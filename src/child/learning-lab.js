import {el,button,screen,card,replaceApp} from "../ui.js";
import {getState,recordAnswer,recordSession} from "../store.js";
import {speak} from "../voice.js";
import {cheer,gentleOops,successPraise,sessionPraise} from "../audio.js";
import {go} from "../router.js";

const pick=(items,random=Math.random)=>items[Math.floor(random()*items.length)];
const shuffle=(items,random=Math.random)=>{const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};

export function createNumberMysteryQuestion(random=Math.random){
 const kind=pick(["decompose","next","previous"],random);
 let answer,prompt,hint,explanation;
 if(kind==="decompose"){
  const hundreds=1+Math.floor(random()*8),tens=Math.floor(random()*10),units=Math.floor(random()*10);
  answer=hundreds*100+tens*10+units;
  prompt="Je suis "+hundreds+" centaine"+(hundreds>1?"s":"")+", "+tens+" dizaine"+(tens>1?"s":"")+" et "+units+" unité"+(units>1?"s":"")+". Qui suis-je ?";
  hint="Une centaine vaut 100 et une dizaine vaut 10. Assemble les trois parties.";
  explanation=hundreds+" centaines font "+(hundreds*100)+", "+tens+" dizaines font "+(tens*10)+", puis "+units+" unité"+(units>1?"s":"")+" : "+answer+".";
 }else{
  const step=pick([1,10,100],random);
  const base=step===100?100+Math.floor(random()*800):step===10?100+Math.floor(random()*890):100+Math.floor(random()*899);
  if(kind==="next"){
   answer=base+step;
   prompt=step===1?"Quel nombre vient juste après "+base+" ?":"Quel nombre vient "+step+" après "+base+" ?";
   hint=step===1?"Avance d’un pas. Attention au changement de dizaine ou de centaine.":"Ajoute "+step+" en surveillant les dizaines et les centaines.";
   explanation="En ajoutant "+step+" à "+base+", on obtient "+answer+".";
  }else{
   answer=base-step;
   prompt=step===1?"Quel nombre vient juste avant "+base+" ?":"Quel nombre vient "+step+" avant "+base+" ?";
   hint=step===1?"Recule d’un pas. Attention au changement de dizaine ou de centaine.":"Retire "+step+" en surveillant les dizaines et les centaines.";
   explanation="En retirant "+step+" à "+base+", on obtient "+answer+".";
  }
 }
 const distractors=shuffle([answer-100,answer-10,answer-2,answer-1,answer+1,answer+2,answer+10,answer+100],random)
  .filter(n=>n>=0&&n<=999&&n!==answer);
 const choices=[answer];
 for(const n of distractors){if(choices.length===4)break;if(!choices.includes(n))choices.push(n);}
 while(choices.length<4){const n=Math.floor(random()*1000);if(!choices.includes(n))choices.push(n);}
 return {prompt,answer,choices:shuffle(choices,random),hint,explanation};
}
export function createCompareQuestion(random=Math.random){
 // La plupart des questions restent à deux chiffres ; certaines passent à trois chiffres
 // pour obliger à comparer les centaines avant les dizaines et les unités.
 const threeDigits=random()<0.35;
 const min=threeDigits?100:10, max=threeDigits?999:99;
 const first=min+Math.floor(random()*(max-min+1));
 let second=min+Math.floor(random()*(max-min+1));
 if(second===first) second=second===max?second-1:second+1;
 const answer=Math.max(first,second),other=Math.min(first,second);
 const distractors=shuffle([answer-1,answer+1,answer-10,answer+10,other-1,other+1],random)
  .filter(n=>n>=min&&n<=max&&n!==answer&&n!==other);
 const choices=[answer,other];
 for(const candidate of distractors){if(choices.length===4)break;if(!choices.includes(candidate))choices.push(candidate);}
 while(choices.length<4){const candidate=min+Math.floor(random()*(max-min+1));if(!choices.includes(candidate))choices.push(candidate);}
 return {prompt:"Quel est le plus grand nombre : "+first+" ou "+second+" ?",answer,choices:shuffle(choices,random),hint:threeDigits?"Compare les centaines d’abord. Si elles sont égales, regarde les dizaines, puis les unités.":"Compare d’abord le chiffre des dizaines, puis celui des unités si besoin.",explanation:answer+" est plus grand que "+other+"."};
}

