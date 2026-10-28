import test from "node:test";
import assert from "node:assert/strict";

const { speak, stopSpeaking, prepareSpeechText } = await import("../src/voice.js?voice-tests");

function installSpeech({ supported = true, voices = [{ lang: "fr-FR", name: "Voix française" }] } = {}) {
  const calls = { cancelled: 0, spoken: [], voices };
  const api = {
    cancel() { calls.cancelled++; },
    getVoices() { return calls.voices; },
    speak(utterance) { calls.spoken.push(utterance); }
  };
  globalThis.window = supported ? { speechSynthesis: api } : {};
  globalThis.speechSynthesis = api;
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) { this.text = text; this.lang = ""; this.rate = 1; this.pitch = 1; this.voice = null; }
  };
  return calls;
}

test("Voix · un réglage désactivé ne déclenche aucune parole", () => {
  const calls = installSpeech();
  assert.equal(speak("Bravo !", false), false);
  assert.equal(calls.cancelled, 0);
  assert.equal(calls.spoken.length, 0);
});

test("Voix · l’absence de synthèse vocale est gérée sans planter", () => {
  installSpeech({ supported: false });
  assert.equal(speak("Bonjour", true), false);
  assert.doesNotThrow(() => stopSpeaking());
});

test("Voix · une consigne est prononcée en français avec les paramètres attendus", () => {
  const calls = installSpeech();
  assert.equal(speak("Bravo Rose !", true), true);
  assert.equal(calls.cancelled, 1, "Une ancienne consigne doit être annulée avant la nouvelle.");
  assert.equal(calls.spoken.length, 1);
  const utterance = calls.spoken[0];
  assert.equal(utterance.text, "Bravo Rose !");
  assert.equal(utterance.lang, "fr-FR");
  assert.equal(utterance.rate, 0.92);
  assert.equal(utterance.pitch, 1.02);
  assert.equal(utterance.voice.name, "Voix française");
});

test("Voix · un appareil sans voix française garde une voix système utilisable", () => {
  const calls = installSpeech({ voices: [{ lang: "en-US", name: "System voice" }] });
  assert.equal(speak("Bonjour", true), true);
  assert.equal(calls.spoken[0].voice, null);
  assert.equal(calls.spoken[0].lang, "fr-FR");
});

test("Voix · une erreur de l’API vocale est absorbée", () => {
  installSpeech();
  globalThis.speechSynthesis.speak = () => { throw new Error("API indisponible"); };
  assert.equal(speak("Test", true), false);
});

test("Voix · l’arrêt explicite annule la lecture en cours", () => {
  const calls = installSpeech();
  stopSpeaking();
  assert.equal(calls.cancelled, 1);
});


test("Voix · une activité peut demander une prononciation anglaise",()=>{
 const calls=installSpeech({voices:[{lang:"en-GB",name:"English voice"},{lang:"fr-FR",name:"Voix française"}]});
 assert.equal(speak("apple",true,"en-GB"),true);
 assert.equal(calls.spoken[0].lang,"en-GB");
 assert.equal(calls.spoken[0].voice.name,"English voice");
});

test("Voix · les liaisons françaises sont préparées pour la synthèse vocale",()=>{
 assert.equal(prepareSpeechText("Faut-il continuer ?"),"fautile continuer ?");
 assert.equal(prepareSpeechText("Peut-il répondre ?"),"peutil répondre ?");
 assert.equal(prepareSpeechText("Faut-il continuer ?","en-GB"),"Faut-il continuer ?");
});

test("Voix · Safari : après une lecture en cours, la nouvelle phrase attend un court instant", async () => {
  const calls = installSpeech();
  globalThis.speechSynthesis.speaking = true;
  assert.equal(speak("Nouvelle consigne", true), true);
  assert.equal(calls.spoken.length, 0, "Pas de speak() collé au cancel()");
  globalThis.speechSynthesis.speaking = false;
  await new Promise(r => setTimeout(r, 200));
  assert.equal(calls.spoken.length, 1);
  assert.equal(calls.spoken[0].text, "Nouvelle consigne");
});

test("Voix · Safari : arrêter puis reparler n’enchaîne pas deux lectures périmées", async () => {
  const calls = installSpeech();
  globalThis.speechSynthesis.speaking = true;
  speak("Ancienne", true);
  stopSpeaking();
  globalThis.speechSynthesis.speaking = false;
  speak("Nouvelle", true);
  await new Promise(r => setTimeout(r, 200));
  assert.deepEqual(calls.spoken.map(u => u.text), ["Nouvelle"]);
});

test("Voix · un moteur resté en pause est relancé et un long texte est découpé en phrases", async () => {
  const calls = installSpeech();
  let resumed = 0;
  globalThis.speechSynthesis.paused = true;
  globalThis.speechSynthesis.resume = () => { resumed++; };
  await new Promise(r => setTimeout(r, 200));
  const long = "Pour compter, on touche chaque objet une seule fois. On dit un nombre à chaque fois. Le dernier nombre dit, c’est combien il y en a, et on peut le montrer avec ses doigts, un dé ou une boîte de dix cases bien rangées.";
  speak(long, true);
  assert.equal(resumed, 1);
  assert.ok(calls.spoken.length >= 3);
  assert.ok(calls.spoken.every(u => u.text.length <= 160));
  assert.equal(calls.spoken.map(u => u.text).join(" "), long);
});
