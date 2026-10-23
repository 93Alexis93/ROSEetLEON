# Journal des versions

## Maintenance — 2026-10-23
- État du projet et décisions techniques consolidés pour distinguer fonctionnalités, validations et vérifications restantes.
- Module parent formaté avant suppression de l’ancien écran d’impression inutilisé ; l’écran actif reste dans `src/parent/printables.js`.

## É2 — 2026-10-23
- Ajout d’un contrôle commun des routes réservées à l’espace parent.
- Verrouillage en mémoire à la sortie vers l’accueil ou les profils enfants ; horodatage du blocage temporaire dans le stockage de session et local.
- Ajout de tests dédiés et renouvellement du cache PWA.

## É3 — 2026-10-23
- Progression adaptative de Léon isolée dans une fonction pure et testable.
- Une question ne pèse qu’une fois sur les séries ; les réponses après aide avancée sont neutres pour le niveau.
- Seuils adaptatifs robustes et remise à zéro des séries après changement de niveau.
- Cache PWA renouvelé à v33.

## É4 — 2026-10-23
- Migration du stockage au schéma 3 et assainissement des sauvegardes importées.
- Refus des sauvegardes malformées, des versions futures et des fichiers trop volumineux.
- Le PIN n’est plus inclus dans les exports ; un import conserve le PIN local.
- Cache PWA renouvelé à v34 ; six tests de sauvegarde supplémentaires.

## 0.1.0 — 2026-10-23
- Fondations PWA et modules natifs.
- Première version navigable et activités de démonstration.

## É5 — 2026-10-23
- Amélioration de l’export JSON sur mobile : partage natif de fichier lorsque disponible, téléchargement de repli et copie du JSON.
- Rappel de sauvegarde après 30 jours ou en l’absence de sauvegarde enregistrée.
- Demande de stockage persistant facultative au moment d’une sauvegarde, sans bloquer si elle échoue.
- Cache PWA renouvelé à v35.

## É6 — 2026-10-23
- Enrichissement du vocabulaire des jeux « Mots-éclairs » et « Mots-mystères ».
- Passage à 10 phrases et 10 mini-textes de compréhension originaux, avec questions explicites.
- Ajout de tests de variété du contenu ; cache PWA renouvelé à v36.

## É7 — 2026-10-23
- Ajout d’une pause guidée facultative en trois étapes, sans chronomètre, score ni enregistrement.
- Accès depuis les écrans principaux de Léon et Rose ; cache PWA renouvelé à v37.

- É7 validée par CI (65 tests réussis) et publiée sur GitHub Pages ; les essais réels sur iPhone restent à faire.

## É8 — 2026-10-23
- La pause guidée annonce désormais l’étape courante aux technologies d’assistance.
- Ajout d’un test de non-régression pour l’annonce accessible et la possibilité d’arrêter la pause.
- Cache PWA renouvelé à v38.
- Validation : 66 tests réussis et déploiement GitHub Pages confirmé sur le commit fonctionnel `b0ef7f9f48567857066b66ec2c2cd2af0fab4846` ([tests](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40017925754), [déploiement](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40017925063)).
- Les essais réels sur iPhone avec Safari et VoiceOver restent à faire.


## É9 — 2026-10-23
- Vocabulaire du jeu de Rose harmonisé autour du mot « syllabes » ; le jeu est également proposé dans son menu de jeux.
- Ajout d’un petit signal sonore doux pour une réponse incorrecte et conservation du signal positif en cas de réussite, y compris après un premier essai incorrect ; réglage des sons respecté.
- Léon voit désormais « Choisir un défi » plutôt que « Défi penalty » et entend une consigne qui reflète les différentes activités disponibles.
- Cache PWA renouvelé à v39 ; tests automatisés et déploiement Pages réussis sur le commit `bb283a7c9c2e28ffc62af1a05ac86e912604230c` ([tests](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40019990840), [publication](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40019992611)).


## É10 — 2026-10-23
- Ajout d’une icône PNG 512×512 au manifeste PWA et d’un lien `apple-touch-icon` pour iOS ; favicon SVG conservé.
- Cache PWA incrémenté de v39 à v40, avec l’icône PNG ajoutée au précache.
- Tests de cohérence du cache et de l’icône ajoutés.
- Validation : tests automatisés réussis et déploiement GitHub Pages confirmé sur le commit `9b1caf7126c044c221152e37d3138b6690e4d3c3` ([tests](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40021113554), [publication](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40021113850)).
- L’icône sur l’écran d’accueil et le comportement réel sur iPhone restent à tester.

## É11 — 2026-10-23
- Le tableau de bord parental distingue désormais les sessions du jour des totaux cumulés, à partir de l’historique local.
- La section « Progression positive » affiche les étoiles gagnées, les réussites et les essais cumulés par enfant, sans classement.
- Le calcul des statistiques est isolé et couvert par des tests ; le module est ajouté au précache et le cache passe à v41.
- Validation CI, déploiement Pages et vérification iPhone à confirmer.


## É12 — 2026-10-23
- Ajout d’activités de calcul mental : compléments à 10 et 100, doubles, moitiés et droite numérique.
- Ajout de petits problèmes de comparaison, de complément et de groupements, avec indice et explication.
- Le menu de Léon propose le nouveau parcours ; les réponses peuvent être saisies au clavier numérique.
- Cache PWA renouvelé à v42 ; tests de génération et de précache ajoutés.
- Tests CI, publication Pages et essai iPhone à confirmer.


