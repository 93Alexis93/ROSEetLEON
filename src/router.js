let render=()=>{};
let parentUnlocked=false;
const LOCKOUT_KEY="rose-leon-parent-lockout-until";

export function setRenderer(fn){render=fn;}
export function go(route,params={}){
 history.replaceState({route,params},"","#"+route);
 render(route,params);
}
export function current(){return {route:location.hash.slice(1)||"home",params:{}};}
export function startRouter(){
 addEventListener("hashchange",()=>{const r=current();render(r.route,r.params);});
 const r=current();
 render(r.route,r.params);
}

export function unlockParent(){parentUnlocked=true;}
export function lockParent(){parentUnlocked=false;}
export function isParentUnlocked(){return parentUnlocked;}
export function isProtectedParentRoute(route){return ["parent","crisis","print"].includes(route);}
export function canAccessRoute(route){return !isProtectedParentRoute(route)||isParentUnlocked();}

export function setParentLockoutUntil(timestamp){
 const value=String(Math.max(0,Number(timestamp)||0));
 for(const storage of [globalThis.sessionStorage,globalThis.localStorage]){
  try{storage?.setItem(LOCKOUT_KEY,value);}catch{}
 }
}
export function getParentLockoutUntil(){
 let until=0;
 for(const storage of [globalThis.sessionStorage,globalThis.localStorage]){
  try{
   const value=Number(storage?.getItem(LOCKOUT_KEY)||0);
   if(Number.isFinite(value))until=Math.max(until,value);
  }catch{}
 }
 if(until<=Date.now()){
  for(const storage of [globalThis.sessionStorage,globalThis.localStorage]){
   try{storage?.removeItem(LOCKOUT_KEY);}catch{}
  }
  return 0;
 }
 return until;
}
