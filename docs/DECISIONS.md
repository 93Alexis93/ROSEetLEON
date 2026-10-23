# Décisions techniques et pédagogiques

## Architecture
- Hébergement statique via GitHub Pages ; aucun backend.
- HTML, CSS et JavaScript natifs avec modules ES ; pas de framework, build, npm ou CDN sans accord explicite.
- Priorité d’usage : Safari sur iPhone ; fonctionnement hors ligne attendu après un premier chargement HTTPS.
- Service worker limité aux ressources locales nécessaires. À chaque ajout ou modification d’une ressource précachée, vérifier `ASSETS` et incrémenter `CACHE` dans le même changement.
- À l’activation, le service worker ne supprime que les caches préfixés `rose-leon-`, car CacheStorage est partagé à l’échelle de l’origine.
- Voix via `speechSynthesis` après interaction utilisateur, avec repli si indisponible ; sons générés avec Web Audio API.
- Icône web SVG locale, sans logo protégé. Une icône PNG spécifique à iOS reste à étudier/valider sur appareil.

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
