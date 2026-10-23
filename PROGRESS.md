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
- Le service worker source utilise actuellement le cache `rose-leon-v49` (dernier renouvellement pour les exercices d’horloge ; les étapes de tests E22–E24 n’ont pas modifié les ressources de l’application).
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
1. Vérifier sur iPhone les consignes « syllabes », les sons de bonne/mauvaise réponse et le menu de Léon.
2. Valider sur Safari iPhone les fonctions précédentes, dont VoiceOver, la pause, les sauvegardes et le mode hors ligne.

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

## Étape É7 — pause guidée douce (code livré, tests CI et déploiement réussis)
- [x] Point d’entrée `src/main.js` formaté dans un commit séparé avant ajout de fonctionnalité ; tests de régression adaptés au formatage.
- [x] Pause facultative en trois étapes, avec progression uniquement au toucher et sans minuterie.
- [x] Texte adapté aux enfants : se poser, observer sa respiration sans obligation, regarder autour de soi.
- [x] Ajout d’un accès depuis les menus principaux de Léon et Rose ; aucun score ni enregistrement de la pause.
- [x] Nouvelle ressource ajoutée au cache PWA, renouvelé à v37.
- [x] 65 tests passent sur le commit `2fd100248ea1dd454f085ad75b1410818ec27d24` ([résultat](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40017274534)).
- [x] Déploiement Pages réussi sur ce commit ([publication](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40017273785)).
- [ ] Vérifier sur iPhone le parcours tactile, la voix et le retour vers l’univers choisi.

## Étape É8 — finition accessibilité et non-régression (code livré, CI et déploiement réussis)
- [x] Annonce accessible de l’étape courante dans la pause guidée avec `role="status"` et `aria-live="polite"`.
- [x] Test de régression ajouté pour vérifier l’annonce de progression et la possibilité d’arrêter à tout moment.
- [x] Cache PWA renouvelé à `rose-leon-v38` ; la ressource modifiée est déjà précachée.
- [x] 66 tests réussis sur le commit `b0ef7f9f48567857066b66ec2c2cd2af0fab4846` ([résultat CI](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40017925754)).
- [x] Déploiement GitHub Pages réussi pour ce commit ([publication](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40017925063)).
- [ ] Les tests automatisés ne remplacent pas les essais Safari iPhone : la voix, l’annonce par lecteur d’écran et la navigation tactile restent à vérifier sur appareil.


## Étape É9 — retours sonores, vocabulaire et choix des défis (code livré, tests CI et déploiement réussis)
- [x] Dans les jeux de Rose, remplacer « morceaux » par « syllabes » dans la consigne, les indices et les annonces vocales.
- [x] Ajouter un son bref et doux en cas de mauvaise réponse, en respectant le réglage des sons ; conserver le son positif lors d’une bonne réponse, y compris après une première erreur.
- [x] Appliquer les retours sonores aux défis de maths, aux jeux de Rose et aux jeux de lecture ; ajouter un son positif lors de la composition correcte du prénom.
- [x] Ajouter le jeu des syllabes au menu principal des jeux de Rose.
- [x] Remplacer « Défi penalty » par « Choisir un défi » et corriger l’annonce vocale d’accueil de Léon.
- [x] Cache PWA renouvelé à `rose-leon-v39` ; les ressources modifiées sont déjà précachées.
- [x] Tests automatisés réussis sur le commit `bb283a7c9c2e28ffc62af1a05ac86e912604230c` ([tests](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40019990840)).
- [x] Déploiement GitHub Pages réussi sur ce même commit ([publication](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40019992611)).
- [ ] Essai iPhone : vérifier que les sons sont doux, non intrusifs et désactivables dans les réglages.


