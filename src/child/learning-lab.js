import { el, button, screen, card, replaceApp, showGameNext } from "../ui.js";
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
   prompt=step===1?"Quel nombre vient juste après "+base+" ?":"Quel nombre est placé "+step+" unités après "+base+" ?";
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
  if(Number(choice)!==question.answer){recordAnswer(child,false);gentleOops(getState().settings.sounds);if(feedback)feedback.textContent=isRose?pick(["On réécoute et on découpe le mot doucement.", "Essaie de dire le mot en tapant dans tes mains.", "Pas grave ! Écoutons le mot une nouvelle fois.", "On cherche ensemble les syllabes du mot."]):pick(["Pas tout à fait. Regarde l’indice et essaie encore.", "Bien essayé ! Compare les nombres ou relis l’indice.", "Ce n’est pas encore ça. Tu peux retenter tranquillement.", "On réfléchit encore un peu : l’indice peut t’aider."]);return;}
  locked=true;recordAnswer(child,true);cheer(getState().settings.sounds);if(feedback)feedback.textContent=isRose?pick(["Bravo ! ", "Bien écouté ! ", "Super ! ", "Tu as trouvé ! "])+question.answer+" syllabe"+(question.answer>1?"s":"")+" dans "+question.word+".":pick(["Bien trouvé ! ", "Exactement ! ", "Bravo ! ", "Oui, c’est ça ! "])+question.explanation;
  successPraise(child,getState().settings.voice,feedback?.textContent||"Bravo, tu as trouvé !");
  const buttons=[...document.querySelectorAll(".answer-grid button")];buttons.forEach(b=>b.disabled=true);
  const next=button(round===total-1?"Terminer":"Continuer",()=>{
   round++;
   if(round>=total){recordSession(child);sessionPraise(child,getState().settings.voice);const done=card([el("div",{class:"prompt",text:isRose?"🌟 Bravo pour ton écoute !":"🔎 Enquête réussie !"}),el("p",{class:"lead",text:"Tu as pris le temps d’écouter, de réfléchir et d’essayer."}),el("p",{class:"small",text:isRose?"🎖️ Badge de la partie : Oreille de fée !":"🏅 Badge de la partie : Détective des nombres ! "}),el("p",{class:"lead",text:pick(["🎉 Surprise ! Tu as gagné le pouvoir de l’œil attentif !","✨ Petit bonus : ta curiosité est ton super-pouvoir !","🚀 Bravo pour tes efforts, détective !"])}),el("p",{class:"small",text:"Tu peux recommencer plus tard ou choisir une autre activité."}),button("Rejouer",()=>launch(child),"button-primary"),button("⌂ Accueil",()=>go("home"),"button-soft")]);replaceApp(screen("Défi terminé",done,{home:()=>go("home")}));return;}
   generate();render();
  },"button-primary");
  showGameNext(next, feedback);
 }
 render();
}
export function numberMystery(){launch("leon");}
export function compareNumbers(){launch("leon","compare");}
export function syllableGame(){launch("rose");}

