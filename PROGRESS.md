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

## Étape É1 — terminée le 23 octobre 2026
- [x] Remplacement de la chronologie contradictoire par un état courant, une liste claire des validations et les contrôles restant à faire.
- [x] Mise à jour des décisions techniques et pédagogiques, notamment sur l’impression, les sauvegardes, le service worker et la validation des livraisons.
- [x] Suppression de l’ancienne fonction `printComingSoon` de `src/parent/parent.js` après vérification : l’application importe l’écran d’impression depuis `src/parent/printables.js`.
- [x] Le module parent a d’abord reçu un commit de formatage seul avant la suppression du code inutilisé.
- [ ] Résultat Actions pour le SHA final non accessible via les outils consultés ; ne pas considérer la CI comme confirmée verte.
- [ ] Vérification du déploiement Pages après les commits non confirmée.

## Étape É2 — protection des routes parentales (code livré, validation en attente)
- [x] Les routes `parent`, `crisis` et `print` sont refusées tant que l’état de déverrouillage en mémoire est fermé ; la navigation redirige vers la porte parentale.
- [x] La porte se referme lors du retour à l’accueil, aux profils enfants ou à l’écran de porte ; la réussite du calcul et du PIN facultatif (si défini) déverrouille l’espace pour la navigation parentale.
- [x] Après trois réponses de calcul incorrectes, le blocage de 30 secondes est enregistré dans `sessionStorage` et `localStorage`, avec nettoyage à expiration.
- [x] Tests automatisés ajoutés pour les routes, le déverrouillage et l’expiration du blocage.
- [x] Cache PWA renouvelé à `rose-leon-v32` ; les ressources modifiées (`main.js`, `router.js`, `parent.js`) sont déjà dans `ASSETS`.
- [x] Quatre tests ciblés de la logique d’accès (routes protégées, déverrouillage/reverrouillage, persistance et expiration du blocage) passent dans un bac à sable Node isolé avec la logique actuelle reproduite.
- [ ] Les tests complets du dépôt et le résultat GitHub Actions n’ont pas pu être confirmés : le clonage du dépôt a échoué faute d’accès réseau. Ne pas annoncer la CI verte.
- [ ] Déploiement Pages et comportement réel sur iPhone non confirmés.
- [ ] À tester sur iPhone : accès direct via `#parent`, `#crisis`, `#print` ; déverrouillage puis navigation entre outils ; retour accueil puis réouverture ; trois erreurs puis rechargement pendant le blocage.

## Étape É3 — progression adaptative de Léon (code livré, validation en attente)
- [x] Ajout d’une fonction pure `updateMathProgress` pour calculer la progression sans modifier l’état d’entrée.
- [x] Les séries sont réinitialisées quand le niveau change ; les seuils fonctionnent même si une série dépasse le seuil.
- [x] Chaque question ne contribue qu’une fois à la progression adaptative ; les clics de réessai n’ajoutent pas de nouvelle erreur de progression.
- [x] Une réponse après le deuxième indice ou la révélation de la solution compte dans les statistiques, mais ne fait pas monter ni baisser le niveau.
- [x] Tests ajoutés pour les répétitions, les seuils de réussite/erreur et les réponses aidées.
- [x] Cache PWA renouvelé à `rose-leon-v33` ; les trois modules modifiés sont déjà listés dans `ASSETS`.
- [x] Tests GitHub Actions réussis pour le commit fonctionnel `a3fd7df2a806704f0033bb86e640f68c670991f5` : 50 tests, 50 réussis, 0 échec ([résultat](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40014851185)).
- [ ] Déploiement Pages en cours de vérification ; comportement réel sur iPhone à confirmer.

## Prochaines étapes proposées
1. É4 — valider/sécuriser l’import de sauvegarde et tester la migration du schéma.
2. É5 — améliorer l’export et les rappels de sauvegarde sur iPhone.
3. É6 — enrichir les contenus de lecture.

## Historique utile
Les anciennes listes de phases et de validations ont été consolidées ici afin d’éviter les répétitions et les statuts contradictoires. Les détails des choix techniques sont consignés dans `docs/DECISIONS.md`, les changements livrés dans `CHANGELOG.md` et les repères pédagogiques dans `docs/RESSOURCES_PEDAGOGIQUES.md`.
