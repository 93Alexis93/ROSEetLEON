# Avancement — Rose & Léon
Mis à jour le 23 octobre 2026.

## Phase 0 — Fondations
- [x] Documentation pédagogique et décisions techniques
- [x] Structure de base du dépôt
- [x] HTML mobile-first, manifest PWA et service worker
- [x] Stockage versionné, routeur, UI, voix et sons
- [x] Thèmes CSS et icône SVG locale
- [x] Application publiée sur GitHub Pages et ouverte sur iPhone Safari
- [ ] Refaire un test complet du mode avion après les dernières évolutions

## Phase 1 — Squelette navigable
- [x] Accueil et choix des profils Léon / Rose
- [x] Porte parentale avec multiplication 6–9, verrouillage après trois erreurs et PIN facultatif
- [x] Tableau de bord parent, réglages voix/sons, export/import JSON et remise à zéro
- [x] Défi de calcul mental initial pour Léon et comptage de licornes pour Rose
- [x] Encouragements, suivi local et écran de fin
- [x] Outil parent « Crise en cours »
- [ ] Tests navigateur complets et vérification de la voix iOS

## Phase 2 — Maths de Léon
- [x] Moteur de questions dans six domaines : calcul mental, numération, tables, problèmes, logique et mesures
- [x] Cinq questions par session, indices progressifs et trois niveaux adaptatifs
- [x] Progression locale par domaine et résumé dans l’espace parent
- [x] Renouvellement du cache PWA pour les ressources de maths
- [x] Contrôle automatique de 9 000 questions sans défaut détecté (résultat rapporté précédemment)
- [x] L’utilisateur a confirmé sur iPhone que les six défis apparaissent après actualisation de l’URL
- [x] Suite `node --experimental-default-type=module --test tests/*.test.mjs` exécutée dans GitHub Actions ; les choix de secours numériques ont été corrigés et les tests automatisés passent
- [ ] Tester chaque domaine jusqu’à la fin d’une session, la progression adaptative et le mode avion
- État : menu visible validé par l’utilisateur ; tests automatisés des moteurs passés, parcours fonctionnel complet encore à vérifier.

## Phase 3 — Lecture de Léon (première version en cours)
- [x] Menu lecture accessible depuis l’accueil de Léon
- [x] Quatre formats : mots-éclairs, mots-mystères, phrases et mini-textes
- [x] Gestion locale des mots personnalisés depuis l’espace parent
- [x] Correction du compteur : une réponse trouvée après une erreur ne compte plus comme réussite du premier coup
- [x] Consigne de chaque format lue par la voix française si elle est activée ; les mots-éclairs font entendre le mot cible
- [x] Questions de compréhension des phrases reformulées pour éviter une consigne ambiguë
- [x] Tests unitaires ajoutés : 200 générations par format vérifient quatre choix distincts, présence de la réponse et contenu des consignes
- [x] Workflow GitHub Actions configuré pour vérifier la syntaxe JavaScript et lancer les tests de maths et de lecture à chaque push sur main ou pull request
- [x] Cache PWA initialement passé à v6 après correction des choix de lecture ; renouvelé ensuite à v8 pour les jeux de Rose
- [x] GitHub Actions exécute le workflow ; une première exécution a révélé un défaut de choix multiples en lecture, corrigé ; les tests et la vérification de syntaxe passent encore sur le commit `57fd361`
- [ ] Tester le parcours complet de lecture sur iPhone, y compris voix, indices, fin de session et navigation
- [ ] Tester ajout/suppression de mots, réutilisation dans les jeux de mots, persistance après rechargement et sauvegardes JSON
- [ ] Vérifier hors ligne après activation du service worker
- État : les tests automatisés passent sur le commit `57fd361`. Les tests navigateur et mode hors ligne restent à faire.

## Phase 4 — Premiers jeux variés pour Rose (en cours)
- [x] Menu de choix de jeux séparé du lancement direct du comptage
- [x] Jeu de couleurs avec consigne vocale, trois choix et indice doux
- [x] Jeu de formes (cercle, carré, triangle, étoile) avec consigne vocale, trois choix et indice
- [x] Jeu des lettres R, O, S et E à partir du prénom Rose, avec consigne vocale et trois choix
- [x] Tests automatisés sur 600 générations couleurs/formes/lettres, 200 questions de comptage et les activités inconnues
- [x] Cache PWA passé à v9 après ajout du jeu des lettres ; nouveau module inclus dans les ressources hors ligne
- [ ] Vérifier l’expérience tactile et la voix sur Safari iPhone
- [ ] Ajouter progressivement d’autres activités MS après contrôle de ces premiers jeux

## Phase 5 — Outils parent
- [x] Première boîte à outils « Crise en cours » avec étapes brèves, sécurité, accueil de l’émotion et choix simples
- [ ] Enrichir les outils parent après retours d’usage, sans enregistrer de données sensibles sur les crises

## Phase 6 — Premières fiches pédagogiques A4
- [x] Menu de fiches imprimables depuis l’espace parent
- [x] Fiche Rose : reconnaître les lettres de son prénom, avec repère de correction
- [x] Fiche Rose : reconnaître et relier les formes, avec repère de correction
- [x] Fiche Léon : six multiplications, stratégies dessin/compter par bonds, corrigé séparé
- [x] Styles d’impression A4 et boutons masqués à l’impression
- [x] Nouveau module ajouté au cache hors ligne v10
- [ ] Vérifier le rendu réel avec l’aperçu d’impression Safari iPhone et une impression A4

## Phases suivantes prévues
- Phase 7 : écriture, émotions, histoires sociales, logique et anglais
- Phase 8 : finition, accessibilité, tests de non-régression et validation globale

## Décisions et limites à respecter
- Application statique : HTML/CSS/JavaScript natifs, modules ES, sans backend, framework, build, npm ni CDN.
- Données locales dans le navigateur ; sauvegardes JSON importables/exportables.
- Priorité à Safari sur iPhone et au fonctionnement hors ligne après un premier chargement HTTPS.
- Pédagogie positive : aucune punition, comparaison entre enfants, score anxiogène ou chronomètre stressant.
- Les SVG servent d’icône web ; une icône PNG iOS pourra être ajoutée après validation sur appareil.
- La porte parentale n’est pas une sécurité cryptographique.
- Les fiches imprimables sont encore une coquille ; les générateurs A4 complets sont prévus en phase 6.
- N’annoncer comme exécutés que les tests réellement lancés. Les vérifications de syntaxe ne remplacent pas un test navigateur.
- Limite de cette session : le clonage du dépôt pour exécuter Node localement a échoué faute de résolution réseau ; le statut GitHub Actions a été confirmé via les outils disponibles ; les tests automatisés passent, mais les tests navigateur restent nécessaires.
