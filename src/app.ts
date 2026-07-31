import { randomUUID } from "node:crypto";

import { cors } from "hono/cors";
import { Hono } from "hono";
import { z } from "zod";

import type { Lead } from "./types.js";

const createLeadSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  emailAddress: z.email().max(254),
  phoneNumber: z.string().trim().min(7).max(30),
  serviceType: z.enum([
    "companion-care",
    "personal-support",
    "recovery-at-home",
    "not-sure",
  ]),
  message: z.string().trim().max(1500).optional(),
  consent: z.literal(true),
});

export function createApp() {
  const app = new Hono();
  const leads = new Map<string, Lead>();

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

  app.get("/api/leads/list", (context) => {
    const leadList = [...leads.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return context.json({ leads: leadList, total: leadList.length });
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
    leads.set(lead.id, lead);

    return context.json({ lead }, 201);
  });

  app.notFound((context) => context.json({ error: "Route not found" }, 404));
  app.onError((error, context) => {
    console.error(error);
    return context.json({ error: "Internal server error" }, 500);
  });

  return app;
}

export const app = createApp();
