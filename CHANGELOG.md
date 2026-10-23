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
