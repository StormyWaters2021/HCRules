"use strict";
let db,mode='rules',path=[],query='';
const $=x=>document.getElementById(x), E=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n};
const low=s=>String(s||'').toLocaleLowerCase();
const button=(label,click,cls='')=>{const n=E('button',cls,label);n.type='button';n.onclick=click;return n};
const byId=id=>db.sections.find(s=>s.id===id),findPac=id=>db.pac.find(p=>p.id===id),findBack=id=>db.back.find(p=>p.id===id);
const searchText=s=>low([s.title,s.name,s.id,s.text,s.searchText].join(' ')).includes(query);
const groups=['Speed','Attack','Defense','Damage'];
const combat=['autonomous_white','bolt','colossal_white','fist_white','flight_white','improved','run_white','shield_white','standard_white','swim_white','tiny_white','trait','vehicle_white'];
const iconPath=name=>'assets/combat/'+name+'.png';
const linkTargets=[];let linkPattern=null;
function initLinks(){
 for(const s of db.sections){if(s.id.includes('.'))linkTargets.push({term:s.id,type:'rule',id:s.id,p:9});if(s.level===3&&s.id.startsWith('27.')){const name=s.title.replace(/\s*\([^)]*\)\s*$/,'');linkTargets.push({term:name,type:'rule',id:s.id,p:6})}}
 for(const p of db.pac)linkTargets.push({term:p.name,type:'power',id:p.id,p:7});
 for(const [name,id] of db.terrain)linkTargets.push({term:name,type:'rule',id,p:3});
 for(const [term,id] of [['Improved Movement','back-1'],['Improved Targeting','back-1'],['Keyphrase Abilities','back-2'],['Inherent Abilities','back-0']])linkTargets.push({term,type:'back',id,p:2});
 const unique=new Map();for(const t of linkTargets.sort((a,b)=>b.p-a.p)){if(!unique.has(low(t.term)))unique.set(low(t.term),t)}
 const terms=[...unique.values()].sort((a,b)=>b.term.length-a.term.length);window.linkMap=new Map(terms.map(t=>[low(t.term),t]));
 const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');linkPattern=new RegExp('(?<![\\p{L}\\p{N}.])('+terms.map(t=>esc(t.term)).join('|')+')(?![\\p{L}\\p{N}])','giu');
}
function linkedLine(t,source){const node=E('span');if(!t){return node}let pos=0,m;linkPattern.lastIndex=0;while((m=linkPattern.exec(t))){const obj=window.linkMap.get(low(m[0]));if(!obj||obj.type===source.type&&obj.id===source.id){node.append(document.createTextNode(t.slice(pos,m.index+m[0].length)));pos=m.index+m[0].length;continue;}node.append(document.createTextNode(t.slice(pos,m.index)));const a=E('a','',m[0]);a.href='#'+obj.type+'/'+encodeURIComponent(obj.id);a.onclick=e=>{e.preventDefault();goTarget(obj.type,obj.id)};node.append(a);pos=m.index+m[0].length}node.append(document.createTextNode(t.slice(pos)));return node}
function textNode(value,source,graphics=[]){const div=E('div','verbatim');const lines=String(value||'').split('\n');const byLine=new Map();for(const g of graphics||[]){if(!byLine.has(g.line))byLine.set(g.line,[]);byLine.get(g.line).push(g)}
 lines.forEach((line,i)=>{const graphics=(byLine.get(i)||[]).sort((a,b)=>a.at-b.at);let pos=0;for(const g of graphics){const at=Math.max(pos,Math.min(line.length,g.at));div.append(linkedLine(line.slice(pos,at),source));const img=E('img','inline-graphic');img.src=g.src;img.alt='Embedded rule symbol';img.loading='lazy';div.append(img);pos=at}div.append(linkedLine(line.slice(pos),source));if(i<lines.length-1)div.append(document.createTextNode('\n'))});return div}
