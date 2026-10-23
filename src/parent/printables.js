import {el,button,screen,card,replaceApp} from "../ui.js";
import {go} from "../router.js";

const worksheets=[
 {id:"rose-letters",label:"Rose · Les lettres de mon prénom",description:"Reconnaître R, O, S et E, puis les retrouver dans une ligne de lettres."},
 {id:"rose-shapes",label:"Rose · Les formes",description:"Reconnaître cercle, carré, triangle et étoile."},
 {id:"leon-multiplication",label:"Léon · Les multiplications",description:"Petits calculs et stratégies sans chronomètre."}
];
function text(tag,value,cls){return el(tag,{text:value,...(cls?{class:cls}:{})});}
function worksheetRoseLetters(){
 const page=el("article",{class:"print-page worksheet"});
 page.append(text("p","ROSE & LÉON · PETITE FICHE POUR GRANDIR","worksheet-kicker"),text("h1","Je reconnais les lettres de Rose"),text("p","Prénom : ____________________     Date : ____________________","worksheet-meta"));
 page.append(text("h2","1. Je regarde les lettres"),el("div",{class:"letter-cards"},["R","O","S","E"].map(x=>text("div",x,"letter-card"))));
 page.append(text("h2","2. J’entoure les lettres de ROSE"),text("p","Entoure seulement les lettres R, O, S et E.","worksheet-instruction"));
 page.append(text("div","A   R   M   O   S   T   E   P   R   L   O   B   S   E   N","letter-row"),text("h2","3. Je retrouve les lettres dans le bon ordre"),text("div","____   ____   ____   ____","letter-row answer-space"));
 page.append(text("p","Bravo ! Tu peux montrer les lettres et les dire à voix haute.","worksheet-encouragement"));
 return page;
}
function worksheetRoseShapes(){
 const page=el("article",{class:"print-page worksheet"});
 page.append(text("p","ROSE & LÉON · PETITE FICHE POUR GRANDIR","worksheet-kicker"),text("h1","Les formes magiques"),text("p","Prénom : ____________________     Date : ____________________","worksheet-meta"));
 page.append(text("h2","1. Je regarde et je dis le nom"),el("div",{class:"shape-cards"},[
  text("div","●\nCercle","shape-card"),text("div","■\nCarré","shape-card"),text("div","▲\nTriangle","shape-card"),text("div","★\nÉtoile","shape-card")
 ]));
 page.append(text("h2","2. Je relie chaque forme à son nom"),text("p","Trace un trait entre la forme et le bon mot.","worksheet-instruction"),el("div",{class:"match-grid"},[
  text("div","●","match-symbol"),text("div","Triangle","match-word"),
  text("div","▲","match-symbol"),text("div","Cercle","match-word"),
  text("div","★","match-symbol"),text("div","Étoile","match-word"),
  text("div","■","match-symbol"),text("div","Carré","match-word")
 ]),text("p","3. Je dessine ma forme préférée dans le cadre.","worksheet-instruction"),text("div"," ","drawing-frame"));
 return page;
}
function worksheetLeon(){
 const page=el("article",{class:"print-page worksheet"});
 page.append(text("p","ROSE & LÉON · PETITE FICHE POUR GRANDIR","worksheet-kicker"),text("h1","Je m’entraîne aux multiplications"),text("p","Prénom : ____________________     Date : ____________________","worksheet-meta"),text("p","Je peux dessiner des groupes ou compter par bonds. Je prends mon temps.","worksheet-instruction"));
 const qs=[["3 × 2","3 groupes de 2"],["4 × 5","4 groupes de 5"],["2 × 6","2 groupes de 6"],["5 × 3","5 groupes de 3"],["4 × 4","4 groupes de 4"],["3 × 7","3 groupes de 7"]];
 page.append(el("div",{class:"math-worksheet-grid"},qs.map(([q,h],i)=>el("section",{class:"math-question"},[
  text("h2",(i+1)+". "+q),text("p",h,"small"),text("p","Je calcule : __________","answer-line")
 ]))));
 page.append(text("p","Une stratégie qui m’a aidé : __________________________________________","worksheet-meta"));
 return page;
}
function answerKey(id){
 const page=el("article",{class:"print-page worksheet answer-key"});
 page.append(text("p","POUR L’ADULTE · CORRIGÉ","worksheet-kicker"),text("h1","Repères de correction"));
 if(id==="rose-letters")page.append(text("p","Fiche « Les lettres de mon prénom » : les lettres attendues sont R, O, S et E. Dans la ligne, entourer R, O, S, E, R, O, S, E dans l’ordre où elles apparaissent."));
 else if(id==="rose-shapes")page.append(text("p","Fiche « Les formes magiques » : ● cercle ; ■ carré ; ▲ triangle ; ★ étoile. L’activité de liaison n’impose pas une façon unique de tracer les traits."));
 else page.append(el("ul",{class:"answer-list"},["1. 3 × 2 = 6","2. 4 × 5 = 20","3. 2 × 6 = 12","4. 5 × 3 = 15","5. 4 × 4 = 16","6. 3 × 7 = 21"].map(answer=>text("li",answer))));
 page.append(text("p","Privilégier l’explication et l’encouragement. L’enfant peut utiliser des dessins ou recompter."));
 return page;
}
export function printComingSoon(){
 document.body.className="theme-parent";
 const content=el("div",{class:"stack no-print"});
 content.append(text("p","Choisis une fiche simple, imprimable depuis Safari. Chaque fiche est accompagnée d’un repère de correction pour l’adulte.","lead"));
 worksheets.forEach(w=>content.append(card([
  text("h2",w.label),text("p",w.description,"small"),
  button("Préparer la fiche",()=>showWorksheet(w.id),"button-primary")
 ])));
 content.append(button("Retour au tableau de bord",()=>go("parent"),"button-soft"));
 replaceApp(screen("Fiches à imprimer",content,{eyebrow:"Fiches A4",home:()=>go("parent")}));
}
function showWorksheet(id){
 const w=worksheets.find(x=>x.id===id);if(!w)return printComingSoon();
 document.body.className="theme-parent print-view";
 const pages=id==="rose-letters"?[worksheetRoseLetters(),answerKey(id)]:id==="rose-shapes"?[worksheetRoseShapes(),answerKey(id)]:[worksheetLeon(),answerKey(id)];
 const wrapper=el("div",{class:"print-workspace"});
 const controls=el("div",{class:"no-print print-controls"},[
  button("🖨️ Imprimer / enregistrer en PDF",()=>window.print(),"button-primary"),
  button("↩ Choisir une autre fiche",printComingSoon,"button-soft"),
  button("Tableau de bord parent",()=>go("parent"),"icon-button")
 ]);
 wrapper.append(controls,...pages);
 replaceApp(screen(w.label,wrapper,{eyebrow:"A4 · fiche et corrigé",home:()=>go("parent")}));
}
