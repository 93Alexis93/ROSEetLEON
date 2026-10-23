import test from "node:test";
import assert from "node:assert/strict";
import { BACKUP_REMINDER_INTERVAL_MS, shouldRemindBackup } from "../src/parent/backup.js";

test("Sauvegarde · un rappel est affiché quand aucune sauvegarde n’est enregistrée", () => {
  assert.equal(shouldRemindBackup(null), true);
  assert.equal(shouldRemindBackup(""), true);
});

test("Sauvegarde · une date illisible déclenche un rappel prudent", () => {
  assert.equal(shouldRemindBackup("pas une date"), true);
});

test("Sauvegarde · une sauvegarde récente ne déclenche pas de rappel", () => {
  const now = Date.parse("2026-10-23T12:00:00.000Z");
  const lastBackup = new Date(now - BACKUP_REMINDER_INTERVAL_MS + 1).toISOString();
  assert.equal(shouldRemindBackup(lastBackup, now), false);
});

test("Sauvegarde · un rappel apparaît au bout de 30 jours", () => {
  const now = Date.parse("2026-10-23T12:00:00.000Z");
  const lastBackup = new Date(now - BACKUP_REMINDER_INTERVAL_MS).toISOString();
  assert.equal(shouldRemindBackup(lastBackup, now), true);
});
