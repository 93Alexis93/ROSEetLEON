import {adaptDifficulty} from "./child/math-engine.js";
const KEY="rose-leon-data";export const SCHEMA_VERSION=2;
const profile=()=>({sessions:0,correct:0,attempts:0,stickers:0,mathProgress:{}});
const initial=()=>({schemaVersion:SCHEMA_VERSION,profiles:{leon:profile(),rose:profile()},settings:{voice:true,sounds:true,leonMinutes:4,roseMinutes:2,parentPin:""},history:[],crisisLog:[],customWords:[]});
function migrate(d){
 if(!d||typeof d!=="object")return initial();
 const base=initial(),oldProfiles=d.profiles||{};
 const profiles={};
 for(const child of ["leon","rose"]){
  const old=oldProfiles[child]||{};
  profiles[child]={...base.profiles[child],...old,mathProgress:{...(old.mathProgress||{})}};
 }
 return {...base,...d,schemaVersion:SCHEMA_VERSION,profiles,settings:{...base.settings,...(d.settings||{})},history:Array.isArray(d.history)?d.history:[],crisisLog:Array.isArray(d.crisisLog)?d.crisisLog:[],customWords:Array.isArray(d.customWords)?d.customWords:[]};
}
let state;try{state=migrate(JSON.parse(localStorage.getItem(KEY)||"null"));}catch{state=initial();}
const listeners=new Set();export const getState=()=>JSON.parse(JSON.stringify(state));function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{throw Error("Stockage indisponible : libère de l’espace ou exporte tes données.");}listeners.forEach(f=>f(getState()));}
export function update(fn){const previous=state;const n=getState();fn(n);n.schemaVersion=SCHEMA_VERSION;state=n;try{persist();}catch(error){state=previous;throw error;}return getState();}
export function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}
export function recordAnswer(child,ok){update(s=>{const p=s.profiles[child];p.attempts++;if(ok){p.correct++;p.stickers=Math.floor(p.correct/3);}});}
export function recordMathAnswer(domain,ok){update(s=>{const p=s.profiles.leon;const previous=p.mathProgress[domain]||{difficulty:1,correctStreak:0,errorStreak:0,attempts:0,correct:0};previous.attempts++;if(ok){previous.correct++;previous.correctStreak++;previous.errorStreak=0;}else{previous.correctStreak=0;previous.errorStreak++;}previous.difficulty=adaptDifficulty(previous.difficulty,previous.correctStreak,previous.errorStreak);p.mathProgress[domain]=previous;});}
export function recordSession(child){update(s=>{s.profiles[child].sessions++;s.history.push({child,date:new Date().toISOString()});if(s.history.length>200)s.history=s.history.slice(-200);});}
export function exportData(){return JSON.stringify({...getState(),exportedAt:new Date().toISOString()},null,2);}
export function importData(text){const d=JSON.parse(text);if(!d||typeof d!=="object"||!d.profiles||typeof d.profiles!=="object"||!d.settings||typeof d.settings!=="object")throw Error("Fichier de sauvegarde non reconnu.");const previous=state;state=migrate(d);try{persist();}catch(error){state=previous;throw error;}return getState();}
export function resetData(){const previous=state;state=initial();try{persist();}catch(error){state=previous;throw error;}}
