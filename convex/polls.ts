import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const submitVote = mutation({
  args: {
    sessionId: v.id("sessions"),
    slideContext: v.string(),
    vote: v.string(),
    voterId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pollVotes")
      .withIndex("by_sessionId_and_slideContext_and_voterId", (q) =>
        q
          .eq("sessionId", args.sessionId)
          .eq("slideContext", args.slideContext)
          .eq("voterId", args.voterId)
      )
      .take(1);
    if (existing.length > 0) {
      await ctx.db.patch("pollVotes", existing[0]._id, { vote: args.vote });
      return existing[0]._id;
    }
    return await ctx.db.insert("pollVotes", {
      sessionId: args.sessionId,
      slideContext: args.slideContext,
      vote: args.vote,
      voterId: args.voterId,
    });
  },
});

export const getResults = query({
  args: {
    sessionId: v.id("sessions"),
    slideContext: v.string(),
  },
  handler: async (ctx, args) => {
    const votes = await ctx.db
      .query("pollVotes")
      .withIndex("by_sessionId_and_slideContext", (q) =>
        q.eq("sessionId", args.sessionId).eq("slideContext", args.slideContext)
      )
      .take(200);
    const counts: Record<string, number> = {};
    for (const v of votes) {
      counts[v.vote] = (counts[v.vote] ?? 0) + 1;
    }
    return { counts, total: votes.length };
  },
});
