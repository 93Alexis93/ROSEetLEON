# Avancement — ROSEetLEON
Mis à jour le 23 octobre 2026.

## État actuel

### Fonctionnalités présentes dans le dépôt
- Application web statique, mobile-first, publiée sur GitHub Pages ; modules JavaScript natifs, sans framework ni dépendance de build.
- Navigation des profils Léon et Rose.
- Léon : six défis de maths, quatre formats de lecture, « Nombre mystère » et « Le plus grand nombre ».
- Rose : comptage, couleurs, formes, lettres du prénom, composition tactile de ROSE, association majuscules/minuscules et jeu des syllabes.
- Espace parent : porte par calcul, tableau de bord, réglages, mots personnalisés, sauvegarde JSON et fiches A4 avec repères de correction.
- Outil parent « Crise en cours ».
- Stockage local versionné et service worker avec cache hors ligne de ressources locales.

### Validation réelle
- **Validé par l’utilisateur sur iPhone Safari** : navigation, six défis de maths, quatre activités de lecture, jeux de Rose, persistance des progrès, mots personnalisés/sauvegardes, voix/sons, espace parent et affichage des fiches imprimables.
- **Présent mais pas encore validé sur iPhone** : « Nombre mystère », « Le plus grand nombre » et « Les syllabes » ; vérifier consignes, interactions, voix et fin de session.
- **Pas encore validé** : parcours complet de chaque activité, mode avion après chargement HTTPS, rendu/ impression A4 réels, export sur iPhone, comportement de l’application installée et voix/sons dans toutes les conditions.

## Tests automatisés
- Tests Node natifs présents dans `tests/*.test.mjs`, notamment moteurs de maths, lecture, stockage et cohérence des ressources hors ligne.
- Le workflow GitHub Actions `.github/workflows/tests.yml` vérifie la syntaxe JavaScript et exécute les tests Node.
- Des tests couvrent notamment les sauvegardes, les questions générées, les menus et le service worker.
- **Ne pas déclarer les tests verts sans consulter le résultat Actions correspondant au SHA exact.** Le statut du dernier commit n’a pas été vérifié pendant l’audit É0.
- Les tests automatisés ne remplacent pas les essais dans Safari iPhone.

## Service worker et publication
- Le service worker source utilise actuellement le cache `rose-leon-v29`.
- La suppression à l’activation est limitée aux caches préfixés `rose-leon-` afin de préserver les autres applications éventuellement hébergées sur la même origine.
- Le contenu public du service worker et la fin du déploiement Pages doivent être vérifiés après chaque changement de ressource précachée.
- Pour toute nouvelle ressource hors ligne : l’ajouter à `ASSETS` et incrémenter `CACHE` dans le même changement, sauf stratégie de mise à jour explicitement validée et testée.

## Principes non négociables
- Application statique : HTML, CSS et JavaScript natifs ; pas de framework, build, npm, backend ou CDN sans accord.
- Priorité à Safari sur iPhone et au fonctionnement hors ligne après un premier chargement HTTPS.
- Données locales, sauvegardes JSON importables/exportables et migrations testées en cas d’évolution du schéma.
- Pédagogie positive : pas de punition, comparaison entre enfants, score anxiogène ni chronomètre stressant. L’erreur doit permettre de recevoir de l’aide et de réessayer.
- Ne pas enregistrer de données sensibles sur les crises et ne pas employer de diagnostic médical dans l’interface enfant.
- A4 sobre, économe en encre et vérifié avant d’annoncer un rendu validé.
- Distinguer dans la documentation les programmes officiels, les pratiques étayées et les propositions pédagogiques ; citer les sources précises lorsqu’une affirmation pédagogique importante est avancée.
- La porte parentale est un filtre d’usage, pas une sécurité cryptographique.
- Ne jamais présenter comme exécuté un test qui n’a pas réellement été lancé ; ne pas confondre présence du code, validation utilisateur, test automatisé et déploiement confirmé.

## Prochaines étapes proposées
1. É1 — remettre la documentation d’avancement et les décisions techniques en cohérence ; supprimer ensuite le code mort uniquement après vérification de ses références et selon la règle de formatage préalable.
2. É2 — verrouillage cohérent de l’espace parent, des outils de crise et des fiches imprimables.
3. É3 — fiabiliser la progression adaptative de Léon et la prise en compte des indices.
4. É4 — valider/sécuriser l’import de sauvegarde et tester la migration du schéma.
5. É5 — améliorer l’export et les rappels de sauvegarde sur iPhone.

## Historique utile
Les anciennes listes de phases et de validations ont été consolidées ici afin d’éviter les répétitions et les statuts contradictoires. Les détails des choix techniques sont consignés dans `docs/DECISIONS.md`, les changements livrés dans `CHANGELOG.md` et les repères pédagogiques dans `docs/RESSOURCES_PEDAGOGIQUES.md`.
