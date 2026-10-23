const BACKUP_KEY = "rose-leon-last-backup";
export const BACKUP_REMINDER_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

export function shouldRemindBackup(lastBackup, now = Date.now()) {
  if (typeof lastBackup !== "string" || !lastBackup.trim()) return true;
  const timestamp = Date.parse(lastBackup);
  if (!Number.isFinite(timestamp)) return true;
  return now - timestamp >= BACKUP_REMINDER_INTERVAL_MS;
}

export function getLastBackupAt() {
  try {
    return localStorage.getItem(BACKUP_KEY);
  } catch {
    return null;
  }
}

export function markBackupCompleted(now = Date.now()) {
  try {
    localStorage.setItem(BACKUP_KEY, new Date(now).toISOString());
  } catch {
    // L’absence de cette indication ne doit pas empêcher une sauvegarde.
  }
}
