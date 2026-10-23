# Décisions techniques et pédagogiques

## Architecture
- Hébergement statique via GitHub Pages ; aucun backend.
- HTML, CSS et JavaScript natifs avec modules ES ; pas de framework, build, npm ou CDN sans accord explicite.
- Priorité d’usage : Safari sur iPhone ; fonctionnement hors ligne attendu après un premier chargement HTTPS.
- Service worker limité aux ressources locales nécessaires. À chaque ajout ou modification d’une ressource précachée, vérifier `ASSETS` et incrémenter `CACHE` dans le même changement.
- À l’activation, le service worker ne supprime que les caches préfixés `rose-leon-`, car CacheStorage est partagé à l’échelle de l’origine.
- Voix via `speechSynthesis` après interaction utilisateur, avec repli si indisponible ; sons générés avec Web Audio API.
- Icône web SVG locale et icône PNG 512×512 locales, sans logo protégé. L’icône PNG est déclarée dans le manifeste PWA et via `apple-touch-icon` ; son rendu réel lors de l’installation iOS reste à valider sur appareil.

## Données et sauvegardes
- Données conservées localement dans le navigateur ; sauvegardes JSON importables et exportables.
- Le schéma de stockage est versionné. Toute évolution doit inclure une migration compatible et des tests des anciennes sauvegardes.
- Les imports doivent être validés avant de remplacer l’état courant ; un échec d’écriture doit laisser l’état précédent intact.
- Ne pas exporter de secret ou de code PIN en clair. Les limites de sécurité de la porte parentale doivent rester explicites.
- Tester les scénarios Safari iPhone, notamment export/import, stockage et éventuelle différence entre Safari et l’application installée.

## Principes pédagogiques
- Sessions courtes, consignes claires, indices progressifs et possibilité de réécouter.
- Une erreur appelle une aide et une nouvelle tentative, sans punition, croix rouges, buzzer, classement entre enfants ni chronomètre stressant.
- La difficulté doit respecter le rythme de l’enfant. Les réponses données après révélation ou aide ne doivent pas être assimilées automatiquement à une réussite autonome.
- Les activités de Rose privilégient les interactions tactiles simples, les grands éléments visuels et la possibilité de recommencer sans pénalité.
- Les affirmations pédagogiques importantes doivent distinguer clairement programme officiel, pratique étayée et proposition personnelle, avec sources précises. Les ressources consultées servent de repères ; les activités et textes doivent rester originaux.
- Ne pas enregistrer de données sensibles sur les crises et ne pas employer de diagnostic médical dans l’interface enfant.

## Accessibilité et impression
- Cibles tactiles adaptées au mobile, focus visible, annonces accessibles de progression et respect de `prefers-reduced-motion`.
- Les fiches A4 doivent rester sobres et économes en encre. Le rendu dans l’aperçu Safari et sur une imprimante réelle n’est pas réputé validé tant qu’un essai n’a pas été fait.
- Les activités pour Rose doivent permettre l’accompagnement oral de l’adulte et ne pas exiger qu’elle sache écrire des phrases.

## Décisions de conception déjà prises
- L’activité de composition du prénom « ROSE » affiche un modèle visible, encourage les essais et permet de recommencer ; aucun score ni pénalité. La règle de validation est testée automatiquement.
- Les jeux de Rose exposent leur progression aux lecteurs d’écran ; des tests couvrent les cibles tactiles, le focus visible et la réduction des animations.
- La porte parentale vérifie, avant de se réafficher après un délai, que l’écran est toujours celui de la porte, pour ne pas interrompre une navigation.
- La porte parentale accepte Entrée pour valider le calcul.
- Les tests de stockage simulent les erreurs d’écriture pour vérifier le maintien de l’état précédent.
- Les activités « Nombre mystère » et « Les syllabes dans les mots » sont des créations originales inspirées des compétences de référence : numération/nombres voisins en CE1 et segmentation orale en moyenne section. Elles doivent rester courtes, réécoutables, sans chronomètre et avec retour encourageant.


- Les routes parentales `parent`, `crisis` et `print` sont gardées par une vérification commune au moment du rendu, et non seulement par les boutons visibles. L’état de déverrouillage reste en mémoire et se referme au retour à l’accueil, aux profils enfants ou à l’écran de porte.
- Le blocage de 30 secondes après trois erreurs de calcul est horodaté dans `sessionStorage` et `localStorage` pour survivre à un rechargement ; les accès au stockage tolèrent les restrictions du navigateur.
- Cette porte est une barrière de navigation destinée à éviter l’accès accidentel des enfants, pas une authentification sécurisée contre une personne techniquement déterminée.

## Validation et livraison
- Distinguer systématiquement : code présent, test automatisé passé, validation par l’utilisateur sur iPhone et déploiement public confirmé.
- Après chaque étape, consulter les tests GitHub Actions correspondant au SHA exact. En cas d’échec, corriger ou revenir en arrière avant de poursuivre.
- Vérifier le déploiement Pages et le service worker public après toute modification du cache.
- Une vérification de syntaxe ne remplace ni les tests unitaires ni un test navigateur. Ne jamais annoncer comme exécuté un test qui ne l’a pas été.