function setHeading(title,eyebrow='',subtitle=''){const c=$('context');c.replaceChildren();if(eyebrow)c.append(E('div','eyebrow',eyebrow));c.append(E('h1','',title));if(subtitle)c.append(E('p','',subtitle))}
function row(num,label,fn,cls=''){const b=button('',fn,'entry '+cls);if(num)b.append(E('span','num',num));b.append(E('span','label',label),E('span','chevron','›'));return b}
function showButtons(items,container){for(const it of items)container.append(it)}
function hierarchy(){const p=path;const nav=$('breadcrumbs');nav.replaceChildren();if(p.length){nav.append(button('‹ Back',()=>{path.pop();query='';$('search').value='';render()},'back'))}else if(mode==='pac'&&p.length===0){} }
function resetScroll(){window.scrollTo({top:0,behavior:'instant'})}
function move(p,resetSearch=true){path=p;if(resetSearch){query='';$('search').value=''}render();resetScroll();syncHash()}
function goTarget(type,id){if(type==='rule') {mode='rules';const s=byId(id);if(!s)return;let p=['chapter:'+s.chapter];if(s.level>=2){const parent=s.id.match(/^\d+\.\d+/)?.[0];if(parent)p.push('section:'+parent)}p.push('rule:'+id);move(p)}else if(type==='power'){mode='pac';move(['power:'+id])}else if(type==='back'){mode='pac';move(['back:'+id])}}
function syncHash(){const last=path[path.length-1];const hash=last?mode+'/'+encodeURIComponent(last):mode;history.replaceState(null,'','#'+hash)}
function eligible(s,term){return low([s.id,s.title,s.text,s.searchText].join(' ')).includes(term)}

function powerSymbol(p){
 const shell=E('span','power-symbol');shell.style.setProperty('--power-color',p.color||'#777');
 const category={Speed:'run_white',Attack:'fist_white',Defense:'shield_white',Damage:'standard_white'}[p.group]||'standard_white';
 const img=E('img');img.src=iconPath(category);img.alt=p.group+' combat symbol';img.loading='lazy';
 shell.append(img);return shell;
}
function specialRuleText(s){
 if(s.id!=='1.3a'||!s.inlineSequence)return textNode(s.text,{type:'rule',id:s.id},s.graphics);
 const root=E('div','verbatim');const lines=s.text.split('\n');let k=0;
 // The PDF extraction inserted line breaks where seven symbol graphics appear.
 const before={1:1,2:1,3:1,4:1,7:1,8:1,10:1};
 lines.forEach((line,i)=>{
   if(before[i]&&k<s.inlineSequence.length){const im=E('img','inline-graphic');im.src=s.inlineSequence[k++];im.alt='Combat symbol';root.append(im);}
   root.append(linkedLine(line,{type:'rule',id:s.id}));
   if(i<lines.length-1)root.append(document.createTextNode('\n'));
 });return root;
}

