import { el, button, screen, card, replaceApp } from "../ui.js";
import { getState } from "../store.js";
import { speak } from "../voice.js";
import { go } from "../router.js";

export const PAUSE_STEPS = [
  {
    title: "Se poser",
    text: "Installe-toi comme tu es, si tu en as envie. Relâche un peu les mains. Tu n’as rien à réussir ici.",
    spoken: "Installe-toi comme tu es, si tu en as envie. Tu n’as rien à réussir ici."
  },
  {
    title: "Respirer tranquillement",
    text: "Observe simplement ta respiration. Si c’est agréable, inspire doucement puis souffle lentement. Tu peux aussi respirer normalement.",
    spoken: "Observe simplement ta respiration. Si c’est agréable, inspire doucement puis souffle lentement. Tu peux aussi respirer normalement."
  },
  {
    title: "Regarder autour de soi",
    text: "Repère une couleur, un son et quelque chose que tu aimes. Quand tu es prêt, tu peux choisir un jeu ou retourner à l’accueil.",
    spoken: "Repère une couleur, un son et quelque chose que tu aimes. Quand tu es prêt, tu peux choisir un jeu."
  }
];

export function getPauseStep(index) {
  const safeIndex = Number.isInteger(index)
    ? Math.max(0, Math.min(PAUSE_STEPS.length - 1, index))
    : 0;
  return PAUSE_STEPS[safeIndex];
}

export function guidedPause(child = "leon") {
  const targetChild = child === "rose" ? "rose" : "leon";
  document.body.className = "theme-" + targetChild;
  let index = 0;

  const render = () => {
    const step = getPauseStep(index);
    const content = card([
      el("p", {
        class: "small",
        text: "Étape " + (index + 1) + " sur " + PAUSE_STEPS.length + " · à ton rythme"
      }),
      el("h2", { text: step.title }),
      el("p", { class: "lead", text: step.text }),
      el("p", {
        class: "small",
        text: "Tu peux arrêter cette pause quand tu veux."
      }),
      button(
        index === PAUSE_STEPS.length - 1 ? "Retour à mon univers" : "Continuer doucement",
        () => {
          if (index >= PAUSE_STEPS.length - 1) {
            go(targetChild);
            return;
          }
          index++;
          render();
        },
        "button-primary"
      ),
      button("Terminer la pause", () => go(targetChild), "button-soft")
    ]);

    replaceApp(screen("Petite pause", content, {
      eyebrow: "Pause facultative",
      home: () => go("home")
    }));
    speak(step.spoken, getState().settings.voice);
  };

  render();
}
