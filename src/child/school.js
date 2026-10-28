// L’École de Rose & Léon : niveaux → chapitres → leçon courte → entraînements → quiz.
import { el, button, screen, card, replaceApp, showGameNext } from "../ui.js";
import { getState, recordAnswer, recordSession, recordSchoolResult } from "../store.js";
import { speak } from "../voice.js";
import { cheer, gentleOops, successPraise, sessionPraise, unlockAudio } from "../audio.js";
import { go } from "../router.js";
import { SCHOOL_LEVELS, CHILD_LEVELS, findLevel, findChapter } from "./school-curriculum.js";
import { createSchoolQuestion, checkAnswer, shuffle } from "./school-engine.js";
import { renderVisual, choiceContent, richText } from "./school-visuals.js";

const UNIVERSE = {
  rose: { name: "L’école enchantée", eyebrow: "Le royaume des savoirs", art: "🏰 🦄 📚", kicker: "Apprendre en s’amusant", trophy: "🦄", star: "🌟" },
  leon: { name: "L’académie des champions", eyebrow: "Centre de formation des maths", art: "🏟️ ⚽ 📘", kicker: "Leçons et entraînements", trophy: "🏆", star: "⭐" }
};
const lastLevel = { rose: null, leon: null };
const voiceOn = () => getState().settings.voice;
const soundsOn = () => getState().settings.sounds;

/** Texte prêt à être lu à voix haute (symboles mathématiques en mots). */
export function speechify(text) {
  return String(text)
    .replace(/(\d+)\/(\d+)/g, "$1 sur $2")
    .replace(/×/g, " fois ")
    .replace(/÷/g, " divisé par ")
    .replace(/ − /g, " moins ")
    .replace(/ = \?/g, " égale combien ?")
    .replace(/\? \+/g, "combien plus")
    .replace(/(\d) h (\d\d)/g, "$1 heures $2")
    .replace(/(\d) h\b/g, "$1 heures")
    .replace(/ cm²/g, " centimètres carrés")
    .replace(/[→]/g, " droite ").replace(/[←]/g, " gauche ").replace(/[↑]/g, " haut ").replace(/[↓]/g, " bas ")
    .replace(/ ; /g, ", ");
}

/* ---------- Étoiles et progression ---------- */
export function starsFor(firstTry, total) {
  if (total <= 0) return 0;
  if (firstTry >= total) return 3;
  if (firstTry >= Math.ceil(total * 0.6)) return 2;
  return 1;
}
const starText = (n, max = 3) => "★".repeat(n) + "☆".repeat(max - n);
function chapterProgress(child, chapter) {
  const school = getState().profiles[child].school || {};
  const ids = [...chapter.skills.map(sk => sk.id), chapter.id + ".quiz"];
  const earned = ids.reduce((sum, id) => sum + (school[id]?.stars || 0), 0);
  return { earned, max: ids.length * 3, done: ids.filter(id => (school[id]?.stars || 0) > 0).length, total: ids.length };
}

