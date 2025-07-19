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
}

const getStreamKey = (streamId: string) => `stream:${streamId}`;

export const createStream = async (streamId: string): Promise<void> => {
  const streamKey = getStreamKey(streamId);

  await redis.xadd(streamKey, "*", {
    event: "start",
    data: JSON.stringify({ streamId, timestamp: Date.now() }),
  });
  await redis.expire(streamKey, STREAM_EXPIRY_SECONDS);
};

export const addEvent = async (
  streamId: string,
  event: string,
  data: unknown
): Promise<void> => {
  const streamKey = getStreamKey(streamId);

  await redis.xadd(streamKey, "*", {
    event,
    data: JSON.stringify(data),
  });
};

export const getEvents = async (streamId: string): Promise<StreamEvent[]> => {
  const streamKey = getStreamKey(streamId);

  try {
    const keyExists = await redis.exists(streamKey);
    if (keyExists === 0) return [];

    const events = await redis.xrange(streamKey, "-", "+");

    if (Array.isArray(events)) {
      return events.map((event: any) => {
        const [, fields] = event;
        return {
          event: String(fields.event),
          data: JSON.parse(fields.data),
          timestamp: Date.now(),
        };
      });
    }

    if (typeof events === "object" && events !== null) {
      return Object.keys(events).map((eventId) => {
        const eventData = events[eventId];
        return {
          event: String(eventData.event),
          data:
            typeof eventData.data === "string"
              ? JSON.parse(eventData.data)
              : eventData.data,
          timestamp: Date.now(),
        };
      });
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch stream events:", error);
    return [];
  }
};

export const streamExists = async (streamId: string): Promise<boolean> => {
  const streamKey = getStreamKey(streamId);
  return (await redis.exists(streamKey)) === 1;
};

export const completeStream = async (streamId: string): Promise<void> => {
  await addEvent(streamId, "complete", { completed: true });
};

export const failStream = async (
  streamId: string,
  error: string
): Promise<void> => {
  await addEvent(streamId, "error", { error });
};
