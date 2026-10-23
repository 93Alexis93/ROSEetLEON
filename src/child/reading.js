import {el,button,screen,card,replaceApp} from "../ui.js";
import {getState,recordAnswer,recordSession} from "../store.js";
import {speak} from "../voice.js";
import {go} from "../router.js";

const BASE_WORDS=["lapin","maison"," ballon","soleil","bateau","papa","maman","vélo","école","chat","livre","rose","léon","fusée","forêt","gâteau"].map(x=>x.trim());
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const syllables={lapin:"la-pin",maison:"mai-son",ballon:"bal-lon",soleil:"so-leil",bateau:"ba-teau",papa:"pa-pa",maman:"ma-man",vélo:"vé-lo",école:"é-cole",chat:"chat",livre:"livre",rose:"rose",léon:"lé-on",fusée:"fu-sée",forêt:"fo-rêt",gâteau:"gâ-teau"};

function bank(){const custom=getState().customWords.map(x=>typeof x==="string"?x:x.word).filter(Boolean);return [...new Set([...BASE_WORDS,...custom.map(x=>x.trim().toLocaleLowerCase("fr")).filter(x=>/^[a-zà-ÿ-]{2,24}$/i.test(x))])];}
function question(mode){
 const words=bank(),word=pick(words),others=shuffle(words.filter(w=>w!==word)).slice(0,3);
 if(mode==="flash")return {prompt:word,answer:word,choices:shuffle([word,...others]),hint:"Lis le mot doucement, puis repère-le parmi les propositions.",explanation:"Le mot était « "+word+" »."};
 if(mode==="mystery"){
  const parts=(syllables[word]||word.split("").join("-")).split("-");
  const shown=parts.length>1?parts.slice(0,-1).join("-")+"-…":word.slice(0,-1)+"…";
  return {prompt:"Quel mot se cache derrière : "+shown+" ?",answer:word,choices:shuffle([word,...others]),hint:"Prononce les syllabes une à une, puis rassemble-les.",explanation:"Les syllabes réunies forment « "+word+" »."};
 }
 if(mode==="sentence"){
  const sentences=[{text:"Le lapin saute dans le jardin.",answer:"Le lapin",choices:["Le lapin","Le bateau","Le gâteau"]},{text:"Maman lit un livre.",answer:"un livre",choices:["un vélo","un livre","un ballon"]},{text:"Le soleil brille.",answer:"Le soleil",choices:["La maison","Le soleil","La forêt"]},{text:"Rose roule à vélo.",answer:"à vélo",choices:["à vélo","à l’école","dans l’eau"]}];
  const s=pick(sentences);return {prompt:"Lis : « "+s.text+" »\nQue fait-on / de quoi parle la phrase ?",answer:s.answer,choices:shuffle(s.choices),hint:"Relis la phrase et cherche les mots qui donnent l'information.",explanation:"La bonne réponse est « "+s.answer+" »."};
 }
 const texts=[{text:"Léon a un ballon rouge. Il joue dans le jardin.",q:"Qu’a Léon ?",a:"Un ballon rouge",c:["Un ballon rouge","Un vélo bleu","Un livre"]},{text:"Rose voit un petit chat. Le chat dort sur le tapis.",q:"Où dort le chat ?",a:"Sur le tapis",c:["Dans le jardin","Sur le tapis","Dans la classe"]},{text:"Le matin, Mila va à l’école avec son sac.",q:"Où va Mila ?",a:"À l’école",c:["Au parc","À l’école","À la piscine"]}];
 const t=pick(texts);return {prompt:t.text+"\n\n"+t.q,answer:t.a,choices:shuffle(t.c),hint:"Cherche dans le petit texte les mots qui répondent à la question.",explanation:"Le texte nous indique : "+t.a+"."};
}

export function readingMenu(){
 document.body.className="theme-leon";const content=el("div",{class:"stack"});
 content.append(el("p",{class:"lead",text:"Des petits jeux de lecture pour lire à ton rythme. Ici, pas de note ni de chronomètre stressant."}));
 const modes=[["flash","⚡ Mots-éclairs","Reconnaître un mot rapidement"],["mystery","🔎 Mots-mystères","Assembler les syllabes"],["sentence","💬 Phrases à comprendre","Lire une phrase et trouver l’information"],["text","📖 Mini-textes","Lire quelques lignes et comprendre"]];
 modes.forEach(([id,label,desc])=>content.append(card([el("h2",{text:label}),el("p",{class:"small",text:desc}),button("Commencer",()=>startReading(id),"button-primary")])));
 content.append(button("⌂ Accueil",()=>go("home"),"icon-button"),button("↩ Autres défis de Léon",()=>go("leon"),"button-soft"));
 replaceApp(screen("Lecture avec Léon",content,{eyebrow:"Univers ballon",home:()=>go("home")}));
}
function startReading(mode){
 let round=0,score=0,hintCount=0,q;
 const labels={flash:"Mots-éclairs",mystery:"Mots-mystères",sentence:"Phrases à comprendre",text:"Mini-textes"};
 const generate=()=>{q=question(mode);hintCount=0;};
 const finish=()=>{recordSession("leon");const c=card([el("p",{class:"prompt",text:"🌟 Bravo pour tes efforts !"}),el("p",{class:"lead",text:"Tu as terminé ce petit moment de lecture."}),el("p",{class:"lead",text:"Tu as trouvé "+score+" réponse(s) du premier coup sur "+round+". Chaque essai t’aide à progresser."}),el("p",{class:"small",text:"On peut recommencer un autre jour : pas besoin d’aller vite."}),button("Autres jeux de lecture",readingMenu,"button-primary"),button("Autres défis de Léon",()=>go("leon"),"button-soft")]);replaceApp(screen("Bien joué !",c,{eyebrow:"Lecture",home:()=>go("home")}));};
 const render=()=>{
  const content=card([]);content.append(el("p",{class:"small",text:"Jeu "+(round+1)+" sur 5"}),el("div",{class:"progress-track"},el("div",{class:"progress-fill",style:"width:"+(round/5*100)+"%"})),el("p",{class:"lead",text:"Prends ton temps. Tu peux écouter et demander un indice."}),el("div",{class:"prompt",text:q.prompt}));
  const answers=el("div",{class:"answer-grid"});q.choices.forEach(a=>answers.append(button(a,()=>answer(a),"button-soft")));content.append(answers);
  const feedback=el("p",{class:"feedback",role:"status","aria-live":"polite"});content.append(feedback,el("div",{class:"button-row"},[
   button("🔊 Écouter",()=>speak(q.prompt,getState().settings.voice),"button-soft"),
   button("💡 Indice",()=>{hintCount++;feedback.textContent=hintCount===1?q.hint:q.explanation;},"button-soft")
  ]),button("⌂ Accueil",()=>go("home"),"icon-button"),button("↩ Menu lecture",readingMenu,"button-soft"));
  replaceApp(screen(labels[mode],content,{eyebrow:"Lecture sans pression",home:()=>go("home")}));
 };
 const answer=a=>{const ok=String(a)===String(q.answer);recordAnswer("leon",ok);const f=document.querySelector(".feedback");if(ok){score++;round++;if(round>=5){finish();return;}generate();render();const next=document.querySelector(".feedback");if(next)next.textContent="Bravo, tu as pris le temps de réfléchir !";}else if(f)f.textContent="Presque ! Relis tranquillement et essaie encore. Tu peux demander un indice.";};
 generate();render();
}
