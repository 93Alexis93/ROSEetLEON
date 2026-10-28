// Programme de l’École de Rose & Léon.
// Les thèmes suivent les grands repères des programmes officiels (cycles 1 à 3).
// Les leçons, exemples et exercices sont des créations originales, courtes et à voix haute.
// Format d’une compétence : [titre, générateur, paramètres].

const LEVELS_RAW = [
  {
    id: "maternelle", label: "Maternelle", short: "Mat.", emoji: "🧸", for: "rose",
    intro: "Compter, comparer, observer les formes et se repérer, en jouant.",
    chapters: [
      ["nombres-5", "🖐️", "Les nombres jusqu’à 5", {
        lesson: "Pour compter, on touche chaque objet une seule fois et on dit un nombre à chaque fois. Le dernier nombre dit, c’est combien il y en a.",
        example: "🦄 🦄 🦄 : un, deux, trois. Il y a 3 licornes.",
        tip: "On peut montrer le même nombre avec ses doigts, un dé ou une boîte."
      }, [
        ["Compter des images", "count", { max: 5 }],
        ["Compter les doigts", "fingers", { max: 5 }],
        ["Reconnaître les faces du dé", "dice", { max: 5 }],
        ["Retrouver un nombre", "findNumber", { max: 5 }]
      ]],
      ["comparer", "⚖️", "Comparer des quantités", {
        lesson: "Pour savoir quel groupe en a le plus, on peut faire des paires : un objet d’un groupe avec un objet de l’autre. Le groupe où il reste des objets seuls en a le plus.",
        example: "⭐⭐⭐ et ⭐⭐ : le premier groupe a une étoile de plus.",
        tip: "Quand il n’en reste aucun tout seul, les deux groupes en ont autant."
      }, [
        ["Le groupe qui en a le plus", "moreGroup", { max: 6 }],
        ["Le plus ou le moins", "moreGroup", { max: 6, fewer: true }],
        ["Le plus grand nombre", "compareSmall", { max: 6 }]
      ]],
      ["nombres-10", "🔟", "Les nombres jusqu’à 10", {
        lesson: "Une boîte de dix a deux lignes de cinq cases. Quand les deux lignes sont pleines, il y a dix jetons.",
        example: "Une ligne pleine et deux jetons en plus : cinq et deux, ça fait sept.",
        tip: "Deux mains, c’est dix doigts."
      }, [
        ["Compter jusqu’à 10", "count", { min: 4, max: 10 }],
        ["La boîte de dix", "tenframe", { max: 10 }],
        ["Les doigts des deux mains", "fingers", { max: 10 }],
        ["Retrouver un nombre", "findNumber", { min: 4, max: 10 }]
      ]],
      ["rang", "🚂", "Le rang et la position", {
        lesson: "Dans une file, on compte à partir du début : le premier, le deuxième, le troisième…",
        example: "🚂 🐶 🐱 🐰 : le chien est le premier, le chat est le deuxième.",
        tip: "Commence toujours par la locomotive."
      }, [
        ["Qui est à cette place ?", "rank", { length: 4 }],
        ["Une file plus longue", "rank", { length: 6 }]
      ]],
      ["premiers-calculs", "➕", "Premiers calculs", {
        lesson: "Quand on ajoute, il y en a plus. Quand on enlève, il y en a moins. Ajouter un, c’est dire le nombre suivant.",
        example: "🍓🍓🍓 et encore 🍓 : trois et un, ça fait quatre.",
        tip: "On peut s’aider de ses doigts."
      }, [
        ["Un de plus", "oneMore", { max: 6 }],
        ["Un de plus, un de moins", "oneMore", { max: 6, less: true }],
        ["Réunir deux groupes", "addPictures", { max: 6 }],
        ["Cinq, c’est combien et combien ?", "decompose", { min: 3, max: 6 }]
      ]],
      ["problemes", "🧩", "Résoudre des petits problèmes", {
        lesson: "Pour résoudre un problème, on écoute bien l’histoire, on imagine la scène, puis on cherche : est-ce qu’on en ajoute, on en enlève ou on partage ?",
        example: "Rose a 2 paillettes, on lui en donne 1 : elle en a 3.",
        tip: "Tu peux dessiner ou utiliser des jetons."
      }, [
        ["Petites histoires de nombres", "petitProbleme", { max: 6 }],
        ["Partager et compléter", "addPictures", { max: 6, sub: true }]
      ]],
      ["formes", "🔷", "Les formes et les solides", {
        lesson: "Le rond n’a pas de coin. Le triangle a trois côtés. Le carré a quatre côtés pareils. Le rectangle a deux grands côtés et deux petits.",
        example: "Une balle ⚽ est une boule : elle roule partout. Un dé 🎲 est un cube.",
        tip: "Pour reconnaître une forme, on compte ses côtés ou ses coins."
      }, [
        ["Retrouver la forme", "shapeFind", {}],
        ["Retrouver le solide", "solidFind", {}]
      ]],
      ["longueurs", "📏", "Explorer les longueurs", {
        lesson: "Pour comparer deux rubans, on les pose côte à côte, en partant du même endroit. Celui qui dépasse est le plus long.",
        example: "Le ruban rouge dépasse le bleu : le rouge est plus long.",
        tip: "Le plus court est celui qui s’arrête le premier."
      }, [
        ["Le plus long", "lengthCompare", {}],
        ["Le plus long ou le plus court", "lengthCompare", { shortest: true }]
      ]],
      ["masses", "🪶", "Explorer les masses", {
        lesson: "Ce qui est lourd est difficile à soulever. Ce qui est léger se soulève très facilement. Une balance penche du côté le plus lourd.",
        example: "Une pastèque 🍉 est plus lourde qu’une fraise 🍓.",
        tip: "Gros ne veut pas toujours dire lourd : un ballon est gros mais léger !"
      }, [
        ["Le plus lourd", "massCompare", {}],
        ["Le plus lourd ou le plus léger", "massCompare", { lightest: true }]
      ]],
      ["motifs", "🎀", "Les motifs qui se répètent", {
        lesson: "Un motif, c’est un petit groupe d’images qui revient toujours dans le même ordre.",
        example: "🦄 🌈 🦄 🌈 🦄 … après la licorne vient l’arc-en-ciel.",
        tip: "Cherche le petit groupe qui recommence."
      }, [
        ["Deux images qui alternent", "pattern", { motifs: ["AB"] }],
        ["Des motifs plus longs", "pattern", { motifs: ["AAB", "ABB", "ABC"] }]
      ]],
      ["temps", "🌙", "Se repérer dans le temps", {
        lesson: "La journée a un ordre : le matin, le midi, l’après-midi, puis la nuit. L’année a quatre saisons : printemps, été, automne, hiver.",
        example: "Après le petit-déjeuner 🥣, on part à l’école 🎒.",
        tip: "Raconte ta journée dans l’ordre."
      }, [
        ["Ma journée dans l’ordre", "timeOrder", { kinds: ["routine"] }],
        ["Les moments et les saisons", "timeOrder", { kinds: ["moments", "seasons"] }]
      ]],
      ["espace", "📦", "Se repérer dans l’espace", {
        lesson: "Sur, c’est au-dessus et posé dessus. Sous, c’est en dessous. Dans, c’est à l’intérieur. À côté, c’est tout près.",
        example: "Le chat est dans la boîte : on ne voit que sa tête !",
        tip: "Tu peux jouer avec un doudou et une boîte pour essayer."
      }, [
        ["Sur, sous, dans, à côté", "position", {}]
      ]]
    ]
  },
  {
    id: "cp", label: "CP", short: "CP", emoji: "✏️", for: "leon",
    intro: "Les nombres jusqu’à 100, les premiers calculs et la géométrie.",
    chapters: [
      ["nombres-100", "💯", "Les nombres jusqu’à 100", {
        lesson: "Un nombre à deux chiffres se lit avec les dizaines à gauche et les unités à droite. Une dizaine, c’est un paquet de 10.",
        example: "4 dizaines et 7 unités : 47, quarante-sept.",
        tip: "De 70 à 99, on compte avec soixante et quatre-vingts : soixante-dix, quatre-vingt-dix."
      }, [
        ["Dizaines et unités", "tensUnits", {}],
        ["Lire les nombres jusqu’à 69", "words", { min: 11, max: 69 }],
        ["Lire les nombres de 70 à 100", "words", { min: 70, max: 100 }],
        ["Le chiffre des dizaines", "placeValue", { max: 100, kinds: ["digit"] }]
      ]],
      ["comparer", "⚖️", "Comparer les nombres", {
        lesson: "Pour comparer deux nombres, on compare d’abord les dizaines. Si elles sont pareilles, on compare les unités. Le signe < se lit « est plus petit que ».",
        example: "38 < 52 car 3 dizaines, c’est moins que 5 dizaines.",
        tip: "Le bec du signe s’ouvre toujours vers le plus grand nombre."
      }, [
        ["Le bon signe", "compare", { max: 100 }],
        ["Le plus grand nombre", "biggest", { max: 100, smallest: true }],
        ["Ranger des nombres", "order", { max: 100 }]
      ]],
      ["suites", "🔢", "Le rang et les suites", {
        lesson: "Juste après un nombre, il y a ce nombre plus 1. Juste avant, il y a ce nombre moins 1. Dans une suite, on avance toujours du même pas.",
        example: "10, 20, 30, 40 : on avance de 10 en 10.",
        tip: "Regarde de combien on avance entre deux nombres."
      }, [
        ["Juste avant, juste après", "neighbors", { max: 100, kinds: ["after", "before"] }],
        ["Compléter une suite", "sequenceNum", { steps: [1, 2, 5, 10], max: 60 }]
      ]],
      ["addition", "➕", "L’addition", {
        lesson: "Additionner, c’est réunir. On peut partir du plus grand nombre et avancer. Connaître les compléments à 10 aide beaucoup.",
        example: "8 + 5 : 8 + 2 = 10, puis 10 + 3 = 13.",
        tip: "7 + 3, 6 + 4, 5 + 5 : ce sont des amis de 10 !"
      }, [
        ["Additions jusqu’à 10", "add", { aMax: 6, bMax: 4 }],
        ["Les amis de 10", "complement", { to: [10] }],
        ["Additions jusqu’à 20", "add", { aMin: 5, aMax: 12, bMin: 3, bMax: 9 }]
      ]],
      ["soustraction", "➖", "La soustraction", {
        lesson: "Soustraire, c’est enlever ou chercher un écart. On peut reculer sur la file des nombres, ou chercher combien il faut ajouter.",
        example: "12 − 4 : je recule de 4 depuis 12 → 8. Vérification : 8 + 4 = 12.",
        tip: "Une soustraction se vérifie avec une addition."
      }, [
        ["Soustractions jusqu’à 10", "sub", { aMax: 10, bMax: 6 }],
        ["Soustractions jusqu’à 20", "sub", { aMin: 11, aMax: 20, bMax: 9 }],
        ["Le nombre caché", "missing", { ops: ["+"], max: 10 }]
      ]],
      ["calcul-100", "🧠", "Calculer jusqu’à 100", {
        lesson: "Pour ajouter 10, on ajoute une dizaine : le chiffre des dizaines augmente de 1. Le double, c’est un nombre ajouté à lui-même.",
        example: "34 + 10 = 44. Le double de 6 : 6 + 6 = 12.",
        tip: "Les doubles se retiennent comme une comptine."
      }, [
        ["Ajouter ou enlever 10", "neighbors", { max: 90, kinds: ["plus10", "minus10"] }],
        ["Doubles et moitiés", "doubleHalf", { max: 10 }],
        ["Additions de dizaines", "add", { aMin: 10, aMax: 60, bMin: 10, bMax: 30 }]
      ]],
      ["vers-multiplication", "✖️", "Vers la multiplication", {
        lesson: "Quand on a plusieurs fois la même quantité, on peut additionner… ou multiplier. 3 fois 5, c’est 5 + 5 + 5.",
        example: "3 équipes de 5 joueurs : 5 + 5 + 5 = 15 joueurs.",
        tip: "Compter de 2 en 2, de 5 en 5, de 10 en 10, c’est déjà multiplier."
      }, [
        ["Des groupes égaux", "problem", { ops: ["groups"], groups: 4, each: 5 }],
        ["Fois 2, fois 5, fois 10", "mul", { tables: [2, 5, 10], bMax: 5 }]
      ]],
      ["problemes", "🧩", "La résolution de problèmes", {
        lesson: "Lis l’histoire deux fois. Demande-toi : la quantité augmente, diminue, ou on compare ? Puis calcule et vérifie que la réponse a du sens.",
        example: "Léon a 12 cartes, il en gagne 5 : la quantité augmente, 12 + 5 = 17.",
        tip: "Un petit dessin aide à voir le problème."
      }, [
        ["Gagner ou perdre", "problem", { ops: ["add", "sub"], max: 20 }],
        ["Combien de plus ?", "problem", { ops: ["compare"], max: 20 }]
      ]],
      ["longueurs", "📏", "Les longueurs", {
        lesson: "Pour mesurer avec une règle, on place le début de l’objet sur le 0, puis on lit le nombre au bout. On mesure en centimètres (cm).",
        example: "Le trait part du 0 et s’arrête au 6 : il mesure 6 cm.",
        tip: "Attention : le bord de la règle n’est pas toujours le 0 !"
      }, [
        ["Mesurer avec la règle", "ruler", { max: 10 }],
        ["Le plus long", "lengthCompare", { shortest: true }]
      ]],
      ["masses", "🏋️", "Les masses", {
        lesson: "La masse dit si un objet est lourd ou léger. Sur une balance à plateaux, le plateau le plus lourd descend.",
        example: "Un chien est plus lourd qu’une pomme.",
        tip: "Gros ne veut pas dire lourd : un ballon de baudruche est très léger."
      }, [
        ["Lourd ou léger ?", "massCompare", { lightest: true }]
      ]],
      ["monnaie", "💶", "La monnaie", {
        lesson: "On paie avec des pièces et des billets en euros (€). Pour compter une somme, on commence par les plus grosses valeurs.",
        example: "Un billet de 5 € et deux pièces de 2 € : 5 + 2 + 2 = 9 €.",
        tip: "Pour rendre la monnaie, on compte depuis le prix jusqu’à la somme donnée."
      }, [
        ["Compter son argent", "money", { values: [1, 2, 5, 10], pieces: 4 }],
        ["Rendre la monnaie", "change", { minPrice: 2, maxPrice: 9 }]
      ]],
      ["temps", "🗓️", "Le repérage dans le temps", {
        lesson: "La semaine a 7 jours : lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche. Sur l’horloge, la petite aiguille montre l’heure.",
        example: "La petite aiguille sur le 3 et la grande sur le 12 : il est 3 h.",
        tip: "Quand la grande aiguille est sur le 12, c’est une heure pile."
      }, [
        ["Les jours de la semaine", "calendar", { months: 0 }],
        ["Lire l’heure pile", "clock", { minutes: [0] }]
      ]],
      ["solides", "🎲", "Les solides", {
        lesson: "Un solide, c’est un objet en volume. La boule roule partout, le cylindre roule tout droit, le cube et le pavé ont des faces plates.",
        example: "Une boîte de céréales ressemble à un pavé droit.",
        tip: "Cherche autour de toi : une canette, une balle, une boîte…"
      }, [
        ["Retrouver le solide", "solidFind", { solids: ["boule", "cube", "cylindre", "cône", "pavé droit"] }],
        ["Qui suis-je ?", "solidName", { solids: ["boule", "cube", "cylindre", "pavé droit"] }]
      ]],
      ["geometrie", "📐", "La géométrie plane", {
        lesson: "Le triangle a 3 côtés, le carré et le rectangle en ont 4. Le carré a 4 côtés de même longueur.",
        example: "Un panneau « attention » a la forme d’un triangle.",
        tip: "Compte les côtés en suivant le bord avec ton doigt."
      }, [
        ["Reconnaître les formes", "shapeFind", {}],
        ["Combien de côtés ?", "polygonName", { shapes: ["triangle", "carré", "rectangle", "hexagone"], kinds: ["sides"] }]
      ]],
      ["espace", "🧭", "Le repérage dans l’espace", {
        lesson: "Sur un quadrillage, chaque case a une adresse : une lettre pour la colonne et un nombre pour la ligne.",
        example: "La case B2 est dans la colonne B et sur la ligne 2.",
        tip: "Lettre d’abord, nombre ensuite."
      }, [
        ["Trouver la case", "gridPos", { cols: 3, rows: 3 }],
        ["Sur, sous, dans, à côté", "position", {}]
      ]],
      ["donnees", "📊", "Organisation et gestion de données", {
        lesson: "Un diagramme en barres montre des quantités : plus la barre est haute, plus il y en a.",
        example: "La barre de Sami monte jusqu’à 5 : Sami a marqué 5 buts.",
        tip: "Suis le haut de la barre jusqu’au nombre."
      }, [
        ["Lire un diagramme", "chart", { max: 6 }]
      ]]
    ]
  },
  {
    id: "ce1", label: "CE1", short: "CE1", emoji: "⚽", for: "leon",
    intro: "Les nombres jusqu’à 1 000, les tables, la monnaie, l’heure et les figures.",
    chapters: [
      ["nombres-1000", "🏟️", "Les nombres jusqu’à 1 000", {
        lesson: "Un nombre à trois chiffres a des centaines, des dizaines et des unités. Une centaine, c’est 10 dizaines, soit 100.",
        example: "347 = 300 + 40 + 7 : 3 centaines, 4 dizaines, 7 unités.",
        tip: "Le chiffre le plus à gauche a la plus grande valeur."
      }, [
        ["Le tableau des centaines", "placeValue", { max: 1000 }],
        ["Recomposer un nombre", "compose", { max: 1000 }],
        ["Lire les grands nombres", "words", { min: 100, max: 999 }]
      ]],
      ["comparer", "⚖️", "Comparer et ranger jusqu’à 1 000", {
        lesson: "On compare d’abord les centaines, puis les dizaines, puis les unités.",
        example: "452 > 425 : mêmes centaines, mais 5 dizaines c’est plus que 2.",
        tip: "Ranger dans l’ordre croissant, c’est du plus petit au plus grand."
      }, [
        ["Le bon signe", "compare", { max: 1000 }],
        ["Le plus grand ou le plus petit", "biggest", { max: 1000, smallest: true }],
        ["Ranger dans l’ordre", "order", { max: 1000, desc: true }]
      ]],
      ["pairs", "👯", "Nombres pairs et impairs", {
        lesson: "Un nombre pair peut se partager en deux parts égales sans reste. On le reconnaît à son dernier chiffre : 0, 2, 4, 6 ou 8.",
        example: "14 est pair (7 + 7). 15 est impair.",
        tip: "Seul le dernier chiffre compte, même pour un très grand nombre."
      }, [
        ["Pair ou impair ?", "parity", { max: 1000 }],
        ["Doubles et moitiés", "doubleHalf", { max: 50 }]
      ]],
      ["suites", "🔢", "Les rangs et les suites", {
        lesson: "Une suite avance (ou recule) toujours du même pas. Pour trouver un nombre manquant, cherche d’abord le pas.",
        example: "250, 300, 350, … : on avance de 50.",
        tip: "Calcule l’écart entre deux nombres qui se suivent."
      }, [
        ["Compléter une suite", "sequenceNum", { steps: [2, 5, 10, 50, 100], max: 500, down: true }],
        ["Avant, après, dizaine suivante", "neighbors", { max: 1000, kinds: ["after", "before", "tenAfter", "tenBefore", "plus100"] }]
      ]],
      ["fractions", "🍕", "Les premières fractions", {
        lesson: "Une fraction partage un tout en parts égales. Le nombre du bas dit en combien de parts on coupe ; celui du haut dit combien on en prend.",
        example: "Une pizza coupée en 4, j’en mange 1 : j’ai mangé un quart, 1/4.",
        tip: "Les parts doivent être égales, sinon ce n’est pas une fraction."
      }, [
        ["Lire une fraction", "fractionRead", { dens: [2, 3, 4] }],
        ["La moitié, le quart…", "fractionOf", { dens: [2, 4], unit: true, k: 5 }]
      ]],
      ["operations-posees", "🧾", "L’addition et la soustraction posées", {
        lesson: "On pose les nombres en colonnes : unités sous unités, dizaines sous dizaines. On commence par les unités et on n’oublie pas les retenues.",
        example: "247 + 38 : 7 + 8 = 15, j’écris 5 et je retiens 1.",
        tip: "Vérifie avec un ordre de grandeur : 247 + 38, c’est environ 250 + 40."
      }, [
        ["Additions posées", "add", { aMin: 100, aMax: 699, bMin: 15, bMax: 299, input: true, hint: "Pose l’opération en colonnes : unités sous unités, dizaines sous dizaines, et pense aux retenues." }],
        ["Soustractions posées", "sub", { aMin: 200, aMax: 999, bMin: 15, bMax: 199, input: true, hint: "Pose l’opération en colonnes : unités sous unités, dizaines sous dizaines, et pense aux retenues." }]
      ]],
      ["calcul-mental", "🧠", "Le calcul mental jusqu’à 1 000", {
        lesson: "Pour calculer vite, on décompose : d’abord les centaines, puis les dizaines, puis les unités. Les compléments à 100 sont très utiles.",
        example: "65 + 35 = 100, car 60 + 30 = 90 et 5 + 5 = 10.",
        tip: "Ajouter 100, c’est changer seulement le chiffre des centaines."
      }, [
        ["Compléments à 100", "complement", { to: [100], round: true, input: true }],
        ["Ajouter des dizaines", "add", { aMin: 100, aMax: 800, bMin: 10, bMax: 90, input: true }],
        ["+10, −10, +100", "neighbors", { max: 900, kinds: ["plus10", "minus10", "plus100"], input: true }]
      ]],
      ["multiplication", "✖️", "La multiplication", {
        lesson: "Multiplier, c’est additionner plusieurs fois le même nombre. 4 × 3 se lit « 4 fois 3 » et vaut 3 + 3 + 3 + 3.",
        example: "4 maillots à 3 € : 4 × 3 = 12 €.",
        tip: "4 × 3 = 3 × 4 : on peut changer l’ordre."
      }, [
        ["Des groupes égaux", "problem", { ops: ["groups"], groups: 5, each: 5 }],
        ["Tables de 2, 3, 4, 5", "mul", { tables: [2, 3, 4, 5] }]
      ]],
      ["premieres-tables", "🧮", "Les premières tables de multiplication", {
        lesson: "Les tables de 2, 5 et 10 sont faciles : on compte de 2 en 2, de 5 en 5, de 10 en 10.",
        example: "Table de 5 : 5, 10, 15, 20, 25…",
        tip: "Les résultats de la table de 10 se terminent tous par 0."
      }, [
        ["Tables de 2, 5 et 10", "mul", { tables: [2, 5, 10], input: true }],
        ["Le facteur caché", "missing", { ops: ["×"] }]
      ]],
      ["toutes-tables", "🏆", "Toutes les tables de multiplication", {
        lesson: "Pour apprendre une table difficile, on s’appuie sur ce qu’on sait : 6 × 7, c’est 5 × 7 plus encore 7.",
        example: "6 × 7 = 35 + 7 = 42.",
        tip: "Un peu chaque jour vaut mieux que beaucoup une seule fois."
      }, [
        ["Tables de 6 à 9", "mul", { tables: [6, 7, 8, 9], input: true }],
        ["Toutes les tables", "mul", { tables: [2, 3, 4, 5, 6, 7, 8, 9] }]
      ]],
      ["problemes", "🧩", "La résolution de problèmes", {
        lesson: "Avant de calculer, on se demande : est-ce qu’on réunit, on enlève, on compare, on répète ou on partage ?",
        example: "24 ballons rangés dans 4 filets : on partage, 24 ÷ 4 = 6.",
        tip: "Relis la question : que cherche-t-on vraiment ?"
      }, [
        ["Ajouter, enlever, comparer", "problem", { ops: ["add", "sub", "compare"], max: 100 }],
        ["Répéter ou partager", "problem", { ops: ["groups", "share"], groups: 5, each: 6 }]
      ]],
      ["longueurs", "📏", "Les longueurs", {
        lesson: "1 mètre (m) = 100 centimètres (cm). On mesure un crayon en centimètres et un terrain de foot en mètres.",
        example: "2 m = 200 cm.",
        tip: "Si le trait ne commence pas au 0, on fait une soustraction."
      }, [
        ["Mesurer avec la règle", "ruler", { max: 14, offset: true }],
        ["Mètres et centimètres", "convert", { kinds: ["length"], units: { length: ["m", "cm"] }, max: 5 }],
        ["Choisir la bonne unité", "unitChoice", {}]
      ]],
      ["masses", "🏋️", "Les masses", {
        lesson: "On mesure les masses en grammes (g) et en kilogrammes (kg). 1 kg = 1 000 g.",
        example: "Un paquet de sucre pèse 1 kg, soit 1 000 g.",
        tip: "Une pomme pèse environ 150 g."
      }, [
        ["Kilogrammes et grammes", "convert", { kinds: ["mass"], max: 5 }],
        ["Lourd ou léger ?", "massCompare", { lightest: true }]
      ]],
      ["monnaie", "💶", "La monnaie", {
        lesson: "Les billets valent 5, 10, 20, 50 € ou plus. Les pièces valent 1 € ou 2 € (et des centimes). On additionne pour connaître la somme.",
        example: "20 € + 10 € + 2 € = 32 €.",
        tip: "Range les billets et pièces du plus grand au plus petit avant de compter."
      }, [
        ["Compter son argent", "money", { values: [1, 2, 5, 10, 20, 50], pieces: 5, input: true }],
        ["Rendre la monnaie", "change", { minPrice: 3, maxPrice: 18 }]
      ]],
      ["temps", "⏰", "Le repérage dans le temps et les durées", {
        lesson: "La grande aiguille montre les minutes : sur le 6, c’est la demie (30 min) ; sur le 3, le quart (15 min). 1 heure = 60 minutes.",
        example: "Petite aiguille entre le 4 et le 5, grande sur le 6 : il est 4 h 30.",
        tip: "Une journée dure 24 heures."
      }, [
        ["Lire l’heure (demie, quart)", "clock", { minutes: [0, 15, 30, 45] }],
        ["Les unités de temps", "timeUnits", { level: 1 }],
        ["Les mois de l’année", "calendar", { months: 1 }]
      ]],
      ["solides", "🎲", "Les solides", {
        lesson: "Un cube a 6 faces carrées. Un pavé droit a 6 faces rectangulaires. Les coins s’appellent des sommets, les bords des arêtes.",
        example: "Un dé est un cube : 6 faces, 8 sommets, 12 arêtes.",
        tip: "Tourne l’objet dans ta main pour compter sans oublier."
      }, [
        ["Qui suis-je ?", "solidName", {}],
        ["Faces, sommets, arêtes", "solidProps", {}]
      ]],
      ["angles", "📐", "Les angles", {
        lesson: "Un angle droit est comme le coin d’une feuille. On le vérifie avec une équerre.",
        example: "Le coin d’une porte forme un angle droit.",
        tip: "Fabrique une équerre en pliant une feuille deux fois."
      }, [
        ["Droit ou pas droit ?", "angle", { kinds: ["droit", "aigu"] }],
        ["Droit ou pas droit (bis)", "angle", { kinds: ["droit", "obtus"] }]
      ]],
      ["figures", "🔷", "Les figures planes", {
        lesson: "Un polygone est une figure fermée avec des côtés droits. Il prend son nom selon son nombre de côtés : triangle (3), quadrilatère (4), pentagone (5), hexagone (6).",
        example: "Un panneau stop a 8 côtés : c’est un octogone.",
        tip: "Le carré est un rectangle particulier : ses 4 côtés sont égaux."
      }, [
        ["Nommer la figure", "polygonName", { kinds: ["name"] }],
        ["Qui suis-je ?", "figureProperties", {}]
      ]],
      ["espace", "🧭", "Se repérer dans l’espace", {
        lesson: "Sur un quadrillage, on code une case par une lettre (colonne) et un nombre (ligne).",
        example: "Le ballon est en C3 : colonne C, ligne 3.",
        tip: "Pose un doigt sur la lettre et un autre sur le nombre, puis rapproche-les."
      }, [
        ["Trouver la case", "gridPos", { cols: 4, rows: 4 }]
      ]],
      ["coder", "🤖", "Coder un déplacement", {
        lesson: "Un programme est une suite d’instructions. Chaque flèche fait avancer le robot d’une case.",
        example: "→ → ↑ : deux cases à droite, puis une case vers le haut.",
        tip: "Suis les flèches une par une, sans sauter d’étape."
      }, [
        ["Suivre le programme", "coding", { min: 2, max: 3 }],
        ["Des programmes plus longs", "coding", { min: 3, max: 5 }]
      ]],
      ["donnees", "📊", "Organisation et gestion de données", {
        lesson: "Un diagramme permet de comparer des quantités d’un seul coup d’œil. On peut aussi y lire des valeurs et calculer des totaux.",
        example: "Léon : 6 buts, Sami : 4 buts. Léon en a 2 de plus.",
        tip: "Lis bien la question : on cherche une valeur, un total ou une différence ?"
      }, [
        ["Lire un diagramme", "chart", { max: 9 }]
      ]]
    ]
  },
  {
    id: "ce2", label: "CE2", short: "CE2", emoji: "🚀", for: "leon",
    intro: "Les nombres jusqu’à 10 000, la division, les fractions et les mesures.",
    chapters: [
      ["nombres-10000", "🔟", "Les nombres jusqu’à 10 000", {
        lesson: "Après les centaines viennent les milliers. 1 000 = 10 centaines. On laisse un petit espace entre les milliers et les centaines.",
        example: "4 205 = 4 000 + 200 + 5.",
        tip: "Un zéro dans un nombre garde la place d’un rang vide."
      }, [
        ["Le tableau des milliers", "placeValue", { max: 10000 }],
        ["Recomposer un nombre", "compose", { max: 10000 }],
        ["Lire et écrire les nombres", "words", { min: 1000, max: 9999 }]
      ]],
      ["comparer", "⚖️", "Comparer et ranger jusqu’à 10 000", {
        lesson: "Le nombre qui a le plus de chiffres est le plus grand. À nombre de chiffres égal, on compare de gauche à droite.",
        example: "3 980 < 4 012 : 3 milliers, c’est moins que 4 milliers.",
        tip: "Encadrer un nombre, c’est le placer entre deux nombres ronds."
      }, [
        ["Le bon signe", "compare", { max: 10000 }],
        ["Encadrer un nombre", "bound", { by: [100, 1000], max: 10000 }],
        ["Ranger dans l’ordre", "order", { max: 10000, desc: true }]
      ]],
      ["addition-soustraction", "🧾", "L’addition et la soustraction", {
        lesson: "On pose en alignant les chiffres de même rang. Pour la soustraction, quand le chiffre du haut est trop petit, on fait une retenue.",
        example: "4 520 − 1 380 = 3 140.",
        tip: "Vérifie une soustraction par une addition : 3 140 + 1 380 = 4 520."
      }, [
        ["Additions posées", "add", { aMin: 1000, aMax: 6999, bMin: 120, bMax: 2999, input: true, hint: "Pose l’opération en colonnes : unités sous unités, dizaines sous dizaines, et pense aux retenues." }],
        ["Soustractions posées", "sub", { aMin: 1000, aMax: 9999, bMin: 120, bMax: 999, input: true, hint: "Pose l’opération en colonnes : unités sous unités, dizaines sous dizaines, et pense aux retenues." }],
        ["Compléments à 100 et 1 000", "complement", { to: [100, 1000], round: true, input: true }]
      ]],
      ["multiplication", "✖️", "La multiplication", {
        lesson: "Pour multiplier un grand nombre, on le décompose : 23 × 4 = 20 × 4 + 3 × 4. Multiplier par 10, c’est ajouter un rang.",
        example: "23 × 4 = 80 + 12 = 92.",
        tip: "45 × 10 = 450 : chaque chiffre avance d’un rang."
      }, [
        ["Toutes les tables", "mul", { tables: [2, 3, 4, 5, 6, 7, 8, 9], input: true }],
        ["Multiplier un nombre à 2 chiffres", "mulBig", { input: true }],
        ["Fois 10, fois 100", "mul10", { by: [10, 100] }]
      ]],
      ["division", "➗", "La division", {
        lesson: "Diviser, c’est partager en parts égales ou chercher combien de fois un nombre entre dans un autre. Parfois, il reste quelque chose : le reste.",
        example: "17 ÷ 5 : 5 × 3 = 15, il reste 2.",
        tip: "Le reste est toujours plus petit que le diviseur."
      }, [
        ["Divisions exactes", "div", { divisors: [2, 3, 4, 5, 6, 7, 8, 9], input: true }],
        ["Quotient et reste", "div", { divisors: [3, 4, 5, 6], remainder: true, input: true }]
      ]],
      ["fractions", "🍕", "Les fractions", {
        lesson: "Le dénominateur (en bas) dit en combien de parts égales on partage. Le numérateur (en haut) dit combien de parts on prend.",
        example: "3/8 : on coupe en 8 parts et on en prend 3.",
        tip: "Avec le même dénominateur, la plus grande fraction a le plus grand numérateur."
      }, [
        ["Lire une fraction", "fractionRead", { dens: [2, 3, 4, 5, 6, 8] }],
        ["Une fraction d’un nombre", "fractionOf", { dens: [2, 3, 4, 5, 10], unit: true, k: 8 }],
        ["Comparer des fractions", "fractionCompare", {}]
      ]],
      ["problemes", "🧩", "La résolution de problèmes", {
        lesson: "Certains problèmes se résolvent en deux étapes. On écrit la question intermédiaire avant de calculer.",
        example: "3 cartes à 4 € avec un billet de 20 € : d’abord 3 × 4 = 12 €, puis 20 − 12 = 8 €.",
        tip: "Écris une phrase réponse pour vérifier que ton résultat a du sens."
      }, [
        ["Problèmes à une étape", "problem", { ops: ["add", "sub", "compare"], max: 1000 }],
        ["Répéter ou partager", "problem", { ops: ["groups", "share"], groups: 8, each: 9 }],
        ["Problèmes en deux étapes", "problem", { ops: ["twoStep"] }]
      ]],
      ["longueurs", "📏", "Les longueurs", {
        lesson: "1 km = 1 000 m, 1 m = 100 cm, 1 cm = 10 mm. On choisit l’unité adaptée à ce que l’on mesure.",
        example: "3 km = 3 000 m.",
        tip: "Une grande unité donne un petit nombre, une petite unité un grand nombre."
      }, [
        ["Convertir les longueurs", "convert", { kinds: ["length"], units: { length: ["km", "m", "cm", "mm"] }, max: 9 }],
        ["Choisir la bonne unité", "unitChoice", {}]
      ]],
      ["geometrie", "📐", "La géométrie plane", {
        lesson: "Un triangle rectangle a un angle droit. Un triangle équilatéral a 3 côtés égaux. Un losange a 4 côtés égaux.",
        example: "Un carré est à la fois un rectangle et un losange !",
        tip: "Vérifie les angles droits avec ton équerre."
      }, [
        ["Nommer la figure", "polygonName", { shapes: ["triangle", "carré", "rectangle", "losange", "pentagone", "hexagone", "octogone"] }],
        ["Qui suis-je ?", "figureProperties", { advanced: true }]
      ]],
      ["perimetre", "🔲", "Le périmètre", {
        lesson: "Le périmètre est la longueur du tour d’une figure. On additionne les longueurs de tous ses côtés.",
        example: "Rectangle de 5 cm sur 3 cm : 5 + 3 + 5 + 3 = 16 cm.",
        tip: "Pour un carré, c’est 4 fois le côté."
      }, [
        ["Calculer un périmètre", "perimeter", { input: true }]
      ]],
      ["masses", "🏋️", "Les masses", {
        lesson: "1 kg = 1 000 g. On utilise le gramme pour les objets légers et le kilogramme pour les objets lourds.",
        example: "2 kg = 2 000 g.",
        tip: "Un litre d’eau pèse environ 1 kg."
      }, [
        ["Convertir les masses", "convert", { kinds: ["mass"], max: 9 }],
        ["Choisir la bonne unité", "unitChoice", {}]
      ]],
      ["contenances", "🥤", "Les contenances", {
        lesson: "La contenance, c’est ce qu’un récipient peut contenir. 1 litre (L) = 10 décilitres (dL) = 100 centilitres (cL).",
        example: "Une bouteille de 50 cL contient la moitié d’un litre.",
        tip: "Un verre contient environ 20 cL."
      }, [
        ["Convertir les contenances", "convert", { kinds: ["capacity"], max: 9 }]
      ]],
      ["monnaie", "💶", "La monnaie", {
        lesson: "1 € = 100 centimes. Pour payer, on cherche une combinaison de billets et de pièces ; pour rendre, on complète jusqu’à la somme donnée.",
        example: "Un livre à 13 € payé avec 20 € : on rend 7 €.",
        tip: "Compte en avançant : 13 → 15 → 20, soit 2 + 5 = 7."
      }, [
        ["Compter son argent", "money", { values: [1, 2, 5, 10, 20, 50], pieces: 6, input: true }],
        ["Rendre la monnaie", "change", { minPrice: 11, maxPrice: 19, input: true }]
      ]],
      ["temps", "⏱️", "Le repérage dans le temps et les durées", {
        lesson: "Sur l’horloge, chaque chiffre vaut 5 minutes pour la grande aiguille. Pour calculer une durée, on avance jusqu’à l’heure pile puis on ajoute le reste.",
        example: "Le match commence à 14 h 30 et dure 45 min : 14 h 30 + 30 min = 15 h, + 15 min = 15 h 15.",
        tip: "1 h = 60 min : attention, ce n’est pas 100 !"
      }, [
        ["Lire l’heure à 5 minutes près", "clock", { minutes: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] }],
        ["Calculer une durée", "duration", {}],
        ["Les unités de temps", "timeUnits", {}]
      ]],
      ["solides", "🎲", "Les solides", {
        lesson: "Un patron, c’est un solide déplié à plat. Le patron d’un cube est fait de 6 carrés.",
        example: "En repliant un patron de pyramide, ses 4 triangles se rejoignent en haut.",
        tip: "Chaque face du solide devient une forme du patron."
      }, [
        ["Faces, sommets, arêtes", "solidProps", {}],
        ["Les patrons", "netFaces", {}]
      ]],
      ["symetrie", "🦋", "La symétrie axiale", {
        lesson: "Une figure a un axe de symétrie si, en la pliant le long de cet axe, les deux moitiés se superposent exactement.",
        example: "Un papillon 🦋 a un axe de symétrie au milieu de son corps.",
        tip: "Un miroir posé sur l’axe reconstitue la figure entière."
      }, [
        ["Les lettres symétriques", "symmetry", { kinds: ["letters"] }],
        ["Compter les axes", "symmetry", { kinds: ["axes"] }]
      ]],
      ["deplacements", "🤖", "Repérage et déplacements", {
        lesson: "On décrit un chemin avec des flèches (→ ← ↑ ↓). On repère une case avec une lettre et un nombre.",
        example: "Départ A1, puis → → ↑ : arrivée en C2.",
        tip: "Compte les cases au fur et à mesure."
      }, [
        ["Suivre le programme", "coding", { min: 3, max: 5 }],
        ["Trouver la case", "gridPos", { cols: 5, rows: 5 }]
      ]],
      ["donnees", "📊", "Organisation et gestion de données", {
        lesson: "Un graphique permet de répondre à des questions : qui a le plus ? combien en tout ? quelle différence ?",
        example: "6 + 9 + 4 + 7 = 26 buts en tout.",
        tip: "Vérifie l’échelle avant de lire une valeur."
      }, [
        ["Lire un diagramme", "chart", { max: 15 }]
      ]]
    ]
  },
  {
    id: "cm1", label: "CM1", short: "CM1", emoji: "🧭", for: "leon",
    intro: "Les grands nombres, les décimaux, les fractions, les aires et la proportionnalité.",
    chapters: [
      ["entiers", "🔢", "Les nombres entiers", {
        lesson: "On groupe les chiffres par classes de trois : la classe des mille, puis celle des unités. Chaque rang vaut 10 fois le rang à sa droite.",
        example: "352 418 se lit trois-cent-cinquante-deux-mille-quatre-cent-dix-huit.",
        tip: "Lis classe par classe en t’arrêtant aux espaces."
      }, [
        ["Valeur des chiffres", "placeValue", { max: 1000000 }],
        ["Recomposer un grand nombre", "compose", { max: 1000000 }],
        ["Écrire en lettres", "words", { min: 10000, max: 999999 }]
      ]],
      ["comparer", "⚖️", "Comparer, ranger, encadrer et intercaler", {
        lesson: "Encadrer un nombre, c’est le placer entre deux nombres plus simples. Intercaler, c’est trouver un nombre entre deux autres.",
        example: "45 000 < 45 678 < 46 000.",
        tip: "Compare d’abord le nombre de chiffres."
      }, [
        ["Le bon signe", "compare", { max: 1000000 }],
        ["Encadrer un nombre", "bound", { by: [1000, 10000], max: 1000000 }],
        ["Ranger dans l’ordre", "order", { max: 1000000, desc: true }]
      ]],
      ["multiples", "🔁", "Multiples et diviseurs", {
        lesson: "24 est un multiple de 6 car 24 = 6 × 4. On dit aussi que 6 est un diviseur de 24.",
        example: "Les multiples de 5 se terminent par 0 ou 5.",
        tip: "Un nombre est multiple de 3 si la somme de ses chiffres est dans la table de 3."
      }, [
        ["Trouver un multiple", "multiples", { of: [2, 3, 5, 10], kinds: ["multiple"] }],
        ["Trouver un diviseur", "multiples", { of: [2, 3, 4, 5, 6], kinds: ["divisor"] }]
      ]],
      ["fractions", "🍕", "Les fractions", {
        lesson: "Une fraction peut être plus petite que 1, égale à 1 ou plus grande que 1. On peut prendre une fraction d’une quantité.",
        example: "3/4 de 20 : 20 ÷ 4 = 5, puis 5 × 3 = 15.",
        tip: "Si le numérateur égale le dénominateur, la fraction vaut 1."
      }, [
        ["Lire une fraction", "fractionRead", { dens: [2, 3, 4, 5, 6, 8, 10] }],
        ["Une fraction d’un nombre", "fractionOf", { dens: [2, 3, 4, 5, 10], k: 9, input: true }],
        ["Comparer des fractions", "fractionCompare", {}]
      ]],
      ["decimaux", "🔍", "Les nombres décimaux", {
        lesson: "Un nombre décimal a une partie entière et une partie décimale, séparées par une virgule. Le premier chiffre après la virgule compte les dixièmes, le second les centièmes.",
        example: "3,47 = 3 + 4/10 + 7/100.",
        tip: "2,5 et 2,50 sont le même nombre."
      }, [
        ["Fractions décimales", "fractionDecimal", { dens: [10, 100] }],
        ["Dixièmes et centièmes", "decimalPlace", {}],
        ["Comparer des décimaux", "compare", { max: 1000, decimals: 2 }]
      ]],
      ["addition-soustraction", "🧾", "Addition et soustraction", {
        lesson: "Avec les grands nombres, on pose les opérations en alignant bien les chiffres de même rang, et on vérifie avec un ordre de grandeur.",
        example: "12 450 + 3 870 ≈ 12 000 + 4 000 = 16 000.",
        tip: "Une estimation permet de repérer une erreur de retenue."
      }, [
        ["Additions posées", "add", { aMin: 10000, aMax: 89999, bMin: 1000, bMax: 9999, input: true, hint: "Pose l’opération en colonnes : unités sous unités, dizaines sous dizaines, et pense aux retenues." }],
        ["Soustractions posées", "sub", { aMin: 10000, aMax: 99999, bMin: 1000, bMax: 9999, input: true, hint: "Pose l’opération en colonnes : unités sous unités, dizaines sous dizaines, et pense aux retenues." }]
      ]],
      ["multiplication", "✖️", "La multiplication", {
        lesson: "Pour multiplier par un nombre à deux chiffres, on multiplie par les unités, puis par les dizaines, et on additionne.",
        example: "125 × 4 = 500.",
        tip: "Multiplier par 100 décale chaque chiffre de deux rangs."
      }, [
        ["Multiplier un grand nombre", "mulBig", { aMin: 100, aMax: 999, bMin: 2, bMax: 9, input: true }],
        ["Fois 10, 100, 1 000", "mul10", { by: [10, 100, 1000] }]
      ]],
      ["division", "➗", "La division", {
        lesson: "Dans la division euclidienne, dividende = diviseur × quotient + reste, et le reste est plus petit que le diviseur.",
        example: "47 = 6 × 7 + 5 : quotient 7, reste 5.",
        tip: "Estime d’abord le quotient avec les tables."
      }, [
        ["Divisions exactes", "div", { divisors: [3, 4, 6, 7, 8, 9], qMax: 25, input: true }],
        ["Quotient et reste", "div", { divisors: [4, 6, 7, 8, 9], qMax: 30, remainder: true, input: true }]
      ]],
      ["calcul-mental", "🧠", "Calcul mental et estimation", {
        lesson: "Calculer un ordre de grandeur, c’est arrondir les nombres pour obtenir vite un résultat approché.",
        example: "398 + 512 ≈ 400 + 500 = 900.",
        tip: "Doubles et moitiés : la moitié de 360, c’est 180."
      }, [
        ["Ordres de grandeur", "estimate", {}],
        ["Doubles et moitiés", "doubleHalf", { max: 500, input: true }],
        ["Compléments à 1 000", "complement", { to: [1000], input: true }]
      ]],
      ["expressions", "🧮", "Les expressions", {
        lesson: "Dans un calcul, on effectue d’abord ce qui est entre parenthèses, puis les multiplications, puis les additions et soustractions.",
        example: "3 + 4 × 5 = 3 + 20 = 23, mais (3 + 4) × 5 = 35.",
        tip: "Souligne d’abord ce que tu dois calculer en premier."
      }, [
        ["Les priorités de calcul", "priority", { input: true }]
      ]],
      ["problemes", "🧩", "La résolution de problèmes", {
        lesson: "Pour un problème à plusieurs étapes, on écrit les étapes intermédiaires et on vérifie que chaque résultat a du sens.",
        example: "4 places à 9 € avec 50 € : 4 × 9 = 36 €, 50 − 36 = 14 € rendus.",
        tip: "Souligne les nombres utiles, barre ceux qui ne servent pas."
      }, [
        ["Problèmes en deux étapes", "problem", { ops: ["twoStep"], input: true }],
        ["Répéter ou partager", "problem", { ops: ["groups", "share"], groups: 9, each: 12, input: true }]
      ]],
      ["algebre", "🔤", "Premiers pas d’algèbre", {
        lesson: "Un nombre inconnu peut être représenté par un « ? ». Pour le trouver, on utilise l’opération inverse.",
        example: "? + 27 = 63 : 63 − 27 = 36.",
        tip: "Vérifie en remplaçant le « ? » par ta réponse."
      }, [
        ["Le nombre inconnu", "missing", { ops: ["+", "−", "×"], max: 100, input: true }],
        ["Programmes de calcul", "program", { input: true }]
      ]],
      ["longueurs-perimetre", "📏", "Longueurs et périmètre", {
        lesson: "On convertit les longueurs grâce au tableau km, hm, dam, m, dm, cm, mm. Le périmètre est la longueur du tour d’une figure.",
        example: "Carré de 7 cm de côté : périmètre 4 × 7 = 28 cm.",
        tip: "Dans le tableau, chaque colonne vaut 10 fois la suivante."
      }, [
        ["Convertir les longueurs", "convert", { kinds: ["length"], units: { length: ["km", "m", "dm", "cm", "mm"] }, max: 9 }],
        ["Calculer un périmètre", "perimeter", { input: true }]
      ]],
      ["masses", "🏋️", "Les masses", {
        lesson: "1 kg = 1 000 g. On choisit la bonne unité selon l’objet.",
        example: "4 500 g = 4,5 kg.",
        tip: "Un sac d’école pèse quelques kilogrammes."
      }, [
        ["Convertir les masses", "convert", { kinds: ["mass"], max: 9 }]
      ]],
      ["contenances", "🥤", "Les contenances", {
        lesson: "1 L = 10 dL = 100 cL. Pour comparer des contenances, on les exprime dans la même unité.",
        example: "75 cL < 1 L, car 1 L = 100 cL.",
        tip: "Une canette contient 33 cL."
      }, [
        ["Convertir les contenances", "convert", { kinds: ["capacity"], max: 9 }]
      ]],
      ["aires", "🟩", "Les aires", {
        lesson: "L’aire mesure la surface à l’intérieur d’une figure. On peut compter les carreaux qui la recouvrent.",
        example: "Un rectangle de 4 carreaux sur 3 : 4 × 3 = 12 carreaux.",
        tip: "Ne confonds pas l’aire (l’intérieur) et le périmètre (le tour)."
      }, [
        ["Compter les carreaux", "area", { grid: true }]
      ]],
      ["angles", "📐", "Les angles", {
        lesson: "Un angle aigu est plus petit qu’un angle droit. Un angle obtus est plus grand qu’un angle droit.",
        example: "Les aiguilles à 2 h forment un angle aigu.",
        tip: "Compare toujours avec ton équerre."
      }, [
        ["Aigu, droit ou obtus ?", "angle", { kinds: ["droit", "aigu", "obtus"] }]
      ]],
      ["temps", "⏱️", "Le temps et les durées", {
        lesson: "Pour calculer un horaire de fin, on ajoute la durée au début. 1 h = 60 min, 1 min = 60 s.",
        example: "16 h 45 + 30 min = 17 h 15.",
        tip: "Passe par l’heure pile pour éviter les erreurs."
      }, [
        ["Calculer une durée", "duration", { durations: [25, 35, 45, 50, 75, 90] }],
        ["Les unités de temps", "timeUnits", {}]
      ]],
      ["points-droites", "📍", "Points et droites", {
        lesson: "Un segment [AB] s’arrête en A et en B. Une droite (AB) continue sans fin. Deux droites perpendiculaires se coupent en formant un angle droit ; deux droites parallèles ne se coupent jamais.",
        example: "Les rails d’un train sont parallèles.",
        tip: "Crochet : on s’arrête. Parenthèse : on continue."
      }, [
        ["Les notations", "lines", { kinds: ["notation"] }],
        ["Parallèles ou perpendiculaires ?", "lines", { kinds: ["relation"] }]
      ]],
      ["figures", "🔷", "Les figures planes", {
        lesson: "On reconnaît les quadrilatères à leurs propriétés : côtés égaux, côtés parallèles, angles droits.",
        example: "Un rectangle a 4 angles droits et ses côtés opposés de même longueur.",
        tip: "Le cercle se trace au compas : tous ses points sont à la même distance du centre."
      }, [
        ["Qui suis-je ?", "figureProperties", { advanced: true }],
        ["Nommer la figure", "polygonName", { shapes: ["triangle", "carré", "rectangle", "losange", "pentagone", "hexagone", "octogone"] }]
      ]],
      ["symetrie", "🦋", "La symétrie axiale", {
        lesson: "Le symétrique d’une figure par rapport à une droite est son reflet dans un miroir posé sur cette droite.",
        example: "La lettre H a un axe de symétrie vertical.",
        tip: "Sur quadrillage, compte les carreaux de chaque côté de l’axe."
      }, [
        ["Les lettres symétriques", "symmetry", { kinds: ["letters"] }],
        ["Compter les axes", "symmetry", { kinds: ["axes"] }]
      ]],
      ["solides", "🎲", "Les solides", {
        lesson: "Les polyèdres ont des faces planes ; la boule, le cylindre et le cône ont des surfaces courbes.",
        example: "Une pyramide à base carrée a 5 faces, 5 sommets et 8 arêtes.",
        tip: "Compte les arêtes du haut, du bas, puis celles qui montent."
      }, [
        ["Faces, sommets, arêtes", "solidProps", {}],
        ["Qui suis-je ?", "solidName", {}]
      ]],
      ["reperage", "🤖", "Le repérage et les déplacements", {
        lesson: "Un programme de déplacement doit être précis : chaque instruction compte.",
        example: "Départ B2, puis ↑ ↑ → : arrivée en C4.",
        tip: "Vérifie ta réponse en refaisant le chemin à l’envers."
      }, [
        ["Suivre le programme", "coding", { min: 4, max: 6 }],
        ["Coordonnées sur une grille", "gridPos", { cols: 6, rows: 5 }]
      ]],
      ["donnees", "📊", "Organisation et gestion de données", {
        lesson: "Un tableau ou un graphique organise des données. On peut y lire une valeur, comparer et calculer.",
        example: "Total des buts du tournoi : on additionne toutes les barres.",
        tip: "Lis le titre et les légendes avant de répondre."
      }, [
        ["Lire un diagramme", "chart", { max: 20 }]
      ]],
      ["probabilites", "🎲", "Les probabilités", {
        lesson: "Un événement peut être certain, possible ou impossible. Plus il y a de cas favorables, plus il a de chances de se produire.",
        example: "Lancer un dé et obtenir 7 : c’est impossible.",
        tip: "Compte les cas favorables et les cas possibles."
      }, [
        ["Certain, possible, impossible", "probability", {}]
      ]],
      ["proportionnalite", "⚖️", "La proportionnalité", {
        lesson: "Deux grandeurs sont proportionnelles quand on multiplie l’une par un nombre, l’autre est multipliée par le même nombre.",
        example: "2 cartes coûtent 6 €, donc 6 cartes coûtent 18 € (3 fois plus).",
        tip: "Passer par l’unité marche toujours : le prix d’une seule carte."
      }, [
        ["Problèmes de proportionnalité", "proportion", { input: true }]
      ]]
    ]
  },
  {
    id: "cm2", label: "CM2", short: "CM2", emoji: "🌍", for: "leon",
    intro: "Jusqu’au milliard, les décimaux, les pourcentages et les constructions.",
    chapters: [
      ["milliard", "🌌", "Les nombres jusqu’au milliard", {
        lesson: "Après la classe des mille vient celle des millions. Un milliard, c’est mille millions.",
        example: "45 300 000 : 45 millions 300 mille.",
        tip: "Chaque classe a trois chiffres : unités, dizaines, centaines."
      }, [
        ["Les classes des grands nombres", "bigNumbers", {}],
        ["Valeur des chiffres", "placeValue", { max: 1000000000 }],
        ["Écrire en lettres", "words", { min: 1000000, max: 999999999 }]
      ]],
      ["comparer", "⚖️", "Comparer, encadrer et arrondir", {
        lesson: "Arrondir, c’est remplacer un nombre par un nombre rond proche. On regarde le chiffre juste après le rang choisi : de 0 à 4 on garde, de 5 à 9 on monte.",
        example: "47 680 arrondi au millier : 48 000.",
        tip: "Un arrondi sert à estimer rapidement."
      }, [
        ["Arrondir", "rounding", { to: [10, 100, 1000], max: 100000 }],
        ["Encadrer", "bound", { by: [1000, 10000, 100000], max: 10000000 }],
        ["Le bon signe", "compare", { max: 1000000000 }]
      ]],
      ["diviseurs", "🔁", "Diviseurs et multiples", {
        lesson: "Critères de divisibilité : par 2 si le nombre est pair, par 5 s’il finit par 0 ou 5, par 3 ou 9 si la somme de ses chiffres est dans la table de 3 ou de 9.",
        example: "135 : 1 + 3 + 5 = 9, donc 135 est divisible par 3 et par 9.",
        tip: "Les diviseurs vont par paires : 24 = 4 × 6."
      }, [
        ["Trouver un multiple", "multiples", { of: [3, 4, 6, 9], kinds: ["multiple"] }],
        ["Trouver un diviseur", "multiples", { of: [3, 4, 6, 8, 9], kinds: ["divisor"] }]
      ]],
      ["fractions", "🍕", "Les fractions", {
        lesson: "Deux fractions sont égales quand on multiplie (ou divise) le numérateur et le dénominateur par le même nombre.",
        example: "2/3 = 4/6 = 10/15.",
        tip: "Une fraction décimale a 10, 100 ou 1 000 au dénominateur."
      }, [
        ["Fractions égales", "fractionEquivalent", {}],
        ["Une fraction d’un nombre", "fractionOf", { dens: [3, 4, 5, 8, 10], k: 12, input: true }],
        ["Fractions et décimaux", "fractionDecimal", { dens: [10, 100] }]
      ]],
      ["decimaux", "🔍", "Les nombres décimaux", {
        lesson: "Multiplier un décimal par 10, 100 ou 1 000 fait glisser ses chiffres vers la gauche ; diviser les fait glisser vers la droite.",
        example: "3,25 × 100 = 325 ; 47 ÷ 10 = 4,7.",
        tip: "La virgule ne bouge pas : ce sont les chiffres qui changent de rang."
      }, [
        ["Dixièmes et centièmes", "decimalPlace", {}],
        ["Comparer des décimaux", "compare", { max: 10000, decimals: 2 }],
        ["× et ÷ par 10, 100, 1 000", "mul10", { by: [10, 100, 1000], decimals: 2, divide: true }]
      ]],
      ["operations-decimaux", "🧾", "Poser les opérations avec les décimaux", {
        lesson: "On aligne les virgules les unes sous les autres. On peut compléter avec des zéros pour avoir autant de chiffres après la virgule.",
        example: "12,5 + 3,47 = 12,50 + 3,47 = 15,97.",
        tip: "Pour multiplier un décimal par un entier, on calcule sans virgule puis on la replace."
      }, [
        ["Additions et soustractions", "decimalCalc", { ops: ["+", "−"], input: true }],
        ["Multiplications", "decimalCalc", { ops: ["×"], input: true }]
      ]],
      ["calcul-mental", "🧠", "Le calcul mental", {
        lesson: "Pour calculer de tête, on décompose, on arrondit et on utilise les propriétés : 25 × 4 = 100, 50 × 2 = 100.",
        example: "99 × 7 = 100 × 7 − 7 = 693.",
        tip: "Un ordre de grandeur permet de vérifier un calcul."
      }, [
        ["Ordres de grandeur", "estimate", { mul: true }],
        ["Doubles et moitiés", "doubleHalf", { max: 1000, input: true }],
        ["Les priorités", "priority", { input: true }]
      ]],
      ["problemes", "🧩", "La résolution de problèmes", {
        lesson: "On repère les données utiles, on choisit les opérations et on organise les étapes avant de calculer.",
        example: "Billets à 9 € pour 6 personnes, payés avec 100 € : 6 × 9 = 54 €, 100 − 54 = 46 €.",
        tip: "Une phrase réponse claire aide à vérifier."
      }, [
        ["Problèmes en plusieurs étapes", "problem", { ops: ["twoStep"], input: true }],
        ["Répéter ou partager", "problem", { ops: ["groups", "share"], groups: 12, each: 15, input: true }],
        ["Proportionnalité", "proportion", { input: true }]
      ]],
      ["algebre", "🔤", "La pensée algébrique", {
        lesson: "Un programme de calcul enchaîne des opérations. On peut le suivre dans un sens ou le remonter pour retrouver le nombre de départ.",
        example: "Je pense à un nombre, je le multiplie par 3 et j’ajoute 4 : j’obtiens 19. Le nombre est 5.",
        tip: "Pour remonter un programme, on fait les opérations inverses, en sens inverse."
      }, [
        ["Le nombre inconnu", "missing", { ops: ["+", "−", "×"], max: 500, input: true }],
        ["Programmes de calcul", "program", { input: true }]
      ]],
      ["aires", "🟩", "Les aires", {
        lesson: "L’aire d’un rectangle se calcule : longueur × largeur. Elle s’exprime en unités d’aire, comme le cm².",
        example: "Rectangle de 6 cm sur 4 cm : 24 cm².",
        tip: "Les deux longueurs doivent être dans la même unité."
      }, [
        ["Compter les carreaux", "area", { grid: true, max: 10 }],
        ["Aire d’un rectangle", "area", { grid: false, max: 12, input: true }]
      ]],
      ["angles", "📐", "Les angles", {
        lesson: "On compare un angle à l’angle droit : plus petit, il est aigu ; plus grand, il est obtus.",
        example: "L’angle d’une part de pizza fine est aigu.",
        tip: "Prolonge les côtés si l’angle est difficile à voir."
      }, [
        ["Aigu, droit ou obtus ?", "angle", { kinds: ["droit", "aigu", "obtus"] }]
      ]],
      ["temps", "⏱️", "Le temps et les durées", {
        lesson: "On calcule des durées en heures et minutes en passant par les heures piles. 1 jour = 24 h, 1 h = 60 min.",
        example: "De 9 h 40 à 11 h 15 : 20 min + 1 h + 15 min = 1 h 35.",
        tip: "Fais un petit schéma en ligne du temps."
      }, [
        ["Calculer une durée", "duration", { durations: [35, 50, 75, 95, 110] }],
        ["Les unités de temps", "timeUnits", {}]
      ]],
      ["points-droites", "📍", "Points, droites et longueurs", {
        lesson: "Le rayon d’un cercle relie le centre à un point du cercle. Le diamètre traverse le cercle en passant par le centre : il mesure deux rayons.",
        example: "Rayon 5 cm → diamètre 10 cm.",
        tip: "Pour tracer un cercle, on écarte le compas de la longueur du rayon."
      }, [
        ["Les notations", "lines", { kinds: ["notation", "relation"] }],
        ["Rayon et diamètre", "circle", {}]
      ]],
      ["constructions", "🛠️", "Figures planes et programmes de construction", {
        lesson: "Un programme de construction décrit une figure étape par étape avec le vocabulaire précis : segment, milieu, perpendiculaire, rayon…",
        example: "« Trace un carré ABCD de 4 cm de côté » : 4 côtés égaux et 4 angles droits.",
        tip: "Lis toute la consigne avant de commencer à tracer."
      }, [
        ["Qui suis-je ?", "figureProperties", { advanced: true }],
        ["Cercles", "circle", {}]
      ]],
      ["symetrie", "🦋", "La symétrie axiale", {
        lesson: "Deux points symétriques sont à la même distance de l’axe, de part et d’autre, sur une même perpendiculaire.",
        example: "Un rectangle (pas carré) a 2 axes de symétrie.",
        tip: "Le pliage est le meilleur moyen de vérifier."
      }, [
        ["Compter les axes", "symmetry", { kinds: ["axes"] }],
        ["Les lettres symétriques", "symmetry", { kinds: ["letters"] }]
      ]],
      ["patrons", "📦", "Les solides et leurs patrons", {
        lesson: "Un patron est une surface plane qui, une fois pliée, forme un solide. Chaque face apparaît une seule fois.",
        example: "Un patron de cylindre : un rectangle et deux disques.",
        tip: "Vérifie qu’en pliant, aucune face ne se superpose."
      }, [
        ["Les patrons", "netFaces", {}],
        ["Faces, sommets, arêtes", "solidProps", {}]
      ]],
      ["deplacements", "🤖", "Déplacements dans l’espace", {
        lesson: "Un programme de déplacement peut être long : on le découpe en petits morceaux.",
        example: "→ → ↑ ↑ ← : deux à droite, deux en haut, un à gauche.",
        tip: "Note la case d’arrivée après chaque morceau."
      }, [
        ["Suivre le programme", "coding", { min: 4, max: 7 }]
      ]],
      ["donnees", "📊", "Organisation et gestion de données", {
        lesson: "Les diagrammes, tableaux et graphiques permettent de comparer et de calculer des totaux ou des différences.",
        example: "Écart entre la plus grande et la plus petite barre : 18 − 5 = 13.",
        tip: "Toujours vérifier l’échelle."
      }, [
        ["Lire un diagramme", "chart", { max: 20 }]
      ]],
      ["probabilites", "🎲", "Les probabilités", {
        lesson: "On peut comparer les chances de deux événements en comptant les cas favorables.",
        example: "Dans un sac de 5 boules rouges et 2 bleues, tirer une rouge est plus probable.",
        tip: "Certain : toujours. Impossible : jamais."
      }, [
        ["Certain, possible, impossible", "probability", {}]
      ]],
      ["proportionnalite", "⚖️", "La proportionnalité", {
        lesson: "Un pourcentage est une proportion sur 100. 50 % c’est la moitié, 25 % le quart, 10 % le dixième.",
        example: "10 % de 80 = 8 ; 25 % de 80 = 20.",
        tip: "Pour 75 %, calcule 50 % + 25 %."
      }, [
        ["Problèmes de proportionnalité", "proportion", { input: true }],
        ["Les pourcentages", "percent", {}]
      ]]
    ]
  }
];