export const SYLLABLE_WORDS=[
 {word:"chat",picture:"🐱",syllables:1},
 {word:"vélo",picture:"🚲",syllables:2},
 {word:"lapin",picture:"🐰",syllables:2},
 {word:"tomate",picture:"🍅",syllables:3},
 {word:"banane",picture:"🍌",syllables:3},
 {word:"papillon",picture:"🦋",syllables:3},
 {word:"chocolat",picture:"🍫",syllables:3},
 {word:"maison",picture:"🏠",syllables:2},
 {word:"bateau",picture:"⛵",syllables:2},
 {word:"soleil",picture:"☀️",syllables:2},
 {word:"renard",picture:"🦊",syllables:2}, {word:"mouton",picture:"🐑",syllables:2},
 {word:"orange",picture:"🍊",syllables:2}, {word:"fromage",picture:"🧀",syllables:2},
 {word:"cabane",picture:"🛖",syllables:2}, {word:"camion",picture:"🚚",syllables:2},
 {word:"domino",picture:"🎲",syllables:3}, {word:"éléphant",picture:"🐘",syllables:3},
 {word:"crocodile",picture:"🐊",syllables:3}, {word:"dinosaure",picture:"🦕",syllables:3},
 {word:"ananas",picture:"🍍",syllables:3}, {word:"fenêtre",picture:"🪟",syllables:2},
 {word:"chapeau",picture:"👒",syllables:2}, {word:"canapé",picture:"🛋️",syllables:3},
 {word:"fourmi",picture:"🐜",syllables:2}, {word:"hibou",picture:"🦉",syllables:2},
 {word:"chaussette",picture:"🧦",syllables:2}, {word:"rivière",picture:"🏞️",syllables:2},
 {word:"poussin",picture:"🐥",syllables:2}, {word:"bonnet",picture:"🧢",syllables:2},
 {word:"abeille",picture:"🐝",syllables:2}, {word:"cerise",picture:"🍒",syllables:2},
 {word:"fraise",picture:"🍓",syllables:1}, {word:"ballon",picture:"⚽",syllables:2},
 {word:"fusée",picture:"🚀",syllables:2}, {word:"musique",picture:"🎵",syllables:2},
 {word:"koala",picture:"🐨",syllables:3}, {word:"kangourou",picture:"🦘",syllables:3},
 {word:"escargot",picture:"🐌",syllables:3}, {word:"cheval",picture:"🐴",syllables:2},
 {word:"voiture",picture:"🚗",syllables:2}, {word:"piano",picture:"🎹",syllables:2},
 {word:"marmite",picture:"🍲",syllables:2}, {word:"girafe",picture:"🦒",syllables:2},
 {word:"poisson",picture:"🐟",syllables:2}, {word:"parapluie",picture:"☂️",syllables:3},
 {word:"licorne",picture:"🦄",syllables:2},
 {word:"princesse",picture:"👸",syllables:2},
 {word:"couronne",picture:"👑",syllables:2},
 {word:"magique",picture:"✨",syllables:2},
 {word:"château",picture:"🏰",syllables:2},
 {word:"dragon",picture:"🐉",syllables:2},
 {word:"bonbon",picture:"🍬",syllables:2},
 {word:"cadeau",picture:"🎁",syllables:2},
 {word:"poulet",picture:"🐔",syllables:2},
 {word:"serpent",picture:"🐍",syllables:2},
 {word:"grenouille",picture:"🐸",syllables:2},
 {word:"pantalon",picture:"👖",syllables:3},
 {word:"biberon",picture:"🍼",syllables:3},
 {word:"arc-en-ciel",picture:"🌈",syllables:3}
];
export function createSyllableQuestion(random=Math.random){
 const item=pick(SYLLABLE_WORDS,random);
 return {word:item.word,picture:item.picture,prompt:"Combien de syllabes entends-tu dans ce mot ?",answer:item.syllables,choices:shuffle([1,2,3],random)};
}

