import { env } from "@/env";
import { Redis } from "@upstash/redis";

const STREAM_EXPIRY_SECONDS = 24 * 60 * 60;

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export interface StreamEvent {
  event: string;
  data: unknown;
  timestamp: number;
  id?: string;
}

const buildEventsKey = (streamId: string) => `events:${streamId}`;
const buildChannelKey = (streamId: string) => `channel:${streamId}`;

const generateEventId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createStreamEvent = (event: string, data: unknown): StreamEvent => ({
  event,
  data,
  timestamp: Date.now(),
  id: generateEventId(),
});

export const createStream = async (streamId: string): Promise<void> => {
  const eventsKey = buildEventsKey(streamId);
  const initialEvent = createStreamEvent("start", {
    streamId,
    timestamp: Date.now(),
  });

  await redis.lpush(eventsKey, JSON.stringify(initialEvent));
  await redis.expire(eventsKey, STREAM_EXPIRY_SECONDS);
};

export const addEvent = async (
  streamId: string,
  eventType: string,
  eventData: unknown
): Promise<void> => {
  const eventsKey = buildEventsKey(streamId);
  const channelKey = buildChannelKey(streamId);
  const streamEvent = createStreamEvent(eventType, eventData);

  await redis.lpush(eventsKey, JSON.stringify(streamEvent));
  await redis.publish(channelKey, JSON.stringify(streamEvent));
};

export const getEvents = async (streamId: string): Promise<StreamEvent[]> => {
  const eventsKey = buildEventsKey(streamId);

  try {
    const rawEvents = await redis.lrange(eventsKey, 0, -1);
    return rawEvents.reverse().map((eventData: any) => {
      if (typeof eventData === "string") {
        return JSON.parse(eventData) as StreamEvent;
      }

      return {
        event: eventData.event || "unknown",
        data: eventData.data || {},
        timestamp: eventData.timestamp || Date.now(),
        id: eventData.id || generateEventId(),
      } as StreamEvent;
    });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
};

export const waitForEvents = async (
  streamId: string,
  lastEventId: string = "0",
  timeoutMs: number = 30000
): Promise<StreamEvent[]> => {
  try {
    const allEvents = await getEvents(streamId);

    if (lastEventId === "0") {
      return allEvents;
    }

    const lastEventIndex = allEvents.findIndex(
      (event) => event.id === lastEventId
    );
    if (lastEventIndex === -1) {
      return allEvents;
    }

    return allEvents.slice(lastEventIndex + 1);
  } catch (error) {
    console.error("Failed to wait for events:", error);
    return [];
  }
};

export const getLastEventId = async (streamId: string): Promise<string> => {
  try {
    const events = await getEvents(streamId);
    if (events.length > 0) {
      return events[events.length - 1].id || "0";
    }
    return "0";
  } catch (error) {
    console.error("Failed to get last event ID:", error);
    return "0";
  }
};

export const streamExists = async (streamId: string): Promise<boolean> => {
  const eventsKey = buildEventsKey(streamId);
  return (await redis.exists(eventsKey)) === 1;
};

export const completeStream = async (streamId: string): Promise<void> => {
  await addEvent(streamId, "complete", { completed: true });
};

export const failStream = async (
  streamId: string,
  errorMessage: string
): Promise<void> => {
  await addEvent(streamId, "error", { error: errorMessage });
};
