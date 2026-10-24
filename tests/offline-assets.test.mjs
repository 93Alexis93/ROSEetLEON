import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, existsSync} from "node:fs";
import {resolve, dirname, relative} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const worker=readFileSync(resolve(root,"service-worker.js"),"utf8");
const manifest=JSON.parse(readFileSync(resolve(root,"manifest.webmanifest"),"utf8"));
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

test("PWA · le cache est renouvelé pour les dernières corrections de contenu",()=>{
  assert.match(worker,/const CACHE="rose-leon-v70"/,"Le cache doit accompagner les derniers enrichissements de contenus.");
});

test("PWA · les nouveaux modules de calcul sont préchargés hors ligne",()=>{
  assert.ok(assets.includes("./src/child/calcul-engine.js"));
  assert.ok(assets.includes("./src/child/calcul.js"));
});

test("PWA · le module de statistiques parentales reste préchargé",()=>{
  assert.ok(assets.includes("./src/parent/dashboard-stats.js"));
});

test("PWA · les ressources locales déclarées dans index.html existent et sont préchargées",()=>{
  const html=readFileSync(resolve(root,"index.html"),"utf8");
  const localRefs=[...html.matchAll(/(?:href|src)="(\.\/[^"]+)"/g)].map(match=>match[1]);
  for(const ref of localRefs){
    assert.ok(existsSync(resolve(root,ref.slice(2))),"Ressource locale absente de index.html : "+ref);
    assert.ok(assets.includes(ref),"Ressource locale de démarrage absente du cache hors ligne : "+ref);
  }
});

test("PWA · l’activation ne supprime que les anciens caches de cette application",()=>{
  assert.match(worker,/keys\.filter\(k=>k\.startsWith\("rose-leon-"\)&&k!==CACHE\)/,
    "Le nettoyage doit préserver les caches d’autres applications hébergées sur la même origine.");
});

test("PWA · icône PNG déclarée, valide et précachée",()=>{
 const icon=manifest.icons.find(item=>item.src==="./assets/icons/icon-512.png");
 assert.ok(icon,"Le manifeste doit déclarer l’icône PNG.");
 assert.equal(icon.sizes,"512x512"); assert.equal(icon.type,"image/png");
 assert.ok(assets.includes(icon.src),"L’icône doit être précachée.");
 const bytes=readFileSync(resolve(root,icon.src.slice(2)));
 assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10]);
});


test("PWA · les imports JavaScript des ressources précachées sont eux aussi précachés",()=>{
  for(const asset of assets.filter(path=>path.endsWith(".js"))){
    const source=readFileSync(resolve(root,asset.slice(2)),"utf8");
    const imports=[...source.matchAll(/(?:from\\s*|import\\s*)["'](\\.[^"']+)["']/g)];
    for(const match of imports){
      const target="./"+relative(root,resolve(dirname(resolve(root,asset.slice(2))),match[1])).replaceAll("\\\\","/");
      assert.ok(existsSync(resolve(root,target.slice(2))),"Import local absent : "+asset+" → "+match[1]);
      assert.ok(assets.includes(target),"Import local absent du cache hors ligne : "+asset+" → "+target);
    }
  }
});

test("Accueil · les deux univers enfant sont mis en avant avec des appels au jeu accessibles",()=>{
  const main=readFileSync(resolve(root,"src/main.js"),"utf8");
  const css=readFileSync(resolve(root,"assets/css/base.css"),"utf8");
  for(const token of ["home-hero","home-title","home-choices","home-leon","home-rose","home-promise"]){
    assert.ok(main.includes(token)||css.includes(token),"Style ou structure d’accueil manquant : "+token);
  }
  assert.match(main,/aria-label.*Choisis ton univers/);
  assert.match(main,/Pas de compétition/);
});
