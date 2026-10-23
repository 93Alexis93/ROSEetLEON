import { el, button, screen, card, replaceApp } from "../ui.js";
import { getState, update, exportData, importData, resetData } from "../store.js";
import { go, unlockParent, getParentLockoutUntil, setParentLockoutUntil } from "../router.js";
import { MATH_DOMAINS } from "../child/math-engine.js";
import { getLastBackupAt, markBackupCompleted, shouldRemindBackup } from "./backup.js";

let failures = 0;
let problem = null;

const makeProblem = () => {
  const a = 6 + Math.floor(Math.random() * 4);
  const b = 6 + Math.floor(Math.random() * 4);
  problem = { a, b, answer: a * b };
};

export function parentGate() {
  const lockoutUntil = getParentLockoutUntil();
  if (Date.now() < lockoutUntil) {
    replaceApp(screen("Espace parent", card([
      el("p", {
        class: "lead",
        text: "La porte se repose un instant. Réessaie dans quelques secondes."
      }),
      button("Retour à l’accueil", () => go("home"))
    ])));
    const gateScreen = document.querySelector("#app")?.firstElementChild;
    setTimeout(() => {
      if (gateScreen && document.querySelector("#app")?.firstElementChild === gateScreen) {
        parentGate();
      }
    }, Math.max(0, lockoutUntil - Date.now()));
    return;
  }

  makeProblem();
  const display = el("div", {
    class: "prompt",
    text: problem.a + " × " + problem.b + " = ?"
  });
  const feedback = el("p", {
    class: "feedback",
    text: "Résous le calcul pour ouvrir la porte."
  });
  const digits = el("div", { class: "pin-grid" });
  const input = el("input", {
    type: "password",
    inputmode: "numeric",
    pattern: "[0-9]*",
    maxlength: "3",
    "aria-label": "Résultat du calcul",
    placeholder: "Résultat"
  });
  const check = button("Ouvrir", verify);
  input.addEventListener("keydown", event => {
    if (event.key === "Enter") verify();
  });

  for (let i = 1; i <= 9; i++) {
    digits.append(button(String(i), () => {
      input.value = (input.value + String(i)).slice(0, 3);
    }, "button-soft"));
  }
  digits.append(
    button("⌫", () => {
      input.value = input.value.slice(0, -1);
    }, "button-soft"),
    button("0", () => {
      input.value = (input.value + "0").slice(0, 3);
    }, "button-soft")
  );

  function verify() {
    if (Date.now() < getParentLockoutUntil()) {
      feedback.textContent = "La porte se repose encore.";
      return;
    }
    const s = getState();
    if (Number(input.value) === problem.answer) {
      failures = 0;
      const pin = getState().settings.parentPin;
      if (pin && prompt("Code PIN parent") !== pin) {
        feedback.textContent = "Code PIN incorrect. Recommence le calcul.";
        makeProblem();
        display.textContent = problem.a + " × " + problem.b + " = ?";
        input.value = "";
        return;
      }
      unlockParent();
      go("parent");
      return;
    }

    failures++;
    feedback.textContent = "Ce n’est pas grave. Respire et réessaie.";
    if (failures >= 3) {
      setParentLockoutUntil(Date.now() + 30000);
      feedback.textContent = "La porte fait une pause de 30 secondes.";
      const gateScreen = document.querySelector("#app")?.firstElementChild;
      setTimeout(() => {
        if (gateScreen && document.querySelector("#app")?.firstElementChild === gateScreen) {
          parentGate();
        }
      }, 30000);
      return;
    }
    makeProblem();
    display.textContent = problem.a + " × " + problem.b + " = ?";
    input.value = "";
  }

  replaceApp(screen("Espace parent", card([
    el("p", {
      class: "lead",
      text: "Une petite question pour garder cet espace réservé aux adultes."
    }),
    display,
    input,
    digits,
    check,
    feedback,
    button("Retour à l’accueil", () => go("home"), "button-soft")
  ]), { eyebrow: "Porte parentale", home: () => go("home") }));
}

function section(title, children) {
  return card([el("h2", { text: title }), ...children]);
}

