import { el, button, screen, card, replaceApp, showGameNext } from "../ui.js";
import { getState, recordAnswer, recordMathAnswer, recordSession } from "../store.js";
import { MATH_DOMAINS, createMathQuestion } from "./math-engine.js";
import { speak } from "../voice.js";
import { cheer, gentleOops, successPraise, sessionPraise } from "../audio.js";
import { go } from "../router.js";

const pick = items => items[Math.floor(Math.random() * items.length)];
const shuffle = (items, random = Math.random) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const ROSE_COUNTING_THEMES = [
  { singular: "licorne", plural: "licornes", symbol: "🦄" },
  { singular: "cœur", plural: "cœurs", symbol: "💗" },
  { singular: "papillon", plural: "papillons", symbol: "🦋" },
  { singular: "fleur", plural: "fleurs", symbol: "🌼" },
  { singular: "chat", plural: "chats", symbol: "🐱" },
  { singular: "étoile", plural: "étoiles", symbol: "⭐" },
  { singular: "pomme", plural: "pommes", symbol: "🍎" },
  { singular: "ballon", plural: "ballons", symbol: "⚽" },
  { singular: "poisson", plural: "poissons", symbol: "🐠" },
  { singular: "coccinelle", plural: "coccinelles", symbol: "🐞" },
  { singular: "glace", plural: "glaces", symbol: "🍦" },
  { singular: "petit dinosaure", plural: "petits dinosaures", symbol: "🦕" },
  { singular: "chat magique", plural: "chats magiques", symbol: "🐈‍⬛" },
  { singular: "patin à roulettes", plural: "patins à roulettes", symbol: "🛼" },
  { singular: "arc-en-ciel", plural: "arcs-en-ciel", symbol: "🌈" },
  { singular: "couronne", plural: "couronnes", symbol: "👑" },
  { singular: "lune", plural: "lunes", symbol: "🌙" },
  { singular: "coquillage", plural: "coquillages", symbol: "🐚" },
  { singular: "chaton magique", plural: "chatons magiques", symbol: "🐈‍⬛" },
  { singular: "éclair étoilé", plural: "éclairs étoilés", symbol: "🌠" }
];

export function createCountingQuestion(random = Math.random, maxCount = 8) {
  const limit = Math.max(2, Math.min(10, Math.floor(maxCount)));
  const count = 1 + Math.floor(random() * limit);
  const theme = ROSE_COUNTING_THEMES[Math.floor(random() * ROSE_COUNTING_THEMES.length)];
  const alternatives = shuffle(Array.from({ length: limit }, (_, i) => i + 1).filter(n => n !== count), random).slice(0, 2);
  return {
    text: "Combien de " + theme.plural + " ?",
    answer: count,
    count,
    symbol: theme.symbol,
    choices: shuffle([count, ...alternatives], random)
  };
}

function mathMenu() {
  document.body.className = "theme-leon";
  const state = getState();
  const content = el("div", { class: "stack" });

  content.append(el("p", {
    class: "lead",
    text: "Choisis ce que tu veux entraîner aujourd’hui. Chaque défi dure quelques minutes, et tu peux faire une pause quand tu veux."
  }));

  for (const domain of MATH_DOMAINS) {
    const progress = state.profiles.leon.mathProgress?.[domain.id];
    const level = progress?.difficulty || 1;
    content.append(card([
      el("h2", { text: domain.label }),
      el("p", { class: "small", text: domain.description }),
      el("p", { class: "small", text: "Niveau actuel : " + level + " / 3" }),
      button("Commencer ce défi", () => startActivity("leon", domain.id), "button-primary")
    ]));
  }

  content.append(button("⌂ Accueil", () => go("home"), "icon-button"));
  replaceApp(screen("Quel défi choisis-tu ?", content, {
    eyebrow: "Univers ballon",
    home: () => go("home")
  }));
}

