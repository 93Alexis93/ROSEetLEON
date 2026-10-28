"""Vérification navigateur de ROSEetLEON (Playwright, format iPhone 13, appuis tactiles).

Lancer depuis la racine du dépôt :
    python3 -m http.server 8770 &
    python3 tests/e2e/verification-navigateur.py

Ce script n’est pas lancé par la CI (qui n’exécute que les tests Node).
La voix est simulée avec les défauts connus de Safari iOS : une phrase lancée moins
de 100 ms après en avoir coupé une autre est perdue, puis la voix reste bloquée.
Il ne remplace pas un essai réel sur iPhone.
"""
import os, re, sys, time
ONLY = os.environ.get("ONLY")  # ex. ONLY=ce1 pour ne jouer qu’un niveau
from playwright.sync_api import sync_playwright

URL = "http://localhost:8770/"
VOICE_STUB = r"""(()=>{
  const st = window.__voice = { spoken: [], dropped: 0, stuck: false, cancels: 0 };
  let current = null, queue = [], lastBusyCancel = -1e9, timer = null;
  const now = () => performance.now();
  function next() {
    current = queue.shift() || null;
    if (!current) return;
    st.spoken.push({ text: current.text, t: now() });
    timer = setTimeout(() => { const u = current; current = null; u && u.onend && u.onend(); next(); }, 180);
  }
  const api = {
    get speaking() { return !!current; }, get pending() { return queue.length > 0; }, paused: false,
    cancel() { if (current || queue.length) { lastBusyCancel = now(); st.cancels++; } clearTimeout(timer); current = null; queue = []; },
    speak(u) {
      if (st.stuck) { st.dropped++; return; }
      if (now() - lastBusyCancel < 100) { st.dropped++; st.stuck = true; return; }
      queue.push(u); if (!current) next();
    },
    resume() {}, pause() {}, getVoices() { return [{ lang: "fr-FR", name: "Voix FR" }]; }
  };
  Object.defineProperty(window, "speechSynthesis", { value: api, configurable: true });
  window.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
})()"""

results = {"ok": 0, "ko": []}
def check(cond, label):
    if cond: results["ok"] += 1
    else:
        results["ko"].append(label)
        print("  ✗", label, flush=True)