const SEQUENCE_SYMBOLS=[["⚽","🏆"],["🔵","🟡"],["🐱","🐶","🐸"],["⭐","🌙","☀️"],["🚲","🛴","🛼"],["🥅","⚽","🥅"],["🍎","🍐","🍌"],["🚒","🚓","🚑"],["🐢","🐰","🦊"],["🎾","🏒","⚽"]];
export function createSequenceQuestion(level=1,random=Math.random){
 const shuffleChoices=(answer,candidates)=>shuffle([...new Set([answer,...candidates])].filter(v=>v!==undefined).slice(0,4),random);
 if(level<=2){
  const pattern=pick(level===1?SEQUENCE_SYMBOLS.slice(0,2):SEQUENCE_SYMBOLS.slice(2),random);
  const length=level===1?2:3;
  const sequence=Array.from({length:level===1?5:7},(_,i)=>pattern[i%length]);
  const answer=pattern[sequence.length%length];
  const candidates=shuffle(pattern.filter(v=>v!==answer).concat(SEQUENCE_SYMBOLS.flat().filter(v=>!pattern.includes(v))),random);
  return {sequence,prompt:"Quel symbole vient ensuite ?",answer,choices:shuffleChoices(answer,candidates),hint:"Observe les symboles depuis le début : le motif recommence-t-il ?",explanation:"Le motif se répète toujours dans le même ordre. Le prochain symbole est "+answer+"."};
 }
 const step=level===3?pick([2,5,10],random):pick([3,4,6,9],random);
 const start=level===3?pick([1,3,10,20],random):pick([2,5,11,20,30],random);
 const length=5;const sequence=Array.from({length},(_,i)=>start+step*i);const answer=start+step*length;
 const candidates=[answer-step,answer+step,answer+1,answer+10,answer+2*step];
 const prompt=pick(["Quel nombre vient ensuite ?","Quel est le prochain nombre de la suite ?","Continue la suite : quel nombre manque ?"],random);
 return {sequence,prompt,answer,choices:shuffleChoices(answer,candidates),hint:"Regarde de combien le nombre augmente à chaque étape.",explanation:"On ajoute "+step+" à chaque fois : le nombre suivant est "+answer+"."};
}
export function sequenceGame(){
 document.body.className="theme-leon";let round=0,level=1,question,locked=false;const total=5;let streak=0,hadError=false,levelMessage="On commence tranquillement : observe le motif.";const seen=new Set();
 function generate(){
  if(round>0){
   if(hadError){level=Math.max(1,level-1);levelMessage="On reprend un peu plus doucement : tu peux y arriver !";}
   else if(streak>=2){level=Math.min(4,level+1);levelMessage="Deux réussites d’affilée : on tente un niveau supérieur !";}
   else{levelMessage="Bien joué, on continue à ce niveau.";}
  }
  hadError=false;let attempts=0,signature;
  do{question=createSequenceQuestion(level);signature=JSON.stringify([question.sequence,question.answer]);attempts++;}while(seen.has(signature)&&attempts<100);
  seen.add(signature);locked=false;
 }
 function render(){let hintUsed=false;const content=card([]);content.append(el("p",{class:"small",text:"Mission "+(round+1)+" sur "+total+" · Niveau "+level}),el("p",{class:"small",text:levelMessage}),el("div",{class:"progress-track",role:"progressbar","aria-label":"Progression du défi","aria-valuemin":"0","aria-valuemax":String(total),"aria-valuenow":String(round)},el("div",{class:"progress-fill",style:"width:"+(round/total*100)+"%"})),el("p",{class:"lead",text:"Observe bien la suite et trouve ce qui vient après."}));
 const sequence=el("div",{class:"prompt","aria-label":"Suite à observer"});sequence.style.fontSize="2.4rem";sequence.style.display="flex";sequence.style.flexWrap="wrap";sequence.style.justifyContent="center";sequence.style.gap=".5rem";question.sequence.forEach(v=>sequence.append(el("span",{text:typeof v==="number"?String(v):v})));sequence.append(el("span",{text:"❓","aria-label":"élément manquant"}));content.append(sequence,el("p",{class:"lead",text:question.prompt}));const answers=el("div",{class:"answer-grid"});question.choices.forEach(choice=>answers.append(button(String(choice),()=>answer(choice),"button-soft")));const feedback=el("p",{class:"feedback",role:"status","aria-live":"polite"});content.append(answers,feedback,button("💡 Petit indice",()=>{if(!hintUsed){feedback.textContent=question.hint;speak(question.hint,getState().settings.voice);hintUsed=true;}else{feedback.textContent=question.explanation;speak(question.explanation,getState().settings.voice);}}, "button-soft"),button("⌂ Accueil",()=>go("home"),"icon-button"));replaceApp(screen("Les suites logiques",content,{eyebrow:"Logique · Léon",home:()=>go("home")}));speak("Observe la suite : "+question.sequence.join(", ")+". "+question.prompt,getState().settings.voice);}
 function answer(choice){if(locked)return;const feedback=document.querySelector(".feedback");if(choice!==question.answer){recordAnswer("leon",false);hadError=true;streak=0;gentleOops(getState().settings.sounds);const message=pick(["Bien essayé ! Observe le motif ou l’écart entre les nombres, puis retente.","Tu explores une piste ! Regarde encore la suite, tu peux essayer une autre réponse.","Pas de souci : cherche ce qui se répète ou ce qui change à chaque étape.","On continue l’enquête ensemble ! Un petit indice peut t’aider."]);if(feedback)feedback.textContent=message;speak(message+" "+question.hint,getState().settings.voice);return;}locked=true;if(hadError)streak=0;else streak++;recordAnswer("leon",true);cheer(getState().settings.sounds);if(feedback)feedback.textContent="Bravo ! "+question.explanation;successPraise("leon",getState().settings.voice,feedback?.textContent||"Bravo !");document.querySelectorAll(".answer-grid button").forEach(b=>b.disabled=true);const next=button(round===total-1?"Terminer":"Continuer",()=>{round++;if(round>=total){recordSession("leon");sessionPraise("leon",getState().settings.voice);const done=card([el("div",{class:"prompt",text:"🧩 Mission logique réussie !"}),el("p",{class:"lead",text:"Tu as observé, cherché et trouvé les règles des suites."}),el("p",{class:"small",text:"🏅 Badge de la partie : Détective des motifs !" }),el("p",{class:"lead",text:pick(["🎉 Surprise ! Tu repères les motifs comme un pro !","✨ Bonus logique : ton cerveau a fait des étincelles !","🚀 Nouvelle mission accomplie, champion !"])}),button("Rejouer",()=>sequenceGame(),"button-primary"),button("⌂ Accueil",()=>go("home"),"button-soft")]);replaceApp(screen("Défi terminé",done,{home:()=>go("home")}));return;}generate();render();},"button-primary"); showGameNext(next, feedback);}
 generate();render();
}


