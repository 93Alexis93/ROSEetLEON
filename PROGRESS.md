# Avancement — Rose & Léon
Mis à jour le 23 octobre 2026.

## Phase 0 — Fondations
- [x] Documentation pédagogique et décisions techniques
- [x] Structure de base du dépôt, avec emplacements pour modules futurs
- [x] HTML mobile-first, manifest PWA et service worker
- [x] Modules de stockage versionné, routeur, UI, voix et sons
- [x] Thèmes CSS et icône SVG locale
- [ ] Activer GitHub Pages dans Settings → Pages (action manuelle requise)
- [ ] Tester le cache hors ligne sur un iPhone réel

## Phase 1 — Squelette navigable
- [x] Accueil et choix des profils Léon / Rose
- [x] Porte parentale avec multiplication 6–9, verrouillage après trois erreurs et PIN facultatif
- [x] Tableau de bord parent, réglages voix/sons, export/import JSON et remise à zéro
- [x] Défi de calcul mental pour Léon et comptage de licornes pour Rose
- [x] Encouragements, suivi local et écran de fin « À demain ! »
- [x] Outils parent : première trame « Crise en cours »
- [ ] Exécuter des tests syntaxiques et fonctionnels automatisés dans un environnement navigateur
- [ ] Tester les interactions, la voix iOS, la sauvegarde et le mode avion sur appareil réel

## Limites connues
- Le tableau de bord et les activités sont une première démonstration, pas encore la bibliothèque pédagogique complète.
- La voix dépend de la disponibilité des voix françaises dans iOS ; les sons peuvent être désactivés.
- La protection parentale réduit les sorties accidentelles mais ne constitue pas une sécurité forte.
- La section fiches imprimables est une coquille ; les générateurs A4 complets sont prévus en phase 6.
- Les SVG fonctionnent comme icône de manifest ; une icône PNG dédiée iOS pourra être ajoutée après validation sur appareil.

## Phase 2 — En cours
- Moteur de maths ajouté : six domaines, trois niveaux, indices progressifs et adaptation douce.
- Progression locale par domaine et résumé dans l’espace parent.
- Cache hors ligne renouvelé ; 9 000 questions contrôlées automatiquement sans défaut détecté.
- Suite de tests ajoutée dans tests/math-engine.test.mjs.
- À faire : lancer la suite sous Node, tester les six domaines et le mode hors ligne sur iPhone.

## Prochaine étape
Tester le parcours maths sur iPhone, corriger les problèmes observés et faire valider la phase 2 avant de commencer la suivante.
