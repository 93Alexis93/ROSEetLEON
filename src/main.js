import {el,button,screen,card,replaceApp} from "./ui.js";
import {setRenderer,startRouter,go} from "./router.js";
import {getState} from "./store.js";
import {startActivity} from "./child/activities.js";
import {parentGate,parentDashboard,crisis,printComingSoon} from "./parent/parent.js";
import {speak} from "./voice.js";
import {unlockAudio} from "./audio.js";
function home(){document.body.className="";const content=el("div",{class:"stack"});content.append(el("p",{class:"lead",text:"Deux petits univers pour apprendre, essayer et recommencer à son rythme."}));const choices=el("div",{class:"choices"});
choices.append(button("⚽ Léon · Défis ballon",()=>{unlockAudio();go("leon");},"big-choice"),button("🦄 Rose · Jeux magiques",()=>{unlockAudio();go("rose");},"big-choice"));content.append(choices,el("p",{class:"small",text:"Des sessions courtes, sans classement et sans pression."}),button("🔒 Espace parent",()=>go("gate"),"icon-button"));replaceApp(screen("Rose & Léon",content,{eyebrow:"Notre petit coin pour grandir"}));}
function childHome(child){document.body.className="theme-"+child;const rose=child==="rose";const content=card([el("p",{class:"lead",text:rose?"Comptons les licornes ensemble !":"Prêt pour un petit défi de calcul ?"}),el("div",{class:"prompt",text:rose?"🌈 🦄 ✨":"⚽ 🥅 ⭐"}),button(rose?"Compter les licornes":"Défi penalty",()=>{unlockAudio();startActivity(child);},"button-primary"),button("🔊 Réécouter",()=>speak(rose?"Choisis le jeu des licornes. Nous allons compter jusqu’à cinq.":"Choisis le défi penalty. Tu vas faire quelques petits calculs.",getState().settings.voice),"button-soft"),button("⌂ Accueil",()=>go("home"),"icon-button")]);replaceApp(screen(rose?"Bonjour Rose !":"Salut Léon !",content,{eyebrow:rose?"Univers licorne":"Univers ballon",home:()=>go("home")}));speak(rose?"Bonjour Rose ! Choisis le jeu des licornes.":"Salut Léon ! Choisis ton défi penalty.",getState().settings.voice);}
function render(route){switch(route){case"home":home();break;case"leon":childHome("leon");break;case"rose":childHome("rose");break;case"gate":parentGate();break;case"parent":parentDashboard();break;case"crisis":crisis();break;case"print":printComingSoon();break;default:home();}}
setRenderer(render);startRouter();
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
