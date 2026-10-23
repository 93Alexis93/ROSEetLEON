import {el,button,screen,card,replaceApp} from "../ui.js";
import {getState,update,exportData,importData,resetData} from "../store.js";
import {go} from "../router.js";
import {MATH_DOMAINS} from "../child/math-engine.js";
let failures=0,blockedUntil=0,problem=null;
const makeProblem=()=>{const a=6+Math.floor(Math.random()*4),b=6+Math.floor(Math.random()*4);
problem={a,b,answer:a*b};
};
export function parentGate(){if(Date.now()<blockedUntil){replaceApp(screen("Espace parent",card([el("p",{class:"lead",text:"La porte se repose un instant. Réessaie dans quelques secondes."}),button("Retour à l’accueil",()=>go("home"))])));
return;
}makeProblem();
let value="";
const display=el("div",{class:"prompt",text:problem.a+" × "+problem.b+" = ?"});
const feedback=el("p",{class:"feedback",text:"Résous le calcul pour ouvrir la porte."});
const digits=el("div",{class:"pin-grid"});
const input=el("input",{type:"password",inputmode:"numeric",pattern:"[0-9]*",maxlength:"3","aria-label":"Résultat du calcul",placeholder:"Résultat"});
const check=button("Ouvrir",verify);
input.addEventListener("keydown",event=>{if(event.key==="Enter")verify();});
for(let i=1;i<=9;i++)digits.append(button(String(i),()=>{input.value=(input.value+String(i)).slice(0,3)},"button-soft"));
digits.append(button("⌫",()=>input.value=input.value.slice(0,-1),"button-soft"),button("0",()=>{input.value=(input.value+"0").slice(0,3)},"button-soft"));
function verify(){if(Date.now()<blockedUntil){feedback.textContent="La porte se repose encore.";
return;
}const s=getState();
if(Number(input.value)===problem.answer){failures=0;
const pin=getState().settings.parentPin;
if(pin&&prompt("Code PIN parent")!==pin){feedback.textContent="Code PIN incorrect. Recommence le calcul.";
makeProblem();
display.textContent=problem.a+" × "+problem.b+" = ?";
input.value="";
return;
}go("parent");
return;
}failures++;
feedback.textContent="Ce n’est pas grave. Respire et réessaie.";
if(failures>=3){blockedUntil=Date.now()+30000;
feedback.textContent="La porte fait une pause de 30 secondes.";
const gateScreen=document.querySelector("#app")?.firstElementChild;
setTimeout(()=>{if(gateScreen&&document.querySelector("#app")?.firstElementChild===gateScreen)parentGate();},30000);
return;
}makeProblem();
display.textContent=problem.a+" × "+problem.b+" = ?";
input.value="";
}replaceApp(screen("Espace parent",card([el("p",{class:"lead",text:"Une petite question pour garder cet espace réservé aux adultes."}),display,input,digits,check,feedback,button("Retour à l’accueil",()=>go("home"),"button-soft")]),{eyebrow:"Porte parentale",home:()=>go("home")}));
}
function section(title,children){return card([el("h2",{text:title}),...children]);
}
export function parentDashboard(){document.body.className="theme-parent";
const s=getState();
const content=el("div",{class:"parent-grid"});
const stats=section("Aujourd’hui",[el("p",{class:"small",text:"Des petits pas comptent. Aucun classement entre les enfants."}),el("p",{class:"stat",text:"Léon · "+s.profiles.leon.sessions+" défi(s) terminé(s)"}),el("p",{class:"stat",text:"Rose · "+s.profiles.rose.sessions+" défi(s) terminé(s)"}),el("p",{class:"small",text:"Réponses essayées : Léon "+s.profiles.leon.correct+" réussites · Rose "+s.profiles.rose.correct+" réussites."})]);
const mathStats=section("Maths de Léon",MATH_DOMAINS.map(domain=>{const p=s.profiles.leon.mathProgress?.[domain.id];return el("p",{class:"small",text:domain.label+" · niveau "+(p?.difficulty||1)+"/3 · "+(p?.correct||0)+" réussite(s) sur "+(p?.attempts||0)+" essai(s)"});}));
const wordInput=el("input",{type:"text",maxlength:"24",placeholder:"Ex. papillon", "aria-label":"Mot à ajouter à la lecture"});
const addWord=button("Ajouter ce mot",()=>{const word=wordInput.value.trim();if(!/^[A-Za-zÀ-ÿ-]{2,24}$/.test(word)){alert("Entre un mot de 2 à 24 lettres, sans espace.");return;}update(x=>{const words=x.customWords.map(w=>(typeof w==="string"?w:w.word||"").toLocaleLowerCase("fr"));if(!words.includes(word.toLocaleLowerCase("fr")))x.customWords.push({word,createdAt:new Date().toISOString()});});parentDashboard();},"button-primary");
const customWords=section("Mots de lecture de Léon",
[el("p",{class:"small",text:"Ajoute des mots qui lui parlent. Ils seront proposés dans les jeux de lecture et conservés sur cet appareil."}),wordInput,addWord,...(s.customWords.length?s.customWords.map((entry,index)=>{const word=typeof entry==="string"?entry:entry.word||"";return el("div",{class:"button-row"},[el("p",{class:"stat",text:word}),button("Supprimer",()=>{update(x=>{x.customWords.splice(index,1);});parentDashboard();},"button-soft")]);}):[el("p",{class:"small",text:"Aucun mot personnalisé pour le moment."})])]);
const tools=section("Outils parent",[button("🫶 Crise en cours",()=>go("crisis"),"button-warm"),button("📄 Fiches à imprimer",()=>go("print"),"button-soft")]);
const backup=section("Sauvegarde et réglages",
[button("Exporter la sauvegarde JSON",downloadBackup,"button-primary"),el("label",{class:"field"},["Importer une sauvegarde JSON",el("input",{type:"file",accept:"application/json",onchange:importBackup})]),el("label",{class:"field"},["Code PIN facultatif (4 chiffres)",el("input",{type:"password",inputmode:"numeric",maxlength:"4",value:s.settings.parentPin,placeholder:"Aucun PIN défini",onchange:e=>update(x=>x.settings.parentPin=e.target.value.replace(/\D/g,"").slice(0,4))})]),el("label",{class:"field"},["Voix",el("select",{onchange:e=>update(x=>x.settings.voice=e.target.value==="oui")},[el("option",{value:"oui",selected:s.settings.voice?"selected":null,text:"Activée"}),el("option",{value:"non",selected:!s.settings.voice?"selected":null,text:"Désactivée"})])]),el("label",{class:"field"},["Sons d’encouragement",el("select",{onchange:e=>update(x=>x.settings.sounds=e.target.value==="oui")},[el("option",{value:"oui",selected:s.settings.sounds?"selected":null,text:"Activés"}),el("option",{value:"non",selected:!s.settings.sounds?"selected":null,text:"Désactivés"})])]),button("Remettre à zéro",()=>{if(confirm("Effacer toutes les progressions et réglages sur cet appareil ?")){resetData();parentDashboard();}},"button-soft")]);
content.append(stats,mathStats,customWords,tools,backup,section("Progression positive",[el("p",{class:"small",text:"La V1 enregistre les essais et les sessions localement. Les conseils personnalisés seront enrichis dans les prochaines phases."})]));
replaceApp(screen("Espace parent",content,{eyebrow:"Tableau de bord",home:()=>go("home")}));
}
function downloadBackup(){const blob=new Blob([exportData()],{type:"application/json"}),url=URL.createObjectURL(blob),a=el("a",{href:url,download:"rose-leon-sauvegarde.json"});
document.body.append(a);
a.click();
a.remove();
URL.revokeObjectURL(url);
}
function importBackup(e){const file=e.target.files?.[0];
if(!file)return;
const reader=new FileReader();
reader.onload=()=>{try{importData(String(reader.result));
alert("Sauvegarde importée.");
parentDashboard();
}catch(err){alert("Import impossible : "+err.message);
}};
reader.readAsText(file);
}
export function crisis(){document.body.className="theme-parent";
const steps=[
["1. Respirer d’abord","Pose les pieds au sol. Inspire doucement, puis expire un peu plus longtemps."],["2. Sécuriser et ralentir","Baisse la voix, éloigne les objets dangereux et utilise peu de mots."],["3. Accueillir l’émotion","« Je vois que c’est très difficile. Tu as le droit d’être en colère. »"],["4. Proposer un petit choix","« Tu préfères un peu d’eau ou un moment tranquille près de moi ? »"],["5. Attendre","Pas besoin de régler le problème tout de suite. Reviens-y quand vous serez plus calmes."]
];
const content=el("div",{class:"stack"});
steps.forEach(([t,d])=>content.append(card([el("h2",{text:t}),el("p",{class:"lead",text:d})])));
content.append(button("Retour au tableau de bord",()=>go("parent")));
replaceApp(screen("Crise en cours",content,{eyebrow:"Boîte à outils parent",home:()=>go("parent")}));
}
