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
    el("p", { class: "home-kicker", text: "Le club des petits explorateurs" }),
    el("h2", { id: "home-welcome", class: "home-title", text: "Prêts pour l’aventure ?" }),
    el("p", {
      class: "home-description",
      text: "Deux univers, plein de surprises et des défis à relever à ton rythme !"
    }),
    el("div", { class: "home-trail", "aria-hidden": "true", text: "🌈　🚀　🪄　⭐" })
  ]);
  const choices = el("div", { class: "choices home-choices", "aria-label": "Choisis ton univers" });
  choices.append(
    button("⚽\nLÉON\nLes missions des champions\nMaths · logique · lecture", () => {
      unlockAudio();
      go("leon");
    }, "big-choice home-leon"),
    button("🦄\nROSE\nLe royaume enchanté\nCouleurs · lettres · découvertes", () => {
      unlockAudio();
      go("rose");
    }, "big-choice home-rose")
  );
  const promise = el("div", { class: "home-promise" }, [
    el("span", { class: "home-promise-icon", "aria-hidden": "true", text: "💛" }),
    el("div", {}, [
      el("strong", { text: "Ici, chacun progresse à son rythme" }),
      el("p", { text: "On essaie, on découvre et on recommence. Pas de compétition !" })
    ])
  ]);
  content.append(
    welcome,
    choices,
    promise,
    el("div", { class: "home-footer" }, [
      el("span", { class: "small", text: "🌱 Chaque petit progrès compte" }),
      button("🔒 Espace parent", () => go("gate"), "icon-button")
    ])
  );
  replaceApp(screen("Rose & Léon", content, {
    eyebrow: "Choisis ton aventure"
  }));
}

function childHome(child) {
  document.body.className = "theme-" + child;
  const rose = child === "rose";
  const content = el("div", { class: "stack child-hub" });
  const hero = el("section", { class: "child-hero child-hero-" + child }, [
    el("div", { class: "child-hero-art", "aria-hidden": "true", text: rose ? "🦄 🌈 ✨" : "⚽ 🏆 ⭐" }),
    el("p", { class: "child-hero-kicker", text: rose ? "Le royaume des merveilles" : "Le terrain des champions" }),
    el("h2", { class: "child-hero-title", text: rose ? "Quelle magie vas-tu découvrir ?" : "Prêt pour ta prochaine mission ?" }),
    el("p", { class: "child-hero-copy", text: rose
      ? "Compte, observe, écoute et joue avec les lettres de ton prénom !"
      : "Réfléchis, calcule, lis et marque des points… surtout dans ta tête !" })
  ]);
  const section = el("section", { class: "child-activities", "aria-label": rose ? "Jeux de Rose" : "Défis de Léon" }, [
    el("div", { class: "child-section-heading" }, [
      el("span", { class: "child-section-sticker", "aria-hidden": "true", text: rose ? "🎀" : "🚀" }),
      el("div", {}, [
        el("h3", { text: rose ? "Choisis un jeu magique" : "Choisis ta mission" }),
        el("p", { class: "small", text: rose ? "Des petites découvertes, sans se presser." : "À toi de choisir ton prochain défi." })
      ])
    ])
  ]);
  const tiles = el("div", { class: "child-tile-grid" });
  if (rose) {
    tiles.append(
      button("🦄\nJeux enchantés\nCompter, couleurs, formes et lettres", () => {
        unlockAudio();
        roseMenu();
      }, "child-tile child-tile-main"),
      button("👏\nSyllabes en rythme\nÉcoute les mots et frappe dans tes mains", () => {
        unlockAudio();
        syllableGame();
      }, "child-tile child-tile-alt")
    );
  } else {
    tiles.append(
      button("⚽\nDéfis de maths\nNombres, calculs et petits problèmes", () => {
        unlockAudio();
        startActivity(child);
      }, "child-tile child-tile-main"),
      button("📚\nJeux de lecture\nMots, phrases et petites histoires", () => {
        unlockAudio();
        readingMenu();
      }, "child-tile child-tile-alt"),
      button("🔎\nNombre mystère\nTrouve le nombre caché", () => {
        unlockAudio();
        numberMystery();
      }, "child-tile child-tile-alt"),
      button("⚖️\nLe plus grand nombre\nCompare et choisis le bon nombre", () => {
        unlockAudio();
        compareNumbers();
      }, "child-tile child-tile-alt"),
      button("🧮\nCalcul mental\nCalculs et problèmes à résoudre", () => {
        unlockAudio();
        calculationMenu();
      }, "child-tile child-tile-alt")
    );
  }
  section.append(tiles);
  const gentle = el("div", { class: "child-gentle-note" }, [
    el("span", { "aria-hidden": "true", text: "💛" }),
    el("p", { text: rose ? "Tu peux prendre ton temps. Chaque essai est une découverte !" : "Pas besoin d’aller vite : réfléchir, essayer et recommencer, c’est déjà gagner !" })
  ]);
  const tools = el("div", { class: "child-bottom-actions" }, [
    button("🌿 Petite pause", () => guidedPause(child), "button-warm"),
    button("🔊 Réécouter", () => speak(
      rose
        ? "Choisis un jeu magique : compter, découvrir les couleurs, les formes, les lettres ou les syllabes."
        : "Choisis une mission : les défis de maths, la lecture, le nombre mystère, le plus grand nombre ou le calcul mental.",
      getState().settings.voice
    ), "button-soft")
  ]);
  content.append(hero, section, gentle, tools);
  replaceApp(screen(rose ? "Bonjour Rose !" : "Salut Léon !", content, {
    eyebrow: rose ? "Ton univers magique" : "Ton club de champions",
    home: () => go("home")
  }));
  speak(
    rose ? "Bonjour Rose ! Quelle magie vas-tu découvrir aujourd’hui ?" : "Salut Léon ! Prêt pour ta prochaine mission ?",
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
