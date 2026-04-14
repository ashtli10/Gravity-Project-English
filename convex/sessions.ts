import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("sessions").take(1);
    return sessions[0] ?? null;
  },
});

export const create = mutation({
  args: { presenterKey: v.string() },
  handler: async (ctx, args) => {
    if (args.presenterKey !== "gravity2026") {
      throw new Error("Invalid presenter key");
    }
    const existing = await ctx.db.query("sessions").take(10);
    for (const s of existing) {
      // Clean up old poll votes for each session
      const votes = await ctx.db
        .query("pollVotes")
        .withIndex("by_sessionId_and_slideContext", (q) =>
          q.eq("sessionId", s._id)
        )
        .take(500);
      for (const vote of votes) {
        await ctx.db.delete(vote._id);
      }
      await ctx.db.delete(s._id);
    }
    const id = await ctx.db.insert("sessions", {
      slideIndex: 0,
      isActive: true,
    });
    return id;
  },
});

export const advanceSlide = mutation({
  args: {
    sessionId: v.id("sessions"),
    presenterKey: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.presenterKey !== "gravity2026") {
      throw new Error("Unauthorized");
    }
    const session = await ctx.db.get("sessions", args.sessionId);
    if (!session) throw new Error("Session not found");
    await ctx.db.patch("sessions", args.sessionId, {
      slideIndex: session.slideIndex + 1,
      activeEvent: undefined,
    });
  },
});

export const previousSlide = mutation({
  args: {
    sessionId: v.id("sessions"),
    presenterKey: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.presenterKey !== "gravity2026") {
      throw new Error("Unauthorized");
    }
    const session = await ctx.db.get("sessions", args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.slideIndex > 0) {
      await ctx.db.patch("sessions", args.sessionId, {
        slideIndex: session.slideIndex - 1,
        activeEvent: undefined,
      });
    }
  },
});

export const goToSlide = mutation({
  args: {
    sessionId: v.id("sessions"),
    presenterKey: v.string(),
    slideIndex: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.presenterKey !== "gravity2026") {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch("sessions", args.sessionId, {
      slideIndex: args.slideIndex,
      activeEvent: undefined,
    });
  },
});

export const triggerEvent = mutation({
  args: {
    sessionId: v.id("sessions"),
    presenterKey: v.string(),
    eventType: v.union(
      v.literal("dropTest_vacuum"),
      v.literal("dropTest_air"),
      v.literal("moveSpotter"),
      v.literal("rooftopRun"),
      v.literal("planetaryParkour"),
      v.literal("gravitySurge"),
      v.literal("wallClimber"),
      v.literal("poll"),
      v.literal("lookUp")
    ),
  },
  handler: async (ctx, args) => {
    if (args.presenterKey !== "gravity2026") {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch("sessions", args.sessionId, {
      activeEvent: {
        type: args.eventType,
        triggeredAt: Date.now(),
      },
    });
  },
});

export const clearEvent = mutation({
  args: {
    sessionId: v.id("sessions"),
    presenterKey: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.presenterKey !== "gravity2026") {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch("sessions", args.sessionId, {
      activeEvent: undefined,
    });
  },
});
