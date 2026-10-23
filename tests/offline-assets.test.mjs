import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import {resolve, dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const worker=readFileSync(resolve(root,"service-worker.js"),"utf8");
const match=worker.match(/const ASSETS=(\[[^;]+\]);/);
assert.ok(match,"Le service worker doit déclarer la liste des ressources hors ligne.");
const assets=JSON.parse(match[1]);

test("PWA · chaque ressource préchargée existe dans le dépôt",()=>{
  assert.ok(assets.length>0,"La liste des ressources hors ligne ne doit pas être vide.");
  for(const asset of assets){
    assert.ok(typeof asset==="string"&&asset.startsWith("./"),"Chemin local attendu : "+asset);
    assert.ok(existsSync(resolve(root,asset.slice(2))),"Ressource absente du dépôt : "+asset);
  }
});

test("PWA · pas de doublons dans les ressources préchargées",()=>{
  assert.equal(new Set(assets).size,assets.length,"Une ressource est déclarée plusieurs fois.");
});

test("PWA · les fiches et leurs styles sont préchargés",()=>{
  assert.ok(assets.includes("./src/parent/printables.js"));
  assert.ok(assets.includes("./assets/css/print.css"));
});

test("PWA · le cache possède une version explicite",()=>{
  assert.match(worker,/const CACHE="rose-leon-v\d+"/);
});

test("PWA · les ressources locales déclarées dans index.html existent et sont préchargées",()=>{
  const html=readFileSync(resolve(root,"index.html"),"utf8");
  const localRefs=[...html.matchAll(/(?:href|src)="(\.\/[^"]+)"/g)].map(match=>match[1]);
  for(const ref of localRefs){
    assert.ok(existsSync(resolve(root,ref.slice(2))),"Ressource locale absente de index.html : "+ref);
    assert.ok(assets.includes(ref),"Ressource locale de démarrage absente du cache hors ligne : "+ref);
  }
});