def norm(t): return re.sub(r"[^a-z0-9àâçéèêëîïôûùüœ]+", "", t.lower())

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(**p.devices["iPhone 13"])
    ctx.add_init_script(VOICE_STUB)
    pg = ctx.new_page()
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.goto(URL); pg.evaluate("localStorage.clear()"); pg.goto(URL + "#home"); pg.reload()
    voice = lambda: pg.evaluate("window.__voice")
    def spoke_since(n): return [s["text"] for s in voice()["spoken"][n:]]
    def h1(): return pg.locator("h1").inner_text()
    def nav(route):
        # Passe par l’accueil pour forcer le changement d’écran (même si l’adresse n’a pas changé).
        pg.evaluate("r=>{location.hash='#__';location.hash='#'+r;}", route); pg.wait_for_timeout(80)

    # ---------- 1. Un appui suffit pour ouvrir chaque entrée ----------
    def tap_and_back(name, back_route):
        nav(back_route)
        before = h1()
        pg.get_by_role("button", name=name).first.tap(); pg.wait_for_timeout(120)
        opened = pg.locator(".answer-grid,.school-chapters,.school-answers,.answer-input,.counting-items,section.card h2").count() > 0 and pg.locator(".child-tile-grid").count() == 0
        check(opened, f"un appui n’ouvre pas « {name} »")
    rose_tiles = ["L’école enchantée", "Jeux enchantés", "Syllabes en rythme"]
    leon_tiles = ["L’académie des champions", "Défis de maths", "Mes premiers mots en anglais", "Jeux de lecture", "Nombre mystère", "Le plus grand nombre", "Suites logiques", "Géométrie des champions", "Petit robot programmeur", "L’aventure du match", "Phrases à reconstruire", "Calcul mental"]
    for t in rose_tiles: tap_and_back(t, "rose")
    for t in leon_tiles: tap_and_back(t, "leon")
    nav("rose"); pg.get_by_role("button", name="Jeux enchantés").first.tap(); pg.wait_for_timeout(100)
    cards = pg.locator("section.card h2").all_inner_texts()
    for title in cards:
        nav("rose"); pg.get_by_role("button", name="Jeux enchantés").first.tap(); pg.wait_for_timeout(80)
        menu_h1 = h1()
        pg.locator("section.card", has_text=title).get_by_role("button").first.tap(); pg.wait_for_timeout(120)
        check(pg.locator(".answer-grid button, .counting-item").count() > 0 or h1() != menu_h1, f"jeu de Rose « {title} » : rien ne s’ouvre au premier appui")

    # ---------- 2. École : tous les exercices, tous les clics de réponse ----------
    from_levels = {"rose": ["maternelle", "cp"], "leon": ["cp", "ce1", "ce2", "cm1", "cm2"]}
    skills = pg.evaluate("""async()=>{const c=await import('./src/child/school-curriculum.js');
      return c.SCHOOL_LEVELS.map(l=>({level:l.id,chapters:l.chapters.map(ch=>({id:ch.id,skills:ch.skills.map(s=>s.id)}))}));}""")
    sessions = 0; questions = 0; first_try_wins = 0
    def play_session(child, chapter, skill_ids, quiz):
        nonlocal_q = {"q": 0, "ft": 0}
        pg.evaluate("async([c,ch,ids,q])=>{const s=await import('./src/child/school.js');s.practice(c,ch,ids,{quiz:q});}", [child, chapter, skill_ids, quiz])
        tag = f"{child} {chapter} {'quiz' if quiz else skill_ids[0]}"
        screen_start = len(voice()["spoken"])
        for guard in range(12):
            if pg.locator(".school-finish-stars").count():
                break
            pg.wait_for_timeout(150)  # laisse partir la lecture de la question
            prompt = pg.locator(".school-prompt").inner_text()
            # La consigne lue peut être formulée autrement que le texte affiché : on vérifie qu’elle part bien.
            check(len(spoken_since(screen_start)) > 0, f"{tag} : la question n’est pas lue ({prompt[:40]})")
            n_before = len(voice()["spoken"])
            if pg.locator(".answer-input").count():
                # Saisie : trois réponses fausses → indice puis correction affichée.
                inp = pg.locator(".answer-input")
                for k in range(3):
                    inp.fill("987654"); pg.get_by_role("button", name="Vérifier").tap()
                fb = pg.locator(".feedback").inner_text()
                check(fb.startswith("On regarde ensemble"), f"{tag} : saisie fausse ×3 sans correction ({fb[:40]})")
                check(inp.input_value() != "987654", f"{tag} : la bonne réponse n’est pas montrée dans la case")
            else:
                buttons = pg.locator(".school-choice")
                count = buttons.count()
                check(2 <= count <= 4, f"{tag} : {count} réponses proposées")
                won = False; wrong = 0
                for i in range(count):
                    b = buttons.nth(i)
                    if b.is_disabled(): continue
                    b.tap()
                    if "is-right" in (b.get_attribute("class") or ""):
                        won = True; break
                    wrong += 1
                    check(pg.locator(".school-choice.is-right").count() == 0 or wrong >= 3, f"{tag} : une mauvaise réponse est affichée juste")
                    if pg.locator("body > .game-next").count(): break  # 3 erreurs : correction
                right = pg.locator(".school-choice.is-right").count()
                check(right == 1, f"{tag} : {right} réponse(s) marquée(s) juste après le tour")
                if won and wrong == 0: nonlocal_q["ft"] += 1
                # Double appui sur une réponse après la fin : rien ne doit changer.
                check(all(buttons.nth(i).is_disabled() for i in range(count)), f"{tag} : réponses encore actives après la fin du tour")
            fb = pg.locator(".feedback").inner_text().strip()
            check(len(fb) > 3, f"{tag} : pas de message après la réponse")
            # La voix attend volontairement ~140 ms après une coupure, puis lit phrase par phrase.
            for _ in range(10):
                if norm(fb)[:14] in norm(" ".join(spoken_since(n_before))): break
                pg.wait_for_timeout(100)
            check(norm(fb)[:14] in norm(" ".join(spoken_since(n_before))), f"{tag} : le message « {fb[:30]} » n’est pas lu → entendu : {spoken_since(n_before)} · état : {voice()['dropped']}")
            nxt = pg.locator("body > .game-next")
            check(nxt.count() == 1, f"{tag} : pas de bouton suivant")
            r_before = pg.locator(".school-question .small").first.inner_text() if pg.locator(".school-question .small").count() else ""
            screen_start = len(voice()["spoken"])
            nxt.tap()
            # Un second appui rapide sur l’ancien bouton ne doit pas sauter une question.
            check(pg.locator("body > .game-next").count() == 0, f"{tag} : le bouton suivant reste affiché")
            nonlocal_q["q"] += 1
        check(pg.locator(".school-finish-stars").count() == 1, f"{tag} : pas d’écran de fin")
        return nonlocal_q
    def spoken_since(n): return [s["text"] for s in voice()["spoken"][n:]]
    for child, levels in from_levels.items():
        for lv in skills:
            if lv["level"] not in levels or (ONLY and lv["level"] != ONLY): continue
            for ch in lv["chapters"]:
                for sk in ch["skills"]:
                    r = play_session(child, ch["id"], [sk], False); sessions += 1; questions += r["q"]; first_try_wins += r["ft"]
                r = play_session(child, ch["id"], ch["skills"], True); sessions += 1; questions += r["q"]
                print(f"… {child} {ch['id']} ({sessions} parties, {len(results['ko'])} échecs)", flush=True)
    stored = pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('rose-leon-data')).profiles.leon.school).length")
    check(ONLY or stored >= 280, f"progression enregistrée : seulement {stored} entrées pour Léon")

    # ---------- 3. Bonne réponse du premier coup = 3 étoiles (calcul lu à l’écran) ----------
    pg.evaluate("async()=>{const s=await import('./src/child/school.js');s.practice('leon','ce1.toutes-tables',['ce1.toutes-tables.2']);}")
    for k in range(5):
        a, b = re.findall(r"\d+", pg.locator(".school-prompt").inner_text())[:2]
        pg.locator(f".school-choice[aria-label='{int(a)*int(b)}']").tap()
        pg.locator("body > .game-next").tap()
    check(pg.locator(".school-finish-stars").get_attribute("aria-label") == "3 étoiles sur 3", "5 bonnes réponses du premier coup ≠ 3 étoiles")
    pg.evaluate("async()=>{const s=await import('./src/child/school.js');s.practice('leon','ce1.operations-posees',['ce1.operations-posees.1']);}")
    for k in range(5):
        a, b = [int(x.replace(" ", "")) for x in re.findall(r"[\d ]+", pg.locator(".school-prompt").inner_text())[:2]]
        pg.locator(".answer-input").fill(str(a + b)); pg.get_by_role("button", name="Vérifier").tap()
        check(pg.locator(".feedback").inner_text().startswith(("Exactement", "Bien joué", "Bravo")), "saisie juste refusée")
        pg.locator("body > .game-next").tap()
    check(pg.locator(".school-finish-stars").get_attribute("aria-label") == "3 étoiles sur 3", "5 saisies justes ≠ 3 étoiles")

    # ---------- 4. Voix : leçon réécoutée plusieurs fois, réécouter, et anciens jeux ----------
    pg.evaluate("async()=>{const s=await import('./src/child/school.js');s.chapterPage('rose','maternelle.nombres-5');}")
    for k in range(4):
        n = len(voice()["spoken"]); pg.get_by_role("button", name="🔊 Écouter la leçon").tap(); pg.wait_for_timeout(250)
        check(any("compter" in s.lower() for s in spoken_since(n)), f"leçon non relue au {k+1}e appui")
    pg.locator(".school-practice").first.tap(); pg.wait_for_timeout(200)
    for k in range(4):
        n = len(voice()["spoken"]); pg.get_by_role("button", name="🔊 Réécouter").tap(); pg.wait_for_timeout(250)
        check(len(spoken_since(n)) > 0, f"Réécouter muet au {k+1}e appui")
    for game in ["Les couleurs magiques", "Les formes à retrouver", "Les suites magiques"]:
        nav("rose"); pg.get_by_role("button", name="Jeux enchantés").first.tap(); pg.wait_for_timeout(100)
        n = len(voice()["spoken"])
        pg.locator("section.card", has_text=game).get_by_role("button").first.tap(); pg.wait_for_timeout(250)
        check(len(spoken_since(n)) > 0, f"« {game} » : consigne non lue")
        n = len(voice()["spoken"]); pg.locator(".answer-grid button").first.tap(); pg.wait_for_timeout(250)
        check(len(spoken_since(n)) > 0, f"« {game} » : réponse sans voix")

    v = voice()
    check(not v["stuck"] and v["dropped"] == 0, f"voix perdue {v['dropped']} fois (bloquée : {v['stuck']})")
    check(not errors, "erreurs JavaScript : " + "; ".join(errors[:3]))
    print(f"Parties jouées : {sessions} · questions : {questions} · phrases lues : {len(v['spoken'])} · coupures de voix : {v['cancels']}")
    print(f"Vérifications réussies : {results['ok']} · échouées : {len(results['ko'])}")
    for k in results["ko"][:40]: print("  ✗", k)
    browser.close()
    sys.exit(1 if results["ko"] else 0)
