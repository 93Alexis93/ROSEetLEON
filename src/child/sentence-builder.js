import { el, button, screen, card, replaceApp } from "../ui.js";
import { getState, recordAnswer, recordSession } from "../store.js";
import { speak } from "../voice.js";
import { cheer, gentleOops, successPraise, sessionPraise } from "../audio.js";
import { go } from "../router.js";

const SENTENCES = [
  { words: ["Le", "chat", "dort", "sur", "le", "canapé", "."], hint: "Cherche qui fait l’action : le chat.", answer: "Le chat dort sur le canapé." },
  { words: ["Léon", "joue", "au", "foot", "avec", "ses", "amis", "."], hint: "Commence par le prénom Léon.", answer: "Léon joue au foot avec ses amis." },
  { words: ["La", "petite", "balle", "roule", "dans", "l’herbe", "."], hint: "Commence par « La petite balle ».", answer: "La petite balle roule dans l’herbe." },
  { words: ["Le", "gardien", "arrête", "le", "ballon", "."], hint: "Le gardien fait l’action.", answer: "Le gardien arrête le ballon." },
  { words: ["Demain", ",", "nous", "irons", "au", "parc", "."], hint: "La phrase commence par « Demain ».", answer: "Demain, nous irons au parc." },
  { words: ["Rose", "dessine", "une", "licorne", "magique", "."], hint: "Commence par le prénom Rose.", answer: "Rose dessine une licorne magique." }
];
function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
export function sentenceBuilder() {
  document.body.className = "theme-leon";
  let round = 0, mistakes = 0, locked = false, current;
  const completed = new Set();
  const choose = () => {
    let options = SENTENCES.map((_, i) => i).filter(i => !completed.has(i));
    if (!options.length) { completed.clear(); options = SENTENCES.map((_, i) => i); }
    current = SENTENCES[options[Math.floor(Math.random() * options.length)]];
    completed.add(SENTENCES.indexOf(current)); mistakes = 0; locked = false;
  };
  const finish = () => {
    recordSession("leon"); sessionPraise("leon", getState().settings.voice);
    replaceApp(screen("Mission accomplie !", card([
      el("p", { class: "prompt", text: "⚽ ⭐ Bien joué, champion des mots !" }),
      el("p", { class: "lead", text: "Tu as construit des phrases en réfléchissant à l’ordre des mots." }),
      button("Rejouer", sentenceBuilder, "button-primary"), button("⌂ Accueil", () => go("home"), "button-soft")
    ]), { home: () => go("home") }));
  };
  function render() {
    const content = card([]);
    content.append(el("p", { class: "small", text: "🧩 Phrase " + (round + 1) + " sur 5" }));
    content.append(el("p", { class: "lead", text: "Touche les mots dans l’ordre pour reconstruire la phrase." }));
    const source = shuffle(current.words);
    const chosen = [];
    const selected = el("div", { class: "answer-grid", "aria-label": "Mots choisis" });
    const choices = el("div", { class: "answer-grid", "aria-label": "Mots à placer" });
    const feedback = el("p", { class: "feedback", role: "status", "aria-live": "polite" });
    const draw = () => {
      selected.replaceChildren();
      chosen.forEach((word, i) => selected.append(button(word, () => {
        if (locked) return;
        chosen.splice(i, 1); draw();
      }, "button-soft")));
      choices.replaceChildren();
      source.forEach((word, i) => { if (!chosen.includes(i)) choices.append(button(word, () => { if (!locked) { chosen.push(i); draw(); } }, "button-soft")); });
      if (chosen.length === current.words.length) {
        const built = chosen.map(i => source[i]).join(" ").replace(" .", ".").replace(" ,", ",");
        if (built === current.answer) {
          locked = true; recordAnswer("leon", true); cheer(getState().settings.sounds); successPraise("leon", getState().settings.voice);
          feedback.textContent = "Bravo ! Ta phrase est bien construite : " + current.answer;
          speak(feedback.textContent, getState().settings.voice);
          const next = button(round === 4 ? "Terminer" : "Phrase suivante", () => { round++; if (round >= 5) finish(); else { choose(); render(); } }, "button-primary");
          feedback.after(next);
        } else {
          mistakes++; recordAnswer("leon", false); gentleOops(getState().settings.sounds);
          feedback.textContent = mistakes === 1 ? "Bien essayé ! Relis les mots et cherche qui fait l’action. Tu peux toucher un mot pour le déplacer." : "On regarde ensemble : " + current.answer + " Essaie encore avec la phrase suivante.";
          speak(feedback.textContent, getState().settings.voice);
          if (mistakes >= 2) { const reveal = button("Voir la solution et continuer", () => { round++; if (round >= 5) finish(); else { choose(); render(); } }, "button-primary"); feedback.after(reveal); }
        }
      }
    };
    content.append(selected, choices, feedback,
      button("💡 Petit indice", () => { feedback.textContent = current.hint; }, "button-soft"),
      button("🔊 Réécouter la consigne", () => speak("Touche les mots dans le bon ordre pour reconstruire la phrase.", getState().settings.voice), "button-soft"),
      button("↩ Retour aux jeux", () => go("leon"), "button-soft"));
    replaceApp(screen("Les phrases mélangées", content, { eyebrow: "Lecture · Léon", home: () => go("home") }));
    speak("Touche les mots dans le bon ordre pour reconstruire la phrase.", getState().settings.voice);
    draw();
  }
  choose(); render();
}