## Étape É10 — icône PNG et vérification du cache PWA (code livré, tests CI et déploiement réussis)
- [x] Ajout d’une icône PNG locale 512×512 pour le manifeste PWA et le raccourci iOS.
- [x] Ajout de l’icône au manifeste et d’un lien `apple-touch-icon`, tout en conservant le favicon SVG.
- [x] Icône ajoutée au précache et cache incrémenté de `rose-leon-v39` à `rose-leon-v40` dans le même commit.
- [x] Tests ajoutés pour l’incrément v40, l’en-tête PNG, le manifeste et le précache.
- [x] Tests automatisés réussis sur le commit `9b1caf7126c044c221152e37d3138b6690e4d3c3` ([résultat CI](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40021113554)).
- [x] Déploiement GitHub Pages réussi sur ce même commit ([publication](https://github.com/93Alexis93/ROSEetLEON/actions/runs/40021113850)).
- [ ] Essai iPhone : vérifier l’icône lors de l’ajout à l’écran d’accueil.

## Étape É11 — tableau de bord parental (code livré, validation CI à confirmer)
- [x] La carte « Aujourd’hui » distingue les sessions du jour des totaux cumulés, à partir de l’historique local horodaté.
- [x] La carte « Progression positive » affiche les étoiles, réussites et essais cumulés pour chaque enfant, sans classement.
- [x] Ajout d’un module pur de calcul des statistiques et de tests dédiés, y compris les dates hors du jour courant et les données absentes.
- [x] Ajout du module au précache et incrément du cache PWA à `rose-leon-v41`.
- [ ] Confirmer les tests automatisés et le déploiement GitHub Pages sur le SHA final.
- [ ] Essai iPhone : vérifier que « Aujourd’hui » ne compte que les sessions du jour et que les totaux cumulés restent cohérents.
- [ ] Les réglages `leonMinutes` et `roseMinutes` restent conservés pour compatibilité, mais ne pilotent pas encore de minuterie ; ils ne sont pas présentés comme une fonctionnalité active.


## Étape É12 — calcul mental et petits problèmes pour Léon (code livré, validation à confirmer)
- [x] Ajout de générateurs de questions pour les compléments à 10/100, doubles, moitiés, droite numérique et petits problèmes de comparaison, complément et groupements.
- [x] Ajout d’un menu de calcul, d’une réponse numérique saisie au clavier, d’un indice, d’une réécoute et d’un retour accessible annoncé poliment.
- [x] Les réponses erronées invitent à réessayer sans pénalité ; une session est enregistrée à la fin des cinq questions.
- [x] Nouveaux modules ajoutés au précache ; cache PWA incrémenté à `rose-leon-v42`.
- [x] Tests de génération et de ressources hors ligne ajoutés.
- [ ] Confirmer les tests automatisés et le déploiement GitHub Pages sur le SHA final.
- [ ] Essai iPhone : saisie numérique, taille du clavier, annonces vocales, aides, session terminée et fonctionnement hors ligne.


## Étape É13 — correction pédagogique des syllabes de Rose (code livré, validation à confirmer)
- [x] Correction du nombre de syllabes de « tomate » (3 : to-ma-te) et « banane » (3 : ba-na-ne).
- [x] Ajout d’un test ciblé sur les dix mots de la banque des syllabes.
- [x] Cache PWA renouvelé à `rose-leon-v43` ; le module reste précaché.
- [ ] Confirmer les tests GitHub Actions et la publication Pages sur le SHA final.
- [ ] Vérifier avec Rose que la consigne orale et le comptage en tapant dans les mains sont compréhensibles.


## Étape É14 — progression adaptative après aide (code livré, validation à confirmer)
- [x] Audit ciblé : dans les défis de maths de Léon, une réponse donnée après une seule aide pouvait encore être comptée comme autonome pour la progression de niveau.
- [x] Correction : toute aide utilisée avant la réponse rend cette réponse neutre pour l’adaptation du niveau ; les statistiques générales d’essai/réussite restent enregistrées.
- [x] Test de non-régression ajouté dans `tests/math-engine.test.mjs`.
- [x] Cache PWA renouvelé à `rose-leon-v44`.
- [ ] Confirmer tests GitHub Actions et déploiement Pages sur le SHA final.
- [ ] Essai sur iPhone : répondre avec zéro aide, puis avec une aide, puis vérifier que seul le premier cas compte comme réponse autonome pour le niveau.


## Étape É15 — audit du découpage oral des mots (code livré, validation à confirmer)
- [x] Audit de la banque des mots-mystères : correction de découpages qui pouvaient faire compter des syllabes écrites plutôt que les syllabes entendues (ex. « pomme », « poire », « nuage », « maîtresse », « cartable », « étoile », « montagne », « girafe », « valise »).
- [x] Exposition de la banque de découpages pour la tester directement et ajout d’un test de non-régression sur 21 mots courants.
- [x] Cache PWA renouvelé à `rose-leon-v45` ; le module `reading.js` reste précaché.
- [ ] Confirmer CI et publication Pages sur le SHA final.
- [ ] Écouter les mots avec Léon : la prononciation réelle peut varier selon les accents et certains découpages doivent rester un support oral, pas une règle orthographique.


## Étape É16 — audit complet de la banque syllabique et cohérence CI (code livré, validation à confirmer)
- [x] Audit des 45 mots de la banque de lecture : correction de « lune », qui s’entend en une syllabe dans la prononciation usuelle retenue ici.
- [x] Test étendu à l’ensemble de la banque : chaque mot attendu est contrôlé, ainsi que son nombre de syllabes.
- [x] Correction d’un test PWA ancien qui attendait encore le cache `v42` alors que le projet avait avancé ; il attend désormais `v46`.
- [x] Cache hors ligne renouvelé à `rose-leon-v46`.
- [ ] Confirmer que le workflow de tests termine avec succès et que GitHub Pages publie le SHA final.
- [ ] Validation orale finale avec Léon : le découpage dépend de la prononciation réelle et reste un support d’écoute.


## Étape É17 — suivi de la composition du prénom de Rose (code livré, validation à confirmer)
- [x] Une session est maintenant enregistrée lorsque Rose compose correctement ROSE dans le bon ordre ; les essais incomplets ou erronés ne créent pas de session.
- [x] Test de non-régression ajouté pour le déclenchement de l’enregistrement à la réussite.
- [x] Cache PWA renouvelé à `rose-leon-v47` et test de cache synchronisé.
- [ ] Confirmer la CI et la publication Pages sur le SHA final.


## Étape É18 — cohérence de l’état projet et audit de couverture (code livré, CI à confirmer)
- [x] Correction de la version de cache indiquée dans l’état courant : la documentation mentionnait encore v44 alors que le service worker est en v47.
- [x] Vérification du parcours syllabes : banque de 10 mots, choix 1–3, aide orale, réponse verrouillée après réussite et session enregistrée à la fin des cinq questions ; les tests dédiés contrôlent le nombre de syllabes de chaque mot.
- [x] Confirmation que les modules des activités enfant sont listés dans le précache du service worker.
- [ ] CI et publication Pages à confirmer sur le SHA final.
- [ ] Les parcours « Nombre mystère », « Le plus grand nombre » et « Les syllabes » restent à essayer en conditions réelles sur Safari iPhone.


## Étape É19 — contrôle sémantique du calcul mental
- [x] Ajout de tests qui vérifient que la réponse correspond à l’opération affichée pour les compléments à 10/100, doubles, moitiés, droite numérique et petits problèmes.
- [x] Contrôle par génération répétée pour détecter les erreurs qui n’apparaissent que sur certaines valeurs aléatoires.
- [ ] Résultat CI à confirmer ; ce changement ne modifie pas les ressources de l’application et ne nécessite donc pas de renouveler le cache PWA.


## Étape É20 — correction du découpage oral de « nuage »
- [x] Revue ciblée de la banque syllabique : « nuage » a deux syllabes orales dans la prononciation retenue (« nu-age »), et non une seule.
- [x] Correction de l’indice affiché dans les mots-mystères et du décompte attendu dans les tests.
- [x] Cache PWA renouvelé à `rose-leon-v48` et test de précache synchronisé.
- [ ] Résultat CI et publication Pages à confirmer sur le SHA final ; essai oral avec Rose reste nécessaire.


## Étape É21 — choix de réponses fiables pour les heures
- [x] Audit du générateur de mesures : à 1 h pile, un distracteur pouvait être identique à la bonne réponse, ce qui réduisait le nombre de choix distincts et faisait apparaître un choix de secours artificiel.
- [x] Génération de distracteurs d’horloge uniques et exclusion systématique de la bonne réponse ; test ciblé pour 1 h pile et 1 h 30.
- [x] Cache PWA renouvelé à `rose-leon-v49` et test hors ligne synchronisé.
- [ ] Résultat CI et publication Pages à confirmer sur le SHA final.


### E22 — Renforcement des tests du moteur mathématique
- Corrigé le contrôle qui repère les choix artificiels : son expression régulière était trop échappée et ne testait pas réellement le format attendu.
- Ajouté des vérifications sémantiques répétées sur les calculs mentaux et les suites logiques, au-delà de la seule forme des questions et des choix.
- Vérification CI et publication Pages : en attente côté GitHub au moment de cette mise à jour.


### E23 — Vérification sémantique élargie des maths
- Étendu les tests au-delà du calcul mental et de la logique : numération, problèmes écrits, conversions de longueurs, sommes d’argent et lecture de l’heure sont comparés à leur énoncé.
- Les contrôles couvrent plusieurs centaines de questions générées par niveau pour repérer les incohérences entre la consigne et la réponse.
- Les workflows GitHub étaient toujours en attente lors du dernier contrôle ; la validation automatique reste à confirmer.


### E24 — Vérification des tables de multiplication
- Étendu le test des multiplications aux trois niveaux de difficulté, et non plus au seul niveau intermédiaire.
- Chaque énoncé est vérifié par recalcul du produit et contrôle des tables autorisées pour le niveau concerné.
- La CI GitHub demeure à confirmer ; ces changements concernent uniquement les tests et la documentation.


### E25 — Audit sémantique du nombre mystère
- Ajout d’un test qui vérifie que la réponse du nombre mystère correspond à l’indice exact : décomposition en dizaines/unités, nombre suivant ou nombre précédent.
- Le contrôle répète 1 200 générations pour augmenter les chances de repérer un défaut lié à une valeur particulière.
- Correction de l’état documentaire : le cache hors ligne courant est `rose-leon-v49`, et non v47.
- CI et publication Pages à confirmer sur le SHA final ; validation sur Safari iPhone toujours nécessaire pour les parcours non encore testés.


### E26 — Vérification des dépendances hors ligne
- Renforcement du test PWA : chaque import JavaScript relatif d’un module précaché doit lui-même exister et être inclus dans le cache hors ligne.
- Ce contrôle vise à détecter les oublis de dépendances qui pourraient casser une activité après le premier chargement sans réseau.
- Changement limité aux tests et à la documentation : aucun renouvellement du cache applicatif nécessaire.
- CI et publication Pages à confirmer ; le parcours hors ligne réel reste à vérifier sur Safari iPhone.


### E27 — Robustesse du rappel de sauvegarde
- Une date de sauvegarde située dans le futur est désormais considérée comme suspecte et déclenche un rappel prudent.
- Ajout d’un test ciblé sur cette situation inhabituelle ; aucune donnée utilisateur n’est envoyée ni modifiée.
- CI et publication Pages à confirmer.

E28 — Robustesse du stockage : un abonné UI qui lève une exception ne doit plus annuler en mémoire une écriture déjà persistée. Test de non-divergence mémoire/localStorage ajouté.

E29 — Isolation des abonnés : chaque abonné reçoit désormais une copie indépendante de l’état ; test de régression contre les mutations accidentelles entre abonnés.