function launch(child,mode="default"){
 const isRose=child==="rose";
 const isCompare=mode==="compare";
 document.body.className="theme-"+child;
 let round=0,question,locked=false,hintUsed=false;const seenQuestions=new Set();
 const total=5;
 const generate=()=>{let candidate,attempts=0;do{candidate=isRose?createSyllableQuestion():(isCompare?createCompareQuestion():createNumberMysteryQuestion());attempts++;}while(seenQuestions.has(isRose?candidate.word:candidate.prompt)&&attempts<100);question=candidate;seenQuestions.add(isRose?question.word:question.prompt);locked=false;hintUsed=false;};
 generate();
 function render(){
  const content=card([]);
  content.append(el("p",{class:"small",text:"Défi "+(round+1)+" sur "+total}),
   el("div",{class:"progress-track",role:"progressbar","aria-label":"Progression du défi","aria-valuemin":"0","aria-valuemax":String(total),"aria-valuenow":String(round)},el("div",{class:"progress-fill",style:"width:"+(round/total*100)+"%"})),
   el("p",{class:"lead",text:isRose?"Écoute le mot. Tape le nombre de syllabes que tu entends.":(isCompare?"Compare les deux nombres. Tu peux utiliser l’aide !":"Lis l’indice et trouve le nombre. Tu peux utiliser l’aide !")}));
  if(isRose){
   const picture=el("div",{class:"prompt",text:question.picture,"aria-label":"Image pour écouter un mot"});
   picture.style.fontSize="4rem";content.append(picture);
  }
  content.append(el("div",{class:"prompt",text:question.prompt}));
  const answers=el("div",{class:"answer-grid"});
  question.choices.forEach(choice=>answers.append(button(isRose?String(choice)+" syllabe"+(choice>1?"s":""):String(choice),()=>answer(choice),"button-soft")));
  const feedback=el("p",{class:"feedback",role:"status","aria-live":"polite"});
  content.append(answers,feedback,
   button("🔊 Réécouter",()=>speak(isRose?"Écoute le mot "+question.word+". "+question.word+". "+question.prompt:question.prompt,getState().settings.voice),"button-soft"),
   button("💡 Petit indice",()=>{if(hintUsed){feedback.textContent=isRose?"Dis le mot lentement en tapant doucement dans tes mains.":(isCompare?"Regarde d’abord le chiffre des dizaines.":"Une dizaine, c’est un groupe de dix unités.");return;}hintUsed=true;feedback.textContent=isRose?"Dis le mot lentement et tape dans tes mains pour chaque syllabe.":(isCompare?"Compare les dizaines, puis les unités si les dizaines sont égales.":"Une dizaine vaut dix unités. Décompose le nombre en dizaines et unités.");if(isRose)speak("Écoute bien : "+question.word+".",getState().settings.voice);},"button-soft"),
   button("⌂ Accueil",()=>go("home"),"icon-button"));
  replaceApp(screen(isRose?"Les syllabes dans les mots":(isCompare?"Le plus grand nombre":"Le nombre mystère"),content,{eyebrow:isRose?"Jeu d’écoute · Rose":(isCompare?"Comparer les nombres · Léon":"Numération · Léon"),home:()=>go("home")}));
  speak(isRose?"Écoute le mot "+question.word+". Combien de syllabes entends-tu ?":question.prompt,getState().settings.voice);
 }
 function answer(choice){
  if(locked)return;
  const feedback=document.querySelector(".feedback");
  if(Number(choice)!==question.answer){recordAnswer(child,false);gentleOops(getState().settings.sounds);if(feedback)feedback.textContent=isRose?pick(["On réécoute et on découpe le mot doucement.", "Essaie de dire le mot en tapant dans tes mains.", "Pas grave ! Écoutons le mot une nouvelle fois.", "On cherche ensemble les morceaux du mot."]):pick(["Pas tout à fait. Regarde l’indice et essaie encore.", "Bien essayé ! Compare les nombres ou relis l’indice.", "Ce n’est pas encore ça. Tu peux retenter tranquillement.", "On réfléchit encore un peu : l’indice peut t’aider."]);return;}
  locked=true;recordAnswer(child,true);cheer(getState().settings.sounds);successPraise(child,getState().settings.voice);
  if(feedback)feedback.textContent=isRose?pick(["Oui, bravo ! ", "Bien écouté ! ", "Super, tu as découpé le mot ! ", "Tu as trouvé ! "])+question.word+" : "+question.answer+" syllabe"+(question.answer>1?"s":"")+".":pick(["Bien trouvé ! ", "Exactement ! ", "Bravo pour ton observation ! ", "Oui, c’est le bon nombre ! "])+question.explanation;
  const buttons=[...document.querySelectorAll(".answer-grid button")];buttons.forEach(b=>b.disabled=true);
  const next=button(round===total-1?"Terminer":"Continuer",()=>{
   round++;
   if(round>=total){recordSession(child);sessionPraise(child,getState().settings.voice);const done=card([el("div",{class:"prompt",text:isRose?"🌟 Bravo pour ton écoute !":"🔎 Enquête réussie !"}),el("p",{class:"lead",text:"Tu as pris le temps d’écouter, de réfléchir et d’essayer."}),el("p",{class:"small",text:"Tu peux recommencer plus tard ou choisir une autre activité."}),button("Rejouer",()=>launch(child),"button-primary"),button("⌂ Accueil",()=>go("home"),"button-soft")]);replaceApp(screen("Défi terminé",done,{home:()=>go("home")}));return;}
   generate();render();
  },"button-primary");
  feedback?.after(next);
 }
 render();
}
export function numberMystery(){launch("leon");}
export function compareNumbers(){launch("leon","compare");}
export function syllableGame(){launch("rose");}
