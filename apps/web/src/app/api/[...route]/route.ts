import { agentRoute } from "@/server/routes/agent";
import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";
import { handle } from "hono/vercel";

export const dynamic = "force-dynamic";

const app = new Hono().basePath("/api");

app.use("*", clerkMiddleware());
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

export { GET, POST };
export type { AppType };

