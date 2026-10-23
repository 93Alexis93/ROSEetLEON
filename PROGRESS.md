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
- Le service worker source utilise actuellement le cache `rose-leon-v36`.
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
- [x] Les tests Node et le déploiement Pages ont depuis été confirmés sur des commits ultérieurs qui incluent cette étape ; conserver les liens précis dans le compte rendu de chaque livraison.

## Étape É2 — protection des routes parentales (code livré, tests CI réussis)
- [x] Les routes `parent`, `crisis` et `print` sont refusées tant que l’état de déverrouillage en mémoire est fermé ; la navigation redirige vers la porte parentale.
- [x] La porte se referme lors du retour à l’accueil, aux profils enfants ou à l’écran de porte ; la réussite du calcul et du PIN facultatif (si défini) déverrouille l’espace pour la navigation parentale.
- [x] Après trois réponses de calcul incorrectes, le blocage de 30 secondes est enregistré dans `sessionStorage` et `localStorage`, avec nettoyage à expiration.
- [x] Cache PWA renouvelé ; les ressources modifiées sont incluses dans `ASSETS`.
- [x] Les tests Node complets ont réussi sur les commits de validation ultérieurs ; le déploiement Pages a également abouti sur le commit final de l’étape É3.
- [ ] À tester sur iPhone : accès direct via `#parent`, `#crisis`, `#print` ; déverrouillage puis navigation entre outils ; retour accueil puis réouverture ; trois erreurs puis rechargement pendant le blocage.

## Étape É3 — progression adaptative de Léon (code livré, CI et déploiement réussis)
- [x] Fonction pure `updateMathProgress` ; séries réinitialisées au changement de niveau et seuils robustes.
- [x] Une seule contribution adaptative par question ; les réponses après le deuxième indice ou la révélation restent neutres pour le niveau.
- [x] Les 50 tests du dépôt passent sur le commit `2470157d3a741ee1744f2bc67ee66028b618363d` ([tests](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40014941349)).
- [x] Le déploiement Pages a abouti pour ce même commit ([déploiement](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40014940698)).
- [ ] Comportement réel sur iPhone à confirmer.

## Étape É4 — validation des sauvegardes et migration du schéma (code livré, CI réussie)
- [x] Passage au schéma 3 avec migration des sauvegardes de schéma 2 et des sauvegardes plus anciennes sans version.
- [x] Normalisation des profils, réglages, statistiques, progression mathématique, historique et mots personnalisés ; champs inconnus et domaines inconnus écartés.
- [x] Refus des profils malformés, des versions futures et des fichiers de plus de 2 Mio avant remplacement des données courantes.
- [x] Le PIN n’est plus exporté en clair ; l’import conserve le PIN déjà configuré sur l’appareil et ignore celui présent dans les anciennes sauvegardes.
- [x] Cache PWA renouvelé à `rose-leon-v34`.
- [x] Tests GitHub Actions réussis sur le commit fonctionnel `c608a650e4bc4e8dd4ebfdbaa2fd6427384c9251` : 56 tests, 56 réussis, 0 échec ([résultat](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40015344966)).
- [x] Déploiement Pages confirmé sur le commit final `80e240cb60b03816a2e30389931a9c88861cf88a` ([publication](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40015458093)).
- [ ] Essais import/export réels sur iPhone à confirmer.

## Prochaines étapes proposées
1. É5 — améliorer l’export et les rappels de sauvegarde sur iPhone.
2. É6 — enrichir les contenus de lecture.
3. É7 — proposer une pause guidée douce.

## Historique utile
Les anciennes listes de phases et de validations ont été consolidées ici afin d’éviter les répétitions et les statuts contradictoires. Les détails des choix techniques sont consignés dans `docs/DECISIONS.md`, les changements livrés dans `CHANGELOG.md` et les repères pédagogiques dans `docs/RESSOURCES_PEDAGOGIQUES.md`.

## Étape É5 — sauvegarde plus accessible sur iPhone (code livré, tests CI et déploiement réussis)
- [x] Préparation du module parent par un commit de formatage seul avant les modifications fonctionnelles.
- [x] Partage natif du fichier JSON quand Safari/navigateur le prend en charge, avec repli vers téléchargement et bouton de copie du JSON.
- [x] Rappel doux de sauvegarde si aucune sauvegarde n’est enregistrée ou si la dernière remonte à 30 jours.
- [x] Demande facultative de stockage persistant lors d’une action explicite de sauvegarde ; son refus ou son indisponibilité ne bloque pas l’export.
- [x] Le PIN reste exclu du JSON par la fonction d’export existante.
- [x] 60 tests passent sur le commit `bfc7162ab888de65eddd302c4bdc8a9b441cdaa9` ([résultat](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40016084267)).
- [x] Déploiement Pages réussi sur ce commit ([publication](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40016083724)).
- [ ] Tester sur iPhone : partage vers Fichiers/iCloud Drive, annulation du partage, téléchargement de repli, copie du JSON et réimport.

## Étape É6 — enrichir les contenus de lecture (code livré, tests CI et déploiement réussis)
- [x] Formatage seul du module de lecture avant les changements fonctionnels ; les tests passent sur le commit `6aaaf2131e0860b416091970ad318ca6b0d570e7`.
- [x] Enrichissement du vocabulaire pour les mots-éclairs et mots-mystères, en conservant les mots personnalisés.
- [x] Passage de 4 à 10 phrases courtes et de 3 à 10 mini-textes originaux, avec questions de compréhension concrètes.
- [x] Ajout de tests de variété des contenus et maintien de quatre choix distincts par question.
- [x] Cache PWA renouvelé à v36.
- [x] 62 tests passent sur le commit `47d0cecf6d4357afa123a930d1980744e438aecb` ([résultat](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40016705869)).
- [x] Déploiement Pages réussi sur ce commit ([publication](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40016705010)).
- [ ] Vérifier sur iPhone la lisibilité, la voix, la longueur des textes et la pertinence des réponses.

## Étape É7 — pause guidée douce (en cours)
- [x] Point d’entrée `src/main.js` formaté dans un commit séparé avant ajout de fonctionnalité ; tests de régression adaptés au formatage.
- [x] Pause facultative en trois étapes, avec progression uniquement au toucher et sans minuterie.
- [x] Texte adapté aux enfants : se poser, observer sa respiration sans obligation, regarder autour de soi.
- [x] Ajout d’un accès depuis les menus principaux de Léon et Rose ; aucun score ni enregistrement de la pause.
- [x] Nouvelle ressource ajoutée au cache PWA, renouvelé à v37.
- [ ] Tests CI et déploiement Pages de l’étape É7 à confirmer.
- [ ] Vérifier sur iPhone le parcours tactile, la voix et le retour vers l’univers choisi.
