function localDayKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

export function summarizeDashboard(state, now = new Date()) {
  const today = localDayKey(now);
  const sessionsToday = { leon: 0, rose: 0 };

  for (const entry of Array.isArray(state.history) ? state.history : []) {
    if (
      entry &&
      (entry.child === "leon" || entry.child === "rose") &&
      localDayKey(entry.date) === today
    ) {
      sessionsToday[entry.child]++;
    }
  }

  const profiles = state.profiles || {};
  return {
    sessionsToday,
    totalSessions: {
      leon: Number(profiles.leon?.sessions) || 0,
      rose: Number(profiles.rose?.sessions) || 0
    },
    correct: {
      leon: Number(profiles.leon?.correct) || 0,
      rose: Number(profiles.rose?.correct) || 0
    },
    attempts: {
      leon: Number(profiles.leon?.attempts) || 0,
      rose: Number(profiles.rose?.attempts) || 0
    },
    stickers: {
      leon: Number(profiles.leon?.stickers) || 0,
      rose: Number(profiles.rose?.stickers) || 0
    }
  };
}