export function geometryGame(){
 document.body.className="theme-leon";let round=0,locked=false,question;const total=5;let attempts=0;
 const sets=[
  {level:"Repère les formes",prompt:"Quelle forme a 3 côtés ?",visual:"🔺　🟦　⚪",answer:"Le triangle",choices:["Le carré","Le triangle","Le cercle","Le rectangle"],hint:"Compte les côtés : un triangle en a trois.",explanation:"Le triangle a 3 côtés."},
  {level:"Repère les formes",prompt:"Quelle forme n’a aucun sommet ?",visual:"🟦　🔺　⚪",answer:"Le cercle",choices:["Le cercle","Le triangle","Le carré","Le rectangle"],hint:"Cherche la forme toute ronde.",explanation:"Le cercle n’a aucun sommet."},
  {level:"Observe les côtés",prompt:"Combien de côtés a un rectangle ?",visual:"▭",answer:"4 côtés",choices:["3 côtés","4 côtés","5 côtés","6 côtés"],hint:"Fais le tour du rectangle avec ton doigt.",explanation:"Un rectangle a 4 côtés."},
  {level:"Observe les côtés",prompt:"Un carré a 4 côtés égaux. Vrai ou faux ?",visual:"🟦",answer:"Vrai",choices:["Vrai","Faux"],hint:"Dans un carré, chaque côté a la même longueur.",explanation:"C’est vrai : les quatre côtés du carré ont la même longueur."},
  {level:"Petite construction",prompt:"Pour tracer un segment droit entre A et B, quel outil t’aide le mieux ?",visual:"A • ───── • B",answer:"Une règle",choices:["Une règle","Un pinceau","Une gomme","Un dé"],hint:"Choisis l’outil avec un bord bien droit.",explanation:"La règle permet de tracer un segment droit entre A et B."}
 ];
 function render(){question=sets[round];locked=false;attempts=0;const content=card([]);content.append(el("p",{class:"small",text:"Mission "+(round+1)+" sur "+total}),el("div",{class:"progress-track",role:"progressbar","aria-label":"Progression du défi","aria-valuemin":"0","aria-valuemax":String(total),"aria-valuenow":String(round)},el("div",{class:"progress-fill",style:"width:"+(round/total*100)+"%"})),el("p",{class:"small",text:question.level}));const visual=el("div",{class:"prompt",text:question.visual,"aria-label":"Illustration géométrique"});visual.style.fontSize="2.6rem";content.append(visual,el("p",{class:"lead",text:question.prompt}));const answers=el("div",{class:"answer-grid"});shuffle(question.choices).forEach(choice=>answers.append(button(choice,()=>answer(choice),"button-soft")));const feedback=el("p",{class:"feedback",role:"status","aria-live":"polite"});content.append(answers,feedback,button("💡 Petit indice",()=>{feedback.textContent=question.hint;},"button-soft"),button("⌂ Accueil",()=>go("home"),"icon-button"));replaceApp(screen("Géométrie des champions",content,{eyebrow:"Observer · reconnaître · construire",home:()=>go("home")}));speak(question.prompt,getState().settings.voice);}
 function answer(choice){if(locked)return;const feedback=document.querySelector(".feedback");if(choice!==question.answer){recordAnswer("leon",false);attempts++;gentleOops(getState().settings.sounds);if(feedback)feedback.textContent=attempts>=2?"La bonne réponse est : "+question.answer+". Regarde bien l’explication, puis sélectionne cette réponse pour continuer. 📐":"Bien essayé ! Regarde la forme ou relis la consigne, puis retente.";if(attempts>=2)speak("La bonne réponse est "+question.answer+". Tu peux la sélectionner et continuer tranquillement.",getState().settings.voice);return;}locked=true;recordAnswer("leon",true);cheer(getState().settings.sounds);if(feedback)feedback.textContent="Bravo ! "+question.explanation;successPraise("leon",getState().settings.voice,feedback?.textContent||"Bravo !");document.querySelectorAll(".answer-grid button").forEach(b=>b.disabled=true);const next=button(round===total-1?"Terminer":"Continuer",()=>{round++;if(round>=total){recordSession("leon");sessionPraise("leon",getState().settings.voice);const done=card([el("div",{class:"prompt",text:"📐 Défi géométrique réussi !"}),el("p",{class:"lead",text:"Tu as observé les formes et découvert comment les tracer."}),el("p",{class:"small",text:"🏅 Badge de la partie : Œil de lynx des formes !" }),el("p",{class:"lead",text:pick(["🎉 Surprise ! Tu as l’œil d’un vrai géomètre !","✨ Bonus précision : la règle est dans ton équipe !","🚀 Les formes n’ont plus beaucoup de secrets pour toi !"])}),button("Rejouer",()=>geometryGame(),"button-primary"),button("⌂ Accueil",()=>go("home"),"button-soft")]);replaceApp(screen("Défi terminé",done,{home:()=>go("home")}));return;}render();},"button-primary"); showGameNext(next, feedback);}
 render();
}

