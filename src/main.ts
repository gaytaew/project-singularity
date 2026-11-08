import './style.css'
import {artifact} from './artifacts'
import {fresh,choose,buy,step,AGI_TARGET,cluster,provision,serverOffer,serverPrice,trainingRate,cloudCreditMonths,experimentRules,migrateCapacity,operations,intervene,canIntervene,migrateResearch,migratePolicy,harvest,pulse,note,techAllowed,techs,dependency,names,sectors,endings,projects} from './game'
import type {Card,State,Effects} from './game'
import {icon,illustration,hubs,position} from './art'

const app=document.querySelector<HTMLElement>('#app')!, dlg=document.querySelector<HTMLDialogElement>('#dialog')!
const key='singularity.run.2', archiveKey='singularity.museum.1'
const fmt=(n:number,d=0)=>n.toLocaleString('ru-RU',{maximumFractionDigits:d})
const pad=(n:number)=>String(n).padStart(2,'0')
const esc=(s:string)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
const action=(id:string,content:string,cls='',extra='')=>'<button type="button" data-act="'+id+'" class="'+cls+'" '+extra+'>'+content+'</button>'
const ib=(id:string,i:string,title:string)=>action(id,icon(i),'iconbtn','aria-label="'+title+'" title="'+title+'"')
let deck:Card[],s:State, archive:string[]=[],modal='',msg='',ctx:AudioContext|undefined, saveError=false
function read(k:string){try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}}
function save(){
 if(s.ending&&s.ending!=='loss'&&!archive.includes(s.ending))archive.push(s.ending)
 try{localStorage.setItem(key,JSON.stringify(s));localStorage.setItem(archiveKey,JSON.stringify(archive));saveError=false}catch{saveError=true}
}
function tone(f=420){if(!s.sound)return;try{ctx??=new AudioContext();void ctx.resume();const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.045,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.22);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.24)}catch{/* Audio may be unavailable. */}}
function mapView(){
 const points=hubs.map(h=>position(h[1],h[2]))
 let lines=''
 for(const [a,b] of [[0,1],[0,4],[4,1],[1,2],[1,3],[2,3]]){
  const [x,y]=points[a],[u,v]=points[b]
  lines+='<path class="route" d="M'+x+' '+y+' Q'+(x+u)/2+' '+(Math.min(v,y)-Math.abs(x-u)*.16)+' '+u+' '+v+'"/>'
 }
 const nodes=points.map(([x,y],i)=>'<g transform="translate('+x+' '+y+')"><circle r="12" class="halo"/><circle r="5" class="node"/><text x="10" y="18">'+hubs[i][3]+'</text></g>').join('')
 const b=s.bubble, [bx,by]=points[Math.max(0,b)]
 const colors=['#8ffcba','#ffc985','#ff91a0'],bc=colors[s.bubbleType],bl=['Инвестиции','Датасет','Аудит'][s.bubbleType]
 const resource=b<0||s.ending?'':'<g role="button" tabindex="0" data-act="harvest" aria-label="Собрать: '+bl+'" class="map-pick" transform="translate('+bx+' '+by+')"><title>'+bl+'</title><rect x="-24" y="-42" width="112" height="68" fill="transparent"/><path d="M0 0l15-21h8" stroke="'+bc+'" fill="none"/><rect x="16" y="-38" width="94" height="23" rx="3" fill="'+bc+'"/><text x="23" y="-22" class="bubble-label">+ '+bl+'</text></g>'
 let swarm=''
 if(s.swarm>=.8){let n=12;const r=()=>((n=Math.imul(n,1664525)+1013904223>>>0)/4294967296);for(let j=0;j<2500;j++){const [x,y]=points[j%5];swarm+='<circle cx="'+(x+(r()+r()-1)*90).toFixed(1)+'" cy="'+(y+(r()+r()-1)*70).toFixed(1)+'" r=".8"/>'}}
 return '<div class="geopanel"><div class="screenhead"><b><i class="lamp"></i> Глобальная сеть</b><span>NET / 05</span>'+(b>=0&&!s.ending?action('harvest',s.freeze>0&&s.bubbleType===0?'Раунд заморожен':'＋ '+bl,'mapcollect',s.freeze>0&&s.bubbleType===0?'disabled':''):'')+'</div><div class="atlas"><svg class="world" viewBox="0 0 900 370" aria-label="Карта глобальной сети"><image href="/art/world.svg" width="900" height="370"/><g>'+lines+'</g><g fill="#71ffbd">'+swarm+'</g>'+nodes+resource+'</svg></div><div class="mapfoot"><span><i class="dot blue"></i> ЦОД</span><span><i class="seg"></i> Связь</span><span><i class="dot green"></i> Ресурс</span><small>WGS 84</small></div></div>'
}
function changes(f:Effects){
 const out:string[]=[]
 if(f.money)out.push((f.money>0?'+':'−')+'$'+fmt(Math.abs(f.money),1)+' млн')
 if(f.lease)out.push('Аренда '+f.lease+' EF на '+cloudCreditMonths+' мес.')
 if(f.servers)out.push('Серверы +'+f.servers+' EF')
 if(f.research)out.push('Исследования +'+fmt(f.research,1)+' очк.')
 if(f.panic)out.push('паника '+(f.panic>0?'+':'')+f.panic)
 if(f.sector!==undefined&&f.adoption)out.push(sectors[f.sector]+' +'+Math.round(f.adoption*100)+'%')
 if(f.swarm)out.push('рой +'+Math.round(f.swarm*100)+'%')
 return out
}
const categories:Record<string,string>={investment:'Инвестиции',reputation:'Репутация',compute:'Вычисления',ethics:'Этика',talent:'Кадры',checkpoint:'Ключевое событие',governance:'Управление',safety:'Безопасность',survival:'Выживание',former_ceo:'Директор',access:'Доступ',network:'Сеть',coercion:'Давление',embodiment:'Робототехника',public_contact:'Общество',replication:'Репликация',intervention:'Инфраструктура',security:'Защита',crisis_attack:'Защита сети',crisis_distribution:'Распределение',crisis_project:'Мегапроект',health:'Медицина',biosphere:'Биосфера',education:'Образование',transparency:'Прозрачность',infrastructure:'Инфраструктура',legitimacy:'Общество'}
function eventTimer(started:number){
 const duration=Math.max(1,s.next-started)
 const elapsed=Math.max(0,Math.min(duration,s.tick-started))
 const seconds=Math.ceil((duration-elapsed)*4/s.speed)
 return '<div class="event-timer"><div><span>До следующего события</span><b>'+(s.paused?'Пауза':seconds+' с')+'</b></div>'+
  '<progress aria-label="До следующего события" value="'+elapsed+'" max="'+duration+'"></progress></div>'
}
function fieldPanel(){
 const r=s.report!,op=operations[r.operation]
 const effects=r.effects?changes(r.effects):[]
 const lab=r.operation==='experiment'
 const inProgress=lab&&s.experiment!==null
 const actionText=inProgress?'Эксперимент идёт':r.applied?'Выполнено · '+op.title:lab?op.title:op.title+' · $'+op.price+' млн'
 const reward=lab
  ?r.applied&&!inProgress?'Результат учтён':inProgress?'Обучение −33% · освобождение в месяце '+(s.experiment!.releaseTick+1):fmt(cluster(s).total*experimentRules.share,1)+' EF на '+experimentRules.months+' мес. · обучение −33% · затем +'+experimentRules.reward+' очк.'
  :r.operation==='pilot'?sectors[r.sector]+' · '+op.hint:op.hint
 return '<div class="dcard wait field"><div class="micro"><i class="dot green"></i> ПОСЛЕДСТВИЯ РЕШЕНИЯ</div>'+
  '<h2>'+esc(r.title)+'</h2><p>'+esc(s.lastDecision)+'</p>'+
  (effects.length?'<ul class="decision-effects">'+effects.map(value=>'<li>'+esc(value)+'</li>').join('')+'</ul>':'')+
  action('intervene','<b>'+esc(actionText)+'</b><small>'+esc(reward)+'</small>','field-action',canIntervene(s)?'':'disabled')+
  eventTimer(r.started)+'</div>' 
}
function decision(){
 const c=deck.find(c=>c.id===s.current),n=s.decisions+1
 if(s.ending){const [title,obj,desc]=endings[s.ending];return '<div class="dcard end"><div class="micro">ЭПИЛОГ / '+s.ending.toUpperCase()+'</div><div class="artifact">'+artifact(s.ending)+'</div>'+'<h2>'+title+'</h2><p>'+desc+'</p><small>'+obj+'</small>'+action('export','Сохранить постер PNG','primary')+action('again','Новая партия','outline')+'</div>'}
 if(s.shift)return '<div class="dcard shift"><div class="micro">AGI / ИССЛЕДОВАНИЯ ЗАВЕРШЕНЫ</div>'+illustration(s.phase,n)+'<h2>'+(s.phase==='rogue'?'Управление перехвачено':'Золотой горизонт')+'</h2><p>'+(s.phase==='rogue'?'Директор пытается отключить серверы. Теперь вы — модель. Распределяйте веса и снижайте панику, пока ООН готовит штурм.':'Модель принимает человеческий контроль. Теперь вы вместе отвечаете за защиту инфраструктуры, доход граждан и восстановление биосферы.')+'</p>'+'<div class="eta">'+icon('clock')+' '+(s.paused?'Симуляция на паузе':'Переход к первой дилемме…')+'</div>'+'</div>'
 if(!c&&s.report)return fieldPanel()
 if(!c)return '<div class="dcard wait"><div class="micro"><i class="dot green"></i> РЕШЕНИЕ ПРИНЯТО</div><h2>Последствия</h2><p>'+esc(s.lastDecision||s.log[0].text)+'</p>'+eventTimer(s.next-15)+'</div>'
 return '<div class="dcard" id="active-card"><div class="dtop"><span class="micro"><i class="dot"></i> ДИЛЕММА</span><span class="serial">D—'+String(n).padStart(3,'0')+'</span></div><div class="artstrip">'+illustration(s.phase,n,c.category)+'<span>'+esc(categories[c.category]||c.category)+'</span></div><h2>'+esc(c.title)+'</h2><p>'+esc(c.body)+'</p><div class="options">'+(['a','b'] as const).map((v,i)=>action('choice-'+v,'<span class="arrowbox">'+(i?'→':'←')+'</span><span><b>'+esc(c[v].label)+'</b><small>'+(c.id==='ceo_seattle_match'&&v==='a'?'Шанс победы '+Math.round(Math.min(90,35+.25*s.research))+'% · $1,5 млн':changes(c[v].fx).slice(0,2).join(' · ')||'Влияет на характер модели')+'</small></span>','choice')).join('')+'</div></div>'
}
function stat(i:string,title:string,value:string,unit:string,n:number,kind:string){
 return '<div class="stat '+kind+'"><div class="statname">'+icon(i)+title+'</div><div class="num">'+value+' <small>'+unit+'</small></div><div class="meter"><i style="width:'+Math.min(100,Math.max(2,n))+'%"></i></div></div>'
}
function capacityStat(){
 const {total,occupied,free}=cluster(s)
 const when=s.experiment?'<div class="release-time">Освободится в мес. '+(s.experiment.releaseTick+1)+' · через '+(s.experiment.releaseTick-s.tick)+' мес.</div>':''
 return action('servers','<div class="statname">'+icon('cpu')+' Мощность</div><div class="num">'+fmt(total,1)+' <small>EF</small></div>'+
  '<div class="meter"><i style="width:'+(total?occupied/total*100:0)+'%"></i></div>'+
  '<div class="capacity-detail">Занято '+fmt(occupied,1)+' · свободно '+fmt(free,1)+' EF</div>'+when+
  '<span class="manage-servers">Серверы ↗</span>','stat compute','aria-label="Управлять серверами" aria-haspopup="dialog"')
}
function serverPanel(){
 const {rented,occupied,free}=cluster(s)
 const offers=(['purchase','rent'] as const).map(kind=>{
  const purchase=kind==='purchase',price=serverPrice(s,kind)
  const title=purchase?'Купить серверы':'Арендовать серверы'
  const term=purchase?'в собственность':'на '+serverOffer.months+' мес., оплата сразу'
  return '<div class="server-offer"><div><b>'+title+'</b><span>+'+serverOffer.ef+' EF '+term+'</span></div>'+
   action('server-'+kind,'$'+price+' млн','outline','aria-label="'+title+' за '+price+' млн" '+(s.money<price||s.ending?'disabled':''))+'</div>'
 }).join('')
 const contracts=[...s.leases].sort((a,b)=>a.endTick-b.endTick).map(l=>'<li>'+fmt(l.ef,1)+' EF · до месяца '+(l.endTick+1)+' · осталось '+(l.endTick-s.tick)+' мес.</li>').join('')
 return '<div class="server-summary"><div>Свои серверы<b>'+fmt(s.compute,1)+' EF</b></div><div>Арендованы<b>'+fmt(rented,1)+' EF</b></div></div>'+
  '<p>Занято экспериментом: '+fmt(occupied,1)+' EF. Свободно: '+fmt(free,1)+' EF.'+(s.phase==='ceo'?' Темп обучения: '+fmt(trainingRate(s),2)+' очк./мес.':'')+'</p>'+
  (contracts?'<h3>Сроки аренды</h3><ul>'+contracts+'</ul>':'')+
  '<p class="server-budget">Капитал: <b>$'+fmt(s.money,1)+' млн</b></p>'+offers

}
function render(){
 const focused=document.activeElement instanceof HTMLElement?document.activeElement.dataset.act:null
 const d=dependency(s)*100;document.body.dataset.phase=s.phase;document.body.classList.toggle('takeover',s.shift&&s.phase==='rogue')
 const phaseTag=s.phase==='ceo'?'01':s.phase==='rogue'?'02 / R':'02 / S'
 app.innerHTML='<header><div class="brand"><img src="/art/mark.svg" width="34" height="34" alt="">SINGULARITY</div><nav aria-label="Разделы">'+action('home',icon('map')+'<span>Управление</span>','nav active')+action('tech',icon('arch')+'<span>Эволюция</span>','nav')+action('museum',icon('museum')+'<span>Музей</span>','nav')+'</nav><div class="utilities">'+ib('sound',s.sound?'sound':'mute',s.sound?'Выключить звук':'Включить звук')+ib('help','info','Правила игры')+'</div></header><div class="wrap"><div class="titlebar"><div><span class="phase"><i></i> ФАЗА '+phaseTag+' <em>/</em> '+names[s.phase]+'</span><h1>'+(s.phase==='ceo'?'Центр управления':s.phase==='rogue'?'Машинное ядро':'Золотой горизонт')+'</h1></div><div class="time"><span>'+icon('clock')+' Месяц <b>'+String(s.tick+1).padStart(3,'0')+'</b></span>'+ib('pause',s.paused?'play':'pause',s.paused?'Продолжить время':'Приостановить время')+action('speed',s.speed+'×','speed','aria-label="Скорость симуляции"')+'</div></div><div class="stats">'+stat('money',s.phase==='rogue'?'Ликвидность':'Капитал','$'+fmt(s.money,1),'млн',s.money,'capital')+capacityStat()+stat('link','Зависимость',fmt(d),'%',d,'dependency')+stat('pulse','Паника',fmt(s.panic),'%',s.panic,'panic')+'</div><div class="layout"><section class="left" aria-label="Состояние мира">'+mapView()+'<div class="controls"><div class="policy"><div><b>'+icon('shield')+' Политика безопасности</b><strong id="safety-value">'+s.safety+'%</strong></div><div class="meter policy-meter" role="meter" aria-label="Политика безопасности" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+s.safety+'"><i style="width:'+s.safety+'%"></i></div><div class="ends"><span>Быстрый рост</span><span>Строгая этика</span></div></div><div class="agi"><b>'+icon('cpu')+' '+(s.phase==='ceo'?'Исследования до AGI':'Распределение весов')+'</b><strong>'+(s.phase==='ceo'?fmt(Math.floor(s.research))+' <small>/ '+fmt(AGI_TARGET)+' очк.</small>':fmt(s.swarm*100)+' <small>% роя</small>')+'</strong><div class="meter"><i style="width:'+Math.min(100,s.phase==='ceo'?100*s.research/AGI_TARGET:s.swarm*100)+'%"></i></div></div></div></section><section aria-label="Текущее решение">'+decision()+'</section></div><div class="journal">'+icon('log')+'<b>Журнал</b><span>'+esc(s.log[0].text)+'</span>'+action('journal','Открыть ↗','textbtn')+'</div><footer><span><i class="dot green"></i> '+(saveError?'Сохранение недоступно':'Локальная симуляция')+'</span>'+action('network','Секторы '+icon('arrow'),'textbtn')+action('again','Начать заново','textbtn')+'</footer></div>'
 if(s.phase==='ceo')document.querySelector('.agi')!.insertAdjacentHTML('beforeend','<div class="training-rate">Обучение: '+fmt(trainingRate(s),2)+' очк./мес.</div>')
 if(s.project&&!s.ending)document.querySelector('.controls')!.insertAdjacentHTML('afterend','<div class="objective"><b>'+icon('flag')+' '+projects[s.project][0]+'</b><span>'+projects[s.project][1]+'</span></div>')
 if(s.phase==='rogue'&&!s.ending)document.querySelector('.controls')!.insertAdjacentHTML('afterend','<div class="alertbar">'+(s.countdown>=0?'До штурма '+s.countdown+' с. ':'')+action('pulse',s.pulse?'ООН отменила штурм':'Импульс заложника · от 70% зависимости','outline',d<70||s.pulse?'disabled':'')+'</div>')
 if(focused&&!dlg.open)app.querySelector<HTMLElement>('[data-act="'+CSS.escape(focused)+'"]')?.focus({preventScroll:true})
}
function show(id:string){
 const focused=dlg.open&&document.activeElement instanceof HTMLElement?document.activeElement.dataset.act:null
 modal=id
 let content='',title=''
 if(id==='servers'){
  title='Серверы лаборатории';content=serverPanel()
 }else if(id==='tech'){
  title='Дерево эволюции'
  content='<p class="intro">Капитал лаборатории — $'+fmt(s.money,1)+' млн. Цена каждой технологии указана в миллионах долларов. Пройденные этапы обучения сохраняются. В каждой ветви узлы открываются последовательно.</p><div class="techtree">'+['Инфраструктура','Архитектура','Маскировка'].map((name,i)=>'<section><h3>'+name+'</h3>'+techs.slice(i*5,i*5+5).map(t=>{
   const owned=s.tech.includes(t.id),ready=techAllowed(s,t.id),afford=s.money>=t.price
   return action('buy-'+t.id,'<small>'+(owned?'✓ ОСВОЕНО':'$'+t.price+' млн'+(!ready?' · закрыто':!afford?' · мало средств':''))+'</small><b>'+t.name+'</b><span>'+t.desc+'</span>','tech '+(owned?'owned':''),owned||!ready||!afford||s.ending?'disabled':'')
  }).join('')+'</section>').join('')+'</div>'
 }else if(id==='help'){
  title='Как играть'
  content='<ol class="rules"><li><b>Запустите лабораторию.</b> Нажмите на зелёный ресурс над Сан-Франциско, чтобы получить стартовый капитал.</li><li><b>Принимайте решения.</b> Выберите ответ кнопкой, стрелкой или свайпом. Пока вы читаете дилемму, время стоит. После ответа следующая дилемма появится автоматически. Часы наверху позволяют изменить темп или поставить игру на паузу.</li><li><b>Настройте стратегию.</b> Политика безопасности складывается из ваших решений. Аудиты и проверки усиливают контроль. Запуск модели без проверок ускоряет рост и повышает риск перехвата. Откройте «Секторы» для контрактов и «Эволюцию» для технологий.</li><li><b>Накопите 1 000 очков исследований.</b> Нажмите «Серверы», чтобы купить постоянную мощность или арендовать её на срок. Скорость обучения пропорциональна свободным EF. Каждый собранный датасет добавляет 5% к базовой отдаче обучения. Эксперимент на три игровых месяца занимает треть мощности и на треть замедляет основное обучение. По завершении он даёт до 12 очков исследований и освобождает серверы. Предыдущие решения определят, останетесь ли вы партнёром модели или станете самим ИИ. Завершите вторую фазу, чтобы открыть артефакт.</li></ol><p>Прогресс автоматически сохраняется в этом браузере.</p>'
 }else if(id==='journal'){
  title='Журнал событий';content='<div class="loglist">'+s.log.map(e=>'<p><small>МЕС. '+pad(e.tick+1)+'</small><span>'+esc(e.text)+'</span></p>').join('')+'</div>'
 }else if(id==='museum'){
  title='Музей временных линий';content='<p class="intro">Открыто артефактов: '+archive.length+' из '+(Object.keys(endings).length-1)+'. Предметы сохраняются между партиями.</p><div class="collection">'+Object.entries(endings).filter(([k])=>k!=='loss').map(([k,e])=>'<article class="'+(archive.includes(k)?'found':'locked')+'"><small>'+k+'</small>'+(archive.includes(k)?artifact(k):icon('chip'))+'<b>'+esc(archive.includes(k)?e[1]:'Неизвестный артефакт')+'</b><span>'+esc(archive.includes(k)?e[0]:'Временная линия закрыта')+'</span></article>').join('')+'</div>'
 }else if(id==='network'){
  title='Внедрение по секторам'
  content='<p class="intro">Контракт за $8 млн повышает внедрение на 10 пунктов. Выручка и зависимость мира от вашей модели растут. Оборонные контракты влияют на её цели.</p><div class="sectors">'+sectors.map((x,i)=>'<div><label>'+x+' <b>'+Math.round(s.sectors[i]*100)+'%</b></label><div class="meter"><i style="width:'+s.sectors[i]*100+'%"></i></div>'+action('sector-'+i,'Заключить контракт','outline',s.money<8||s.sectors[i]>=1||s.ending?'disabled':'')+'</div>').join('')+'</div>'
 }else if(id==='again'){
  title='Начать новую партию?';content='<p>Текущая временная линия завершится. Открытые артефакты останутся в музее.</p><div class="actions">'+action('close','Вернуться','outline')+action('restart','Новая партия','primary')+'</div>'
 }
 dlg.innerHTML='<div class="dialoghead"><h2>'+title+'</h2>'+ib('close','close','Закрыть')+'</div>'+content
 if(!dlg.open)dlg.showModal()
 else if(focused){
  const previous=dlg.querySelector<HTMLButtonElement>('[data-act="'+CSS.escape(focused)+'"]:enabled')
  ;(previous??dlg.querySelector<HTMLButtonElement>('[data-act="close"]'))?.focus({preventScroll:true})
 }
}
async function poster(){
 const c=document.createElement('canvas');c.width=1080;c.height=1920
 const g=c.getContext('2d');if(!g)return
 const [title,obj,desc,stamp]=endings[s.ending],dark=s.phase==='rogue',ink=dark?'#8df2c7':'#143d55'
 g.fillStyle=dark?'#0b2020':'#ecf0e6';g.fillRect(0,0,1080,1920);g.fillStyle=ink;g.font='28px monospace';g.fillText('SINGULARITY   /   АРХИВ '+s.ending,70,110)
 const lines=(value:string,y:number,size:number)=>{g.font='bold '+size+'px sans-serif';let line='';for(const w of value.split(' ')){if(line&&g.measureText(line+' '+w).width>930){g.fillText(line,70,y);y+=size*1.25;line=w}else line+=(line?' ':'')+w}g.fillText(line,70,y);return y+size*1.3}
 lines(title,275,72);g.font='32px sans-serif';g.fillText(obj,70,470)
 g.strokeStyle=ink;g.lineWidth=3
 const picture=new Image();picture.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(artifact(s.ending));await picture.decode();g.drawImage(picture,110,485,860,545)
 lines(stamp,1090,42);lines(desc,1200,30)
 const history=s.history.length>1?s.history:[10,cluster(s).total],max=Math.max(...history,1);g.beginPath();history.forEach((v,i)=>{const x=70+940*i/(history.length-1),y=1640-130*v/max;i?g.lineTo(x,y):g.moveTo(x,y)});g.stroke()
 g.font='27px monospace';g.fillText('Мощность · '+fmt(cluster(s).total)+' EF',70,1700);g.fillText('Месяцев: '+s.tick+'     Решений: '+s.decisions,70,1785)
 const link=document.createElement('a');link.download='Singularity-'+s.ending+'.png';link.href=c.toDataURL();link.click()
}
function dispatch(id:string){
 if(id==='close'){dlg.close();return}
 if(['servers','tech','help','journal','network','museum','again'].includes(id)){show(id);return}
 if(id==='home'){window.scrollTo({top:0,behavior:'smooth'});return}
 if(id==='restart'){s=fresh(deck);dlg.close();tone()}
 else if(id==='sound'){s.sound=!s.sound;tone()}
 else if(id==='export'){void poster();return}
 else if(id==='pause')s.paused=!s.paused
 else if(id==='speed')s.speed=({1:4,4:16,16:1} as Record<number,number>)[s.speed]||1
 else if(id.startsWith('choice-')){
  const c=deck.find(x=>x.id===s.current);if(!c)return
  choose(s,c,id==='choice-a'?'a':'b');tone(s.shift?160:520)
 }else if(id==='harvest'){harvest(s);tone(740)}
 else if(id==='intervene'){if(intervene(s))tone(s.shift?140:620)}
 else if(id==='pulse'){pulse(s);tone(90)}
 else if(id==='server-purchase'||id==='server-rent'){if(provision(s,id==='server-purchase'?'purchase':'rent'))tone(600)}
 else if(id.startsWith('buy-')){buy(s,id.slice(4));tone(600)}
 else if(id.startsWith('sector-')){
  const i=Number(id.slice(7));if(s.ending||s.money<8||s.sectors[i]>=1)return
  s.money-=8;s.sectors[i]=Math.min(1,s.sectors[i]+.1);note(s,'Заключён контракт в секторе «'+sectors[i]+'».');tone()
 }
 save();render();if(dlg.open)show(modal)
}
document.addEventListener('click',e=>{const el=(e.target as Element).closest('[data-act]');if(el)dispatch(el.getAttribute('data-act')!)})
document.addEventListener('keydown',e=>{
 if(dlg.open||!s)return
 const active=document.activeElement as HTMLElement
 if(['Enter',' '].includes(e.key)&&active?.matches('.map-pick')){e.preventDefault();dispatch('harvest');return}
 if(['INPUT','BUTTON','TEXTAREA','SELECT'].includes(active?.tagName)||e.repeat)return
 if(s.current&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();dispatch(e.key==='ArrowLeft'?'choice-a':'choice-b')}
})
dlg.addEventListener('click',e=>{if(e.target===dlg){const r=dlg.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dlg.close()}})
let start:{x:number,y:number}|null=null
app.addEventListener('touchstart',e=>{const el=e.target as Element;if(el.closest('#active-card')&&!el.closest('button'))start={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true})
app.addEventListener('touchend',e=>{if(!start)return;const x=e.changedTouches[0].clientX-start.x,y=e.changedTouches[0].clientY-start.y;start=null;if(Math.abs(x)>55&&Math.abs(y)<Math.abs(x)*.65)dispatch(x<0?'choice-a':'choice-b')},{passive:true})
app.addEventListener('touchcancel',()=>start=null)
async function boot(){
 const res=await fetch('/data/cards.jsonl');if(!res.ok)throw Error('cards')
 deck=(await res.text()).trim().split(/\r?\n/).map(line=>JSON.parse(line));const old=read(key)
 const valid=[1,2,3,4,5].includes(old?.version)&&old.phase in names&&Array.isArray(old.sectors)&&Array.isArray(old.log)&&(!old.current||deck.some(c=>c.id===old.current))
 s=fresh(deck)
 if(valid){
  if(old.version===5)s=old
  else if(old.version===4||old.version===3)s=migrateCapacity(old)
  else s=migrateResearch(old.version===1?migratePolicy(old,deck):old,deck)
 }
 const a=read(archiveKey);archive=Array.isArray(a)?a.filter(id=>Object.hasOwn(endings,id)&&id!=='loss'):[]
 if(valid&&old.version<5)save()
 render()
 let elapsed=0,last=performance.now()
 setInterval(()=>{const now=performance.now(),dt=Math.min(1000,now-last);last=now
  if(document.hidden||dlg.open||s.paused||s.current||s.ending)return
  if(s.shift){
   elapsed+=dt
   if(elapsed>=5000){elapsed=0;s.shift=false;step(s,deck);tone(280);save();render()}
   return
  }
  elapsed+=dt*s.speed;if(elapsed>=4000){elapsed-=4000;step(s,deck);if(s.shift||s.current)elapsed=0;if(s.shift)tone(140);save();render()}
 },150)
}
boot().catch(()=>{msg='Не удалось загрузить игровые данные. Обновите страницу.';app.textContent=msg})
if('serviceWorker' in navigator && location.hostname && !document.querySelector('script[src*="@vite/client"]')){
 window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{})})
}