function finish(child, score, total) {
  recordSession(child);
  sessionPraise(child,getState().settings.voice);
  const body = card([
    el("div", { class: "prompt", text: child === "leon" ? "⚽ Bien joué !" : "🦄 Bravo !" }),
    el("p", { class: "lead", text: "Tu as persévéré et tu as appris quelque chose." }),
    el("p", {
      class: "lead",
      text: score ? "Tu as essayé plusieurs fois, et chaque essai compte." : "Merci d’avoir joué et essayé !"
    }),
    el("div", { class: "progress-track" }, el("div", { class: "progress-fill", style: "width:100%" })),
    el("p", { class: "small", text: "Si tu veux, tu peux choisir un visage pour dire comment tu te sens." })
  ]);

  const faces = el("div", { class: "answer-grid" }, ["😊", "😌", "😐", "😟"].map(face => button(face, () => {
    body.querySelector(".feedback")?.remove();
    body.append(el("p", { class: "feedback", text: "Merci de me l’avoir dit !" }));
  }, "button-soft")));

  body.append(
    faces,
    el("p", { class: "feedback", text: "À demain !" }),
    button(child === "leon" ? "Choisir un autre défi" : "Terminer", () => {
      if (child === "leon") mathMenu();
      else go("home");
    }, "button-primary")
  );

  replaceApp(screen("À demain !", body, {
    eyebrow: "Fin du défi",
    home: () => go("home")
  }));
}

