import test from "node:test";
import assert from "node:assert/strict";

const values=new Map();
globalThis.localStorage={
  getItem(key){return values.has(key)?values.get(key):null;},
  setItem(key,value){values.set(key,String(value));},
  removeItem(key){values.delete(key);}
};

const store=await import("../src/store.js?store-tests");

test("Sauvegarde · export puis import restaure les mots personnalisés et réglages",()=>{
  store.resetData();
  store.update(state=>{
    state.customWords.push({word:"papillon",createdAt:"2026-10-23T12:00:00.000Z"});
    state.settings.voice=false;
    state.profiles.leon.sessions=3;
  });
  const backup=store.exportData();
  store.resetData();
  store.importData(backup);
  const restored=store.getState();
  assert.equal(restored.customWords[0].word,"papillon");
  assert.equal(restored.settings.voice,false);
  assert.equal(restored.profiles.leon.sessions,3);
});

test("Sauvegarde · un fichier non reconnu est refusé sans écraser les données",()=>{
  store.resetData();
  store.update(state=>{state.profiles.rose.sessions=2;});
  assert.throws(()=>store.importData('{"settings":{}}'),/Fichier de sauvegarde non reconnu/);
  assert.equal(store.getState().profiles.rose.sessions,2);
});

test("Sauvegarde · un JSON invalide est refusé sans écraser les données",()=>{
  store.resetData();
  store.update(state=>{state.profiles.leon.sessions=1;});
  assert.throws(()=>store.importData("{pas du json"),SyntaxError);
  assert.equal(store.getState().profiles.leon.sessions,1);
});
