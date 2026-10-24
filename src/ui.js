import { speak } from "./voice.js";
import { getState } from "./store.js";

export function el(tag,attrs={},children=[]){const n=document.createElement(tag);for(const [k,v] of Object.entries(attrs)){if(k==="class")n.className=v;else if(k==="text")n.textContent=v;else if(k.startsWith("on")&&typeof v==="function")n.addEventListener(k.slice(2).toLowerCase(),v);else if(v!==undefined&&v!==null)n.setAttribute(k,String(v));}for(const c of Array.isArray(children)?children:[children])if(c instanceof Node)n.append(c);else if(c!==undefined&&c!==null)n.append(document.createTextNode(String(c)));return n;}
export const button=(label,fn,cls="button-primary",attrs={})=>el("button",{type:"button",class:cls,...attrs,onclick:fn},label);
export function screen(title,content,{eyebrow="Rose & Léon",home}={}){const s=el("section",{class:"screen"}),b=el("header",{class:"topbar"},[el("div",{},[el("div",{class:"eyebrow",text:eyebrow}),el("h1",{text:title})])]);if(home)b.append(button("⌂ Accueil",home,"icon-button"));s.append(b,content);return s;}
export const card=(children,cls="card")=>el("section",{class:cls},children);

let feedbackObserver;
function collectFeedback(node,set){
  if(!node || node.nodeType!==1)return;
  if(node.matches?.(".feedback"))set.add(node);
  node.querySelectorAll?.(".feedback").forEach(item=>set.add(item));
}
function announceFeedback(item){
  if(!item.isConnected)return;
  const message=item.textContent?.trim();
  if(message)speak(message,getState().settings.voice);
}
export function replaceApp(node){
  const app=document.querySelector("#app");
  if(!app)return;
  if(!feedbackObserver && typeof MutationObserver!=="undefined"){
    feedbackObserver=new MutationObserver(mutations=>{
      const changed=new Set();
      for(const mutation of mutations){
        if(mutation.type==="characterData"){
          const feedback=mutation.target.parentElement?.closest(".feedback");
          if(feedback)changed.add(feedback);
        }else if(mutation.type==="childList"){
          const feedback=mutation.target.nodeType===1?mutation.target.closest?.(".feedback"):null;
          if(feedback)changed.add(feedback);
          mutation.addedNodes.forEach(node=>collectFeedback(node,changed));
        }
      }
      changed.forEach(announceFeedback);
    });
    feedbackObserver.observe(app,{subtree:true,childList:true,characterData:true});
  }
  app.replaceChildren(node);
  scrollTo({top:0,behavior:"auto"});
}

export function chooseExercise(instruction, action) {
  let armed = false;
  return () => {
    if (!armed) {
      armed = true;
      speak(instruction, getState().settings.voice);
      return;
    }
    armed = false;
    action();
  };
}
