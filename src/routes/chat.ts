import { Hono } from "hono";
import { z } from "zod";

const API_URL = process.env.OPENCODE_API_URL ?? "https://api.opencode.ai/v1/chat/completions";
const API_KEY = process.env.OPENCODE_API_KEY ?? "";
const MODEL = "opencode-go/deepseek-v4-pro";

const SYSTEM_PROMPT =
  "You are a helpful assistant for Harborlight Care, a Bay Area in-home senior care agency. " +
  "You answer questions about companion care, personal support, recovery at home, and in-home senior care services. " +
  "Keep responses brief, warm, and under 3 sentences. " +
  "If asked about pricing or medical advice, explain that a care coordinator can provide personalized details during a consultation.";

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1),
    }),
  ).min(1),
});

export const chatRoute = new Hono().post("/", async (context) => {
  const body = await context.req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return context.json({ error: "Invalid request" }, 400);
  }

  const payload = {
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...parsed.data.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 300,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("DeepSeek API error:", response.status, text);
      return context.json({ error: "AI service unavailable" }, 502);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const reply = data.choices?.[0]?.message?.content ?? "";
    return context.json({ reply });
  } catch (error) {
    console.error("Chat proxy error:", error);
    return context.json({ error: "AI service unreachable" }, 502);
  }
});
