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
      // Clean up old poll votes
      const votes = await ctx.db
        .query("pollVotes")
        .withIndex("by_sessionId_and_slideContext", (q) =>
          q.eq("sessionId", s._id)
        )
        .take(500);
      for (const vote of votes) {
        await ctx.db.delete(vote._id);
      }
      // Clean up old players
      const players = await ctx.db
        .query("players")
        .withIndex("by_sessionId_and_voterId", (q) =>
          q.eq("sessionId", s._id)
        )
        .take(500);
      for (const p of players) {
        await ctx.db.delete(p._id);
      }
      // Clean up old scores
      const scores = await ctx.db
        .query("scores")
        .withIndex("by_sessionId_and_game", (q) =>
          q.eq("sessionId", s._id)
        )
        .take(500);
      for (const sc of scores) {
        await ctx.db.delete(sc._id);
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
    studentEvent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.presenterKey !== "gravity2026") {
      throw new Error("Unauthorized");
    }
    const session = await ctx.db.get("sessions", args.sessionId);
    if (!session) throw new Error("Session not found");
    await ctx.db.patch("sessions", args.sessionId, {
      slideIndex: session.slideIndex + 1,
      activeEvent: args.studentEvent
        ? { type: args.studentEvent as any, triggeredAt: Date.now() }
        : undefined,
    });
  },
});

export const previousSlide = mutation({
  args: {
    sessionId: v.id("sessions"),
    presenterKey: v.string(),
    studentEvent: v.optional(v.string()),
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
        activeEvent: args.studentEvent
          ? { type: args.studentEvent as any, triggeredAt: Date.now() }
          : undefined,
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
      v.literal("dropShow_vacuum"),
      v.literal("dropShow_air"),
      v.literal("moveSpotter"),
      v.literal("rooftopRun"),
      v.literal("planetaryParkour"),
      v.literal("gravitySurge"),
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
