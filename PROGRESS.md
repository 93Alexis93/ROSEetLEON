# Avancement — Rose & Léon
Mis à jour le 23 octobre 2026.

## Validation utilisateur et audit PWA — 23 octobre 2026
- [x] Validation déclarée sur iPhone Safari : navigation, six défis de maths, quatre activités de lecture, jeux de Rose, conservation des progrès, mots personnalisés/sauvegardes, voix/sons, espace parent et fiches imprimables.
- [ ] Mode hors ligne non testé par l’utilisateur ; ne pas le déclarer validé avant un essai en mode avion après chargement HTTPS.
- [x] Audit du service worker : le nettoyage à l’activation supprimait auparavant tous les caches de l’origine `github.io`, y compris ceux d’autres applications éventuelles. Il est désormais limité aux caches dont le nom commence par `rose-leon-`.
- [x] Cache PWA renouvelé à v26 ; test automatique ajouté pour empêcher la régression du nettoyage des caches.

## Phase 0 — Fondations
- [x] Documentation pédagogique et décisions techniques
- [x] Structure de base du dépôt
- [x] HTML mobile-first, manifest PWA et service worker
- [x] Stockage versionné, routeur, UI, voix et sons
- [x] Thèmes CSS et icône SVG locale
- [x] Application publiée sur GitHub Pages et ouverte sur iPhone Safari
- [x] Test automatisé de cohérence de la liste de ressources hors ligne ajouté ; GitHub Actions passe
- [x] Tests automatisés des sauvegardes : export/import, restauration des mots personnalisés et réglages, refus des JSON invalides sans écraser les données
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
- [x] Jeu d’association majuscules/minuscules R/r, O/o, S/s et E/e avec consigne vocale, indice doux et trois choix
- [x] Activité interactive « Je compose mon prénom » : composer ROSE en touchant les lettres, avec modèle visible, retour encourageant et possibilité de recommencer.
- [x] Test ciblé de la règle de validation du prénom : bon ordre, ordre erroné, prénom incomplet, lettres en trop et type invalide.
- [x] Si Rose touche une mauvaise lettre, l’activité l’invite doucement à regarder le modèle et à réessayer sans enregistrer cette lettre ; test automatisé de la lettre attendue à chaque étape.
- [x] Phase 8 : progression des jeux de Rose annoncée comme barre de progression aux lecteurs d’écran ; tests de régression ajoutés pour cibles tactiles, focus visible et réduction des animations.
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
- [x] Fiche Rose : chemins simples pour entraîner le geste du crayon, sans exigence de réussite
- [x] Fiche Rose : petites situations pour parler des émotions, avec réponses ouvertes et sans émotion imposée
- [x] Fiche Léon : six multiplications, stratégies dessin/compter par bonds, corrigé séparé
- [x] Fiche Léon : trois petits problèmes additifs et multiplicatifs, avec espace pour dessiner et corrigé séparé
- [x] Fiche Léon : cinq premiers mots anglais à relier à leur traduction, avec corrigé
- [x] Styles d’impression A4 et boutons masqués à l’impression
- [x] Nouveau module ajouté au cache hors ligne, version actuelle v23
- [x] Corrigé des multiplications structuré en liste lisible pour l’impression
- [x] Choix d’imprimer la fiche seule ou la fiche accompagnée du corrigé
- [x] Test CI ajouté pour vérifier que toutes les ressources préchargées par le service worker existent, sans doublons, et que les fiches/styles sont bien inclus
- [x] Trois nouvelles fiches ajoutées sans dépendances : motricité fine pour Rose, problèmes courts et premiers mots anglais pour Léon
- [ ] Vérifier le rendu réel avec l’aperçu d’impression Safari iPhone et une impression A4

## Phases suivantes prévues
- Phase 7 : écriture, émotions, histoires sociales, logique et anglais (fiche émotions, fiche anglaise, suites logiques et association majuscules/minuscules ajoutées)
- Phase 8 : finition, accessibilité, tests de non-régression et validation globale

## Décisions et limites à respecter
- Application statique : HTML/CSS/JavaScript natifs, modules ES, sans backend, framework, build, npm ni CDN.
- Données locales dans le navigateur ; sauvegardes JSON importables/exportables.
- Priorité à Safari sur iPhone et au fonctionnement hors ligne après un premier chargement HTTPS.
- Pédagogie positive : aucune punition, comparaison entre enfants, score anxiogène ou chronomètre stressant.
- Les SVG servent d’icône web ; une icône PNG iOS pourra être ajoutée après validation sur appareil.
- La porte parentale n’est pas une sécurité cryptographique.
- Huit fiches A4 sont présentes ; le rendu physique sur Safari iPhone et imprimante reste à valider, mais le développement continue sans attendre cette validation à la demande de l’utilisateur.
- N’annoncer comme exécutés que les tests réellement lancés. Les vérifications de syntaxe ne remplacent pas un test navigateur.
- Limite de cette session : le clonage du dépôt pour exécuter Node localement a échoué faute de résolution réseau ; le statut GitHub Actions a été confirmé via les outils disponibles ; les tests automatisés passent, mais les tests navigateur restent nécessaires.

- [x] Phase 8 : le délai de sécurité de la porte parentale ne réaffiche plus son écran si l’utilisateur est parti sur une autre page ; test de non-régression ajouté.

- [x] Phase 8 : tests automatisés de sauvegarde locale ajoutés avec stockage simulé ; vérification du cycle export/import et du refus des fichiers invalides sans perte des données en mémoire.

- [x] Phase 8 : la porte parentale accepte aussi la touche Entrée pour valider le calcul ; test de non-régression ajouté et cache PWA passé à v22.

- [x] Phase 8 : l’import de sauvegarde restaure l’état précédent si l’écriture dans le stockage local échoue ; test de régression avec quota simulé ajouté. Cache PWA passé à v24.

- [x] Phase 8 : une modification ou une remise à zéro est annulée en mémoire si le stockage local refuse l’écriture ; tests de régression avec quota simulé ajoutés. Cache PWA v25.

- [x] Phase 8 : les sauvegardes dont les profils ou réglages sont des tableaux sont désormais refusées ; test de non-régression ajouté. Cache PWA v25.

## Nouvelles activités issues de la veille pédagogique — 23 octobre 2026
- [x] Création du jeu CE1 « Nombre mystère » : dizaines/unités, nombre précédent et suivant, indices progressifs, quatre choix et explication après réussite.
- [x] Création du jeu MS « Les syllabes dans les mots » : écoute d’un mot courant, appui visuel, dénombrement de 1 à 3 syllabes, possibilité de réécouter et indice gestuel (taper dans les mains).
- [x] Les deux jeux sont reliés aux menus de Léon et Rose, sans dépendance externe ; le module est préchargé pour le mode hors ligne.
- [x] Tests automatisés ajoutés : 600 questions de numération, 300 questions de syllabes, unicité des choix, présence des réponses, intégration aux menus et cache PWA.
- [ ] Vérifier sur iPhone l’usage des deux nouveaux jeux, notamment la prononciation vocale et la clarté des images pour la phonologie.
- Sources pédagogiques consultées et principes retenus documentés dans `docs/RESSOURCES_PEDAGOGIQUES.md`.
