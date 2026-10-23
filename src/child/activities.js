import { el, button, screen, card, replaceApp } from "../ui.js";
import { getState, recordAnswer, recordMathAnswer, recordSession } from "../store.js";
import { MATH_DOMAINS, createMathQuestion } from "./math-engine.js";
import { speak } from "../voice.js";
import { cheer, gentleOops } from "../audio.js";
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

export function createCountingQuestion(random = Math.random) {
  const count = 1 + Math.floor(random() * 5);
  const alternatives = shuffle([1, 2, 3, 4, 5].filter(n => n !== count), random).slice(0, 2);
  return {
    text: "Combien de licornes ?",
    answer: count,
    count,
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
  const target = 5;
  const initialState = getState();
  document.body.className = "theme-" + child;

  const generate = () => {
    tries = 0;
    hint = 0;
    progressRecorded = false;
    if (child === "leon") {
      const progress = getState().profiles.leon.mathProgress?.[domain];
      question = createMathQuestion(domain, progress?.difficulty || 1);
    } else {
      question = createCountingQuestion();
    }
  };

  generate();

  function render() {
    const noun = child === "leon"
      ? (MATH_DOMAINS.find(item => item.id === domain)?.label || "Défi de maths")
      : "Les licornes à compter";
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
          : "Regarde les licornes, puis touche le bon nombre."
      }),
      el("div", { class: "prompt", text: child === "leon" ? question.prompt : question.text })
    );

    if (child === "rose") {
      const art = el("div", {
        class: "prompt",
        text: "🦄 ".repeat(question.count),
        "aria-label": question.count + " licornes"
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
        child === "leon" ? "Calcule " + question.prompt : "Compte les licornes et choisis le nombre.",
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
            ? "Presque ! Regarde bien et compte tranquillement."
            : hint === 2
              ? "Compte chaque licorne une seule fois."
              : "La bonne réponse est " + question.answer + ". Essaie de la toucher.";
        }

        if (hint >= 3) {
          answers.querySelectorAll("button").forEach(item => {
            if (item.textContent === String(question.answer)) item.className = "button-warm";
          });
        }
      }, "button-soft")
    ]));

    content.append(button("⌂ Accueil", () => go("home"), "icon-button"));
    if (child === "leon") content.append(button("↩ Autres défis", () => mathMenu(), "button-soft"));

    replaceApp(screen(noun, content, {
      eyebrow: child === "leon" ? "Univers ballon" : "Univers licorne",
      home: () => go("home")
    }));

    speak(
      child === "leon" ? "Défi " + noun + ". " + question.prompt : "Combien de licornes vois-tu ? Compte-les puis choisis le nombre.",
      initialState.settings.voice
    );
  }

  function answer(choice) {
    const ok = String(choice) === String(question.answer);
    recordAnswer(child, ok);
    if (child === "leon" && !progressRecorded) {
      recordMathAnswer(domain, ok, { firstTry: true, helped: hint >= 2 });
      progressRecorded = true;
    }

    if (ok) {
      score++;
      cheer(getState().settings.sounds);
      round++;
      if (round >= target) {
        finish(child, score, target);
        return;
      }
      generate();
      render();
      const feedback = document.querySelector(".feedback");
      if (feedback) feedback.textContent = "Oui ! Tu as persévéré, bravo !";
      return;
    }

    gentleOops(getState().settings.sounds);
    tries++;
    const feedback = document.querySelector(".feedback");
    if (feedback) {
      feedback.textContent = tries % 2
        ? "Presque ! Essayons ensemble."
        : "Tu peux prendre ton temps. On réessaie !";
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
