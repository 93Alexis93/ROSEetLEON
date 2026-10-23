import { el, button, screen, card, replaceApp } from "../ui.js";
import { getState, recordAnswer, recordSession } from "../store.js";
import { speak } from "../voice.js";
import { go } from "../router.js";

const BASE_WORDS = [
  "lapin", "maison", "ballon", "soleil", "bateau", "papa", "maman", "vélo",
  "école", "chat", "livre", "rose", "léon", "fusée", "forêt", "gâteau",
  "ami", "lune", "moto", "tomate", "banane", "papillon", "chocolat", "pirate",
  "robot", "cadeau", "pomme", "poire", "poule", "canard", "jardin", "fleur",
  "maîtresse", "cartable", "crayon", "étoile", "nuage", "montagne", "musique",
  "maillot", "tortue", "girafe", "poussin", "savon", "valise"
];
const pick = items => items[Math.floor(Math.random() * items.length)];
const shuffle = items => [...items].sort(() => Math.random() - 0.5);
const syllables = {
  lapin: "la-pin",
  maison: "mai-son",
  ballon: "bal-lon",
  soleil: "so-leil",
  bateau: "ba-teau",
  papa: "pa-pa",
  maman: "ma-man",
  vélo: "vé-lo",
  école: "é-cole",
  chat: "chat",
  livre: "livre",
  rose: "rose",
  léon: "lé-on",
  fusée: "fu-sée",
  forêt: "fo-rêt",
  gâteau: "gâ-teau",
  ami: "a-mi", lune: "lu-ne", moto: "mo-to", tomate: "to-ma-te",
  banane: "ba-na-ne", papillon: "pa-pi-llon", chocolat: "cho-co-lat",
  pirate: "pi-rate", robot: "ro-bot", cadeau: "ca-deau", pomme: "pom-me",
  poire: "poi-re", poule: "pou-le", canard: "ca-nard", jardin: "jar-din",
  fleur: "fleur", maîtresse: "maî-tres-se", cartable: "car-ta-ble",
  crayon: "cra-yon", étoile: "é-toi-le", nuage: "nu-age",
  montagne: "mon-ta-gne", musique: "mu-si-que", maillot: "mail-lot",
  tortue: "tor-tue", girafe: "gi-ra-fe", poussin: "pou-ssin",
  savon: "sa-von", valise: "va-li-se"
};

function bank() {
  const custom = getState().customWords
    .map(entry => typeof entry === "string" ? entry : entry.word)
    .filter(Boolean);
  return [...new Set([
    ...BASE_WORDS,
    ...custom
      .map(word => word.trim().toLocaleLowerCase("fr"))
      .filter(word => /^[a-zà-ÿ-]{2,24}$/i.test(word))
  ])];
}

