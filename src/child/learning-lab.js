import {el,button,screen,card,replaceApp} from "../ui.js";
import {getState,recordAnswer,recordSession} from "../store.js";
import {speak} from "../voice.js";
import {cheer} from "../audio.js";
import {go} from "../router.js";

const pick=(items,random=Math.random)=>items[Math.floor(random()*items.length)];
const shuffle=(items,random=Math.random)=>{const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};

export function createNumberMysteryQuestion(random=Math.random){
 const kind=pick(["decompose","next","previous"],random);
 let answer,prompt,hint,explanation;
 if(kind==="decompose"){
  const tens=1+Math.floor(random()*8),units=Math.floor(random()*10);
  answer=tens*10+units;prompt="Je suis "+tens+" dizaine"+(tens>1?"s":"")+" et "+units+" unité"+(units>1?"s":"")+". Qui suis-je ?";
  hint="Une dizaine vaut 10. Additionne les dizaines et les unités.";
  explanation=tens+" dizaines font "+(tens*10)+", puis "+units+" unité"+(units>1?"s":"")+" : "+answer+".";
 }else{
  const base=10+Math.floor(random()*89);
  if(kind==="next"){answer=base+1;prompt="Quel nombre vient juste après "+base+" ?";hint="Avance d’un pas sur la file des nombres.";explanation="Après "+base+", on dit "+answer+".";}
  else{answer=base-1;prompt="Quel nombre vient juste avant "+base+" ?";hint="Recule d’un pas sur la file des nombres.";explanation="Avant "+base+", on dit "+answer+".";}
 }
 const choices=shuffle([answer,...new Set([answer-2,answer-1,answer+1,answer+2].filter(n=>n>=0&&n<=99&&n!==answer))].slice(0,3),random);
 while(choices.length<4){const n=Math.floor(random()*100);if(!choices.includes(n))choices.push(n);}
 return {prompt,answer,choices:shuffle(choices,random),hint,explanation};
}

export function createCompareQuestion(random=Math.random){
 const first=10+Math.floor(random()*90);
 const rawSecond=10+Math.floor(random()*89);
 const second=rawSecond>=first?rawSecond+1:rawSecond;
 const answer=Math.max(first,second),other=Math.min(first,second);
 const choices=[answer,other];
 for(const candidate of shuffle([answer-1,answer+1,answer-2,answer+2],random)){
  if(candidate>=10&&candidate<=99&&!choices.includes(candidate)&&choices.length<4)choices.push(candidate);
 }
 while(choices.length<4){const candidate=10+Math.floor(random()*90);if(!choices.includes(candidate))choices.push(candidate);}
 return {prompt:"Quel est le plus grand nombre : "+first+" ou "+second+" ?",answer,choices:shuffle(choices,random),hint:"Compare d’abord le chiffre des dizaines, puis celui des unités si besoin.",explanation:answer+" est plus grand que "+other+"."};
}

const SYLLABLE_WORDS=[
 {word:"chat",picture:"🐱",syllables:1},
 {word:"vélo",picture:"🚲",syllables:2},
 {word:"lapin",picture:"🐰",syllables:2},
 {word:"tomate",picture:"🍅",syllables:2},
 {word:"banane",picture:"🍌",syllables:2},
 {word:"papillon",picture:"🦋",syllables:3},
 {word:"chocolat",picture:"🍫",syllables:3},
 {word:"maison",picture:"🏠",syllables:2},
 {word:"bateau",picture:"⛵",syllables:2},
 {word:"soleil",picture:"☀️",syllables:2}
];
export function createSyllableQuestion(random=Math.random){
 const item=pick(SYLLABLE_WORDS,random);
 return {word:item.word,picture:item.picture,prompt:"Combien de morceaux entends-tu dans ce mot ?",answer:item.syllables,choices:shuffle([1,2,3],random)};
}

