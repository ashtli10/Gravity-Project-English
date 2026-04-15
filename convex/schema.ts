import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  sessions: defineTable({
    slideIndex: v.number(),
    activeEvent: v.optional(
      v.object({
        type: v.union(
          v.literal("dropTest_vacuum"),
          v.literal("dropTest_air"),
          v.literal("dropShow_vacuum"),
          v.literal("dropShow_air"),
          v.literal("moveSpotter"),
          v.literal("rooftopRun"),
          v.literal("planetaryParkour"),
          v.literal("gravitySurge"),
          v.literal("wallClimber"),
          v.literal("poll"),
          v.literal("lookUp")
        ),
        triggeredAt: v.number(),
      })
    ),
    isActive: v.boolean(),
  }),

  pollVotes: defineTable({
    sessionId: v.id("sessions"),
    slideContext: v.string(),
    vote: v.string(),
    voterId: v.string(),
  })
    .index("by_sessionId_and_slideContext", ["sessionId", "slideContext"])
    .index("by_sessionId_and_slideContext_and_voterId", [
      "sessionId",
      "slideContext",
      "voterId",
    ]),
});