## É13 — 2026-10-23
- Correction du comptage syllabique de « tomate » et « banane » : trois syllabes chacune.
- Ajout d’un test de non-régression sur la banque des dix mots du jeu des syllabes.
- Cache PWA renouvelé à v43 ; CI, publication Pages et essai réel avec Rose à confirmer.


## É14 — 2026-10-23
- Progression adaptative de Léon : une réponse précédée de n’importe quelle aide ne contribue plus aux séries autonomes de montée/descente de niveau.
- Les statistiques ordinaires de réponses continuent à être enregistrées.
- Test de non-régression ajouté ; cache PWA renouvelé à v44. CI, publication Pages et test iPhone à confirmer.


## É15 — 2026-10-23
- Audit du découpage oral dans les mots-mystères : corrections des mots dont les tirets suggéraient un nombre de syllabes inexact à l’oral.
- Ajout d’un test explicite sur 21 mots courants pour protéger les découpages les plus sensibles.
- Cache PWA renouvelé à v45 ; CI, publication Pages et essai oral avec Léon à confirmer.


## É16 — 2026-10-23
- Audit étendu des 45 mots de la banque de lecture ; correction du découpage de « lune » en une syllabe.
- Test de non-régression élargi à l’ensemble de la banque syllabique.
- Mise à jour du test PWA qui attendait encore l’ancienne version du cache v42 ; le contrôle suit maintenant v46.
- Cache PWA renouvelé à v46 ; CI, publication Pages et validation orale avec Léon à confirmer.


## É17 — 2026-10-23
- Le jeu « Je compose mon prénom » enregistre maintenant une session quand ROSE est complété correctement, pour que le tableau de bord reflète cette activité.
- Test de non-régression ajouté ; cache PWA renouvelé à v47.
- CI et publication Pages à confirmer.


## É18 — 2026-10-23
- Contrôle de cohérence documentaire : la version du cache PWA dans `PROGRESS.md` était obsolète (v44 au lieu de v47) ; corrigée.
- Revue du parcours « Les syllabes » et des contrôles automatiques existants : dix mots avec décompte explicite, choix 1–3, aide, verrouillage après bonne réponse et enregistrement de la session après cinq questions.
- Les tests et la publication Pages du SHA final restent à confirmer via GitHub Actions.


## É19 — 2026-10-23
- Renforcement des tests du calcul mental : les réponses générées sont comparées aux nombres et opérations réellement affichés, y compris dans les trois familles de petits problèmes.
- Pas de changement du code livré ni du cache PWA ; résultat CI à confirmer.


## É20 — 2026-10-23
- Correction du découpage syllabique de « nuage » : deux syllabes orales (« nu-age »).
- Ajout de la vérification correspondante dans les tests de lecture.
- Cache PWA renouvelé à v48 ; CI, publication Pages et validation orale à confirmer.


## É21 — 2026-10-23
- Correction des propositions de réponse du domaine « Mesures » : plus de doublon entre la bonne réponse et un distracteur à 1 h pile.
- Ajout d’un test de non-régression pour 1 h et 1 h 30 ; cache PWA renouvelé à v49.
- CI et publication Pages à confirmer.


## E22 — Fiabilité des tests mathématiques
- Correction d’un test qui ne détectait pas correctement les choix de réponse artificiels.
- Ajout de tests vérifiant que les résultats du calcul mental et les suites logiques correspondent réellement aux énoncés.


## E23 — Contrôle des énoncés mathématiques
- Ajout de tests de cohérence pour la numération, les problèmes et les exercices de mesures, en complément du calcul mental et des suites logiques.


## E24 — Couverture des multiplications
- Les tests contrôlent maintenant la cohérence des produits et les tables autorisées aux trois niveaux de difficulté.


## E25 — Nombre mystère
- Ajout d’un test qui compare la réponse générée à l’indice de décomposition, de succession ou de prédécesseur.
- Correction de la version du cache PWA indiquée dans l’état d’avancement : `rose-leon-v49`.


## E26 — Dépendances hors ligne
- Ajout d’un test qui parcourt les imports JavaScript relatifs des modules précachés et vérifie que chaque dépendance existe et figure dans le précache PWA.
- Aucun changement du code livré à l’application ; validation CI et publication toujours à confirmer.


## E27 — Rappel de sauvegarde
- Le rappel de sauvegarde ne se laisse plus désactiver par une date enregistrée dans le futur ; un test couvre cette incohérence d’horloge.

- Robustesse du stockage : les exceptions des abonnés sont isolées après persistance, afin d’éviter une divergence entre l’état mémoire et localStorage. Test de régression ajouté.

- Isolation du stockage : les abonnés reçoivent des instantanés indépendants, empêchant l’un d’altérer les données vues par les autres.

- Lecture : remplacement du tri à comparateur aléatoire par un mélange Fisher–Yates afin d’éviter un biais dans l’ordre des réponses.

- PWA : cache incrémenté en v50 pour garantir le renouvellement des ressources hors ligne après les corrections de lecture.