function question(mode) {
  const words = bank();
  const word = pick(words);
  const others = shuffle(words.filter(item => item !== word)).slice(0, 3);

  if (mode === "flash") {
    return {
      mode,
      prompt: "Écoute le mot, puis retrouve-le.",
      speakText: word,
      answer: word,
      choices: shuffle([word, ...others]),
      hint: "Écoute encore une fois, puis compare les mots proposés.",
      explanation: "Le mot entendu était « " + word + " »."
    };
  }

  if (mode === "mystery") {
    const known = Boolean(syllables[word]);
    const parts = (syllables[word] || "").split("-");
    const shown = known
      ? (parts.length > 1 ? parts.slice(0, -1).join("-") + "-…" : word.slice(0, -1) + "…")
      : word.slice(0, Math.max(1, Math.floor(word.length / 2))) + "…";
    return {
      mode,
      prompt: "Quel mot se cache derrière : " + shown + " ?",
      answer: word,
      choices: shuffle([word, ...others]),
      hint: known
        ? "Prononce les syllabes une à une, puis rassemble-les."
        : "Lis le début du mot, puis cherche celui qui correspond.",
      explanation: "Le mot recherché est « " + word + " »."
    };
  }

  if (mode === "sentence") {
    const sentences = [
      { text: "Le lapin saute dans le jardin.", q: "De qui parle la phrase ?", answer: "Le lapin", choices: ["Le lapin", "Le bateau", "Le gâteau", "La forêt"] },
      { text: "Maman lit un livre.", q: "Que lit Maman ?", answer: "un livre", choices: ["un vélo", "un livre", "un ballon", "une fusée"] },
      { text: "Le soleil brille.", q: "Qu’est-ce qui brille ?", answer: "Le soleil", choices: ["La maison", "Le soleil", "La forêt", "Le bateau"] },
      { text: "Rose roule à vélo.", q: "Comment Rose se déplace-t-elle ?", answer: "à vélo", choices: ["à vélo", "à l’école", "dans l’eau", "en fusée"] },
      { text: "Le chat dort sur le canapé.", q: "Où dort le chat ?", answer: "sur le canapé", choices: ["sur le canapé", "dans le jardin", "dans le bateau", "à l’école"] },
      { text: "Lina plante une graine dans un pot.", q: "Que plante Lina ?", answer: "une graine", choices: ["une graine", "une fleur coupée", "un ballon", "un crayon"] },
      { text: "Noé met son manteau car il fait froid.", q: "Pourquoi Noé met-il son manteau ?", answer: "car il fait froid", choices: ["car il fait froid", "car il a faim", "car il pleut du chocolat", "car il va dormir"] },
      { text: "Dans la mare, trois canards nagent.", q: "Combien de canards nagent ?", answer: "trois", choices: ["deux", "trois", "quatre", "cinq"] },
      { text: "Papa prépare une soupe avec des carottes.", q: "Avec quoi Papa prépare-t-il la soupe ?", answer: "des carottes", choices: ["des carottes", "des pommes", "des crayons", "des fleurs"] },
      { text: "Mila range ses crayons dans la trousse.", q: "Où Mila range-t-elle ses crayons ?", answer: "dans la trousse", choices: ["dans la trousse", "dans le frigo", "sous la pluie", "dans la mare"] }
    ];
    const sentence = pick(sentences);
    return {
      mode,
      prompt: "Lis : « " + sentence.text + " »\n" + sentence.q,
      answer: sentence.answer,
      choices: shuffle(sentence.choices),
      hint: "Relis la phrase et cherche les mots qui répondent à la question.",
      explanation: "La bonne réponse est « " + sentence.answer + " »."
    };
  }

  if (mode === "text") {
    const texts = [
      { text: "Léon a un ballon rouge. Il joue dans le jardin.", q: "Qu’a Léon ?", a: "Un ballon rouge", c: ["Un ballon rouge", "Un vélo bleu", "Un livre", "Un gâteau"] },
      { text: "Rose voit un petit chat. Le chat dort sur le tapis.", q: "Où dort le chat ?", a: "Sur le tapis", c: ["Dans le jardin", "Sur le tapis", "Dans la classe", "Dans le bateau"] },
      { text: "Le matin, Mila va à l’école avec son sac.", q: "Où va Mila ?", a: "À l’école", c: ["Au parc", "À l’école", "À la piscine", "À la forêt"] },
      { text: "Sam a planté une graine. Il l’arrose chaque matin. Une petite pousse apparaît.", q: "Que fait Sam chaque matin ?", a: "Il arrose la graine", c: ["Il arrose la graine", "Il peint le mur", "Il range ses chaussures", "Il nourrit un poisson"] },
      { text: "Nina prépare son sac pour la piscine. Elle prend une serviette et un bonnet. Puis elle rejoint son papa.", q: "Que prend Nina ?", a: "Une serviette et un bonnet", c: ["Une serviette et un bonnet", "Un ballon et un livre", "Un manteau et des bottes", "Une poêle et une cuillère"] },
      { text: "Le vent souffle fort. Les feuilles s’envolent et roulent sur le chemin. Hugo ferme son blouson.", q: "Que font les feuilles ?", a: "Elles s’envolent", c: ["Elles s’envolent", "Elles chantent", "Elles nagent", "Elles deviennent des pommes"] },
      { text: "Au marché, Mamie choisit trois pommes et deux poires. Elle les met dans son panier.", q: "Combien de pommes Mamie choisit-elle ?", a: "Trois", c: ["Deux", "Trois", "Quatre", "Cinq"] },
      { text: "Léo entend un bruit dans la cuisine. C’est le chat qui pousse sa gamelle vide. Léo lui donne ses croquettes.", q: "Pourquoi le chat pousse-t-il sa gamelle ?", a: "Elle est vide", c: ["Elle est vide", "Il veut sortir en fusée", "Elle est pleine d’eau", "Il cherche un crayon"] },
      { text: "Après la pluie, Inès observe un escargot près du pot de fleurs. Elle le regarde sans le toucher, puis appelle son frère.", q: "Quel animal Inès observe-t-elle ?", a: "Un escargot", c: ["Un escargot", "Un papillon", "Un canard", "Un lapin"] },
      { text: "Tom met ses bottes et son imperméable. Il sort avec sa sœur pour sauter dans les flaques.", q: "Pourquoi Tom met-il ses bottes ?", a: "Pour sortir sous la pluie", c: ["Pour aller dormir", "Pour sortir sous la pluie", "Pour faire un gâteau", "Pour nager dans la mer"] }
    ];
    const text = pick(texts);
    return {
      mode,
      prompt: text.text + "\n\n" + text.q,
      answer: text.a,
      choices: shuffle(text.c),
      hint: "Cherche dans le petit texte les mots qui répondent à la question.",
      explanation: "Le texte nous indique : " + text.a + "."
    };
  }

  throw new Error("Format de lecture inconnu : " + mode);
}