function cardPower(p){const b=button(' ',()=>move(['power:'+p.id]),'entry power');b.textContent='';const icon=powerSymbol(p);const t=E('span','power-text',p.name);b.append(icon,t,E('span','chevron','›'));return b}
function showPowerList(){setHeading('Powers & Abilities','PAC · Front','Select a power to read its complete wording');const content=$('view');for(const group of groups){const candidates=db.pac.filter(p=>p.group===group&&(!query||searchText(p)));if(!candidates.length)continue;content.append(E('h2','group-head '+low(group),group.toUpperCase()));const stack=E('div','stack');candidates.forEach(p=>stack.append(cardPower(p)));content.append(stack)}content.append(button('PAC reverse side · Improved abilities, terrain & more',()=>move(['back-index']),'entry'))}
function showPower(p){setHeading(p.name,'PAC · '+p.group,'Original PAC wording');const v=$('view');const article=E('article','pac-article');const paper=E('div','rule-paper');const header=E('div','pac-title');const img=powerSymbol(p);header.append(img,E('h2','',p.name));paper.append(header,textNode(p.text,{type:'power',id:p.id}));article.append(paper);v.append(article);const rules=db.sections.find(x=>x.level===3&&x.id.startsWith('27.')&&low(x.title.replace(/\s*\([^)]*\)\s*$/,''))===low(p.name));if(rules)v.append(row('§'+rules.id,'View corresponding comprehensive rule',()=>goTarget('rule',rules.id)))}
function showBackIndex(){setHeading('PAC · Reverse Side','Reference card','Inherent, improved and keyphrase abilities, plus terrain');const v=$('view');const stack=E('div','stack');db.back.forEach(b=>stack.append(row('',b.name,()=>move(['back:'+b.id]))));v.append(stack);v.append(E('h2','group-head','MAP TERRAIN'));v.append(terrainRows())}
function terrainRows(){const stack=E('div','stack');for(const [title,id,color] of db.terrain){const b=row('',title,()=>goTarget('rule',id));const sw=E('span','terrain-swatch');sw.style.background=color;b.prepend(sw);stack.append(b)}return stack}
function showBack(b){setHeading(b.name,'PAC · Reverse Side','Source text, with rule references linked');const v=$('view');const panel=E('div','rule-paper');panel.append(textNode(b.text,{type:'back',id:b.id}));v.append(panel);if(b.id==='back-1'){const box=E('div','symbol-strip');for(const n of ['improved','run_white','flight_white','shield_white','bolt']){const im=E('img');im.src=iconPath(n);im.alt=n.replace('_white','')+' symbol';box.append(im)}v.prepend(box)}v.append(E('h2','group-head','TERRAIN RULES'));v.append(terrainRows())}
function family(s){return db.sections.filter(x=>x.id.startsWith(s.id)&&x.id!==s.id&&x.level===s.level+1)}
function showRule(s){setHeading(s.id+' '+s.title,'Comprehensive Rules','July 1, 2026 · source page '+Math.max(1,s.page-17));const v=$('view');const body=E('article','rule-paper');body.append(specialRuleText(s));v.append(body);const children=family(s);if(children.length){v.append(E('h2','group-head','SUBSECTIONS'));const stack=E('div','stack');children.forEach(c=>stack.append(row(c.id,c.title,()=>enter(c))));v.append(stack)}const tools=E('div','rule-tools');tools.append(button('Copy link',()=>navigator.clipboard?.writeText(location.href),'small-action'));v.append(tools)}
function enter(s){if(s.level===1)move(['chapter:'+s.id]);else if(s.level===2)move(['chapter:'+s.chapter,'section:'+s.id]);else move(['chapter:'+s.chapter,'section:'+s.id.match(/^\d+\.\d+/)?.[0],'rule:'+s.id])}
function showChapter(ch){const s=byId(ch);if(!s)return;setHeading(ch+' '+s.title,'Comprehensive Rules','Choose a section');const v=$('view'),stack=E('div','stack');if(s.text){const intro=E('article','rule-paper chapter-intro');intro.append(specialRuleText(s));v.append(intro)}db.sections.filter(x=>x.level===2&&x.chapter===ch).forEach(x=>stack.append(row(x.id,x.title,()=>enter(x))));v.append(stack)}
function showSection(id){const s=byId(id);if(!s)return;setHeading(id+' '+s.title,'Chapter '+s.chapter,'Choose a rule');const v=$('view'),stack=E('div','stack');if(s.text){const intro=E('article','rule-paper section-intro');intro.append(specialRuleText(s));v.append(intro)}db.sections.filter(x=>x.level===3&&x.id.startsWith(id)&&x.id.length>id.length).forEach(x=>stack.append(row(x.id,x.title,()=>move([...path,'rule:'+x.id]))));if(stack.children.length)v.append(stack);else if(!s.text)showRule(s)}
function showChapters(){setHeading('Comprehensive Rules','July 1, 2026','Select a chapter');const stack=E('div','stack');db.sections.filter(x=>x.level===1).forEach(s=>stack.append(row(s.id,s.title,()=>enter(s),'chapter')));$('view').append(stack)}
function showSearch(){setHeading('Search results',mode==='rules'?'Comprehensive Rules':'Powers & Abilities Card','Matches include full rule text, not just titles');const v=$('view'),stack=E('div','stack');let count=0;if(mode==='rules'){const matches=db.sections.filter(s=>eligible(s,query));for(const s of matches){stack.append(row(s.id,s.title,()=>goTarget('rule',s.id),'search-result'));count++}}else{for(const group of groups){const entries=db.pac.filter(p=>p.group===group&&searchText(p));if(entries.length)stack.append(E('h2','group-head '+low(group),group));for(const p of entries){stack.append(cardPower(p));count++}}for(const b of db.back.filter(searchText)){stack.append(row('',b.name,()=>goTarget('back',b.id)));count++}}v.append(stack);if(!count)v.append(E('p','empty','No results found.'))}

