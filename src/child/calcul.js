import { el, button, screen, card, replaceApp } from "../ui.js";
import { getState, recordAnswer, recordSession } from "../store.js";
import { speak } from "../voice.js";
import { cheer, gentleOops, successPraise, sessionPraise } from "../audio.js";
import { go } from "../router.js";
import { CALCULATION_MODES, createCalculationQuestion } from "./calcul-engine.js";

export function calculationMenu() {
  document.body.className = "theme-leon";
  const content = el("div", { class: "stack" });
  content.append(el("p", { class: "lead", text: "Choisis un petit entraînement. Tu peux prendre ton temps et demander un indice." }));
  CALCULATION_MODES.forEach(mode => content.append(card([
    el("h2", { text: mode.label }),
    button("Commencer", () => startCalculation(mode.id), "button-primary")
  ])));
  content.append(button("⌂ Accueil", () => go("home"), "icon-button"));
  replaceApp(screen("Calcul mental et problèmes", content, { eyebrow: "Univers ballon", home: () => go("home") }));
}

export function startCalculation(kind) {
  const mode = CALCULATION_MODES.find(item => item.id === kind);
  if (!mode) return calculationMenu();
  let round = 0, locked = false, question;
  const seenQuestions = new Set();
  const total = 5;
  const generate = () => {
    locked = false;
    let candidate, attempts = 0;
    do { candidate = createCalculationQuestion(kind); attempts++; }
    while (seenQuestions.has(candidate.prompt) && attempts < 100);
    question = candidate;
    seenQuestions.add(question.prompt);
  };
  function render() {
    const content = card([]);
    content.append(
      el("p", { class: "small", text: mode.label + " · Question " + (round + 1) + " sur " + total }),
      el("p", { class: "lead", text: question.prompt })
    );
    const answer = el("input", { type: "number", inputmode: "numeric", min: "0", max: "200", "aria-label": "Ta réponse" });
    answer.className = "answer-input";
    const feedback = el("p", { class: "feedback", role: "status", "aria-live": "polite" });
    const validate = button("Vérifier", check, "button-primary");
    content.append(answer, validate, feedback,
      button("💡 Petit indice", () => { feedback.textContent = question.hint; }, "button-soft"),
      button("🔊 Réécouter", () => speak(question.prompt, getState().settings.voice), "button-soft"),
      button("⌂ Accueil", () => go("home"), "icon-button"));
    replaceApp(screen("Un petit calcul", content, { eyebrow: "Calcul · Léon", home: () => go("home") }));
    answer.focus();
    speak(question.prompt, getState().settings.voice);
    function check() {
      if (locked || answer.value.trim() === "") {
        if (!answer.value.trim()) feedback.textContent = "Écris un nombre avant de vérifier.";
        return;
      }
      if (Number(answer.value) !== question.answer) {
        recordAnswer("leon", false);
        gentleOops(getState().settings.sounds);
        feedback.textContent = ["Pas tout à fait. Tu peux utiliser l’indice et réessayer.", "Ce calcul résiste encore un peu : regarde l’indice, puis retente.", "Bien essayé ! On reprend étape par étape.", "Tu peux te tromper, réfléchir et recommencer. Essaie encore !"][Math.floor(Math.random() * 4)];
        return;
      }
      locked = true;
      recordAnswer("leon", true);
      cheer(getState().settings.sounds);successPraise("leon",getState().settings.voice);
      feedback.textContent = ["Bien trouvé ! ", "Exactement ! ", "Bravo pour ton raisonnement ! ", "Oui, c’est ça ! ", "Super, tu as réussi ! "][Math.floor(Math.random() * 5)] + question.explanation;
      answer.disabled = true;
      validate.disabled = true;
      const next = button(round === total - 1 ? "Terminer" : "Continuer", () => {
        round++;
        if (round >= total) {
          recordSession("leon");
          sessionPraise("leon",getState().settings.voice);
          const done = card([
            el("div", { class: "prompt", text: "⚽ Bravo !" }),
            el("p", { class: "lead", text: "Tu as pris le temps de réfléchir et d’essayer." }),
            button("Choisir un autre calcul", calculationMenu, "button-primary"),
            button("⌂ Accueil", () => go("home"), "button-soft")
          ]);
          replaceApp(screen("Défi terminé", done, { home: () => go("home") }));
          return;
        }
        generate();
        render();
      }, "button-primary");
      feedback.after(next);
    }
  }
  generate();
  render();
}
