import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

const gameValidator = v.union(
  v.literal("techMerge"),
  v.literal("skyClimb"),
  v.literal("droneDefense"),
  v.literal("shieldCommand")
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

type GameName = "techMerge" | "skyClimb" | "droneDefense" | "shieldCommand";
const GAMES: GameName[] = ["techMerge", "skyClimb", "droneDefense", "shieldCommand"];

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
      techMerge: 0,
      skyClimb: 0,
      droneDefense: 0,
      shieldCommand: 0,
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
          gameScores: { techMerge: 0, skyClimb: 0, droneDefense: 0, shieldCommand: 0 },
          gameNormalized: {
            techMerge: 0,
            skyClimb: 0,
            droneDefense: 0,
            shieldCommand: 0,
          },
        });
      }
      const p = playerMap.get(s.voterId)!;
      p.gameScores[s.game] = s.rawScore;
      const max = maxPerGame[s.game];
      p.gameNormalized[s.game] = max > 0 ? (s.rawScore / max) * 1000 : 0;
    }

    // Per-game difficulty weights. Each game's best raw score normalizes to
    // 1000; we then scale that contribution by how demanding the game is, so a
    // harder game is worth more toward the overall champion total.
    const DIFFICULTY: Record<GameName, number> = {
      techMerge: 1.0, // puzzle: steady skill + a little luck
      skyClimb: 1.15, // reflex platformer: one slip ends the run
      shieldCommand: 1.2, // defend many targets at once
      droneDefense: 1.35, // full shmup: dodging + aiming under pressure
    };

    // Build sorted result — normalized per game, then weighted by difficulty.
    const results = Array.from(playerMap.entries()).map(([, p]) => {
      const weighted = {
        techMerge: p.gameNormalized.techMerge * DIFFICULTY.techMerge,
        skyClimb: p.gameNormalized.skyClimb * DIFFICULTY.skyClimb,
        droneDefense: p.gameNormalized.droneDefense * DIFFICULTY.droneDefense,
        shieldCommand: p.gameNormalized.shieldCommand * DIFFICULTY.shieldCommand,
      };
      return {
        playerName: p.playerName,
        totalScore: Math.round(
          weighted.techMerge +
            weighted.skyClimb +
            weighted.droneDefense +
            weighted.shieldCommand
        ),
        gameScores: {
          techMerge: Math.round(weighted.techMerge),
          skyClimb: Math.round(weighted.skyClimb),
          droneDefense: Math.round(weighted.droneDefense),
          shieldCommand: Math.round(weighted.shieldCommand),
        },
      };
    });

    results.sort((a, b) => b.totalScore - a.totalScore);

    return results.slice(0, 10).map((r, i) => ({
      ...r,
      rank: i + 1,
    }));
  },
});