export function footballAdventure(){
 document.body.className="theme-leon";let round=0,locked=false,attempts=0;const total=5;
 const scenes=[
  {title:"Le grand match",story:"C’est le jour de la finale ! Léon arrive au stade avec son équipe. Le coach lui confie le brassard de capitaine.",question:"Que reçoit Léon ?",answer:"Le brassard de capitaine",choices:["Un nouveau vélo","Le brassard de capitaine","Une paire de patins","Un livre de recettes"],hint:"Relis la dernière phrase."},
  {title:"Le vestiaire",story:"Avant le match, Léon vérifie le sac. Il y trouve deux maillots, trois bouteilles d’eau et un ballon.",question:"Combien de bouteilles d’eau y a-t-il ?",answer:"3",choices:["2","3","4","5"],hint:"Compte les bouteilles indiquées dans le texte."},
  {title:"La passe décisive",story:"Le coup d’envoi est donné. Un défenseur approche. Léon lève la tête et voit Sami libre près du but.",question:"Quelle est la meilleure décision pour aider son équipe ?",answer:"Faire une passe à Sami",choices:["Fermer les yeux","Faire une passe à Sami","Sortir du terrain","Cacher le ballon"],hint:"Léon a repéré un coéquipier libre près du but."},
  {title:"Une équipe maligne",story:"Sami reçoit la passe. Le gardien avance, mais un partenaire est mieux placé sur le côté droit.",question:"Que peut faire Sami pour créer une occasion ?",answer:"Passer au partenaire libre",choices:["Passer au partenaire libre","Rester immobile jusqu’à demain","Envoyer le ballon dans les tribunes","Prendre le ballon avec les mains"],hint:"Cherche la solution qui aide l’équipe à avancer."},
  {title:"Le but !",story:"Le partenaire tire et marque ! Toute l’équipe célèbre le but. Le coach félicite Léon pour son observation et ses passes.",question:"Pourquoi le coach félicite-t-il Léon ?",answer:"Il a bien observé et aidé son équipe",choices:["Il a joué tout seul","Il a bien observé et aidé son équipe","Il a caché le ballon","Il a oublié le match"],hint:"Le coach parle de l’observation et des passes de Léon."}
 ];
 function render(){locked=false;attempts=0;const scene=scenes[round];const content=card([]);content.append(el("p",{class:"small",text:"Aventure "+(round+1)+" sur "+total}),el("div",{class:"progress-track",role:"progressbar","aria-label":"Progression de l’aventure","aria-valuemin":"0","aria-valuemax":String(total),"aria-valuenow":String(round)},el("div",{class:"progress-fill",style:"width:"+(round/total*100)+"%"})),el("h2",{text:"⚽ "+scene.title}),el("p",{class:"lead",text:scene.story}),el("p",{class:"lead",text:scene.question}));const answers=el("div",{class:"answer-grid"});shuffle(scene.choices).forEach(choice=>answers.append(button(choice,()=>answer(choice),"button-soft")));const feedback=el("p",{class:"feedback",role:"status","aria-live":"polite"});content.append(answers,feedback,button("💡 Indice du coach",()=>{feedback.textContent=scene.hint;},"button-soft"),button("⌂ Accueil",()=>go("home"),"icon-button"));replaceApp(screen("L’aventure du match",content,{eyebrow:"Lecture · compréhension · football",home:()=>go("home")}));speak(scene.story+" "+scene.question,getState().settings.voice);}
 function answer(choice){if(locked)return;const scene=scenes[round],feedback=document.querySelector(".feedback");if(choice!==scene.answer){recordAnswer("leon",false);attempts++;gentleOops(getState().settings.sounds);if(feedback)feedback.textContent=attempts>=2?"La bonne réponse est : "+scene.answer+". Pas grave, champion ! Choisis-la pour continuer. ⚽":"Bien tenté, champion ! Relis l’histoire ou demande un indice, puis essaie encore.";if(attempts>=2)speak("La bonne réponse est "+scene.answer+". Choisis-la pour continuer, champion.",getState().settings.voice);return;}locked=true;recordAnswer("leon",true);cheer(getState().settings.sounds);if(feedback)feedback.textContent="Bien joué ! Tu fais avancer l’aventure. ⚽";successPraise("leon",getState().settings.voice,feedback?.textContent||"Bien joué !");document.querySelectorAll(".answer-grid button").forEach(b=>b.disabled=true);const next=button(round===total-1?"Découvrir la fin":"Continuer l’aventure",()=>{round++;if(round>=total){recordSession("leon");sessionPraise("leon",getState().settings.voice);const done=card([el("div",{class:"prompt",text:"🏆 Victoire !"}),el("p",{class:"lead",text:"L’équipe a gagné grâce à l’observation, aux bonnes décisions et à l’entraide."}),el("p",{class:"small",text:"⚽ Badge de la partie : Coéquipier en or !" }),el("p",{class:"lead",text:pick(["🎉 Surprise ! Le public applaudit ton esprit d’équipe !","⚽ Bonus du coach : passe décisive pour ta persévérance !","🏆 Tu gagnes le brassard du super coéquipier !"])}),el("p",{class:"small",text:"Tu as lu, compris et aidé ton équipe à chaque étape."}),button("Rejouer l’aventure",()=>footballAdventure(),"button-primary"),button("⌂ Accueil",()=>go("home"),"button-soft")]);replaceApp(screen("La coupe des champions",done,{home:()=>go("home")}));return;}render();},"button-primary"); showGameNext(next, feedback);}
 render();
}

