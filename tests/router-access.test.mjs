import test from "node:test";
import assert from "node:assert/strict";

const makeStorage=()=>{
 const values=new Map();
 return {
  getItem(key){return values.has(key)?values.get(key):null;},
  setItem(key,value){values.set(key,String(value));},
  removeItem(key){values.delete(key);}
 };
};
globalThis.sessionStorage=makeStorage();
globalThis.localStorage=makeStorage();

const access=await import("../src/router.js?parent-access-tests");

test("Accès parent · les routes protégées sont refusées par défaut",()=>{
 access.lockParent();
 for(const route of ["parent","crisis","print"])assert.equal(access.canAccessRoute(route),false,route);
 assert.equal(access.canAccessRoute("home"),true);
 assert.equal(access.canAccessRoute("gate"),true);
});

test("Accès parent · le déverrouillage autorise les routes protégées puis se referme",()=>{
 access.lockParent();
 assert.equal(access.canAccessRoute("parent"),false);
 access.unlockParent();
 for(const route of ["parent","crisis","print"])assert.equal(access.canAccessRoute(route),true,route);
 access.lockParent();
 assert.equal(access.canAccessRoute("parent"),false);
});

test("Porte parentale · le blocage temporaire est conservé dans le stockage de session et local",()=>{
 const until=Date.now()+30000;
 access.setParentLockoutUntil(until);
 assert.equal(Number(sessionStorage.getItem("rose-leon-parent-lockout-until")),until);
 assert.equal(Number(localStorage.getItem("rose-leon-parent-lockout-until")),until);
 assert.equal(access.getParentLockoutUntil(),until);
});

test("Porte parentale · un blocage expiré est ignoré et nettoyé",()=>{
 access.setParentLockoutUntil(Date.now()-1000);
 assert.equal(access.getParentLockoutUntil(),0);
 assert.equal(sessionStorage.getItem("rose-leon-parent-lockout-until"),null);
 assert.equal(localStorage.getItem("rose-leon-parent-lockout-until"),null);
});