function sidebarRow(label,fn,depth=0,selected=false){
 const b=button(label,fn,'sidebar-item depth-'+depth+(selected?' active':''));
 b.title=label;return b;
}
function sidebar(){
 const host=$('sidebarContents');if(!host)return;host.replaceChildren();
 const isPac=mode==='pac';const last=path.at(-1)||'';
 $('desktopSidebar').querySelector('.sidebar-title').textContent=isPac?'Powers & Abilities':'Comprehensive Rules';
 if(isPac){
  host.append(sidebarRow('All powers',()=>move([]),0,!path.length));
  for(const group of groups){
   const head=E('div','sidebar-group',group.toUpperCase());host.append(head);
   for(const p of db.pac.filter(p=>p.group===group)){
    if(query&&!searchText(p))continue;
    const b=sidebarRow(p.name,()=>goTarget('power',p.id),1,last==='power:'+p.id);
    const dot=E('span','sidebar-dot');dot.style.background=p.color;b.prepend(dot);host.append(b)
   }
  }
  host.append(E('div','sidebar-group','OTHER REFERENCES'));
  host.append(sidebarRow('PAC reverse side',()=>move(['back-index']),0,last==='back-index'));
  for(const b of db.back)host.append(sidebarRow(b.name,()=>goTarget('back',b.id),1,last==='back:'+b.id));
 }else{
  host.append(sidebarRow('All chapters',()=>move([]),0,!path.length));
  const current=path.find(x=>x.startsWith('chapter:'))?.slice(8)||'';
  const selectedSection=path.find(x=>x.startsWith('section:'))?.slice(8)||'';
  const selectedRule=last.startsWith('rule:')?last.slice(5):'';
  for(const ch of db.sections.filter(x=>x.level===1)){
   const sections=db.sections.filter(x=>x.level===2&&x.chapter===ch.id);
   if(query&&!eligible(ch,query)&&!db.sections.some(s=>s.chapter===ch.id&&eligible(s,query)))continue;
   host.append(sidebarRow(ch.id+'  '+ch.title,()=>enter(ch),0,current===ch.id&&last==='chapter:'+ch.id));
   if(current!==ch.id&&!query)continue;
   for(const sec of sections){
    const subsections=db.sections.filter(x=>x.level===3&&x.id.startsWith(sec.id)&&x.id.length>sec.id.length);
    if(query&&!eligible(sec,query)&&!subsections.some(x=>eligible(x,query)))continue;
    host.append(sidebarRow(sec.id+'  '+sec.title,()=>enter(sec),1,last==='section:'+sec.id));
    if(selectedSection===sec.id||query){
     for(const item of subsections){if(query&&!eligible(item,query))continue;host.append(sidebarRow(item.id+' '+item.title,()=>goTarget('rule',item.id),2,selectedRule===item.id))}
    }
   }
  }
 }
}

function render(){const v=$('view');v.replaceChildren();$('rulesTab').classList.toggle('chosen',mode==='rules');$('pacTab').classList.toggle('chosen',mode==='pac');$('search').placeholder=mode==='rules'?'Search all rule text…':'Search all PAC text…';$('clear').hidden=!query;hierarchy();sidebar();if(query){showSearch();return}if(mode==='pac'){const key=path.at(-1)||'';if(key.startsWith('power:'))showPower(findPac(key.slice(6)));else if(key==='back-index')showBackIndex();else if(key.startsWith('back:'))showBack(findBack(key.slice(5)));else showPowerList();return}
 const key=path.at(-1)||'';if(key.startsWith('rule:'))showRule(byId(key.slice(5)));else if(key.startsWith('section:'))showSection(key.slice(8));else if(key.startsWith('chapter:'))showChapter(key.slice(8));else showChapters()}
async function init(){try{db=await(await fetch('data.json')).json()}catch(e){$('view').textContent='Could not load rule data. Open through GitHub Pages or a local HTTP server.';return}initLinks();$('rulesTab').onclick=()=>{mode='rules';move([])};$('pacTab').onclick=()=>{mode='pac';move([])};$('search').oninput=e=>{query=low(e.target.value.trim());render()};$('clear').onclick=()=>{query='';$('search').value='';render()};const hash=decodeURIComponent(location.hash.slice(1)).split('/');if(['rules','pac'].includes(hash[0])){mode=hash[0];if(hash[1]){const k=hash[1];if(k.startsWith('rule:')){const id=k.slice(5);const s=byId(id);if(s){path=['chapter:'+s.chapter];if(s.level>=2){const parent=id.match(/^\d+\.\d+/)?.[0];if(parent)path.push('section:'+parent)}path.push(k)}}else path=[k]}}render();window.addEventListener('popstate',()=>{const h=decodeURIComponent(location.hash.slice(1)).split('/');if(['rules','pac'].includes(h[0])){mode=h[0];path=h[1]?[h[1]]:[];if(h[1]?.startsWith('rule:')){const s=byId(h[1].slice(5));if(s){path=['chapter:'+s.chapter];if(s.level>=2){const parent=s.id.match(/^\d+\.\d+/)?.[0];if(parent)path.push('section:'+parent)}path.push(h[1])}}render()}})}init();