export function roseMagicAdventure(){
 document.body.className="theme-rose";let round=0,locked=false,attempts=0;const total=5;
 const scenes=[
  {title:"La porte enchantée",story:"Rose rencontre une petite licorne devant une porte brillante. La porte s’ouvre quand on trouve la première lettre de ROSE.",storyVariants:["Une petite licorne attend Rose devant une porte qui scintille. Pour l’ouvrir, il faut trouver la première lettre de ROSE.","Ding ding ! Une porte magique brille devant Rose. La licorne demande la première lettre de son prénom pour entrer."] ,question:"Quelle lettre commence le prénom ROSE ?",answer:"R",choices:["R","O","S","E"],hint:"Dis doucement le prénom Rose et écoute son tout premier son."},
  {title:"Le chaton étoilé",story:"Un chat magique a perdu trois étoiles. Rose en retrouve une sous une fleur et une autre près du ruisseau.",storyVariants:["Miaou ! Le chaton étoilé cherche ses étoiles. Rose en découvre une sous une fleur et une autre près de l’eau.","Le petit chat magique a égaré ses étoiles : Rose en retrouve une dans l’herbe et une près du ruisseau."] ,question:"Combien d’étoiles Rose a-t-elle retrouvées ?",answer:"2",choices:["1","2","3"],hint:"Compte une étoile, puis encore une."},
  {title:"Le pont des couleurs",story:"Pour traverser, la licorne demande de montrer la couleur du soleil dans un dessin.",storyVariants:["Un arc-en-ciel apparaît au-dessus du pont. La licorne demande à Rose de retrouver la couleur du soleil.","Le pont magique attend sa couleur préférée : Rose doit montrer la couleur qui ressemble au soleil."] ,question:"Quelle couleur ressemble au soleil dans ce jeu ?",answer:"Jaune",choices:["Bleu","Jaune","Vert","Violet"],hint:"Regarde le soleil dans le ciel quand il fait beau."},
  {title:"Les lettres du coffre",story:"Un petit coffre magique porte le prénom ROSE. Pour l’ouvrir, il faut retrouver la lettre qui se trouve entre R et S.",storyVariants:["Un coffre couvert d’étoiles affiche R-O-S-E. Pour l’ouvrir, Rose doit retrouver la lettre entre R et S.","Le chaton a caché un trésor dans un coffre. Les lettres de ROSE sont la clé : laquelle se trouve entre R et S ?"] ,question:"Quelle lettre est entre R et S dans ROSE ?",answer:"O",choices:["R","O","S","E"],hint:"Dis les lettres dans l’ordre : R… O… S… E."},
  {title:"Le vœu de la licorne",story:"La licorne remercie Rose. Pour faire apparaître la dernière lumière, elle lui demande de retrouver la dernière lettre de son prénom.",storyVariants:["La licorne offre un sourire à Rose. Une dernière lumière va briller si elle retrouve la dernière lettre de son prénom.","La magie du royaume est presque complète ! La licorne demande à Rose la toute dernière lettre de ROSE."] ,question:"Quelle est la dernière lettre de ROSE ?",answer:"E",choices:["R","O","S","E"],hint:"Regarde le prénom : R-O-S-E. Quelle lettre est tout à la fin ?"}
 ];
 function render(){locked=false;attempts=0;const scene=scenes[round];const story=pick(scene.storyVariants||[scene.story]);const content=card([]);content.append(el("p",{class:"small",text:"Étape magique "+(round+1)+" sur "+total}),el("div",{class:"progress-track",role:"progressbar","aria-label":"Progression de l’aventure","aria-valuemin":"0","aria-valuemax":String(total),"aria-valuenow":String(round)},el("div",{class:"progress-fill",style:"width:"+(round/total*100)+"%"})),el("div",{class:"prompt",text:"🦄 ✨ 🐱", "aria-label":"Licorne et chat magique"}),el("h2",{text:scene.title}),el("p",{class:"lead",text:story}),el("p",{class:"lead",text:scene.question}));const answers=el("div",{class:"answer-grid"});shuffle(scene.choices).forEach(choice=>answers.append(button(choice,()=>answer(choice),"button-soft")));const feedback=el("p",{class:"feedback",role:"status","aria-live":"polite"});content.append(answers,feedback,button("✨ Un indice magique",()=>{feedback.textContent=scene.hint;} ,"button-soft"),button("⌂ Accueil",()=>go("home"),"icon-button"));replaceApp(screen("L’aventure de Rose",content,{eyebrow:"Lettres · observation · magie",home:()=>go("home")}));speak(story+" "+scene.question,getState().settings.voice);}
 function answer(choice){if(locked)return;const scene=scenes[round],feedback=document.querySelector(".feedback");if(choice!==scene.answer){recordAnswer("rose",false);attempts++;gentleOops(getState().settings.sounds);if(feedback)feedback.textContent=attempts>=2?"La réponse magique est : "+scene.answer+". Tu peux la choisir, petite magicienne ! ✨":"Ce n’est pas grave, petite magicienne ! Écoute l’indice et essaie encore.";if(attempts>=2)speak("La réponse magique est "+scene.answer+". Tu peux la choisir, petite magicienne.",getState().settings.voice);return;}locked=true;recordAnswer("rose",true);cheer(getState().settings.sounds);if(feedback)feedback.textContent="Bravo Rose ! La magie avance grâce à toi ! ✨";successPraise("rose",getState().settings.voice,feedback?.textContent||"Bravo Rose !");document.querySelectorAll(".answer-grid button").forEach(b=>b.disabled=true);const next=button(round===total-1?"Découvrir la magie":"Continuer",()=>{round++;if(round>=total){recordSession("rose");sessionPraise("rose",getState().settings.voice);const done=card([el("div",{class:"prompt",text:"🌈 🦄 ✨"}),el("h2",{text:"Le royaume est illuminé !"}),el("p",{class:"lead",text:"Tu as retrouvé les lettres, compté les étoiles et aidé tes amis magiques."}),el("p",{class:"small",text:"✨ Badge magique de la partie : Gardienne des étoiles !" }),el("p",{class:"lead",text:pick(["🌟 Surprise magique : les étoiles dansent pour toi !","🦄 Bonus enchanté : ton imagination fait briller le royaume !","🐱 Le chat magique ronronne : mission merveilleuse !"])}),button("Rejouer l’aventure",()=>roseMagicAdventure(),"button-primary"),button("⌂ Accueil",()=>go("home"),"button-soft")]);replaceApp(screen("Bravo, Rose !",done,{home:()=>go("home")}));return;}render();},"button-primary"); showGameNext(next, feedback);}
 render();
}