function launch(child,mode="default"){
 const isRose=child==="rose";
 const isCompare=mode==="compare";
 document.body.className="theme-"+child;
 let round=0,question,locked=false,hintUsed=false;
 const total=5;
 const generate=()=>{question=isRose?createSyllableQuestion():(isCompare?createCompareQuestion():createNumberMysteryQuestion());locked=false;hintUsed=false;};
 generate();
 function render(){
  const content=card([]);
  content.append(el("p",{class:"small",text:"Défi "+(round+1)+" sur "+total}),
   el("div",{class:"progress-track",role:"progressbar","aria-label":"Progression du défi","aria-valuemin":"0","aria-valuemax":String(total),"aria-valuenow":String(round)},el("div",{class:"progress-fill",style:"width:"+(round/total*100)+"%"})),
   el("p",{class:"lead",text:isRose?"Écoute le mot. Tape le nombre de morceaux que tu entends.":(isCompare?"Compare les deux nombres. Tu peux utiliser l’aide !":"Lis l’indice et trouve le nombre. Tu peux utiliser l’aide !")}));
  if(isRose){
   const picture=el("div",{class:"prompt",text:question.picture,"aria-label":"Image pour écouter un mot"});
   picture.style.fontSize="4rem";content.append(picture);
  }
  content.append(el("div",{class:"prompt",text:question.prompt}));
  const answers=el("div",{class:"answer-grid"});
  question.choices.forEach(choice=>answers.append(button(isRose?String(choice)+" syllab"+(choice>1?"es":"e"):String(choice),()=>answer(choice),"button-soft")));
  const feedback=el("p",{class:"feedback",role:"status","aria-live":"polite"});
  content.append(answers,feedback,
   button("🔊 Réécouter",()=>speak(isRose?"Écoute le mot "+question.word+". "+question.word+". "+question.prompt:question.prompt,getState().settings.voice),"button-soft"),
   button("💡 Petit indice",()=>{if(hintUsed){feedback.textContent=isRose?"Dis le mot lentement en tapant doucement dans tes mains.":(isCompare?"Regarde d’abord le chiffre des dizaines.":"Une dizaine, c’est un groupe de dix unités.");return;}hintUsed=true;feedback.textContent=isRose?"Dis le mot lentement et tape dans tes mains pour chaque morceau.":(isCompare?"Compare les dizaines, puis les unités si les dizaines sont égales.":"Une dizaine vaut dix unités. Décompose le nombre en dizaines et unités.");if(isRose)speak("Écoute bien : "+question.word+".",getState().settings.voice);},"button-soft"),
   button("⌂ Accueil",()=>go("home"),"icon-button"));
  replaceApp(screen(isRose?"Les syllabes dans les mots":(isCompare?"Le plus grand nombre":"Le nombre mystère"),content,{eyebrow:isRose?"Jeu d’écoute · Rose":(isCompare?"Comparer les nombres · Léon":"Numération · Léon"),home:()=>go("home")}));
  speak(isRose?"Écoute le mot "+question.word+". Combien de syllabes entends-tu ?":question.prompt,getState().settings.voice);
 }
 function answer(choice){
  if(locked)return;
  const feedback=document.querySelector(".feedback");
  if(Number(choice)!==question.answer){recordAnswer(child,false);if(feedback)feedback.textContent=isRose?"On réécoute et on essaie de découper le mot doucement.":"Pas tout à fait. Regarde l’indice et essaie encore.";return;}
  locked=true;recordAnswer(child,true);cheer(getState().settings.sounds);
  if(feedback)feedback.textContent=isRose?"Oui ! "+question.word+" : "+question.answer+" syllabe"+(question.answer>1?"s":"")+".": "Bien trouvé ! "+question.explanation;
  const buttons=[...document.querySelectorAll(".answer-grid button")];buttons.forEach(b=>b.disabled=true);
  const next=button(round===total-1?"Terminer":"Continuer",()=>{
   round++;
   if(round>=total){recordSession(child);const done=card([el("div",{class:"prompt",text:isRose?"🌟 Bravo pour ton écoute !":"🔎 Enquête réussie !"}),el("p",{class:"lead",text:"Tu as pris le temps d’écouter, de réfléchir et d’essayer."}),el("p",{class:"small",text:"Tu peux recommencer plus tard ou choisir une autre activité."}),button("Rejouer",()=>launch(child),"button-primary"),button("⌂ Accueil",()=>go("home"),"button-soft")]);replaceApp(screen("Défi terminé",done,{home:()=>go("home")}));return;}
   generate();render();
  },"button-primary");
  feedback?.after(next);
 }
 render();
}
export function numberMystery(){launch("leon");}
export function compareNumbers(){launch("leon","compare");}
export function syllableGame(){launch("rose");}
