import { randomUUID } from "node:crypto";

import { cors } from "hono/cors";
import { Hono } from "hono";

import { createLeadSchema } from "./db/lead/lead.dto.js";
import { initStore, insertLead, listLeads } from "./db/lead/lead.queries.js";
import type { Lead } from "./db/lead/lead.types.js";

export async function createApp() {
  await initStore();

  const app = new Hono();

  app.use(
    "/api/*",
    cors({
      origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type"],
    }),
  );

  app.get("/", (context) =>
    context.json({
      status: "ok",
      service: "harborlight-leads",
      health: "/health",
      leads: "/api/leads/list",
    }),
  );

  app.get("/health", (context) =>
    context.json({ status: "ok", service: "harborlight-leads" }),
  );

  app.get("/api/leads/list", async (context) => {
    try {
      const leadList = await listLeads();
      return context.json({ leads: leadList, total: leadList.length });
    } catch (error) {
      console.error(error);
      return context.json({ error: "Failed to retrieve leads" }, 500);
    }
  });

  app.post("/api/leads", async (context) => {
    const body = await context.req.json().catch(() => null);
    const parsed = createLeadSchema.safeParse(body);

    if (!parsed.success) {
      return context.json(
        {
          error: "Invalid lead",
          issues: parsed.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        400,
      );
    }

    const now = new Date().toISOString();
    const lead: Lead = {
      id: randomUUID(),
      ...parsed.data,
      emailAddress: parsed.data.emailAddress.toLowerCase(),
      status: "new",
      createdAt: now,
      updatedAt: now,
    };
    await insertLead(lead);

    return context.json({ lead }, 201);
  });

  app.notFound((context) => context.json({ error: "Route not found" }, 404));
  app.onError((error, context) => {
    console.error(error);
    return context.json({ error: "Internal server error" }, 500);
  });

  return app;
}

export const app = await createApp();