const PROGRAM_COMMANDS = [
 {id:"right",symbol:"➡️",dx:1,dy:0},
 {id:"down",symbol:"⬇️",dx:0,dy:1},
 {id:"left",symbol:"⬅️",dx:-1,dy:0},
 {id:"up",symbol:"⬆️",dx:0,dy:-1}
];
function validRoutes(length){
 const found=[];
 function walk(route,x,y){
  if(route.length===length){found.push({route:[...route],x,y});return;}
  for(const command of PROGRAM_COMMANDS){
   const nx=x+command.dx,ny=y+command.dy;
   if(nx>=0&&nx<=2&&ny>=0&&ny<=2)walk([...route,command.id],nx,ny);
  }
 }
 walk([],0,0);
 return found;
}
export function createProgrammingQuestion(random=Math.random){
 const targetX=1+Math.floor(random()*2),targetY=1+Math.floor(random()*2);
 const correct=shuffle([...Array(targetX).fill("right"),...Array(targetY).fill("down")],random);
 const length=correct.length;
 const alternatives=validRoutes(length).filter(item=>item.x!==targetX||item.y!==targetY);
 const distractors=[];
 while(alternatives.length&&distractors.length<2){
  const index=Math.min(alternatives.length-1,Math.floor(random()*alternatives.length));
  const candidate=alternatives.splice(index,1)[0];
  if(candidate.route.join(",")!==correct.join(",")&&!distractors.some(item=>item.join(",")===candidate.route.join(",")))distractors.push(candidate.route);
 }
 for(const item of validRoutes(length)){
  if(distractors.length===2)break;
  if((item.x!==targetX||item.y!==targetY)&&item.route.join(",")!==correct.join(",")&&!distractors.some(route=>route.join(",")===item.route.join(",")))distractors.push(item.route);
 }
 const label=route=>route.map(id=>PROGRAM_COMMANDS.find(item=>item.id===id).symbol).join(" ");
 return {
  target:{x:targetX,y:targetY},
  prompt:"Le robot part de la case verte. Quelle suite de commandes l’amène sur l’étoile ?",
  answer:label(correct),
  choices:shuffle([correct,...distractors],random).map(label),
  hint:"Compte les cases : va à droite pour avancer en largeur et en bas pour descendre.",
  explanation:"Le robot doit avancer de "+targetX+" case"+(targetX>1?"s":"")+" à droite et descendre de "+targetY+" case"+(targetY>1?"s":"")+"."
 };
}
export function programmingGame(){
 document.body.className="theme-leon";
 let round=0,locked=false,attempts=0,question;
 const total=4,seen=new Set();
 function generate(){
  locked=false;attempts=0;
  let candidate,tries=0;
  do{candidate=createProgrammingQuestion();tries++;}
  while(seen.has(candidate.target.x+","+candidate.target.y)&&tries<30);
  question=candidate;seen.add(question.target.x+","+question.target.y);
 }
 function render(){
  const content=card([]);
  content.append(el("p",{class:"small",text:"Mission code "+(round+1)+" sur "+total+" · Des flèches, de la logique et pas de pression !"}));
  content.append(el("div",{class:"progress-track",role:"progressbar","aria-label":"Progression du jeu de programmation","aria-valuemin":"0","aria-valuemax":String(total),"aria-valuenow":String(round)},el("div",{class:"progress-fill",style:"width:"+(round/total*100)+"%"})));
  const cells=[];
  for(let y=0;y<3;y++)for(let x=0;x<3;x++){
   const isStart=x===0&&y===0,isTarget=x===question.target.x&&y===question.target.y;
   cells.push(el("div",{class:"programming-cell",style:"min-height:54px;display:grid;place-items:center;border:2px solid "+(isStart?"#16865c":isTarget?"#d9a400":"#d9e2ec")+";border-radius:14px;background:"+(isStart?"#d8f7e7":isTarget?"#fff2b8":"#f4f7fb")+";font-size:26px",text:isStart?"🤖":isTarget?"⭐":"·","aria-label":isStart?"Départ":isTarget?"Étoile à atteindre":"Case vide"}));
  }
  content.append(el("div",{class:"programming-grid",style:"display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;max-width:230px;margin:12px auto",role:"group","aria-label":"Grille du robot"},cells));
  content.append(el("p",{class:"lead",text:question.prompt}));
  const answers=el("div",{class:"answer-grid"});
  question.choices.forEach(choice=>answers.append(button(choice,()=>answer(choice),"button-soft")));
  const feedback=el("p",{class:"feedback",role:"status","aria-live":"polite"});
  content.append(answers,feedback,button("💡 Indice du robot",()=>{feedback.textContent=question.hint;speak(question.hint,getState().settings.voice);},"button-soft"),button("⌂ Accueil",()=>go("home"),"icon-button"));
  replaceApp(screen("Le petit robot programmeur",content,{eyebrow:"Logique · commandes · repérage",home:()=>go("home")}));
  speak(question.prompt,getState().settings.voice);
 }
 function answer(choice){
  if(locked)return;
  const feedback=document.querySelector(".feedback");
  if(choice!==question.answer){
   recordAnswer("leon",false);attempts++;gentleOops(getState().settings.sounds);
   if(feedback)feedback.textContent=attempts>=2?"Le bon programme est : "+question.answer+". Observe le départ et l’étoile, puis choisis-le. 🤖":"Bien essayé ! Imagine le robot qui suit chaque flèche, puis recommence.";
   speak(attempts>=2?"Le bon programme est "+question.answer+". Choisis-le pour continuer.":"Bien essayé ! Observe la grille et recommence.",getState().settings.voice);
   return;
  }
  locked=true;recordAnswer("leon",true);cheer(getState().settings.sounds);
  if(feedback)feedback.textContent="Bravo ! "+question.explanation+" 🤖";
  successPraise("leon",getState().settings.voice,feedback?.textContent||"Bravo ! Le robot a trouvé son chemin.");
  document.querySelectorAll(".answer-grid button").forEach(b=>b.disabled=true);
  const next=button(round===total-1?"Terminer la mission":"Mission suivante",()=>{
   round++;
   if(round>=total){
    recordSession("leon");sessionPraise("leon",getState().settings.voice);
    const done=card([el("div",{class:"prompt",text:"🤖 ⭐ 🏆"}),el("h2",{text:"Mission code réussie !"}),el("p",{class:"lead",text:"Tu as utilisé des instructions, observé une grille et trouvé des chemins."}),el("p",{class:"small",text:"Badge de la partie : Petit programmeur !"}),button("Rejouer",()=>programmingGame(),"button-primary"),button("⌂ Accueil",()=>go("home"),"button-soft")]);
    replaceApp(screen("Bravo, programmeur !",done,{home:()=>go("home")}));return;
   }
   generate();render();
  },"button-primary"); showGameNext(next, feedback);
 }
 generate();render();
}


