import { el, button, screen, card, replaceApp, chooseExercise } from "./ui.js";
import { setRenderer, startRouter, go, lockParent, canAccessRoute } from "./router.js";
import { getState } from "./store.js";
import { startActivity } from "./child/activities.js";
import { readingMenu, startReading } from "./child/reading.js";
import { roseMenu, startRoseActivity } from "./child/rose-activities.js";
import { parentGate, parentDashboard, crisis } from "./parent/parent.js";
import { printComingSoon } from "./parent/printables.js";
import { speak } from "./voice.js";
import { unlockAudio } from "./audio.js";
import { numberMystery, compareNumbers, syllableGame, sequenceGame, geometryGame, footballAdventure, roseMagicAdventure, programmingGame, englishGame } from "./child/learning-lab.js";
import { guidedPause } from "./child/pause.js";
import { calculationMenu } from "./child/calcul.js";
import { sentenceBuilder } from "./child/sentence-builder.js";
import { schoolHome } from "./child/school.js";

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

function guidedChoice(child) {
  const rose = child === "rose";
  document.body.className = "theme-" + child;
  const content = el("div", { class: "stack" });
  const intro = rose
    ? "Bonjour Rose ! Qu’est-ce qui te ferait plaisir ? Tu peux choisir de compter, découvrir un jeu magique, ou écouter les syllabes."
    : "Salut Léon ! De quoi as-tu envie aujourd’hui ? Tu peux résoudre des défis de maths, lire, ou faire du calcul mental.";
  content.append(el("p", { class: "lead", text: rose
    ? "Choisis ce qui te donne envie. Je peux te lire les choix et tu peux changer d’avis."
    : "Choisis selon ton envie du moment. Pas besoin de tout faire : un seul défi suffit !" }));
  const options = rose ? [
    ["🏰 Je veux aller à l’école enchantée", "Petites leçons et jeux de maternelle", () => schoolHome("rose")],
    ["🦄 Je veux compter", "Compter les collections", () => startActivity("rose")],
    ["🌈 Je veux découvrir", "Couleurs, formes et lettres", () => roseMenu()],
    ["👏 Je veux écouter", "Les syllabes en rythme", () => syllableGame()],
    ["🦄 Je pars à l’aventure", "Une histoire magique avec des lettres", () => roseMagicAdventure()]
  ] : [
    ["🏟️ Je veux une leçon", "L’académie des champions : chapitres du CP au CM2", () => schoolHome("leon")],
    ["⚽ Je veux réfléchir", "Défis de maths", () => startActivity("leon")],
    ["📚 Je veux lire", "Mots, phrases et histoires", () => readingMenu()],
    ["🇬🇧 Je veux découvrir l’anglais", "Écouter cinq mots anglais", () => englishGame()],
    ["🧮 Je veux calculer", "Calcul mental et petits problèmes", () => calculationMenu()],
    ["🤖 Je veux programmer", "Guider un robot avec des flèches", () => programmingGame()]
  ];
  options.forEach(([label, description, action]) => content.append(card([
    el("h2", { text: label }),
    el("p", { class: "small", text: description }),
    button("Je choisis ce jeu", action, "button-primary")
  ])));
  content.append(button("🔊 Répéter les choix", () => speak(intro, getState().settings.voice), "button-soft"));
  content.append(button("↩ Retour", () => childHome(child), "button-soft"));
  replaceApp(screen(rose ? "Quel jeu te ferait plaisir ?" : "Quelle mission te tente ?", content, {
    eyebrow: "Le guide des aventures", home: () => go("home")
  }));
  speak(intro, getState().settings.voice);
}

