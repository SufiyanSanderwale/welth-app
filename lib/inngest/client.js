import { Inngest } from "inngest";

// Provide a safe default event key in development so `inngest.send(...)` works
// with the local Inngest Dev Server without additional env setup.
const isDev = process.env.NODE_ENV !== "production";
const eventKey = process.env.INNGEST_EVENT_KEY || (isDev ? "dev" : undefined);

export const inngest = new Inngest({
  id: "finance-platform", // Unique app ID
  name: "Finance Platform",
  // In dev, default to the magic "dev" key understood by the Inngest Dev Server
  eventKey,
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000, // Exponential backoff
    maxAttempts: 2,
  }),
});
