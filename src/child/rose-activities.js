import {el,button,screen,card,replaceApp} from "../ui.js";
import {getState,recordAnswer,recordSession} from "../store.js";
import {speak} from "../voice.js";
import {cheer,gentleOops} from "../audio.js";
import {go} from "../router.js";
import {startActivity} from "./activities.js";
import {syllableGame} from "./learning-lab.js";

const COLORS=[["Rouge","🔴"],["Bleu","🔵"],["Jaune","🟡"],["Vert","🟢"],["Violet","🟣"],["Orange","🟠"],["Rose","🩷"],["Marron","🟤"]];
const SHAPES=[["Cercle","●","Le cercle est rond et n’a pas de coin."],["Carré","■","Le carré a quatre côtés."],["Triangle","▲","Le triangle a trois côtés et trois coins."],["Rectangle","▰","Le rectangle a quatre côtés, avec deux côtés longs et deux côtés courts."],["Ovale","⬭","L’ovale est allongé et arrondi."],["Losange","◆","Le losange ressemble à un carré penché."],["Étoile","★","L’étoile a plusieurs pointes."]];
const LETTERS=[["R","La lettre R commence le prénom Rose."],["O","La lettre O est ronde."],["S","La lettre S fait comme un petit serpent."],["E","La lettre E a trois petits traits."]];
const pick=(a,r)=>a[Math.floor(r()*a.length)];
function shuffle(a,r){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function threeChoices(items,target,random){return shuffle([target,...shuffle(items.filter(x=>x!==target),random).slice(0,2)],random);}
export function isRoseNameComplete(letters){return Array.isArray(letters)&&letters.join("")==="ROSE";}
export function getNextRoseLetter(letters){return Array.isArray(letters)&&letters.length<4?"ROSE"[letters.length]:null;}
export function createRoseQuestion(mode,random=Math.random){
 if(mode==="colors"){const t=pick(COLORS,random);const prompt=pick(["Touche le cercle "+t[0].toLowerCase()+".","Peux-tu trouver le cercle "+t[0].toLowerCase()+" ?","Montre-moi la couleur "+t[0].toLowerCase()+".","Où est le cercle "+t[0].toLowerCase()+" ?"],random);return {mode,answer:t[0],prompt,speakText:prompt,choices:threeChoices(COLORS.map(x=>x[0]),t[0],random),hint:"Regarde la couleur du cercle.",explanation:"Le cercle recherché est "+t[0].toLowerCase()+" "+t[1]};}
 if(mode==="shapes"){const t=pick(SHAPES,random);const prompt=pick(["Trouve la forme : "+t[1],"Peux-tu toucher "+t[0].toLowerCase()+" ?","Montre-moi "+(t[0]==="Étoile"?"l’étoile":"le "+t[0].toLowerCase())+".","Quelle est la forme "+t[0].toLowerCase()+" ?"],random);return {mode,answer:t[0],prompt,speakText:prompt,choices:threeChoices(SHAPES.map(x=>x[0]),t[0],random),hint:t[2],explanation:"C’est "+(t[0]==="Étoile"?"l"+String.fromCharCode(8217):"le ")+t[0].toLowerCase()+" "+t[1]};}
 if(mode==="letters"){const t=pick(LETTERS,random);const prompt=pick(["Touche la lettre "+t[0]+".","Peux-tu trouver la lettre "+t[0]+" ?","Montre-moi "+t[0]+".","Où se cache la lettre "+t[0]+" ?","Choisis la lettre "+t[0]+"."],random);return {mode,answer:t[0],prompt,speakText:prompt,choices:threeChoices(LETTERS.map(x=>x[0]),t[0],random),hint:"Regarde bien la forme de chaque lettre.",explanation:t[1]};}
 if(mode==="letter-pairs"){const t=pick(LETTERS,random);const lower=t[0].toLowerCase();const prompt=pick(["Trouve la petite lettre qui va avec "+t[0]+".","Quelle petite lettre correspond à "+t[0]+" ?","Associe "+t[0]+" à sa petite lettre.","Montre la minuscule de "+t[0]+".","Cherche la petite lettre "+lower+" qui va avec "+t[0]+"."],random);return {mode,answer:lower,prompt,speakText:prompt,choices:threeChoices(LETTERS.map(x=>x[0].toLowerCase()),lower,random),hint:"La petite lettre peut avoir une forme différente de la grande.",explanation:"La grande lettre "+t[0]+" et la petite lettre "+lower+" vont ensemble."};}
 throw new Error("Activité de Rose inconnue : "+mode);
}
export function roseMenu(){
 document.body.className="theme-rose";const content=el("div",{class:"stack"});
 content.append(el("p",{class:"lead",text:"Choisis un petit jeu. On peut s’arrêter dès qu’on en a envie !"}));
 content.append(
  card([el("h2",{text:"🦄 Compter les licornes"}),el("p",{class:"small",text:"Compter jusqu’à huit, en prenant son temps."}),button("Jouer",()=>startActivity("rose"),"button-primary")]),
  card([el("h2",{text:"🌈 Les couleurs magiques"}),el("p",{class:"small",text:"Reconnaître huit couleurs."}),button("Jouer",()=>startRoseActivity("colors"),"button-primary")]),
  card([el("h2",{text:"⭐ Les formes à retrouver"}),el("p",{class:"small",text:"Reconnaître sept formes."}),button("Jouer",()=>startRoseActivity("shapes"),"button-primary")]),
  card([el("h2",{text:"🔤 Les lettres de Rose"}),el("p",{class:"small",text:"Retrouver les lettres R, O, S et E."}),button("Jouer",()=>startRoseActivity("letters"),"button-primary")]),
  card([el("h2",{text:"🔡 Grandes et petites lettres"}),el("p",{class:"small",text:"Associer R, O, S, E aux lettres r, o, s, e."}),button("Jouer",()=>startRoseActivity("letter-pairs"),"button-primary")]),
  card([el("h2",{text:"👏 Les syllabes"}),el("p",{class:"small",text:"Écouter un mot et compter ses syllabes."}),button("Jouer",syllableGame,"button-primary")]),
  card([el("h2",{text:"✍️ Je compose mon prénom"}),el("p",{class:"small",text:"Choisir les lettres pour écrire ROSE dans le bon ordre."}),button("Composer mon prénom",startRoseWritingActivity,"button-primary")]),
  button("⌂ Accueil",()=>go("home"),"icon-button"));
 replaceApp(screen("Bonjour Rose !",content,{eyebrow:"Univers licorne",home:()=>go("home")}));
 speak("Bonjour Rose ! Choisis un petit jeu.",getState().settings.voice);
}
function startRoseActivity(mode){
 let round=0,tries=0,hintCount=0,q;const seenQuestions=new Set();const title=mode==="colors"?"Les couleurs magiques":mode==="shapes"?"Les formes à retrouver":mode==="letter-pairs"?"Grandes et petites lettres":"Les lettres de Rose";
 const generate=()=>{let candidate,attempts=0;do{candidate=createRoseQuestion(mode);attempts++;}while(seenQuestions.has(candidate.prompt)&&attempts<100);q=candidate;seenQuestions.add(q.prompt);tries=0;hintCount=0;};
 const finish=()=>{recordSession("rose");const c=card([el("p",{class:"prompt",text:"🌟 Bravo pour tes efforts !"}),el("p",{class:"lead",text:"Chaque essai t’aide à apprendre. Tu peux faire une pause."}),button("Choisir un autre jeu",roseMenu,"button-primary"),button("⌂ Accueil",()=>go("home"),"icon-button")]);replaceApp(screen("Bravo Rose !",c,{eyebrow:"Petit jeu terminé",home:()=>go("home")}));};
 const render=()=>{const c=card([]);c.append(el("p",{class:"small",text:"Petit jeu "+(round+1)+" sur 5"}),el("div",{class:"progress-track",role:"progressbar","aria-label":"Progression du jeu","aria-valuemin":"0","aria-valuemax":"5","aria-valuenow":String(round)},el("div",{class:"progress-fill",style:"width:"+(round/5*100)+"%"})),el("p",{class:"lead",text:"Regarde bien, puis touche une réponse."}),el("div",{class:"prompt",text:q.prompt}));
  const answers=el("div",{class:"answer-grid"});q.choices.forEach(choice=>{const item=mode==="colors"?COLORS.find(x=>x[0]===choice):mode==="shapes"?SHAPES.find(x=>x[0]===choice):[choice];answers.append(button(mode==="letters"||mode==="letter-pairs"?choice:item[1]+" "+choice,()=>answer(choice),"button-soft"));});
  const f=el("p",{class:"feedback",role:"status","aria-live":"polite"});c.append(answers,f,el("div",{class:"button-row"},[button("🔊 Réécouter",()=>speak(q.speakText,getState().settings.voice),"button-soft"),button("💡 Petit indice",()=>{hintCount++;f.textContent=hintCount===1?q.hint:q.explanation;},"button-soft")]),button("↩ Autres jeux",roseMenu,"button-soft"),button("⌂ Accueil",()=>go("home"),"icon-button"));replaceApp(screen(title,c,{eyebrow:"On apprend en jouant",home:()=>go("home")}));speak(q.speakText,getState().settings.voice);};
 const answer=choice=>{const ok=choice===q.answer;recordAnswer("rose",ok);if(!ok){gentleOops(getState().settings.sounds);tries++;const f=document.querySelector(".feedback");if(f)f.textContent=tries===1?pick(["Presque ! Regarde encore et essaie tranquillement.","Bien essayé ! Observe les choix une nouvelle fois.","Pas encore, mais tu peux y arriver. Regarde bien !","On prend notre temps et on retente."]):pick(["Ce n’est pas grave, on peut chercher ensemble.","Chaque essai nous apprend quelque chose !","On observe encore une fois, tout doucement.","Tu peux essayer une autre réponse."]);return;}cheer(getState().settings.sounds);const praise=pick(["Oui, bravo d’avoir regardé attentivement !","Youpi ! Tu as trouvé la bonne réponse !","Super observation !","Bien joué, tu progresses !","Exactement, quelle bonne découverte !"]);f.textContent=praise;answers.querySelectorAll("button").forEach(item=>{item.disabled=true;});const next=button(round+1>=5?"Terminer":"Question suivante",()=>{round++;if(round>=5)finish();else{generate();render();}},"button-primary");f.after(next);};
 generate();render();
}

function startRoseWritingActivity(){
 document.body.className="theme-rose";
 const model=el("div",{class:"prompt","aria-label":"Modèle du prénom Rose",text:"R O S E"});
 const chosen=[];
 const letters=["S","E","R","O"];
 const content=card([el("p",{class:"lead",text:"Regarde le modèle, puis touche les lettres pour composer ton prénom."}),model]);
 const status=el("p",{class:"feedback",role:"status","aria-live":"polite",text:"Choisis la première lettre."});
 const sequence=el("div",{class:"answer-grid","aria-label":"Lettres choisies"});
 const choices=el("div",{class:"answer-grid","aria-label":"Lettres à choisir"});
 const draw=()=>{
  sequence.replaceChildren();
  sequence.append(...Array.from({length:4},(_,i)=>el("div",{class:"prompt",text:chosen[i]||"·","aria-label":chosen[i]||"Case vide"})));
  choices.replaceChildren();
  letters.filter(letter=>!chosen.includes(letter)).forEach(letter=>choices.append(button(letter,()=>{
   if(letter!==getNextRoseLetter(chosen)){
    gentleOops(getState().settings.sounds);
    status.textContent="Regarde le modèle : quelle lettre vient maintenant ? Tu peux essayer une autre lettre.";
    return;
   }
   chosen.push(letter);
   if(chosen.length===4){
    if(isRoseNameComplete(chosen)){recordSession("rose");cheer(getState().settings.sounds);status.textContent="🌟 Tu as écrit ROSE ! Bravo, tu peux recommencer ou retourner aux jeux.";speak("Bravo ! Tu as écrit Rose.",getState().settings.voice);}
    else {status.textContent="Bien essayé ! Regarde le modèle. Tu peux effacer et recommencer tranquillement.";}
   }else {cheer(getState().settings.sounds);status.textContent="Bien joué ! Quelle lettre vient ensuite ?";}
   draw();
  },"button-soft")));
  content.replaceChildren(el("p",{class:"lead",text:"Regarde le modèle, puis touche les lettres pour composer ton prénom."}),model,sequence,choices,status,
   button("↩ Effacer et recommencer",()=>{chosen.splice(0);status.textContent="Choisis la première lettre.";draw();},"button-soft"),
   button("Autres jeux",roseMenu,"button-soft"),
   button("⌂ Accueil",()=>go("home"),"icon-button"));
 };
 draw();
 replaceApp(screen("Je compose mon prénom",content,{eyebrow:"Écriture en jouant",home:()=>go("home")}));
 speak("Regarde le modèle : R O S E. Choisis les lettres dans le bon ordre.",getState().settings.voice);
}