export function startActivity(child, domain = null) {
  if (child === "leon" && !domain) {
    mathMenu();
    return;
  }

  let round = 0;
  let score = 0;
  let tries = 0;
  let hint = 0;
  let question;
  let progressRecorded = false;
  let locked = false;
  const seenQuestions = new Set();
  const target = 5;
  const initialState = getState();
  document.body.className = "theme-" + child;

  const generate = () => {
    tries = 0;
    hint = 0;
    progressRecorded = false;
    locked = false;
    let candidate, attempts = 0;
    do {
      if (child === "leon") {
        const progress = getState().profiles.leon.mathProgress?.[domain];
        candidate = createMathQuestion(domain, progress?.difficulty || 1);
      } else {
        candidate = createCountingQuestion(Math.random, round < 2 ? 5 : round < 4 ? 8 : 10);
      }
      attempts++;
    } while (seenQuestions.has(child === "leon" ? candidate.prompt : candidate.text + "|" + candidate.count + "|" + candidate.symbol) && attempts < 100);
    question = candidate;
    seenQuestions.add(child === "leon" ? question.prompt : question.text + "|" + question.count + "|" + question.symbol);
  };

  generate();

  function render() {
    const noun = child === "leon"
      ? (MATH_DOMAINS.find(item => item.id === domain)?.label || "Défi de maths")
      : "Les collections à compter";
    const content = card([]);
    const progress = el("div", { class: "progress-track" },
      el("div", { class: "progress-fill", style: "width:" + round / target * 100 + "%" })
    );

    content.append(
      el("p", { class: "small", text: "Défi " + (round + 1) + " sur " + target }),
      progress,
      el("p", {
        class: "lead",
        text: child === "leon"
          ? "Choisis une réponse, puis prends ton temps pour réfléchir."
          : "Regarde les images, compte-les tranquillement, puis touche le bon nombre. Tu peux prendre ton temps, Rose !"
      }),
      el("div", { class: "prompt", text: child === "leon" ? question.prompt : question.text })
    );

    if (child === "rose") {
      const art = el("div", {
        class: "prompt",
        text: (question.symbol + " ").repeat(question.count),
        "aria-label": question.count + " " + question.text.replace("Combien de ", "").replace(" ?", "")
      });
      art.style.fontSize = "2.4rem";
      content.append(art);
    }

    const answers = el("div", { class: "answer-grid" });
    question.choices.forEach(choice => {
      answers.append(button(String(choice), () => answer(choice), "button-soft"));
    });
    content.append(answers);

    const feedback = el("div", { class: "feedback", role: "status", "aria-live": "polite" });
    content.append(feedback, el("div", { class: "button-row" }, [
      button("🔊 Réécouter", () => speak(
        child === "leon" ? "Calcule " + question.prompt : "Compte les images et choisis le nombre.",
        getState().settings.voice
      ), "button-soft"),
      button("💡 Aide", () => {
        hint++;
        if (child === "leon") {
          if (hint === 1) feedback.textContent = question.hint;
          else if (hint === 2) {
            feedback.textContent = domain === "multiplication"
              ? "Essaie de compter par bonds, en gardant toujours le même pas."
              : domain === "numeration"
                ? "Sépare le nombre en centaines, dizaines et unités."
                : domain === "problems"
                  ? "Demande-toi si la quantité augmente ou diminue."
                  : domain === "logic"
                    ? "Compare deux nombres qui se suivent."
                    : domain === "measures"
                      ? "Repère l’unité utilisée et ce qu’elle représente."
                      : "Décompose le calcul en petites étapes.";
          } else {
            feedback.textContent = "La réponse est " + question.answer + ". " + question.explanation;
          }
        } else {
          feedback.textContent = hint === 1
            ? "Presque ! Regarde bien et compte tranquillement. Tu peux y arriver !"
            : hint === 2
              ? "Touche chaque image une seule fois en comptant doucement."
              : "La bonne réponse est " + question.answer + ". Essaie de la toucher.";
        }

        if (hint >= 3) {
          answers.querySelectorAll("button").forEach(item => {
            if (item.textContent === String(question.answer)) item.className = "button-warm";
          });
        }
        speak(feedback.textContent, getState().settings.voice);
      }, "button-soft")
    ]));

    content.append(button("⌂ Accueil", () => go("home"), "icon-button"));
    if (child === "leon") content.append(button("↩ Autres défis", () => mathMenu(), "button-soft"));

    replaceApp(screen(noun, content, {
      eyebrow: child === "leon" ? "Univers ballon" : "Univers magique",
      home: () => go("home")
    }));

    speak(
      child === "leon" ? "Défi " + noun + ". " + question.prompt : question.text + " Compte-les puis choisis le nombre.",
      initialState.settings.voice
    );
  }

  function answer(choice) {
    if (locked) return;
    const ok = String(choice) === String(question.answer);
    recordAnswer(child, ok);
    if (child === "leon" && !progressRecorded) {
      recordMathAnswer(domain, ok, { firstTry: true, helped: hint > 0 });
      progressRecorded = true;
    }

    if (ok) {
      locked = true;
      score++;
      cheer(getState().settings.sounds);
      const feedback = document.querySelector(".feedback");
      if (feedback) feedback.textContent = pick(["Oui, bien joué ! Tu as trouvé !", "Super réflexion ! Tu avances dans le défi.", "Bravo, tu as bien observé !", "Bien trouvé ! Une nouvelle étape est réussie.", "Youpi, tu as trouvé la bonne réponse !"]) + (child === "leon" ? " " + question.explanation : " " + question.answer + " !");
      successPraise(child, getState().settings.voice, feedback?.textContent || "Bravo, tu as trouvé !");
      document.querySelectorAll(".answer-grid button").forEach(item => { item.disabled = true; });
      const next = button(round + 1 >= target ? "Terminer" : "Question suivante", () => {
        round++;
        if (round >= target) finish(child, score, target);
        else { generate(); render(); }
      }, "button-primary");
      showGameNext(next, feedback);
      return;
    }

    gentleOops(getState().settings.sounds);
    tries++;
    const feedback = document.querySelector(".feedback");
    if (feedback) {
      feedback.textContent = pick(tries % 2
        ? ["Pas loin ! On regarde encore ensemble.", "Tu y es presque. Essaie une autre fois !", "Ce n’est pas la bonne réponse pour le moment. On réfléchit ensemble."]
        : ["Prends ton temps, tu peux retenter.", "Chaque essai aide à apprendre. On recommence ?", "Pas de souci, on cherche encore tranquillement !"]);
      speak(feedback.textContent + (hint > 0 ? " " + question.hint : ""), getState().settings.voice);
    }
    if (tries >= 3) {
      const pause = button("Faire une petite pause", () => {
        tries = 0;
        if (feedback) feedback.textContent = "On reprend doucement quand tu es prêt.";
        pause.remove();
      }, "button-warm");
      feedback?.after(pause);
    }
  }

  render();
}