/* ---------- Écran d’accueil de l’École ---------- */
export function schoolHome(child, levelId = null) {
  unlockAudio();
  const u = UNIVERSE[child];
  document.body.className = "theme-" + child + " school-mode";
  const allowed = CHILD_LEVELS[child];
  const current = findLevel(levelId || lastLevel[child] || allowed[0]);
  lastLevel[child] = current.id;
  const content = el("div", { class: "stack school" });
  content.append(el("section", { class: "child-hero child-hero-" + child + " school-hero" }, [
    el("div", { class: "child-hero-art", "aria-hidden": "true", text: u.art }),
    el("p", { class: "child-hero-kicker", text: u.kicker }),
    el("h2", { class: "child-hero-title", text: child === "rose" ? "Que veux-tu apprendre, Rose\u00a0?" : "Quel chapitre aujourd’hui, Léon\u00a0?" }),
    el("p", { class: "child-hero-copy", text: child === "rose" ? "Écoute la petite leçon, puis joue. Tu peux toucher 🔊 pour réécouter." : "Une leçon courte, des entraînements et un quiz par chapitre. Tu choisis !" })
  ]));
  const tabs = el("div", { class: "school-levels", role: "tablist", "aria-label": "Choisis ton niveau" });
  allowed.map(findLevel).forEach(level => {
    const active = level.id === current.id;
    const tab = button(level.emoji + " " + level.label, () => schoolHome(child, level.id), "school-level" + (active ? " is-active" : ""), { role: "tab", "aria-selected": String(active) });
    tabs.append(tab);
  });
  content.append(tabs);
  const levelStats = current.chapters.reduce((acc, ch) => { const p = chapterProgress(child, ch); acc.e += p.earned; acc.m += p.max; return acc; }, { e: 0, m: 0 });
  content.append(el("div", { class: "school-level-intro" }, [
    el("p", { text: current.intro }),
    el("div", { class: "progress-track", role: "progressbar", "aria-label": "Étoiles gagnées dans ce niveau", "aria-valuemin": "0", "aria-valuemax": String(levelStats.m), "aria-valuenow": String(levelStats.e) }, el("div", { class: "progress-fill", style: "width:" + (levelStats.m ? Math.round(levelStats.e / levelStats.m * 100) : 0) + "%" })),
    el("p", { class: "small", text: levelStats.e + " étoile" + (levelStats.e > 1 ? "s" : "") + " sur " + levelStats.m + " dans ce niveau" })
  ]));
  const list = el("div", { class: "school-chapters" });
  current.chapters.forEach(chapter => {
    const p = chapterProgress(child, chapter);
    const item = button("", () => chapterPage(child, chapter.id), "school-chapter");
    item.append(
      el("span", { class: "school-chapter-num", "aria-hidden": "true", text: String(chapter.number) }),
      el("span", { class: "school-chapter-emoji", "aria-hidden": "true", text: chapter.emoji }),
      el("span", { class: "school-chapter-body" }, [
        el("strong", { text: chapter.title }),
        el("span", { class: "school-chapter-meta", text: (chapter.skills.length + 1) + " défis · " + p.done + " réussi" + (p.done > 1 ? "s" : "") })
      ]),
      el("span", { class: "school-chapter-stars", "aria-label": p.earned + " étoiles sur " + p.max, text: p.earned ? "⭐ " + p.earned : "▶" })
    );
    item.setAttribute("aria-label", "Chapitre " + chapter.number + " : " + chapter.title);
    list.append(item);
  });
  content.append(list,
    el("p", { class: "school-credit small", text: "Exercices créés pour Rose et Léon, d’après les grands thèmes des programmes de l’école." }),
    button("↩ Retour à mon univers", () => go(child), "button-soft"));
  replaceApp(screen(u.name, content, { eyebrow: u.eyebrow, home: () => go("home") }));
  speak(child === "rose" ? "Bienvenue à l’école enchantée ! Choisis un chapitre." : "Bienvenue à l’académie des champions ! Choisis un chapitre.", voiceOn());
}