export function parentDashboard() {
  document.body.className = "theme-parent";
  const s = getState();
  const content = el("div", { class: "parent-grid" });
  const stats = section("Aujourd’hui", [
    el("p", {
      class: "small",
      text: "Des petits pas comptent. Aucun classement entre les enfants."
    }),
    el("p", {
      class: "stat",
      text: "Léon · " + s.profiles.leon.sessions + " défi(s) terminé(s)"
    }),
    el("p", {
      class: "stat",
      text: "Rose · " + s.profiles.rose.sessions + " défi(s) terminé(s)"
    }),
    el("p", {
      class: "small",
      text: "Réponses essayées : Léon " + s.profiles.leon.correct +
        " réussites · Rose " + s.profiles.rose.correct + " réussites."
    })
  ]);
  const mathStats = section("Maths de Léon", MATH_DOMAINS.map(domain => {
    const p = s.profiles.leon.mathProgress?.[domain.id];
    return el("p", {
      class: "small",
      text: domain.label + " · niveau " + (p?.difficulty || 1) + "/3 · " +
        (p?.correct || 0) + " réussite(s) sur " + (p?.attempts || 0) + " essai(s)"
    });
  }));

  const wordInput = el("input", {
    type: "text",
    maxlength: "24",
    placeholder: "Ex. papillon",
    "aria-label": "Mot à ajouter à la lecture"
  });
  const addWord = button("Ajouter ce mot", () => {
    const word = wordInput.value.trim();
    if (!/^[A-Za-zÀ-ÿ-]{2,24}$/.test(word)) {
      alert("Entre un mot de 2 à 24 lettres, sans espace.");
      return;
    }
    update(x => {
      const words = x.customWords.map(w =>
        (typeof w === "string" ? w : w.word || "").toLocaleLowerCase("fr")
      );
      if (!words.includes(word.toLocaleLowerCase("fr"))) {
        x.customWords.push({ word, createdAt: new Date().toISOString() });
      }
    });
    parentDashboard();
  }, "button-primary");
  const customWords = section("Mots de lecture de Léon", [
    el("p", {
      class: "small",
      text: "Ajoute des mots qui lui parlent. Ils seront proposés dans les jeux de lecture et conservés sur cet appareil."
    }),
    wordInput,
    addWord,
    ...(s.customWords.length ? s.customWords.map((entry, index) => {
      const word = typeof entry === "string" ? entry : entry.word || "";
      return el("div", { class: "button-row" }, [
        el("p", { class: "stat", text: word }),
        button("Supprimer", () => {
          update(x => {
            x.customWords.splice(index, 1);
          });
          parentDashboard();
        }, "button-soft")
      ]);
    }) : [
      el("p", { class: "small", text: "Aucun mot personnalisé pour le moment." })
    ])
  ]);

  const tools = section("Outils parent", [
    button("🫶 Crise en cours", () => go("crisis"), "button-warm"),
    button("📄 Fiches à imprimer", () => go("print"), "button-soft")
  ]);
  const lastBackup = getLastBackupAt();
  const backupReminder = shouldRemindBackup(lastBackup)
    ? el("p", {
      class: "small",
      text: lastBackup
        ? "Cela fait un moment depuis la dernière sauvegarde enregistrée. Pense à en refaire une."
        : "Aucune sauvegarde enregistrée pour le moment. Exporte le fichier et conserve-le dans Fichiers ou iCloud Drive."
    })
    : el("p", {
      class: "small",
      text: "Dernière sauvegarde enregistrée : " +
        new Date(lastBackup).toLocaleDateString("fr-FR") + "."
    });
  const backup = section("Sauvegarde et réglages", [
    backupReminder,
    button("Exporter / partager la sauvegarde JSON", downloadBackup, "button-primary"),
    button("Copier le JSON (solution de secours)", copyBackup, "button-soft"),
    el("label", { class: "field" }, [
      "Importer une sauvegarde JSON",
      el("input", {
        type: "file",
        accept: "application/json",
        onchange: importBackup
      })
    ]),
    el("label", { class: "field" }, [
      "Code PIN facultatif (4 chiffres)",
      el("input", {
        type: "password",
        inputmode: "numeric",
        maxlength: "4",
        value: s.settings.parentPin,
        placeholder: "Aucun PIN défini",
        onchange: e => update(x =>
          x.settings.parentPin = e.target.value.replace(/\D/g, "").slice(0, 4)
        )
      })
    ]),
    el("label", { class: "field" }, [
      "Voix",
      el("select", {
        onchange: e => update(x => x.settings.voice = e.target.value === "oui")
      }, [
        el("option", {
          value: "oui",
          selected: s.settings.voice ? "selected" : null,
          text: "Activée"
        }),
        el("option", {
          value: "non",
          selected: !s.settings.voice ? "selected" : null,
          text: "Désactivée"
        })
      ])
    ]),
    el("label", { class: "field" }, [
      "Sons d’encouragement",
      el("select", {
        onchange: e => update(x => x.settings.sounds = e.target.value === "oui")
      }, [
        el("option", {
          value: "oui",
          selected: s.settings.sounds ? "selected" : null,
          text: "Activés"
        }),
        el("option", {
          value: "non",
          selected: !s.settings.sounds ? "selected" : null,
          text: "Désactivés"
        })
      ])
    ]),
    button("Remettre à zéro", () => {
      if (confirm("Effacer toutes les progressions et réglages sur cet appareil ?")) {
        resetData();
        parentDashboard();
      }
    }, "button-soft")
  ]);

  content.append(
    stats,
    mathStats,
    customWords,
    tools,
    backup,
    section("Progression positive", [
      el("p", {
        class: "small",
        text: "La V1 enregistre les essais et les sessions localement. Les conseils personnalisés seront enrichis dans les prochaines phases."
      })
    ])
  );
  replaceApp(screen("Espace parent", content, {
    eyebrow: "Tableau de bord",
    home: () => go("home")
  }));
}

