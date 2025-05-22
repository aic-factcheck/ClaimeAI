import { agentRoute } from "@/server/routes/agent";
import { Hono } from "hono";
import { handle } from "hono/vercel";

export const dynamic = "force-dynamic";

const app = new Hono().basePath("/api");

const routes = app
  .get("/health", (c) => {
    return c.json({
      message: "OK",
    });
  })
  .route("/agent", agentRoute);

type AppType = typeof routes;

const GET = handle(app);
const POST = handle(app);
const PUT = handle(app);
const PATCH = handle(app);
const DELETE = handle(app);

export { DELETE, GET, PATCH, POST, PUT };
export type { AppType };
