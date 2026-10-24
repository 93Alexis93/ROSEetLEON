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
import { calculationMenu } from "./child/calcul.js";

function home() {
  document.body.className = "";
  const content = el("div", { class: "stack home-stack" });
  const welcome = el("section", { class: "home-hero", "aria-labelledby": "home-welcome" }, [
    el("div", { class: "home-sparkles", "aria-hidden": "true", text: "✨ ⭐ ✨" }),
    el("p", { class: "home-kicker", text: "Bienvenue dans votre terrain de jeu !" }),
    el("h2", { id: "home-welcome", class: "home-title", text: "À toi de jouer !" }),
    el("p", {
      class: "home-description",
      text: "Des défis rigolos, des découvertes et plein de petites victoires. Choisis ton univers !"
    }),
    el("div", { class: "home-trail", "aria-hidden": "true", text: "🎈　🌈　🚀　🪄" })
  ]);
  const choices = el("div", { class: "choices home-choices", "aria-label": "Choisis ton univers" });
  choices.append(
    button("⚽\nLéon\nLes défis champions", () => {
      unlockAudio();
      go("leon");
    }, "big-choice home-leon"),
    button("🦄\nRose\nLes jeux enchantés", () => {
      unlockAudio();
      go("rose");
    }, "big-choice home-rose")
  );
  const promise = el("div", { class: "home-promise" }, [
    el("span", { class: "home-promise-icon", "aria-hidden": "true", text: "💛" }),
    el("p", { text: "Ici, on essaie, on apprend et on recommence. Chaque petit progrès compte !" })
  ]);
  content.append(
    welcome,
    choices,
    promise,
    el("div", { class: "home-footer" }, [
      el("span", { class: "small", text: "🌱 À ton rythme · Sans compétition" }),
      button("🔒 Espace parent", () => go("gate"), "icon-button")
    ])
  );
  replaceApp(screen("Rose & Léon", content, {
    eyebrow: "Le club des petits explorateurs"
  }));
}

function childHome(child) {
  document.body.className = "theme-" + child;
  const rose = child === "rose";
  const content = card([
    el("p", {
      class: "lead",
      text: rose ? "Choisissons un jeu magique !" : "Prêt pour un petit défi ?"
    }),
    el("div", { class: "prompt", text: rose ? "🌈 🦄 ✨" : "⚽ 🥅 ⭐" }),
    button(rose ? "Choisir un jeu" : "Choisir un défi", () => {
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
      }, "button-soft"),
      button("🧮 Calcul mental et problèmes", () => {
        unlockAudio();
        calculationMenu();
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
        ? "Choisis un jeu : compter les licornes, les couleurs magiques, les formes, les lettres ou les syllabes."
        : "Choisis un défi de maths, le nombre mystère, le plus grand nombre, le calcul mental ou la lecture.",
      getState().settings.voice
    ), "button-soft"),
    button("⌂ Accueil", () => go("home"), "icon-button")
  ]);
  replaceApp(screen(rose ? "Bonjour Rose !" : "Salut Léon !", content, {
    eyebrow: rose ? "Univers licorne" : "Univers ballon",
    home: () => go("home")
  }));
  speak(
    rose ? "Bonjour Rose ! Choisis un petit jeu." : "Salut Léon ! Choisis un défi : tu peux faire des maths ou lire.",
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