async function downloadBackup() {
  const json = exportData();
  const filename = "rose-leon-sauvegarde.json";
  const file = typeof File === "function"
    ? new File([json], filename, { type: "application/json" })
    : null;

  try {
    const persistence = navigator.storage?.persist?.();
    if (persistence && typeof persistence.catch === "function") {
      persistence.catch(() => {});
    }
  } catch {
    // Le stockage persistant est une amélioration facultative.
  }

  if (
    file &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: "Sauvegarde Rose & Léon",
        text: "Conserve ce fichier pour retrouver les progrès de Rose & Léon."
      });
      markBackupCompleted();
      parentDashboard();
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
      // Si le partage échoue, proposer le téléchargement classique.
    }
  }

  try {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = el("a", { href: url, download: filename });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    markBackupCompleted();
    parentDashboard();
  } catch {
    alert("Export impossible dans ce navigateur. Essaie « Copier le JSON ».");
  }
}

async function copyBackup() {
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Presse-papiers indisponible");
    }
    await navigator.clipboard.writeText(exportData());
    markBackupCompleted();
    alert("Sauvegarde copiée. Colle le texte dans un fichier et conserve-le en lieu sûr.");
    parentDashboard();
  } catch {
    alert("La copie n’est pas disponible ici. Essaie « Exporter / partager la sauvegarde JSON ».");
  }
}

function importBackup(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      importData(String(reader.result));
      alert("Sauvegarde importée.");
      parentDashboard();
    } catch (err) {
      alert("Import impossible : " + err.message);
    }
  };
  reader.readAsText(file);
}

export function crisis() {
  document.body.className = "theme-parent";
  const steps = [
    ["1. Respirer d’abord", "Pose les pieds au sol. Inspire doucement, puis expire un peu plus longtemps."],
    ["2. Sécuriser et ralentir", "Baisse la voix, éloigne les objets dangereux et utilise peu de mots."],
    ["3. Accueillir l’émotion", "« Je vois que c’est très difficile. Tu as le droit d’être en colère. »"],
    ["4. Proposer un petit choix", "« Tu préfères un peu d’eau ou un moment tranquille près de moi ? »"],
    ["5. Attendre", "Pas besoin de régler le problème tout de suite. Reviens-y quand vous serez plus calmes."]
  ];
  const content = el("div", { class: "stack" });
  steps.forEach(([title, description]) => {
    content.append(card([
      el("h2", { text: title }),
      el("p", { class: "lead", text: description })
    ]));
  });
  content.append(button("Retour au tableau de bord", () => go("parent")));
  replaceApp(screen("Crise en cours", content, {
    eyebrow: "Boîte à outils parent",
    home: () => go("parent")
  }));
}