export const ENGLISH_WORDS = [
 {word:"cat",meaning:"chat",picture:"🐱",hint:"Le mot anglais commence par le son « k »."},
 {word:"dog",meaning:"chien",picture:"🐶",hint:"C’est un animal qui aime parfois rapporter la balle."},
 {word:"sun",meaning:"soleil",picture:"☀️",hint:"Il brille dans le ciel pendant la journée."},
 {word:"book",meaning:"livre",picture:"📘",hint:"On le lit pour découvrir une histoire."},
 {word:"red",meaning:"rouge",picture:"🔴",hint:"C’est la couleur d’un coquelicot."},
 {word:"blue",meaning:"bleu",picture:"🔵",hint:"C’est la couleur d’un ciel sans nuages."},
 {word:"apple",meaning:"pomme",picture:"🍎",hint:"C’est un fruit que l’on peut croquer."},
 {word:"house",meaning:"maison",picture:"🏠",hint:"C’est l’endroit où l’on peut habiter."},
 {word:"ball",meaning:"ballon",picture:"⚽",hint:"On peut le lancer, le faire rebondir ou jouer au foot."},
 {word:"star",meaning:"étoile",picture:"⭐",hint:"On peut en voir dans le ciel la nuit."}
];
export function createEnglishQuestion(random=Math.random,excluded=[]){
 const available=ENGLISH_WORDS.filter(item=>!excluded.includes(item.word));
 const word=available[Math.floor(random()*available.length)]||ENGLISH_WORDS[0];
 const distractors=shuffle(ENGLISH_WORDS.filter(item=>item.meaning!==word.meaning),random).slice(0,2).map(item=>item.meaning);
 return {word:word.word,meaning:word.meaning,picture:word.picture,hint:word.hint,prompt:"Écoute le mot anglais, puis trouve sa signification en français.",choices:shuffle([word.meaning,...distractors],random)};
}
export function englishGame(){
 document.body.className="theme-leon";
 let round=0,locked=false,attempts=0,question;
 const total=5,seen=[];
 function generate(){locked=false;attempts=0;question=createEnglishQuestion(Math.random,seen);seen.push(question.word);}
 function render(){
  const content=card([]);
  content.append(el("p",{class:"small",text:"English · Mot "+(round+1)+" sur "+total+" · On écoute, on cherche et on recommence si besoin."}));
  content.append(el("div",{class:"progress-track",role:"progressbar","aria-label":"Progression des mots anglais","aria-valuemin":"0","aria-valuemax":String(total),"aria-valuenow":String(round)},el("div",{class:"progress-fill",style:"width:"+(round/total*100)+"%"})));
  content.append(el("div",{class:"prompt",text:question.picture,"aria-label":"Illustration du mot anglais"}),el("p",{class:"lead",text:question.prompt}));
  const answers=el("div",{class:"answer-grid"});
  question.choices.forEach(choice=>answers.append(button(choice,()=>answer(choice),"button-soft")));
  const feedback=el("p",{class:"feedback",role:"status","aria-live":"polite"});
  content.append(answers,feedback,button("🔊 Réécouter en anglais",()=>speak(question.word,getState().settings.voice,"en-GB"),"button-soft"),button("💡 Indice",()=>{feedback.textContent=question.hint;speak(question.hint,getState().settings.voice);},"button-soft"),button("⌂ Accueil",()=>go("home"),"icon-button"));
  replaceApp(screen("Mes premiers mots en anglais",content,{eyebrow:"Écouter · comprendre · découvrir",home:()=>go("home")}));
  speak(question.word,getState().settings.voice,"en-GB");
 }
 function answer(choice){
  if(locked)return;
  const feedback=document.querySelector(".feedback");
  if(choice!==question.meaning){
   recordAnswer("leon",false);attempts++;gentleOops(getState().settings.sounds);
   if(feedback)feedback.textContent=attempts>=2?"« "+question.word+" » veut dire « "+question.meaning+" ». Choisis cette réponse pour continuer.":"Bien essayé ! Réécoute le mot anglais et cherche encore.";
   speak(attempts>=2?question.word+" means "+question.meaning+". Choose "+question.meaning+".":"Bien essayé ! Réécoute le mot anglais.",getState().settings.voice,attempts>=2?"en-GB":"fr-FR");
   return;
  }
  locked=true;recordAnswer("leon",true);cheer(getState().settings.sounds);
  if(feedback)feedback.textContent="Bravo ! "+question.word+" veut dire « "+question.meaning+" ». 🇬🇧";
  successPraise("leon",getState().settings.voice,feedback?.textContent||"Bravo ! Tu découvres l’anglais.");
  document.querySelectorAll(".answer-grid button").forEach(b=>b.disabled=true);
  const next=button(round===total-1?"Terminer les mots":"Mot suivant",()=>{
   round++;
   if(round>=total){
    recordSession("leon");sessionPraise("leon",getState().settings.voice);
    const done=card([el("div",{class:"prompt",text:"🇬🇧 ⭐ 🎉"}),el("h2",{text:"Well done !"}),el("p",{class:"lead",text:"Tu as écouté cinq mots anglais et découvert leur sens."}),button("Rejouer",()=>englishGame(),"button-primary"),button("⌂ Accueil",()=>go("home"),"button-soft")]);
    replaceApp(screen("Bravo !",done,{home:()=>go("home")}));return;
   }
   generate();render();
  },"button-primary"); showGameNext(next, feedback);
 }
 generate();render();
}
