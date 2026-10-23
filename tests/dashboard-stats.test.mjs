import test from "node:test";
import assert from "node:assert/strict";
import { summarizeDashboard } from "../src/parent/dashboard-stats.js";

test("Tableau parent · distingue les sessions du jour des totaux cumulés", () => {
  const now = new Date(2026, 9, 23, 12, 0, 0);
  const state = {
    history: [
      { child: "leon", date: new Date(2026, 9, 23, 9, 0, 0).toISOString() },
      { child: "leon", date: new Date(2026, 9, 23, 10, 0, 0).toISOString() },
      { child: "rose", date: new Date(2026, 9, 23, 11, 0, 0).toISOString() },
      { child: "rose", date: new Date(2026, 9, 22, 18, 0, 0).toISOString() },
      { child: "other", date: new Date(2026, 9, 23, 11, 0, 0).toISOString() },
      { child: "leon", date: "date invalide" }
    ],
    profiles: {
      leon: { sessions: 18, correct: 40, attempts: 52, stickers: 13 },
      rose: { sessions: 7, correct: 16, attempts: 20, stickers: 5 }
    }
  };

  assert.deepEqual(summarizeDashboard(state, now), {
    sessionsToday: { leon: 2, rose: 1 },
    totalSessions: { leon: 18, rose: 7 },
    correct: { leon: 40, rose: 16 },
    attempts: { leon: 52, rose: 20 },
    stickers: { leon: 13, rose: 5 }
  });
});

test("Tableau parent · accepte un historique ou des profils absents sans planter", () => {
  assert.deepEqual(summarizeDashboard({}, new Date(2026, 9, 23)), {
    sessionsToday: { leon: 0, rose: 0 },
    totalSessions: { leon: 0, rose: 0 },
    correct: { leon: 0, rose: 0 },
    attempts: { leon: 0, rose: 0 },
    stickers: { leon: 0, rose: 0 }
  });
});