/** Programme normalisé : identifiants stables `niveau.chapitre.n`. */
export const SCHOOL_LEVELS = LEVELS_RAW.map(level => ({
  id: level.id,
  label: level.label,
  short: level.short,
  emoji: level.emoji,
  for: level.for,
  intro: level.intro,
  chapters: level.chapters.map(([slug, emoji, title, lesson, skills], index) => ({
    id: level.id + "." + slug,
    number: index + 1,
    emoji,
    title,
    lesson,
    skills: skills.map(([skillTitle, gen, params], n) => ({
      id: level.id + "." + slug + "." + (n + 1),
      title: skillTitle,
      gen,
      params: params || {}
    }))
  }))
}));

export const ALL_SKILLS = SCHOOL_LEVELS.flatMap(level => level.chapters.flatMap(chapter => chapter.skills.map(skill => ({ ...skill, level: level.id, chapter: chapter.id }))));
export const findLevel = id => SCHOOL_LEVELS.find(level => level.id === id) || null;
export const findChapter = id => SCHOOL_LEVELS.flatMap(level => level.chapters).find(chapter => chapter.id === id) || null;
export const findSkill = id => ALL_SKILLS.find(skill => skill.id === id) || null;
/** Niveaux proposés à chaque enfant ; le premier est son niveau de classe. */
export const CHILD_LEVELS = { rose: ["maternelle", "cp"], leon: ["ce1", "cp", "ce2", "cm1", "cm2", "maternelle"] };