/* ---------- Page d’un chapitre ---------- */
export function chapterPage(child, chapterId) {
  const chapter = findChapter(chapterId);
  if (!chapter) return schoolHome(child);
  const level = SCHOOL_LEVELS.find(l => l.chapters.includes(chapter));
  document.body.className = "theme-" + child + " school-mode";
  const school = getState().profiles[child].school || {};
  const content = el("div", { class: "stack school" });
  content.append(el("nav", { class: "school-crumbs", "aria-label": "Fil d’Ariane" }, [
    button(level.emoji + " " + level.label, () => schoolHome(child, level.id), "school-crumb"),
    el("span", { "aria-hidden": "true", text: "›" }),
    el("span", { text: "Chapitre " + chapter.number })
  ]));
  const lessonText = chapter.lesson.lesson + " Par exemple : " + chapter.lesson.example + (chapter.lesson.tip ? " Astuce : " + chapter.lesson.tip : "");
  content.append(el("section", { class: "school-lesson", "aria-labelledby": "lesson-title" }, [
    el("div", { class: "school-lesson-head" }, [
      el("span", { class: "school-lesson-emoji", "aria-hidden": "true", text: chapter.emoji }),
      el("h2", { id: "lesson-title", text: chapter.title })
    ]),
    el("div", { class: "school-box school-box-def" }, [el("p", { class: "school-box-label", text: "📘 Je découvre" }), el("p", {}, richText(chapter.lesson.lesson))]),
    el("div", { class: "school-box school-box-example" }, [el("p", { class: "school-box-label", text: "👀 Exemple" }), el("p", {}, richText(chapter.lesson.example))]),
    chapter.lesson.tip ? el("div", { class: "school-box school-box-tip" }, [el("p", { class: "school-box-label", text: "💡 Astuce" }), el("p", {}, richText(chapter.lesson.tip))]) : null,
    button("🔊 Écouter la leçon", () => speak(speechify(lessonText), voiceOn()), "button-soft")
  ].filter(Boolean)));
  const skills = el("section", { class: "school-skills", "aria-label": "Je m’entraîne" }, [el("h3", { text: "⚡ Je m’entraîne" })]);
  chapter.skills.forEach(skill => {
    const stars = school[skill.id]?.stars || 0;
    const row = el("div", { class: "school-skill" }, [
      el("div", { class: "school-skill-text" }, [el("strong", { text: skill.title }), el("span", { class: "exercise-stars", "aria-label": stars + " étoiles sur 3", text: starText(stars) })]),
      button(stars ? "Rejouer" : "Pratiquer", () => practice(child, chapter.id, [skill.id]), "button-primary school-practice")
    ]);
    skills.append(row);
  });
  const quizStars = school[chapter.id + ".quiz"]?.stars || 0;
  skills.append(el("div", { class: "school-skill school-skill-quiz" }, [
    el("div", { class: "school-skill-text" }, [el("strong", { text: "🏆 Quiz du chapitre" }), el("span", { class: "exercise-stars", "aria-label": quizStars + " étoiles sur 3", text: starText(quizStars) })]),
    button("Lancer le quiz", () => practice(child, chapter.id, chapter.skills.map(sk => sk.id), { quiz: true }), "button-primary school-practice")
  ]));
  content.append(skills);
  const index = level.chapters.indexOf(chapter);
  const nav = el("div", { class: "button-row school-chapter-nav" });
  if (index > 0) nav.append(button("← " + level.chapters[index - 1].title, () => chapterPage(child, level.chapters[index - 1].id), "button-soft"));
  if (index < level.chapters.length - 1) nav.append(button(level.chapters[index + 1].title + " →", () => chapterPage(child, level.chapters[index + 1].id), "button-soft"));
  content.append(nav, button("📚 Tous les chapitres", () => schoolHome(child, level.id), "button-soft"));
  replaceApp(screen(chapter.title, content, { eyebrow: level.label + " · Chapitre " + chapter.number, home: () => go("home") }));
  speak(speechify(child === "rose" ? lessonText : chapter.title + ". " + chapter.lesson.lesson), voiceOn());
}

