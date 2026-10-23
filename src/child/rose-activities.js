import {el,button,screen,card,replaceApp} from "../ui.js";
import {getState,recordAnswer,recordSession} from "../store.js";
import {speak} from "../voice.js";
import {cheer} from "../audio.js";
import {go} from "../router.js";
import {startActivity} from "./activities.js";

const COLORS=[["Rouge","🔴"],["Bleu","🔵"],["Jaune","🟡"],["Vert","🟢"],["Violet","🟣"]];
const SHAPES=[["Cercle","●","Le cercle est rond et n’a pas de coin."],["Carré","■","Le carré a quatre côtés."],["Triangle","▲","Le triangle a trois côtés et trois coins."],["Étoile","★","L’étoile a plusieurs pointes."]];
const LETTERS=[["R","La lettre R commence le prénom Rose."],["O","La lettre O est ronde."],["S","La lettre S fait comme un petit serpent."],["E","La lettre E a trois petits traits."]];
const pick=(a,r)=>a[Math.floor(r()*a.length)];
function shuffle(a,r){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function threeChoices(items,target,random){return shuffle([target,...shuffle(items.filter(x=>x!==target),random).slice(0,2)],random);}
export function createRoseQuestion(mode,random=Math.random){
 if(mode==="colors"){const t=pick(COLORS,random);return {mode,answer:t[0],prompt:"Touche le cercle "+t[0].toLowerCase()+".",speakText:"Touche le cercle "+t[0].toLowerCase()+".",choices:threeChoices(COLORS.map(x=>x[0]),t[0],random),hint:"Regarde la couleur du cercle.",explanation:"Le cercle recherché est "+t[0].toLowerCase()+" "+t[1]};}
 if(mode==="shapes"){const t=pick(SHAPES,random);return {mode,answer:t[0],prompt:"Trouve la forme : "+t[1],speakText:"Trouve la forme "+t[0].toLowerCase()+".",choices:threeChoices(SHAPES.map(x=>x[0]),t[0],random),hint:t[2],explanation:"C’est "+(t[0]==="Étoile"?"l"+String.fromCharCode(8217):"le ")+t[0].toLowerCase()+" "+t[1]};}
 if(mode==="letters"){const t=pick(LETTERS,random);return {mode,answer:t[0],prompt:"Touche la lettre "+t[0]+".",speakText:"Touche la lettre "+t[0]+".",choices:threeChoices(LETTERS.map(x=>x[0]),t[0],random),hint:"Regarde bien la forme de chaque lettre.",explanation:t[1]};}
 if(mode==="letter-pairs"){const t=pick(LETTERS,random);const lower=t[0].toLowerCase();return {mode,answer:lower,prompt:"Trouve la petite lettre qui va avec "+t[0]+".",speakText:"Trouve la petite lettre qui va avec "+t[0]+".",choices:threeChoices(LETTERS.map(x=>x[0].toLowerCase()),lower,random),hint:"La petite lettre peut avoir une forme différente de la grande.",explanation:"La grande lettre "+t[0]+" et la petite lettre "+lower+" vont ensemble."};}
 throw new Error("Activité de Rose inconnue : "+mode);
}
export function roseMenu(){
 document.body.className="theme-rose";const content=el("div",{class:"stack"});
 content.append(el("p",{class:"lead",text:"Choisis un petit jeu. On peut s’arrêter dès qu’on en a envie !"}));
 content.append(
  card([el("h2",{text:"🦄 Compter les licornes"}),el("p",{class:"small",text:"Compter jusqu’à cinq."}),button("Jouer",()=>startActivity("rose"),"button-primary")]),
  card([el("h2",{text:"🌈 Les couleurs magiques"}),el("p",{class:"small",text:"Écouter une couleur et la retrouver."}),button("Jouer",()=>startRoseActivity("colors"),"button-primary")]),
  card([el("h2",{text:"⭐ Les formes à retrouver"}),el("p",{class:"small",text:"Reconnaître quatre formes."}),button("Jouer",()=>startRoseActivity("shapes"),"button-primary")]),
  card([el("h2",{text:"🔤 Les lettres de Rose"}),el("p",{class:"small",text:"Retrouver les lettres R, O, S et E."}),button("Jouer",()=>startRoseActivity("letters"),"button-primary")]),
  card([el("h2",{text:"🔡 Grandes et petites lettres"}),el("p",{class:"small",text:"Associer R, O, S, E aux lettres r, o, s, e."}),button("Jouer",()=>startRoseActivity("letter-pairs"),"button-primary")]),
  button("⌂ Accueil",()=>go("home"),"icon-button"));
 replaceApp(screen("Bonjour Rose !",content,{eyebrow:"Univers licorne",home:()=>go("home")}));
 speak("Bonjour Rose ! Choisis un petit jeu.",getState().settings.voice);
}
function startRoseActivity(mode){
 let round=0,tries=0,hintCount=0,q;const title=mode==="colors"?"Les couleurs magiques":mode==="shapes"?"Les formes à retrouver":mode==="letter-pairs"?"Grandes et petites lettres":"Les lettres de Rose";
 const generate=()=>{q=createRoseQuestion(mode);tries=0;hintCount=0;};
 const finish=()=>{recordSession("rose");const c=card([el("p",{class:"prompt",text:"🌟 Bravo pour tes efforts !"}),el("p",{class:"lead",text:"Chaque essai t’aide à apprendre. Tu peux faire une pause."}),button("Choisir un autre jeu",roseMenu,"button-primary"),button("⌂ Accueil",()=>go("home"),"icon-button")]);replaceApp(screen("Bravo Rose !",c,{eyebrow:"Petit jeu terminé",home:()=>go("home")}));};
 const render=()=>{const c=card([]);c.append(el("p",{class:"small",text:"Petit jeu "+(round+1)+" sur 5"}),el("div",{class:"progress-track"},el("div",{class:"progress-fill",style:"width:"+(round/5*100)+"%"})),el("p",{class:"lead",text:"Regarde bien, puis touche une réponse."}),el("div",{class:"prompt",text:q.prompt}));
  const answers=el("div",{class:"answer-grid"});q.choices.forEach(choice=>{const item=mode==="colors"?COLORS.find(x=>x[0]===choice):mode==="shapes"?SHAPES.find(x=>x[0]===choice):[choice];answers.append(button(mode==="letters"||mode==="letter-pairs"?choice:item[1]+" "+choice,()=>answer(choice),"button-soft"));});
  const f=el("p",{class:"feedback",role:"status","aria-live":"polite"});c.append(answers,f,el("div",{class:"button-row"},[button("🔊 Réécouter",()=>speak(q.speakText,getState().settings.voice),"button-soft"),button("💡 Petit indice",()=>{hintCount++;f.textContent=hintCount===1?q.hint:q.explanation;},"button-soft")]),button("↩ Autres jeux",roseMenu,"button-soft"),button("⌂ Accueil",()=>go("home"),"icon-button"));replaceApp(screen(title,c,{eyebrow:"On apprend en jouant",home:()=>go("home")}));speak(q.speakText,getState().settings.voice);};
 const answer=choice=>{const ok=choice===q.answer;recordAnswer("rose",ok);const f=document.querySelector(".feedback");if(!ok){tries++;if(f)f.textContent=tries===1?"Presque ! Regarde encore et essaie tranquillement.":"Ce n’est pas grave, on peut chercher ensemble.";return;}cheer(getState().settings.sounds);round++;if(round>=5){finish();return;}generate();render();const next=document.querySelector(".feedback");if(next)next.textContent="Oui, bravo d’avoir regardé attentivement !";};
 generate();render();
}
