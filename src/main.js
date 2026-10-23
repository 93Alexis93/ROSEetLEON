import { el, button, screen, card, replaceApp } from "./ui.js";
import { setRenderer, startRouter, go, lockParent, canAccessRoute } from "./router.js";
import { getState } from "./store.js";
import { startActivity } from "./child/activities.js";
import { readingMenu } from "./child/reading.js";
import { roseMenu } from "./child/rose-activities.js";
import { parentGate, parentDashboard, crisis } from "./parent/parent.js";
import { printComingSoon } from "./parent/printables.js";
import { speak } from "./voice.js";
import { unlockAudio } from "./audio.js";
import { numberMystery, compareNumbers, syllableGame } from "./child/learning-lab.js";
import { guidedPause } from "./child/pause.js";

function home() {
  document.body.className = "";
  const content = el("div", { class: "stack" });
  content.append(el("p", {
    class: "lead",
    text: "Deux petits univers pour apprendre, essayer et recommencer à son rythme."
  }));
  const choices = el("div", { class: "choices" });
  choices.append(
    button("⚽ Léon · Défis ballon", () => {
      unlockAudio();
      go("leon");
    }, "big-choice"),
    button("🦄 Rose · Jeux magiques", () => {
      unlockAudio();
      go("rose");
    }, "big-choice")
  );
  content.append(
    choices,
    el("p", {
      class: "small",
      text: "Des sessions courtes, sans classement et sans pression."
    }),
    button("🔒 Espace parent", () => go("gate"), "icon-button")
  );
  replaceApp(screen("Rose & Léon", content, {
    eyebrow: "Notre petit coin pour grandir"
  }));
}

function childHome(child) {
  document.body.className = "theme-" + child;
  const rose = child === "rose";
  const content = card([
    el("p", {
      class: "lead",
      text: rose ? "Choisissons un jeu magique !" : "Prêt pour un petit défi de calcul ?"
    }),
    el("div", { class: "prompt", text: rose ? "🌈 🦄 ✨" : "⚽ 🥅 ⭐" }),
    button(rose ? "Choisir un jeu" : "Défi penalty", () => {
      unlockAudio();
      if (rose) roseMenu();
      else startActivity(child);
    }, "button-primary"),
    ...(!rose ? [
      button("📚 Lecture", () => {
        unlockAudio();
        readingMenu();
      }, "button-soft"),
      button("🔎 Nombre mystère", () => {
        unlockAudio();
        numberMystery();
      }, "button-soft"),
      button("⚖️ Le plus grand nombre", () => {
        unlockAudio();
        compareNumbers();
      }, "button-soft")
    ] : [
      button("👏 Les syllabes", () => {
        unlockAudio();
        syllableGame();
      }, "button-soft")
    ]),
    button("🌿 Petite pause", () => guidedPause(child), "button-warm"),
    button("🔊 Réécouter", () => speak(
      rose
        ? "Choisis un jeu : compter les licornes, les couleurs magiques ou les formes à retrouver."
        : "Choisis les défis de maths ou les jeux de lecture.",
      getState().settings.voice
    ), "button-soft"),
    button("⌂ Accueil", () => go("home"), "icon-button")
  ]);
  replaceApp(screen(rose ? "Bonjour Rose !" : "Salut Léon !", content, {
    eyebrow: rose ? "Univers licorne" : "Univers ballon",
    home: () => go("home")
  }));
  speak(
    rose ? "Bonjour Rose ! Choisis un petit jeu." : "Salut Léon ! Choisis ton défi penalty.",
    getState().settings.voice
  );
}

function render(route) {
  if (route === "home" || route === "leon" || route === "rose" || route === "gate") {
    lockParent();
  }
  if (!canAccessRoute(route)) {
    go("gate");
    return;
  }
  switch (route) {
    case "home":
      home();
      break;
    case "leon":
      childHome("leon");
      break;
    case "rose":
      childHome("rose");
      break;
    case "gate":
      parentGate();
      break;
    case "parent":
      parentDashboard();
      break;
    case "crisis":
      crisis();
      break;
    case "print":
      printComingSoon();
      break;
    default:
      home();
  }
}

setRenderer(render);
startRouter();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
}