/* ---------- Entraînement et quiz ---------- */
export function practice(child, chapterId, skillIds, { quiz = false } = {}) {
  const chapter = findChapter(chapterId);
  if (!chapter) return schoolHome(child);
  const skills = skillIds.map(id => chapter.skills.find(sk => sk.id === id)).filter(Boolean);
  if (!skills.length) return chapterPage(child, chapterId);
  document.body.className = "theme-" + child + " school-mode";
  const total = quiz ? (child === "rose" ? 5 : 6) : (child === "rose" ? 4 : 5);
  const plan = Array.from({ length: total }, (_, i) => skills[i % skills.length]);
  const order = quiz ? shuffle(plan) : plan;
  const resultId = quiz ? chapter.id + ".quiz" : skills[0].id;
  const title = quiz ? "Quiz : " + chapter.title : skills[0].title;
  let round = 0, firstTry = 0, question, mistakes = 0, locked = false, helped = false;
  const seen = new Set();

  const generate = () => {
    let candidate, attempts = 0;
    do { candidate = createSchoolQuestion(order[round], { child, step: round }); attempts++; }
    while (seen.has(candidate.prompt + "|" + candidate.answer) && attempts < 40);
    question = candidate;
    seen.add(question.prompt + "|" + question.answer);
    mistakes = 0; locked = false; helped = false;
  };
  const read = () => speak(speechify(question.speech), voiceOn());

  const finish = () => {
    const stars = starsFor(firstTry, total);
    recordSchoolResult(child, resultId, stars);
    recordSession(child);
    const message = sessionPraise(child, voiceOn());
    const level = SCHOOL_LEVELS.find(l => l.chapters.includes(chapter));
    const index = level.chapters.indexOf(chapter);
    const body = card([
      el("div", { class: "school-finish-trophy", "aria-hidden": "true", text: UNIVERSE[child].trophy }),
      el("p", { class: "school-finish-stars", "aria-label": stars + " étoiles sur 3", text: starText(stars) }),
      el("p", { class: "lead", text: message }),
      el("p", { class: "small", text: firstTry + " réponse" + (firstTry > 1 ? "s" : "") + " trouvée" + (firstTry > 1 ? "s" : "") + " du premier coup sur " + total + ". Les autres, tu les as trouvées en persévérant : ça compte aussi !" }),
      button("🔁 Rejouer", () => practice(child, chapterId, skillIds, { quiz }), "button-primary"),
      button("📘 Retour au chapitre", () => chapterPage(child, chapterId), "button-soft"),
      index < level.chapters.length - 1 ? button("➜ Chapitre suivant : " + level.chapters[index + 1].title, () => chapterPage(child, level.chapters[index + 1].id), "button-soft") : null
    ].filter(Boolean));
    replaceApp(screen(quiz ? "Quiz terminé !" : "Entraînement terminé !", body, { eyebrow: chapter.title, home: () => go("home") }));
  };

  function render() {
    const content = card([], "card school-question");
    const feedback = el("p", { class: "feedback", role: "status", "aria-live": "polite" });
    content.append(
      el("p", { class: "small", text: (quiz ? "Quiz" : "Entraînement") + " · question " + (round + 1) + " sur " + total }),
      el("div", { class: "progress-track", role: "progressbar", "aria-label": "Progression", "aria-valuemin": "0", "aria-valuemax": String(total), "aria-valuenow": String(round) }, el("div", { class: "progress-fill", style: "width:" + (round / total * 100) + "%" })),
      el("div", { class: "school-prompt" + (question.prompt.length > 60 ? " is-long" : "") }, richText(question.prompt))
    );
    const visual = renderVisual(question.visual);
    if (visual) content.append(el("div", { class: "school-visual" }, visual));
    if (question.visual?.type === "items" && question.visual.tappable !== false) content.append(el("p", { class: "small counting-help", text: "Touche les images pour les cocher pendant que tu comptes." }));

    const answers = el("div", { class: "answer-grid school-answers" + (question.choices.length === 2 ? " is-two" : "") + (["words"].includes(question.choiceStyle) || question.choices.some(c => c.length > (child === "rose" ? 8 : 12)) ? " is-wide" : "") });
    const choiceButtons = [];
    const showChoices = () => {
      answers.replaceChildren();
      choiceButtons.length = 0;
      question.choices.forEach(choice => {
        const b = button("", () => answer(choice, b), "button-soft school-choice choice-" + question.choiceStyle);
        b.append(choiceContent(question, choice));
        b.setAttribute("aria-label", choice);
        choiceButtons.push(b);
        answers.append(b);
      });
    };
    let input = null, validate = null;
    if (question.answerType === "number") {
      const decimal = question.answer.includes(",");
      input = el("input", { type: "text", inputmode: decimal ? "decimal" : "numeric", autocomplete: "off", "aria-label": "Ta réponse", placeholder: "?" });
      input.className = "answer-input";
      input.addEventListener("keydown", e => { if (e.key === "Enter") validate.click(); });
      const unit = question.answer.match(/\s([^\d\s,]+)$/)?.[1];
      const clear = button("🧹 Effacer", () => { input.value = ""; feedback.textContent = "C’est effacé ! Tu peux écrire une nouvelle réponse."; input.focus(); }, "button-soft answer-clear", { "aria-label": "Effacer la réponse" });
      const row = el("div", { class: "answer-input-row" }, [input, unit ? el("span", { class: "school-unit", text: unit }) : null, clear].filter(Boolean));
      validate = button("Vérifier", () => {
        if (!input.value.trim()) { feedback.textContent = "Écris ta réponse avant de vérifier."; return; }
        answer(input.value, validate);
      }, "button-primary");
      const toChoices = button("🎯 Voir des propositions", () => { row.remove(); validate.remove(); toChoices.remove(); showChoices(); content.insertBefore(answers, feedback); }, "button-soft school-to-choices");
      content.append(row, validate, toChoices);
    } else {
      showChoices();
      content.append(answers);
    }
    content.append(feedback);
    const hintButton = button("💡 Un indice", () => { helped = true; feedback.textContent = question.hint; }, "button-soft");
    content.append(el("div", { class: "button-row" }, [button("🔊 Réécouter", read, "button-soft"), hintButton]),
      el("div", { class: "button-row" }, [button("📘 Revoir la leçon", () => chapterPage(child, chapterId), "button-soft"), button("⏹ Arrêter", () => chapterPage(child, chapterId), "button-soft")]));
    replaceApp(screen(title, content, { eyebrow: quiz ? "Quiz du chapitre" : chapter.title, home: () => go("home") }));
    if (input && window.matchMedia?.("(pointer:fine)").matches) input.focus();
    read();

    function answer(given, source) {
      if (locked) return;
      const ok = checkAnswer(question, given);
      recordAnswer(child, ok);
      if (!ok) {
        mistakes++;
        gentleOops(soundsOn());
        if (source && source !== validate) { source.disabled = true; source.classList.add("is-wrong"); }
        if (mistakes === 1) feedback.textContent = pickOne(child === "rose" ? ["Presque ! Regarde encore et essaie tranquillement.", "Bien essayé ! On regarde une nouvelle fois.", "Pas encore, mais tu peux y arriver !"] : ["Pas tout à fait. Relis la question et réessaie.", "Bien tenté ! Prends ton temps.", "Ce n’est pas grave : on réfléchit et on retente."]);
        else if (mistakes === 2) { helped = true; feedback.textContent = "Un petit indice : " + question.hint; }
        else {
          helped = true; locked = true;
          feedback.textContent = "On regarde ensemble : " + question.explanation;
          revealAnswer();
          offerNext();
        }
        return;
      }
      locked = true;
      if (mistakes === 0 && !helped) firstTry++;
      cheer(soundsOn());
      if (source && source !== validate) source.classList.add("is-right");
      choiceButtons.forEach(b => { b.disabled = true; });
      if (input) { input.disabled = true; validate.disabled = true; }
      const praise = mistakes === 0 ? pickOne(child === "rose" ? ["Oui, bravo ! ", "Youpi, tu as trouvé ! ", "Super ! "] : ["Exactement ! ", "Bien joué ! ", "Bravo pour ton raisonnement ! "]) : "Tu as persévéré, bravo ! ";
      feedback.textContent = praise + question.explanation;
      successPraise(child, voiceOn(), feedback.textContent);
      offerNext();
    }
    function revealAnswer() {
      choiceButtons.forEach(b => { b.disabled = true; if (b.getAttribute("aria-label") === question.answer) b.classList.add("is-right"); });
      if (input) { input.value = question.answer; input.disabled = true; validate.disabled = true; }
    }
    function offerNext() {
      const next = button(round + 1 >= total ? "Voir mes étoiles ✨" : "Question suivante ➜", () => {
        round++;
        if (round >= total) finish(); else { generate(); render(); }
      }, "button-primary");
      showGameNext(next, feedback);
    }
  }
  generate();
  render();
}
function pickOne(list) { return list[Math.floor(Math.random() * list.length)]; }

/* ---------- Résumé pour l’espace parent ---------- */
export function schoolSummary(child) {
  const school = getState().profiles[child].school || {};
  return SCHOOL_LEVELS.map(level => {
    const ids = level.chapters.flatMap(ch => [...ch.skills.map(sk => sk.id), ch.id + ".quiz"]);
    const stars = ids.reduce((sum, id) => sum + (school[id]?.stars || 0), 0);
    const played = ids.filter(id => school[id]?.plays).length;
    return { id: level.id, label: level.label, stars, max: ids.length * 3, played, total: ids.length };
  }).filter(row => row.played > 0);
}
