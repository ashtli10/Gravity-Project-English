import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const gameValidator = v.union(
  v.literal("rooftopRun"),
  v.literal("planetaryParkour"),
  v.literal("gravitySurge"),
  v.literal("videoQuiz"),
  v.literal("dropTestAir")
);

export const registerName = mutation({
  args: {
    sessionId: v.id("sessions"),
    voterId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const trimmed = args.name.trim();
    if (trimmed.length < 2 || trimmed.length > 16) {
      throw new Error("Name must be 2-16 characters");
    }

    // Check if this voterId already has a registration
    const existing = await ctx.db
      .query("players")
      .withIndex("by_sessionId_and_voterId", (q) =>
        q.eq("sessionId", args.sessionId).eq("voterId", args.voterId)
      )
      .take(1);

    // Check if name is taken by someone else
    const nameTaken = await ctx.db
      .query("players")
      .withIndex("by_sessionId_and_name", (q) =>
        q.eq("sessionId", args.sessionId).eq("name", trimmed)
      )
      .take(1);

    if (nameTaken.length > 0 && nameTaken[0].voterId !== args.voterId) {
      throw new Error("Name already taken");
    }

    if (existing.length > 0) {
      await ctx.db.patch("players", existing[0]._id, { name: trimmed });
    } else {
      await ctx.db.insert("players", {
        sessionId: args.sessionId,
        voterId: args.voterId,
        name: trimmed,
      });
    }
  },
});

export const getPlayerName = query({
  args: {
    sessionId: v.id("sessions"),
    voterId: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_sessionId_and_voterId", (q) =>
        q.eq("sessionId", args.sessionId).eq("voterId", args.voterId)
      )
      .take(1);
    return player[0]?.name ?? null;
  },
});

export const submitScore = mutation({
  args: {
    sessionId: v.id("sessions"),
    voterId: v.string(),
    playerName: v.string(),
    game: gameValidator,
    rawScore: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("scores")
      .withIndex("by_sessionId_and_voterId_and_game", (q) =>
        q
          .eq("sessionId", args.sessionId)
          .eq("voterId", args.voterId)
          .eq("game", args.game)
      )
      .take(1);

    if (existing.length > 0) {
      if (args.rawScore > existing[0].rawScore) {
        await ctx.db.patch("scores", existing[0]._id, {
          rawScore: args.rawScore,
          playerName: args.playerName,
        });
      }
    } else {
      await ctx.db.insert("scores", {
        sessionId: args.sessionId,
        voterId: args.voterId,
        playerName: args.playerName,
        game: args.game,
        rawScore: args.rawScore,
      });
    }
  },
});

export const getLeaderboard = query({
  args: {
    sessionId: v.id("sessions"),
    game: gameValidator,
  },
  handler: async (ctx, args) => {
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_sessionId_and_game", (q) =>
        q.eq("sessionId", args.sessionId).eq("game", args.game)
      )
      .take(50);

    scores.sort((a, b) => b.rawScore - a.rawScore);

    return scores.slice(0, 10).map((s, i) => ({
      playerName: s.playerName,
      rawScore: s.rawScore,
      rank: i + 1,
    }));
  },
});

type GameName = "rooftopRun" | "planetaryParkour" | "gravitySurge" | "videoQuiz" | "dropTestAir";
const GAMES: GameName[] = ["rooftopRun", "planetaryParkour", "gravitySurge", "videoQuiz", "dropTestAir"];

export const getTotalLeaderboard = query({
  args: {
    sessionId: v.id("sessions"),
  },
  handler: async (ctx, args) => {
    // Fetch all scores for this session
    const allScores: Array<{
      voterId: string;
      playerName: string;
      game: GameName;
      rawScore: number;
    }> = [];

    for (const game of GAMES) {
      const gameScores = await ctx.db
        .query("scores")
        .withIndex("by_sessionId_and_game", (q) =>
          q.eq("sessionId", args.sessionId).eq("game", game)
        )
        .take(200);
      for (const s of gameScores) {
        allScores.push({
          voterId: s.voterId,
          playerName: s.playerName,
          game: s.game as GameName,
          rawScore: s.rawScore,
        });
      }
    }

    // Find max score per game for normalization
    const maxPerGame: Record<GameName, number> = {
      rooftopRun: 0,
      planetaryParkour: 0,
      gravitySurge: 0,
      videoQuiz: 0,
      dropTestAir: 0,
    };
    for (const s of allScores) {
      if (s.rawScore > maxPerGame[s.game]) {
        maxPerGame[s.game] = s.rawScore;
      }
    }

    // Group by player (voterId), normalize, and sum
    const playerMap = new Map<
      string,
      {
        playerName: string;
        gameScores: Record<GameName, number>;
        gameNormalized: Record<GameName, number>;
      }
    >();

    for (const s of allScores) {
      if (!playerMap.has(s.voterId)) {
        playerMap.set(s.voterId, {
          playerName: s.playerName,
          gameScores: { rooftopRun: 0, planetaryParkour: 0, gravitySurge: 0, videoQuiz: 0, dropTestAir: 0 },
          gameNormalized: {
            rooftopRun: 0,
            planetaryParkour: 0,
            gravitySurge: 0,
            videoQuiz: 0,
            dropTestAir: 0,
          },
        });
      }
      const p = playerMap.get(s.voterId)!;
      p.gameScores[s.game] = s.rawScore;
      const max = maxPerGame[s.game];
      p.gameNormalized[s.game] = max > 0 ? (s.rawScore / max) * 1000 : 0;
    }

    // Build sorted result — use normalized scores so all games feel equally weighted
    const results = Array.from(playerMap.entries()).map(([, p]) => ({
      playerName: p.playerName,
      totalScore: Math.round(
        p.gameNormalized.rooftopRun +
          p.gameNormalized.planetaryParkour +
          p.gameNormalized.gravitySurge +
          p.gameNormalized.videoQuiz +
          p.gameNormalized.dropTestAir
      ),
      gameScores: {
        rooftopRun: Math.round(p.gameNormalized.rooftopRun),
        planetaryParkour: Math.round(p.gameNormalized.planetaryParkour),
        gravitySurge: Math.round(p.gameNormalized.gravitySurge),
        videoQuiz: Math.round(p.gameNormalized.videoQuiz),
        dropTestAir: Math.round(p.gameNormalized.dropTestAir),
      },
    }));

    results.sort((a, b) => b.totalScore - a.totalScore);

    return results.slice(0, 10).map((r, i) => ({
      ...r,
      rank: i + 1,
    }));
  },
});