// Point d’entrée pur pour les tests automatisés du contenu.
export function createReadingQuestion(mode) {
  return question(mode);
}

export function readingMenu() {
  document.body.className = "theme-leon";
  const content = el("div", { class: "stack" });
  content.append(el("p", {
    class: "lead",
    text: "Des petits jeux de lecture pour lire à ton rythme. Ici, pas de note ni de chronomètre stressant."
  }));

  const modes = [
    ["flash", "⚡ Mots-éclairs", "Reconnaître un mot rapidement"],
    ["mystery", "🔎 Mots-mystères", "Assembler les syllabes"],
    ["sentence", "💬 Phrases à comprendre", "Lire une phrase et trouver l’information"],
    ["text", "📖 Mini-textes", "Lire quelques lignes et comprendre"]
  ];
  modes.forEach(([id, label, description]) => {
    content.append(card([
      el("h2", { text: label }),
      el("p", { class: "small", text: description }),
      button("Commencer", () => startReading(id), "button-primary")
    ]));
  });
  content.append(
    button("⌂ Accueil", () => go("home"), "icon-button"),
    button("↩ Autres défis de Léon", () => go("leon"), "button-soft")
  );
  replaceApp(screen("Lecture avec Léon", content, {
    eyebrow: "Univers ballon",
    home: () => go("home")
  }));
}

function startReading(mode) {
  let round = 0;
  let score = 0;
  let hintCount = 0;
  let questionHadError = false;
  let currentQuestion;
  const labels = {
    flash: "Mots-éclairs",
    mystery: "Mots-mystères",
    sentence: "Phrases à comprendre",
    text: "Mini-textes"
  };

  const generate = () => {
    currentQuestion = question(mode);
    hintCount = 0;
    questionHadError = false;
  };

  const finish = () => {
    recordSession("leon");
    const content = card([
      el("p", { class: "prompt", text: "🌟 Bravo pour tes efforts !" }),
      el("p", { class: "lead", text: "Tu as terminé ce petit moment de lecture." }),
      el("p", {
        class: "lead",
        text: "Tu as trouvé " + score + " réponse(s) du premier coup sur " + round +
          ". Chaque essai t’aide à progresser."
      }),
      el("p", {
        class: "small",
        text: "On peut recommencer un autre jour : pas besoin d’aller vite."
      }),
      button("Autres jeux de lecture", readingMenu, "button-primary"),
      button("Autres défis de Léon", () => go("leon"), "button-soft")
    ]);
    replaceApp(screen("Bien joué !", content, {
      eyebrow: "Lecture",
      home: () => go("home")
    }));
  };

  const render = () => {
    const content = card([]);
    content.append(
      el("p", { class: "small", text: "Jeu " + (round + 1) + " sur 5" }),
      el("div", { class: "progress-track" },
        el("div", { class: "progress-fill", style: "width:" + (round / 5 * 100) + "%" })
      ),
      el("p", {
        class: "lead",
        text: "Prends ton temps. Tu peux écouter et demander un indice."
      }),
      el("div", { class: "prompt", text: currentQuestion.prompt })
    );

    const answers = el("div", { class: "answer-grid" });
    currentQuestion.choices.forEach(choice => {
      answers.append(button(choice, () => answer(choice), "button-soft"));
    });
    const feedback = el("p", { class: "feedback", role: "status", "aria-live": "polite" });
    content.append(
      answers,
      feedback,
      el("div", { class: "button-row" }, [
        button("🔊 Écouter", () => speak(
          currentQuestion.speakText || currentQuestion.prompt,
          getState().settings.voice
        ), "button-soft"),
        button("💡 Indice", () => {
          hintCount++;
          feedback.textContent = hintCount === 1
            ? currentQuestion.hint
            : currentQuestion.explanation;
        }, "button-soft")
      ]),
      button("⌂ Accueil", () => go("home"), "icon-button"),
      button("↩ Menu lecture", readingMenu, "button-soft")
    );

    replaceApp(screen(labels[mode], content, {
      eyebrow: "Lecture sans pression",
      home: () => go("home")
    }));
    speak(currentQuestion.speakText || currentQuestion.prompt, getState().settings.voice);
  };

  const answer = choice => {
    const correct = String(choice) === String(currentQuestion.answer);
    recordAnswer("leon", correct);
    const feedback = document.querySelector(".feedback");
    if (correct) {
      if (!questionHadError) score++;
      round++;
      if (round >= 5) {
        finish();
        return;
      }
      generate();
      render();
      const nextFeedback = document.querySelector(".feedback");
      if (nextFeedback) nextFeedback.textContent = "Bravo, tu as pris le temps de réfléchir !";
    } else {
      questionHadError = true;
      if (feedback) {
        feedback.textContent = "Presque ! Relis tranquillement et essaie encore. Tu peux demander un indice.";
      }
    }
  };

  generate();
  render();
}
