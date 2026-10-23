const KEY="rose-leon-data";export const SCHEMA_VERSION=1;
const initial=()=>({schemaVersion:SCHEMA_VERSION,profiles:{leon:{sessions:0,correct:0,attempts:0,stickers:0},rose:{sessions:0,correct:0,attempts:0,stickers:0}},settings:{voice:true,sounds:true,leonMinutes:4,roseMinutes:2,parentPin:""},history:[],crisisLog:[],customWords:[]});
function migrate(d){if(!d||typeof d!=="object")return initial();if(d.schemaVersion===SCHEMA_VERSION)return {...initial(),...d,settings:{...initial().settings,...(d.settings||{})},profiles:{...initial().profiles,...(d.profiles||{})}};return initial();}
let state;try{state=migrate(JSON.parse(localStorage.getItem(KEY)||"null"));}catch{state=initial();}
const listeners=new Set();export const getState=()=>JSON.parse(JSON.stringify(state));function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{throw Error("Stockage indisponible : libère de l’espace ou exporte tes données.");}listeners.forEach(f=>f(getState()));}
export function update(fn){const n=getState();fn(n);n.schemaVersion=SCHEMA_VERSION;state=n;persist();return getState();}
export function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}
export function recordAnswer(child,ok){update(s=>{const p=s.profiles[child];p.attempts++;if(ok){p.correct++;p.stickers=Math.floor(p.correct/3);}});}
export function recordSession(child){update(s=>{s.profiles[child].sessions++;s.history.push({child,date:new Date().toISOString()});if(s.history.length>200)s.history=s.history.slice(-200);});}
export function exportData(){return JSON.stringify({...getState(),exportedAt:new Date().toISOString()},null,2);}
export function importData(text){const d=JSON.parse(text);if(!d||!d.profiles||!d.settings)throw Error("Fichier de sauvegarde non reconnu.");state=migrate(d);persist();}
export function resetData(){state=initial();persist();}
