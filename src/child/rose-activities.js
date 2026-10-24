import { el, button, screen, card, replaceApp, chooseExercise } from "../ui.js";
import {getState,recordAnswer,recordSession} from "../store.js";
import {speak} from "../voice.js";
import {cheer,gentleOops,successPraise,sessionPraise} from "../audio.js";
import {go} from "../router.js";
import {startActivity} from "./activities.js";
import {syllableGame} from "./learning-lab.js";

const COLORS=[["Rouge","🔴"],["Bleu","🔵"],["Jaune","🟡"],["Vert","🟢"],["Violet","🟣"],["Orange","🟠"],["Rose","🩷"],["Marron","🟤"]];
const SHAPES=[["Carré","■","Le carré a quatre côtés égaux."],["Rond","●","Le rond est tout rond et n’a pas de coin."],["Triangle","▲","Le triangle a trois côtés et trois coins."],["Rectangle","▰","Le rectangle a quatre côtés : deux longs et deux courts."]];
const LETTERS=[["R","La lettre R commence le prénom Rose."],["O","La lettre O est ronde."],["S","La lettre S fait comme un petit serpent."],["E","La lettre E a trois petits traits."]];
const LETTER_SOUNDS={R:"rrrrrrrr",O:"oooooo",S:"ssssssss",E:"eeeuuhh"};
const pick=(a,r=Math.random)=>a[Math.floor(r()*a.length)];
function shuffle(a,r){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function threeChoices(items,target,random){return shuffle([target,...shuffle(items.filter(x=>x!==target),random).slice(0,2)],random);}
export function isRoseNameComplete(letters){return Array.isArray(letters)&&letters.join("")==="ROSE";}
export function getNextRoseLetter(letters){return Array.isArray(letters)&&letters.length<4?"ROSE"[letters.length]:null;}
export function createRoseQuestion(mode,random=Math.random){
 if(mode==="colors"){const t=pick(COLORS,random);const prompt=pick(["Touche le cercle "+t[0].toLowerCase()+".","Peux-tu trouver le cercle "+t[0].toLowerCase()+" ?","Montre-moi la couleur "+t[0].toLowerCase()+".","Où est le cercle "+t[0].toLowerCase()+" ?"],random);return {mode,answer:t[0],prompt,speakText:prompt,choices:threeChoices(COLORS.map(x=>x[0]),t[0],random),hint:"Regarde la couleur du cercle.",explanation:"Le cercle recherché est "+t[0].toLowerCase()+" "+t[1]};}
 if(mode==="shapes"){const t=pick(SHAPES,random);const prompt=pick(["Trouve la forme : "+t[1],"Peux-tu toucher le "+t[0].toLowerCase()+" ?","Montre-moi le "+t[0].toLowerCase()+".","Quelle forme vois-tu ?"],random);return {mode,answer:t[0],prompt,speakText:prompt,choices:threeChoices(SHAPES.map(x=>x[0]),t[0],random),hint:t[2],explanation:"C’est "+(t[0]==="Étoile"?"l"+String.fromCharCode(8217):"le ")+t[0].toLowerCase()+" "+t[1]};}
 if(mode==="letters"){const t=pick(LETTERS,random);const prompt=pick(["Touche la lettre "+t[0]+".","Peux-tu trouver la lettre "+t[0]+" ?","Montre-moi "+t[0]+".","Où se cache la lettre "+t[0]+" ?","Choisis la lettre "+t[0]+"."],random);return {mode,answer:t[0],prompt,speakText:prompt,choices:threeChoices(LETTERS.map(x=>x[0]),t[0],random),hint:"Regarde bien la forme de chaque lettre.",explanation:t[1]};}
 if(mode==="letter-sounds"){const t=pick(LETTERS,random);const sound=LETTER_SOUNDS[t[0]];const prompt="Écoute le son, puis retrouve la lettre qui le fait.";return {mode,answer:t[0],prompt,speakText:"Écoute bien. "+sound+".",choices:threeChoices(LETTERS.map(x=>x[0]),t[0],random),hint:"Écoute encore le son, puis regarde les lettres proposées.",explanation:"C’est le son de la lettre "+t[0]+". "+t[1]};}
 if(mode==="patterns"){
  const patterns=[
   {sequence:"🔴 🔵 🔴 🔵 ?",answer:"🔴",hint:"Les couleurs alternent : rouge, bleu, rouge, bleu…",explanation:"Après le bleu, on revient au rouge."},
   {sequence:"⭐ 🌙 ⭐ 🌙 ?",answer:"⭐",hint:"Observe : étoile, lune, étoile, lune…",explanation:"Après la lune, c’est à nouveau l’étoile."},
   {sequence:"🦄 🌈 🦄 🌈 ?",answer:"🦄",hint:"La licorne et l’arc-en-ciel se relaient.",explanation:"Après l’arc-en-ciel, la licorne revient."},
   {sequence:"🍓 🍋 🍋 🍓 🍋 🍋 ?",answer:"🍓",hint:"Regarde le petit groupe : une fraise, puis deux citrons.",explanation:"Le groupe recommence par une fraise."},
   {sequence:"🔵 🔵 🟡 🔵 🔵 ?",answer:"🟡",hint:"Deux ronds bleus, puis un rond jaune.",explanation:"Après deux ronds bleus, vient le rond jaune."}
  ];
  const t=pick(patterns,random);
  return {mode,answer:t.answer,prompt:"Quelle image vient ensuite ? "+t.sequence,speakText:"Quelle image vient ensuite ? "+t.sequence,choices:threeChoices(["🔴","🔵","⭐","🌙","🦄","🌈","🍓","🍋","🟡"],t.answer,random),hint:t.hint,explanation:t.explanation};
 }
 if(mode==="letter-pairs"){const t=pick(LETTERS,random);const lower=t[0].toLowerCase();const prompt=pick(["Trouve la petite lettre qui va avec "+t[0]+".","Quelle petite lettre correspond à "+t[0]+" ?","Associe "+t[0]+" à sa petite lettre.","Montre la petite lettre de "+t[0]+".","Cherche la petite lettre "+lower+" qui va avec "+t[0]+"."],random);return {mode,answer:lower,prompt,speakText:prompt,choices:threeChoices(LETTERS.map(x=>x[0].toLowerCase()),lower,random),hint:"La petite lettre peut avoir une forme différente de la grande.",explanation:"La grande lettre "+t[0]+" et la petite lettre "+lower+" vont ensemble."};}
 throw new Error("Activité de Rose inconnue : "+mode);
}
export function roseMenu(){
 document.body.className="theme-rose";const content=el("div",{class:"stack"});
 content.append(el("p",{class:"lead",text:"Choisis un petit jeu. On peut s’arrêter dès qu’on en a envie !"}));
 content.append(
  card([el("h2",{text:"🔢 Compte le nombre d’éléments"}),el("p",{class:"small",text:"Compter des licornes, des fleurs, des animaux et plein d’autres images."}),button("Jouer",chooseExercise("Compte le nombre d’éléments en touchant chaque image pour la cocher.",()=>startActivity("rose")),"button-primary")]),
  card([el("h2",{text:"🪄 Les suites magiques"}),el("p",{class:"small",text:"Observer les répétitions et deviner quelle image vient après."}),button("Jouer",chooseExercise("Observe les images et trouve ce qui vient ensuite.",()=>startRoseActivity("patterns")),"button-primary")]),
  card([el("h2",{text:"🌈 Les couleurs magiques"}),el("p",{class:"small",text:"Reconnaître huit couleurs."}),button("Jouer",chooseExercise("Écoute la consigne puis retrouve la bonne couleur.",()=>startRoseActivity("colors")),"button-primary")]),
  card([el("h2",{text:"⭐ Les formes à retrouver"}),el("p",{class:"small",text:"Reconnaître quatre formes faciles : carré, rond, triangle et rectangle."}),button("Jouer",chooseExercise("Observe les formes et retrouve celle qui est demandée.",()=>startRoseActivity("shapes")),"button-primary")]),
  card([el("h2",{text:"🔤 Les lettres de Rose"}),el("p",{class:"small",text:"Retrouver les lettres R, O, S et E."}),button("Jouer",chooseExercise("Retrouve les lettres R, O, S et E.",()=>startRoseActivity("letters")),"button-primary")]),
  card([el("h2",{text:"🔡 Grandes et petites lettres"}),el("p",{class:"small",text:"Associer R, O, S, E aux lettres r, o, s, e."}),button("Jouer",chooseExercise("Associe chaque grande lettre à sa petite lettre.",()=>startRoseActivity("letter-pairs")),"button-primary")]),
  card([el("h2",{text:"🔊 Le son des lettres"}),el("p",{class:"small",text:"Écouter un son étiré et retrouver la lettre correspondante."}),button("Jouer",chooseExercise("Écoute le son puis touche la lettre correspondante.",()=>startRoseActivity("letter-sounds")),"button-primary")]),
  card([el("h2",{text:"👏 Les syllabes"}),el("p",{class:"small",text:"Écouter un mot et compter ses syllabes."}),button("Jouer",chooseExercise("Écoute les mots et frappe dans tes mains pour compter les syllabes.",syllableGame),"button-primary")]),
  card([el("h2",{text:"✍️ Reconstitue les prénoms"}),el("p",{class:"small",text:"Mélanger puis remettre les lettres des mots de la famille dans le bon ordre."}),button("Reconstituer",chooseExercise("Remets les lettres dans le bon ordre pour reconstituer les prénoms et les mots de la famille.",startRoseWritingActivity),"button-primary")]),
  button("⌂ Accueil",()=>go("home"),"icon-button"));
 replaceApp(screen("Bonjour Rose !",content,{eyebrow:"Univers licorne",home:()=>go("home")}));
 speak("Bonjour Rose ! Choisis un petit jeu.",getState().settings.voice);
}
export function startRoseActivity(mode){
 let round=0,tries=0,hintCount=0,q;const seenQuestions=new Set();const title=mode==="patterns"?"Les suites magiques":mode==="colors"?"Les couleurs magiques":mode==="shapes"?"Les formes à retrouver":mode==="letter-pairs"?"Grandes et petites lettres":mode==="letter-sounds"?"Le son des lettres":"Les lettres de Rose";
 const generate=()=>{let candidate,attempts=0;do{candidate=createRoseQuestion(mode);attempts++;}while(seenQuestions.has(candidate.prompt)&&attempts<100);q=candidate;seenQuestions.add(q.prompt);tries=0;hintCount=0;};
 const finish=()=>{recordSession("rose");sessionPraise("rose",getState().settings.voice);const c=card([el("p",{class:"prompt",text:"🌟 Bravo pour tes efforts !"}),el("p",{class:"lead",text:"Chaque essai t’aide à apprendre. Tu peux faire une pause."}),button("Choisir un autre jeu",roseMenu,"button-primary"),button("⌂ Accueil",()=>go("home"),"icon-button")]);replaceApp(screen("Bravo Rose !",c,{eyebrow:"Petit jeu terminé",home:()=>go("home")}));};
 const readQuestion=()=>speak(q.speakText,getState().settings.voice,"fr-FR",mode==="letter-sounds"?0.68:0.92);const render=()=>{const c=card([]);c.append(el("p",{class:"small",text:"Petit jeu "+(round+1)+" sur 5"}),el("div",{class:"progress-track",role:"progressbar","aria-label":"Progression du jeu","aria-valuemin":"0","aria-valuemax":"5","aria-valuenow":String(round)},el("div",{class:"progress-fill",style:"width:"+(round/5*100)+"%"})),el("p",{class:"lead",text:"Regarde bien, puis touche une réponse."}),el("div",{class:"prompt",text:q.prompt}));
  const answers=el("div",{class:"answer-grid"});q.choices.forEach(choice=>{const item=mode==="colors"?COLORS.find(x=>x[0]===choice):mode==="shapes"?SHAPES.find(x=>x[0]===choice):[choice];answers.append(button(mode==="letters"||mode==="letter-pairs"||mode==="letter-sounds"||mode==="patterns"?choice:item[1]+" "+choice,()=>answer(choice,c,answers,f),"button-soft"));});
  const f=el("p",{class:"feedback",role:"status","aria-live":"polite"});c.append(answers,f,el("div",{class:"button-row"},[button("🔊 Réécouter",readQuestion,"button-soft"),button("💡 Petit indice",()=>{hintCount++;f.textContent=mode==="letter-sounds"?"La petite lettre est « "+q.answer.toLowerCase()+" ».":(hintCount===1?q.hint:q.explanation);speak(f.textContent,getState().settings.voice);},"button-soft")]),button("↩ Autres jeux",roseMenu,"button-soft"),button("⌂ Accueil",()=>go("home"),"icon-button"));replaceApp(screen(title,c,{eyebrow:"On apprend en jouant",home:()=>go("home")}));readQuestion();};
 const answer=(choice,cardEl,answerGrid,feedback)=>{const ok=choice===q.answer;recordAnswer("rose",ok);if(!ok){gentleOops(getState().settings.sounds);tries++;const f=feedback;if(f){f.textContent=tries===1?pick(["Presque ! Regarde encore et essaie tranquillement.","Bien essayé ! Observe les choix une nouvelle fois.","Pas encore, mais tu peux y arriver. Regarde bien !","On prend notre temps et on retente."]):pick(["Ce n’est pas grave, on peut chercher ensemble.","Chaque essai nous apprend quelque chose !","On observe encore une fois, tout doucement.","Tu peux essayer une autre réponse."]);speak(f.textContent,getState().settings.voice);}return;}cheer(getState().settings.sounds);const praise=pick(["Oui, bravo !","Youpi, tu as trouvé !","Super observation !","Bien joué !","Quelle belle découverte !"]);feedback.textContent=praise;successPraise("rose",getState().settings.voice,praise);answerGrid.querySelectorAll("button").forEach(item=>{item.disabled=true;});const next=button(round+1>=5?"Terminer":"Question suivante",()=>{next.remove();round++;if(round>=5)finish();else{generate();render();}},"button-primary");next.classList.add("rose-question-next");next.setAttribute("aria-label",round+1>=5?"Terminer le jeu":"Passer à la question suivante");const controls=cardEl.querySelector(".button-row");if(controls)cardEl.insertBefore(next,controls);else cardEl.append(next);};
 generate();render();
}

export const FAMILY_WORDS=["ROSE","LÉON","PAPA","MAMAN","ALEXIS","PAULINE","MAMI"];
export function shuffleFamilyLetters(word,random=Math.random){return shuffle([...word].map((letter,id)=>({letter,id})),random);}
function startRoseWritingActivity(){
 document.body.className="theme-rose";
 const wordOrder=shuffle([...FAMILY_WORDS],Math.random);
 let wordIndex=0,target=wordOrder[wordIndex],chosen=[],tokens=[];
 const model=el("div",{class:"prompt","aria-label":"Mot à reconstituer",text:target.split("").join(" ")});
 const content=card([]);
 const status=el("p",{class:"feedback",role:"status","aria-live":"polite",text:"Choisis la première lettre."});
 const sequence=el("div",{class:"answer-grid","aria-label":"Lettres choisies"});
 const choices=el("div",{class:"answer-grid","aria-label":"Lettres à choisir"});
 const resetWord=()=>{target=wordOrder[wordIndex];chosen=[];tokens=shuffleFamilyLetters(target);model.textContent=target.split("").join(" ");model.setAttribute("aria-label","Mot à reconstituer");status.textContent="Choisis la première lettre.";draw();};
 const draw=()=>{
  sequence.replaceChildren();
  const targetLetters=[...target];
  sequence.append(...Array.from({length:target.length},(_,i)=>{const letter=i<chosen.length?targetLetters[chosen[i]]:"·";return el("div",{class:"prompt",text:letter,"aria-label":letter==="·"?"Case vide":letter});}));
  choices.replaceChildren();
  const previousOrder=tokens.map(token=>token.id).join(",");let mixed=tokens;for(let attempt=0;attempt<8;attempt++){mixed=shuffleFamilyLetters(target);if(mixed.map(token=>token.id).join(",")!==previousOrder)break;}tokens=mixed;
  tokens.filter(token=>!chosen.includes(token.id)).forEach(token=>choices.append(button(token.letter,()=>{
   const expected=target[chosen.length];
   if(token.letter!==expected){
    gentleOops(getState().settings.sounds);
    status.textContent="Bien essayé ! Regarde le modèle et cherche la bonne lettre. Les lettres changent de place.";
    speak(status.textContent,getState().settings.voice);
    tokens=shuffle(tokens,Math.random);draw();return;
   }
   chosen.push(token.id);cheer(getState().settings.sounds);draw();
   if(chosen.length===target.length){
    choices.replaceChildren();
    status.textContent="🌟 Bravo ! Tu as reconstitué "+target+" !";
    successPraise("rose",getState().settings.voice,status.textContent);
    if(wordIndex<wordOrder.length-1){const next=button("Mot suivant ➜",()=>{wordIndex++;resetWord();},"button-primary");next.classList.add("rose-question-next");content.append(next);}
    else {status.textContent+=" Tu as retrouvé tous les mots de la famille !";recordSession("rose");sessionPraise("rose",getState().settings.voice);}
   }else{status.textContent="Bien joué ! Quelle lettre vient ensuite ?";successPraise("rose",getState().settings.voice,status.textContent);}
  },"button-soft")));
  content.replaceChildren(el("p",{class:"lead",text:"Regarde le modèle, puis touche les lettres pour reconstituer le mot."}),model,sequence,choices,status,
   button("↩ Réessayer (mélanger les lettres)",()=>{chosen=[];tokens=shuffleFamilyLetters(target);status.textContent="Les lettres ont changé de place. À toi de jouer !";draw();},"button-soft"),
   button("Autres jeux",roseMenu,"button-soft"),
   button("⌂ Accueil",()=>go("home"),"icon-button"));
 };
 resetWord();
 replaceApp(screen("Reconstitue les prénoms",content,{eyebrow:"Les mots de la famille",home:()=>go("home")}));
 speak("Reconstitue les prénoms et les mots de la famille. Regarde le modèle et cherche les lettres dans le bon ordre.",getState().settings.voice);
}