- Progression adaptative de Léon : une seule contribution par question, à la première réponse. Les réponses après le deuxième indice ou la révélation de la solution alimentent les statistiques d’essai/réussite, mais restent neutres pour le niveau. Les séries sont remises à zéro après un changement de niveau pour éviter les montées ou baisses successives indues.

- Schéma de stockage 3 : les imports sont validés puis normalisés avant remplacement de l’état ; les versions futures, profils malformés et fichiers de plus de 2 Mio sont refusés. Les champs inconnus ne sont pas réinjectés dans l’état courant.
- Le PIN parental ne figure pas dans les sauvegardes exportées. Lors d’un import, la configuration PIN de l’appareil est conservée et toute valeur de PIN contenue dans une ancienne sauvegarde est ignorée.
- La migration du schéma 2 normalise les anciennes séries de progression pour éviter qu’un seuil déjà atteint ne déclenche une montée/descente supplémentaire à la première réponse après mise à jour.

- É5 : la sauvegarde doit rester déclenchée par une action explicite. Préférer le partage natif de fichier quand il est disponible, conserver un téléchargement de repli et proposer la copie du JSON comme autre solution. Le rappel de sauvegarde est local à l’appareil, non intrusif, et n’atteste pas que l’utilisateur a effectivement conservé le fichier après téléchargement. La demande `navigator.storage.persist()` est facultative et ne doit jamais empêcher l’export.

- É6 : les activités de lecture utilisent des contenus courts et originaux, avec des questions littérales faciles à repérer dans la phrase ou le mini-texte. La banque de mots est élargie tout en conservant les mots personnalisés de l’espace parent. Les tests vérifient que les contenus varient et que les réponses proposées restent distinctes ; l’adaptation réelle à Léon doit encore être confirmée sur iPhone.

- É7 : la pause guidée est une activité facultative en trois étapes, sans compte à rebours, sans obligation de respirer d’une manière particulière, sans score et sans persistance. L’enfant progresse en touchant un bouton et peut arrêter à tout moment. Elle reste une proposition de recentrage simple, pas un outil de diagnostic ou de soin.

- É8 : la progression de la pause guidée est exposée comme statut accessible avec annonce polie afin que les technologies d’assistance puissent signaler le changement d’étape sans interrompre inutilement la lecture. Le test source vérifie la présence de cette annonce, mais seul un essai réel avec VoiceOver sur iPhone peut confirmer l’expérience.


- É9 : employer « syllabes » de façon cohérente dans l’activité d’écoute de Rose. Les sons de réponse sont courts, doux et subordonnés au réglage utilisateur ; une erreur déclenche un son discret plutôt qu’un buzzer punitif. La bonne réponse reste encouragée même si l’enfant s’est trompé avant. Le menu d’entrée de Léon doit annoncer un choix de défis, pas uniquement un penalty.


- É10 : l’icône PNG 512×512 est déclarée dans le manifeste PWA et comme `apple-touch-icon`, conservée en ressource locale précachée ; le cache est `rose-leon-v40`. La CI et GitHub Pages sont confirmés sur le commit `9b1caf7126c044c221152e37d3138b6690e4d3c3`. Le rendu réel de l’icône et le comportement hors ligne sur iPhone restent non testés.

- É11 : la carte « Aujourd’hui » doit refléter la date locale de l’appareil et s’appuyer sur l’historique des sessions ; les compteurs cumulés restent explicitement identifiés comme tels. La progression positive montre les étoiles, réussites et essais sans comparaison entre enfants. Les réglages de durée inutilisés restent compatibles avec les anciennes sauvegardes et ne doivent pas être présentés comme un minuteur actif.

- É12 : les exercices de calcul mental et de petits problèmes sont générés localement, sans service externe. L’enfant saisit une réponse numérique, peut demander un indice ou réécouter la consigne et peut réessayer après une erreur. Une session est enregistrée après cinq réponses correctes. Les modes proposés couvrent les compléments à 10/100, doubles, moitiés, droite numérique et trois structures de problèmes. Les tests de générateurs ne remplacent pas la vérification de la pertinence pédagogique ni l’essai sur iPhone.


- É13 : la banque du jeu des syllabes doit refléter le découpage oral usuel des mots. « tomate » se prononce en trois syllabes (to-ma-te) et « banane » en trois (ba-na-ne). Un test couvre explicitement les dix entrées afin d’éviter une régression. La validation automatisée ne remplace pas l’écoute et l’essai avec Rose.


- É14 : dans les défis adaptatifs de maths, utiliser une aide même une seule fois signifie que la réponse est accompagnée. Elle compte toujours dans les statistiques d’activité, mais ne doit pas être considérée comme une réussite ou une erreur autonome pour ajuster le niveau. Ce choix évite de faire monter ou descendre le niveau sur une réponse influencée par un indice.


- É15 : dans les mots-mystères, les tirets doivent représenter le découpage oral entendu, pas une découpe mécanique des lettres. Les mots monosyllabiques comme « pomme », « poire » et « nuage » restent sans tiret ; les mots comme « maîtresse », « cartable », « étoile », « montagne », « girafe » et « valise » sont ramenés à deux syllabes orales. La banque exportée est testée sur un échantillon courant ; la validation finale se fait à voix haute avec l’enfant.