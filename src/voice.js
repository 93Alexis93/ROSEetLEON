export function prepareSpeechText(text,language="fr-FR"){let spoken=String(text??"");if(language.toLowerCase().startsWith("fr")){const rules=[[/faut-il/gi,"fautile"],[/peut-il/gi,"peutil"],[/doit-il/gi,"doitil"],[/est-il/gi,"estile"],[/va-t-il/gi,"vatil"],[/y a-t-il/gi,"ya-til"],[/a-t-il/gi,"atil"],[/faut-elle/gi,"faut-elle"],[/peut-elle/gi,"peut-elle"]];for(const [pattern,replacement] of rules)spoken=spoken.replace(pattern,replacement);}return spoken;}

// Safari iOS a trois fragilités connues avec speechSynthesis :
// 1. un speak() lancé juste après cancel() est parfois ignoré, puis la voix reste muette ;
// 2. une longue phrase coupée en plein milieu peut laisser le moteur « en pause » ;
// 3. un énoncé que plus rien ne référence peut être libéré avant d’être lu.
// On laisse donc un court délai après une annulation, on relance un moteur en pause,
// on découpe les longs textes en phrases et on garde une référence aux énoncés en cours.
const CANCEL_GAP_MS = 140;
const MAX_CHUNK = 160;
let lastCancelAt = 0;
let pendingTimer = null;
let generation = 0;
const alive = new Set();

/** Découpe un texte en morceaux courts, sur les fins de phrase puis les virgules. */
export function splitSpeech(text, max = MAX_CHUNK) {
  const sentences = String(text).match(/[^.!?…]+[.!?…]*\s*/g) || [String(text)];
  const chunks = [];
  for (const sentence of sentences) {
    let rest = sentence.trim();
    while (rest.length > max) {
      let cut = rest.lastIndexOf(", ", max);
      if (cut < max / 3) cut = rest.lastIndexOf(" ", max);
      if (cut <= 0) cut = max;
      chunks.push(rest.slice(0, cut + 1).trim());
      rest = rest.slice(cut + 1).trim();
    }
    if (rest) chunks.push(rest);
  }
  return chunks.length ? chunks : [""];
}

function synth() {
  try { return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null; } catch { return null; }
}

export function speak(text,enabled=true,language="fr-FR",rate=0.92){
  const engine = synth();
  if(!enabled||!engine)return false;
  try{
    const busy = engine.speaking || engine.pending;
    engine.cancel();
    if (busy) lastCancelAt = Date.now();
    const prefix=language.toLowerCase().split("-")[0];
    const voice=engine.getVoices().find(x=>x.lang.toLowerCase().startsWith(prefix));
    const chunks = splitSpeech(prepareSpeechText(text,language));
    const run = () => {
      pendingTimer = null;
      try { if (engine.paused && typeof engine.resume === "function") engine.resume(); } catch {}
      for (const chunk of chunks) {
        const u=new SpeechSynthesisUtterance(chunk);
        u.lang=language;
        if(voice)u.voice=voice;
        u.rate=rate;u.pitch=1.02;
        alive.add(u);
        u.onend = u.onerror = () => alive.delete(u);
        engine.speak(u);
      }
    };
    if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
    const wait = CANCEL_GAP_MS - (Date.now() - lastCancelAt);
    const id = ++generation;
    if (wait > 0) pendingTimer = setTimeout(() => { if (id === generation) { try { run(); } catch {} } }, wait);
    else run();
    return true;
  }catch{return false;}
}

export function stopSpeaking(){
  generation++;
  if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = null; }
  try{
    const engine = synth();
    if(engine){
      if (engine.speaking || engine.pending) lastCancelAt = Date.now();
      engine.cancel();
    }
  }catch{return false;}
  return true;
}
