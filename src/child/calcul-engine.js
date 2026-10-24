const pick = (items, random) => items[Math.floor(random() * items.length)];

export const CALCULATION_MODES = [
  { id: "complements10", label: "Compléments à 10" },
  { id: "complements100", label: "Compléments à 100" },
  { id: "doubles", label: "Doubles" },
  { id: "halves", label: "Moitiés" },
  { id: "numberLine", label: "Droite numérique" },
  { id: "problems", label: "Petits problèmes" },
  { id: "tables", label: "Tables de multiplication" }
];

export function createCalculationQuestion(kind, random = Math.random) {
  let a, b, answer, prompt, hint, explanation;
  switch (kind) {
    case "complements10":
      a = Math.floor(random() * 10); answer = 10 - a;
      prompt = "Combien faut-il ajouter à " + a + " pour faire 10 ?";
      hint = "Pars de " + a + " et compte jusqu’à 10.";
      explanation = a + " + " + answer + " = 10.";
      break;
    case "complements100": {
      // Mélange de nombres ronds et de nombres avec unités : calculs sans rester aux dizaines.
      const useRoundNumber = random() < 0.28;
      a = useRoundNumber
        ? Math.floor(random() * 10) * 10
        : 1 + Math.floor(random() * 98);
      answer = 100 - a;
      prompt = "Combien faut-il ajouter à " + a + " pour faire 100 ?";
      hint = a % 10 === 0
        ? "Complète d’abord jusqu’à la dizaine suivante, puis jusqu’à 100."
        : "Complète d’abord jusqu’à la dizaine suivante, puis ajoute les dizaines qui manquent.";
      explanation = a + " + " + answer + " = 100.";
      break;
    }
    case "doubles":
      a = 1 + Math.floor(random() * 20); answer = 2 * a;
      prompt = "Quel est le double de " + a + " ?";
      hint = "Le double, c’est deux fois le même nombre : " + a + " + " + a + ".";
      explanation = a + " + " + a + " = " + answer + ".";
      break;
    case "halves":
      answer = 1 + Math.floor(random() * 20); a = 2 * answer;
      prompt = "Quelle est la moitié de " + a + " ?";
      hint = "Partage " + a + " en deux parts égales.";
      explanation = a + ", partagé en deux parts égales, donne " + answer + ".";
      break;
    case "numberLine":
      a = Math.floor(random() * 8) * 10; b = a + 20; answer = a + 10;
      prompt = "Quel nombre manque entre " + a + " et " + b + " ?";
      hint = "Les graduations avancent de 10 en 10.";
      explanation = a + ", " + answer + ", " + b + " : on avance de 10 à chaque fois.";
      break;
    case "tables": {
      const tables = [2, 5, 10, 3, 4, 6, 7, 8, 9];
      a = pick(tables, random);
      b = 1 + Math.floor(random() * 10);
      answer = a * b;
      prompt = "Combien font " + a + " × " + b + " ?";
      hint = "Tu peux additionner " + a + ", " + b + " fois, ou utiliser la table de " + a + ".";
      explanation = a + " × " + b + " = " + answer + ".";
      break;
    }
    case "problems": {
      const type = pick(["compare", "complement", "groups"], random);
      if (type === "compare") {
        const smaller = 8 + Math.floor(random() * 23);
        const difference = 2 + Math.floor(random() * 15);
        const larger = smaller + difference; answer = difference;
        prompt = "Léa a " + larger + " cartes et Sami en a " + smaller + ". Combien Léa en a-t-elle de plus ?";
        hint = "Cherche l’écart entre " + smaller + " et " + larger + ".";
        explanation = smaller + " + " + difference + " = " + larger + ".";
      } else if (type === "complement") {
        a = 12 + Math.floor(random() * 29); b = a + 1 + Math.floor(random() * 20); answer = b - a;
        prompt = "Il faut " + b + " jetons. Tu en as déjà " + a + ". Combien en manque-t-il ?";
        hint = "Cherche ce qu’il faut ajouter à " + a + " pour arriver à " + b + ".";
        explanation = a + " + " + answer + " = " + b + ".";
      } else {
        const groups = 2 + Math.floor(random() * 4);
        const each = 2 + Math.floor(random() * 5); answer = groups * each;
        prompt = "Il y a " + groups + " sachets avec " + each + " billes dans chacun. Combien de billes en tout ?";
        hint = "Additionne " + each + " billes, " + groups + " fois.";
        explanation = groups + " × " + each + " = " + answer + ".";
      }
      break;
    }
    default: throw new Error("Type de question inconnu : " + kind);
  }
  return { kind, prompt, answer, hint, explanation };
}