const EXERCISES = [
  {child:"rose",name:"L’école enchantée",keywords:"école leçons maternelle nombres formes motifs temps espace longueurs masses",stars:1,description:"Douze chapitres de maternelle : une petite leçon, des jeux et un quiz.",run:()=>schoolHome("rose")},
  {child:"leon",name:"L’académie des champions",keywords:"école leçons chapitres cp ce1 ce2 cm1 cm2 fractions heure monnaie géométrie problèmes tables quiz",stars:2,description:"Tous les chapitres du CP au CM2 : leçon courte, entraînements et quiz.",run:()=>schoolHome("leon")},
  {child:"rose",name:"Compter les objets",keywords:"compter nombres collections",stars:1,description:"Dénombrer de petites collections.",run:()=>startActivity("rose")},
  {child:"rose",name:"Couleurs magiques",keywords:"couleurs rouge bleu jaune vert",stars:1,description:"Reconnaître les couleurs.",run:()=>startRoseActivity("colors")},
  {child:"rose",name:"Suites magiques",keywords:"logique motifs répétitions images suite",stars:2,description:"Observer un motif et trouver l’image suivante.",run:()=>startRoseActivity("patterns")},
  {child:"rose",name:"Formes à retrouver",keywords:"formes cercle carré triangle géométrie",stars:2,description:"Observer et reconnaître les formes.",run:()=>startRoseActivity("shapes")},
  {child:"rose",name:"Lettres de Rose",keywords:"lettres alphabet prénom majuscule",stars:1,description:"Retrouver R, O, S et E.",run:()=>startRoseActivity("letters")},
  {child:"rose",name:"Les sons des lettres",keywords:"sons lettres écouter alphabet phonologie",stars:1,description:"Écoute le nom d’une lettre et retrouve-la parmi les bulles.",run:()=>startRoseActivity("letter-sounds")},
  {child:"rose",name:"Grandes et petites lettres",keywords:"alphabet minuscule majuscule associer",stars:2,description:"Associer les lettres majuscules et minuscules.",run:()=>startRoseActivity("letter-pairs")},
  {child:"rose",name:"Syllabes en rythme",keywords:"syllabes écouter mots taper mains",stars:2,description:"Écouter les syllabes des mots.",run:()=>syllableGame()},
  {child:"leon",name:"Défis de maths",keywords:"maths problèmes nombres calcul",stars:2,description:"Résoudre des questions de maths variées.",run:()=>startActivity("leon")},
  {child:"leon",name:"Nombre mystère",keywords:"numération indices nombre caché",stars:2,description:"Trouver un nombre grâce aux indices.",run:()=>numberMystery()},
  {child:"leon",name:"Comparer les nombres",keywords:"plus grand petit comparer centaines dizaines",stars:2,description:"Comparer des nombres à deux ou trois chiffres.",run:()=>compareNumbers()},
  {child:"leon",name:"Suites logiques",keywords:"logique suite motif symbole nombres régularité",stars:2,description:"Repérer une règle et trouver le symbole ou le nombre suivant.",run:()=>sequenceGame()},
  {child:"leon",name:"Géométrie des champions",keywords:"géométrie formes côtés triangle carré cercle rectangle segment règle",stars:1,description:"Reconnaître les formes et découvrir comment tracer un segment.",run:()=>geometryGame()},
  {child:"leon",name:"Le petit robot programmeur",keywords:"programmation coder robot flèches commandes logique",stars:2,description:"Donner des instructions au robot pour atteindre une étoile.",run:()=>programmingGame()},
  {child:"leon",name:"Mes premiers mots en anglais",keywords:"anglais oral écouter prononcer vocabulaire english",stars:1,description:"Écouter cinq mots anglais et retrouver leur sens en français.",run:()=>englishGame()},
  {child:"leon",name:"L’aventure du match",keywords:"football histoire lecture compréhension aventure équipe but",stars:2,description:"Lis une aventure de football et fais avancer l’histoire avec tes réponses.",run:()=>footballAdventure()},
  {child:"leon",name:"Phrases à reconstruire",keywords:"lecture mots phrase syntaxe remettre ordre",stars:2,description:"Remets les mots dans l’ordre pour former une phrase.",run:()=>sentenceBuilder()},
  {child:"leon",name:"Calcul mental",keywords:"calcul additions soustractions compléments problèmes",stars:2,description:"Calculer et résoudre des petits problèmes.",run:()=>calculationMenu()},
  {child:"leon",name:"Mots-éclairs",keywords:"lecture mots reconnaître rapidement",stars:1,description:"Reconnaître des mots familiers.",run:()=>startReading("flash")},
  {child:"leon",name:"Mots-mystères",keywords:"lecture syllabes assembler déchiffrer",stars:2,description:"Assembler des syllabes pour lire.",run:()=>startReading("mystery")},
  {child:"leon",name:"Phrases à comprendre",keywords:"lecture compréhension phrase",stars:2,description:"Lire une phrase et retrouver l’information.",run:()=>startReading("sentence")},
  {child:"leon",name:"Mini-textes",keywords:"lecture histoire texte compréhension",stars:3,description:"Lire quelques lignes et comprendre.",run:()=>startReading("text")},
  {child:"leon",name:"Chasse aux rimes",keywords:"sons rimes phonologie écouter",stars:2,description:"Repérer les sons à la fin des mots.",run:()=>startReading("rhyme")},
  {child:"leon",name:"Syllabes en rythme",keywords:"lecture syllabes oral découper mots",stars:1,description:"Découper des mots à l’oral.",run:()=>startReading("syllables")}
];
function starLabel(level){return "★".repeat(level)+"☆".repeat(3-level);}
function exerciseSearch(child){
 const section=el("section",{class:"exercise-search", "aria-label":"Rechercher un exercice"});
 section.append(el("h3",{text:"🔎 Trouve ton jeu"}),el("p",{class:"small",text:"Tape un mot : maths, lettres, lecture, syllabes…"}),el("p",{class:"small",text:"★ Découverte · ★★ Je réfléchis · ★★★ Défi plus exigeant. Les étoiles donnent un repère, chacun avance à son rythme."}));
 const input=el("input",{type:"search",placeholder:"Rechercher un exercice…","aria-label":"Rechercher un exercice"});
 input.className="exercise-search-input";
 const results=el("div",{class:"exercise-search-results","aria-live":"polite"});
 const draw=()=>{
  const query=input.value.trim().toLocaleLowerCase("fr");
  const matches=EXERCISES.filter(item=>item.child===child&&(!query||(item.name+" "+item.keywords+" "+item.description).toLocaleLowerCase("fr").includes(query)));
  results.replaceChildren();
  if(!matches.length){results.append(el("p",{class:"small",text:"Aucun jeu trouvé. Essaie un autre mot."}));return;}
  matches.forEach(item=>results.append(card([
   el("div",{class:"exercise-result-heading"},[el("strong",{text:item.name}),el("span",{class:"exercise-stars","aria-label":item.stars+" étoile"+(item.stars>1?"s":"")+" sur 3",text:starLabel(item.stars)})]),
   el("p",{class:"small",text:item.description}),
   button("Jouer",()=>{unlockAudio();item.run();},"button-primary")
  ])));
 };
 input.addEventListener("input",draw);
 section.append(input,results);
 draw();
 return section;
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
      button("🏰\nL’école enchantée\nPetites leçons, jeux et quiz de maternelle", () => {
        unlockAudio();
        schoolHome("rose");
      }, "child-tile child-tile-main"),
      button("🦄\nJeux enchantés\nCompter, couleurs, formes et lettres", chooseExercise("Rose, dans les jeux enchantés, tu pourras compter, découvrir les couleurs, reconnaître les formes et jouer avec les lettres.", () => {
        unlockAudio();
        roseMenu();
      }), "child-tile child-tile-alt"),
      button("👏\nSyllabes en rythme\nÉcoute les mots et frappe dans tes mains", chooseExercise("Rose, écoute un mot puis frappe dans tes mains pour compter les syllabes.", () => {
        unlockAudio();
        syllableGame();
      }), "child-tile child-tile-alt")
    );
  } else {
    tiles.append(
      button("🏟️\nL’académie des champions\nLeçons, entraînements et quiz du CP au CM2", () => {
        unlockAudio();
        schoolHome("leon");
      }, "child-tile child-tile-main"),
      button("⚽\nDéfis de maths\nNombres, calculs et petits problèmes", chooseExercise("Léon, résous des défis de maths, réfléchis aux nombres et trouve les bonnes réponses.", () => {
        unlockAudio();
        startActivity(child);
      }), "child-tile child-tile-alt"),
      button("🇬🇧\nMes premiers mots en anglais\nÉcoute et découvre", chooseExercise("Léon, écoute un mot anglais et retrouve sa signification en français.", () => { unlockAudio(); englishGame(); }), "child-tile child-tile-alt"),
      button("📚\nJeux de lecture\nMots, phrases et petites histoires", chooseExercise("Léon, lis des mots, des phrases et de petites histoires, puis réponds aux questions.", () => {
        unlockAudio();
        readingMenu();
      }), "child-tile child-tile-alt"),
      button("🔎\nNombre mystère\nTrouve le nombre caché", chooseExercise("Léon, écoute les indices et trouve le nombre mystère.", () => {
        unlockAudio();
        numberMystery();
      }), "child-tile child-tile-alt"),
      button("⚖️\nLe plus grand nombre\nCompare et choisis le bon nombre", chooseExercise("Léon, compare les nombres et choisis celui qui est le plus grand.", () => {
        unlockAudio();
        compareNumbers();
      }), "child-tile child-tile-alt"),
      button("🔢\nSuites logiques\nTrouve le prochain symbole ou nombre", chooseExercise("Léon, observe les suites et trouve le prochain symbole ou nombre.", () => { unlockAudio(); sequenceGame(); }), "child-tile child-tile-alt"),
      button("📐\nGéométrie des champions\nFormes, côtés et règle", chooseExercise("Léon, observe les formes, compte leurs côtés et découvre comment tracer un segment avec une règle.", () => { unlockAudio(); geometryGame(); }), "child-tile child-tile-alt"),
      button("🤖\nPetit robot programmeur\nDonne les bonnes instructions", chooseExercise("Léon, observe la grille et choisis les flèches qui guident le robot jusqu’à l’étoile.", () => { unlockAudio(); programmingGame(); }), "child-tile child-tile-alt"),
      button("🏆\nL’aventure du match\nLis et fais avancer ton équipe", chooseExercise("Léon, lis une aventure de football et choisis les bonnes décisions pour aider ton équipe.", () => { unlockAudio(); footballAdventure(); }), "child-tile child-tile-alt"),
      button("🧩\nPhrases à reconstruire\nRemets les mots dans le bon ordre", chooseExercise("Léon, remets les mots dans le bon ordre pour former une phrase.", () => { unlockAudio(); sentenceBuilder(); }), "child-tile child-tile-alt"),
      button("🧮\nCalcul mental\nCalculs et problèmes à résoudre", chooseExercise("Léon, fais les calculs dans ta tête et résous les petits problèmes.", () => {
        unlockAudio();
        calculationMenu();
      }), "child-tile child-tile-alt")
    );
  }
  section.append(tiles);
  const profile = getState().profiles[child];
  const successRate = profile.attempts ? Math.round(profile.correct / profile.attempts * 100) : 0;
  const progressCard = el("div", { class: "child-gentle-note child-progress-note" }, [
    el("span", { "aria-hidden": "true", text: rose ? "🌟" : "🏅" }),
    el("div", {}, [
      el("strong", { text: rose ? "Ton chemin magique" : "Ton parcours de champion" }),
      el("p", { text: profile.stickers + (profile.stickers > 1 ? " petits trophées gagnés" : " petit trophée gagné") + " · " + profile.correct + " réussites · " + profile.sessions + (profile.sessions === 1 ? " partie terminée." : " parties terminées.") }),
      el("div", { class: "progress-track", role: "progressbar", "aria-label": "Réponses réussies", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(successRate), "aria-valuetext": successRate + " % de réponses réussies" },
        el("div", { class: "progress-fill", style: "width:" + successRate + "%" })
      ),
      el("p", { class: "small", text: profile.attempts ? successRate + " % de réponses réussies sur " + profile.attempts + " essais. Chaque essai compte !" : "Ton aventure commence ici : chaque essai fera grandir ton parcours !" })
    ])
  ]);
  const gentle = el("div", { class: "child-gentle-note" }, [
    el("span", { "aria-hidden": "true", text: "💛" }),
    el("p", { text: rose ? "Tu peux prendre ton temps. Chaque essai est une découverte !" : "Pas besoin d’aller vite : réfléchir, essayer et recommencer, c’est déjà gagner !" })
  ]);
  const tools = el("div", { class: "child-bottom-actions" }, [
    button("🎙️ Aide-moi à choisir", () => guidedChoice(child), "button-primary"),
    button("🌿 Petite pause", () => guidedPause(child), "button-warm"),
    button("🔊 Réécouter", () => speak(
      rose
        ? "Choisis un jeu magique : l’école enchantée, compter, découvrir les couleurs, les formes, les lettres ou les syllabes."
        : "Choisis une mission : l’académie des champions, les défis de maths, la lecture, le nombre mystère, le plus grand nombre ou le calcul mental.",
      getState().settings.voice
    ), "button-soft")
  ]);
  content.append(hero, section, progressCard, exerciseSearch(child), gentle, tools);
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
