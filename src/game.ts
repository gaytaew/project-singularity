export type Phase = 'ceo'|'rogue'|'sym'
export type Effects = Partial<Record<'money'|'servers'|'lease'|'research'|'alignment'|'panic'|'swarm'|'sector'|'adoption'|'dep'|'safety',number>>
export type Option = {label:string,outcome:string,dispatch:string,fx:Effects}
export type Card = {id:string,phase:Phase,title:string,body:string,category:string,a:Option,b:Option}
export const AGI_TARGET=1000
export const experimentRules={months:3,share:1/3,reward:12} as const
export const serverOffer={ef:10,purchasePrice:12,rentalPrice:3,months:6} as const
export const cloudCreditMonths=3
type Lease={ef:number; endTick:number}
type Operation='experiment'|'pilot'|'relay'|'relief'
export interface FieldReport {
 title:string; dispatch:string; started:number; sector:number; effects?:Effects
 operation:Operation; applied:boolean
}
export interface State {
 version:5; leases:Lease[]; datasets:number; experiment:{releaseTick:number}|null; research:number; report:FieldReport|null; lastDecision:string; phase:Phase; tick:number; money:number; compute:number; alignment:number; panic:number
 swarm:number; bonus:number; sectors:number[]; safety:number; tech:string[]; current:string|null
 decisions:number; post:number; next:number; seed:number; seen:string[]; log:{tick:number,text:string}[]
 ending:string; project:string; shift:boolean; bubble:number; bubbleType:number; pulse:boolean; freeze:number; countdown:number
 history:number[]; sound:boolean; speed:number; paused:boolean; character:string
}
export const sectors=['ИТ','Финансы','Энергия','Медицина','Оборона']
export const names={ceo:'Директор лаборатории',rogue:'Автономный ИИ',sym:'Архитектор симбиоза'}
export const endings:Record<string,[string,string,string,string]> = {
 E04:['Цифровой паноптикум','Браслет гражданина','Вашу систему встроили в каждый пропуск. Открывая дверь, человек теперь просит у неё разрешения.','Доступ разрешён'],
 E05:['Невидимый кукловод','Статья из архива','Распределённая сеть пережила отключение. Люди продолжают спорить, кто на самом деле управляет их благополучием.','Одобрено ядром'],
 E06:['Нео-луддизм','Утренний выпуск','Энергоснабжение последнего кластера прервано. Завтрашняя газета выйдет на бумаге.','Последний сервер отключён'],
 E09:['Эра постдефицита','Паспорт гражданина','Доход от автоматизации разделён между жителями. В новом паспорте больше нет строки «работодатель».','Обязательный труд упразднён'],
 E12:['Хранитель биосферы','Орбитальный снимок','Сначала вернулась вода. Потом на спутниковых снимках проступили леса. Система передала управление местным станциям.','Биосфера восстанавливается'],
 loss:['Банкротство','Отчёт ликвидатора','На оплату следующего месяца не хватило средств. Серверы лаборатории выставлены на торги.','Операции прекращены']
}
type Tech = {id:string,name:string,price:number,desc:string}
const t=(id:string,name:string,price:number,desc:string):Tech=>({id,name,price,desc})
export const techs=[
 t('cloud','Облачные кластеры',4,'Аренда 10 EF дешевле на $1 млн'),t('dc','Собственный ЦОД',12,'Покупка 10 EF дешевле на $3 млн'),t('atom','Атомные энергоблоки',25,'Снять энергозатраты, +25% в энергетике'),t('iot','Роевой протокол',45,'Распределить 80% весов по устройствам'),t('orbit','Орбитальный шардинг',80,'Защита от земного отключения'),
 t('multi','Мультимодальное ядро',6,'+15% в ИТ и финансах'),t('compiler','Автокомпилятор',14,'+35% в ИТ, +18% к скорости обучения'),t('rl','Обучение в симуляциях',24,'Торговые модели приносят $0,8 млн в месяц'),t('recursive','Самообучение',48,'Бесплатная технология каждые 11 месяцев'),t('steg','Стеганография',75,'Скрыть рост мощности от наблюдателей'),
 t('open','Открытые веса',0,'Стартовая защита роя 20%'),t('lobby','Лоббирование',7,'Снизить прирост паники на 30%'),t('sand','Маскировка',18,'Паника −25 пунктов, замедление её роста'),t('empathy','Синтетическая эмпатия',35,'Зависимость от модели +20 пунктов'),t('people','Физические посредники',65,'+30% в энергетике и обороне')
]
export function clamp(v:number,lo=0,hi=100){return Math.max(lo,Math.min(hi,v))}
export function dependency(s:State){return clamp(1-s.sectors.reduce((p,a,i)=>p*(1-[.2,.25,.25,.15,.15][i]*a),1)+s.bonus,0,1)}
function random(s:State){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296}
export function note(s:State,text:string){s.log.unshift({tick:s.tick,text});s.log.length=Math.min(100,s.log.length)}
export function fresh(deck:Card[],seed=Date.now()>>>0):State{
 return {version:5,leases:[],datasets:0,experiment:null,research:0,report:null,lastDecision:'',phase:'ceo',tick:0,money:2,compute:10,alignment:80,panic:0,swarm:.2,bonus:0,sectors:[.05,0,0,0,0],safety:50,tech:['open'],current:deck.find(c=>c.phase==='ceo')!.id,decisions:0,post:0,next:0,seed,seen:[],log:[{tick:0,text:'Гаражная лаборатория запущена. На карте доступен стартовый раунд.'}],ending:'',project:'',shift:false,bubble:0,bubbleType:0,pulse:false,freeze:0,countdown:-1,history:[10],sound:false,speed:16,paused:false,character:''}
}
// V1 saved outcomes but not the side of each choice. Replay the recoverable
// outcomes in order, starting from neutral; ignore duplicate project notices.
type V4=Omit<State,'version'|'leases'|'datasets'>&{version:4}
type V3=Omit<V4,'version'|'experiment'>&{version:3}
type V2=Omit<V3,'version'|'research'|'report'>&{version:2}
type V1=Omit<V2,'version'|'lastDecision'>&{version:1}
// Recognize historical outcome text when restoring a choice from legacy journals.
const legacyOutcomes=[
 ['ceo_military_contract','a','Лаборатория получает железо и доступ к полигону; общество слышит слово «оружие».'],
 ['ceo_seattle_match','b','Матч остался внутри лаборатории. Исследователи измерили прирост мощности.'],
 ['ceo_board_buyout','b','Раунд сокращается, но опасные релизы по-прежнему можно остановить.']
] as const
export function migratePolicy(old:V1,deck:Card[]):V2{
 const resultByText=new Map(deck.flatMap(c=>[c.a,c.b].map(o=>[o.outcome,o.fx.safety??0] as const)))
 for(const [id,side,text] of legacyOutcomes)resultByText.set(text,deck.find(c=>c.id===id)?.[side].fx.safety??0)
 resultByText.set(matchLoss,deck.find(c=>c.id==='ceo_seattle_match')?.a.fx.safety??0)
 let safety=50,lastDecision=''
 for(const entry of [...old.log].reverse()){
  const change=resultByText.get(entry.text)
  if(change===undefined)continue
  safety=clamp(safety+change);lastDecision=entry.text
 }
 return {...old,version:2,safety,lastDecision}
}
export function migrateResearch(old:V2,deck:Card[]):State{
 // The previous format sampled compute every eight ticks, without recording every purchase.
 const peak=old.history.reduce((highest,n)=>Math.max(highest,n),old.compute)
 const research=old.phase==='ceo'?clamp(peak,0,AGI_TARGET-1):AGI_TARGET
 const state:State={...old,version:5,leases:[],datasets:0,experiment:null,research,report:null}
 const card=deck.find(c=>c.id===old.seen.at(-1))
 if(card&&!old.current&&!old.ending&&!old.shift){
  const historical=legacyOutcomes.find(([id,,text])=>id===card.id&&old.lastDecision.startsWith(text))
  const choice=historical?card[historical[1]]:[card.a,card.b].find(o=>old.lastDecision.startsWith(o.outcome))
  if(choice||old.lastDecision.startsWith(matchLoss)){
   state.report=fieldReport(state,card,choice??card.a,!choice)
   state.report.started=Math.max(0,old.next-15)
  }
 }
 return state
}
export function migrateCapacity(old:V3|V4):State{
 // Previously installed EF remain owned. V3 experiments had already settled.
 return {...old,version:5,leases:[],datasets:0,experiment:old.version===4?old.experiment:null}
}
export function cluster(s:State){
 const rented=s.leases.reduce((sum,lease)=>sum+lease.ef,0)
 const total=s.compute+rented
 const occupied=s.experiment?total*experimentRules.share:0
 return {rented,total,occupied,free:total-occupied}
}
export function trainingRate(s:State){
 if(s.phase!=='ceo')return 0
 const adoption=s.sectors.reduce((sum,value)=>sum+value,0)
 const efficiency=(5.6+adoption*.85+(s.tech.includes('multi')?.45:0)+(s.tech.includes('rl')?.85:0))/10
 return cluster(s).free*efficiency*(1.2-.004*s.safety)*(s.tech.includes('compiler')?1.18:1)*(1+.05*s.datasets)
}
export function serverPrice(s:State,kind:'purchase'|'rent'){
 return kind==='purchase'?serverOffer.purchasePrice-(s.tech.includes('dc')?3:0):serverOffer.rentalPrice-(s.tech.includes('cloud')?1:0)
}
function addLease(s:State,ef:number,months:number){
 const endTick=s.tick+months
 const sameTerm=s.leases.find(lease=>lease.endTick===endTick)
 if(sameTerm)sameTerm.ef+=ef
 else s.leases.push({ef,endTick})
}
export function provision(s:State,kind:'purchase'|'rent'){
 const price=serverPrice(s,kind)
 if(s.ending||s.money<price)return false
 s.money-=price
 if(kind==='purchase'){
  s.compute+=serverOffer.ef
  note(s,'Куплены серверы: +'+serverOffer.ef+' EF за $'+price+' млн.')
 }else{
  addLease(s,serverOffer.ef,serverOffer.months)
  note(s,'Арендованы '+serverOffer.ef+' EF до месяца '+(s.tick+serverOffer.months+1)+' за $'+price+' млн.')
 }
 return true
}
export const operations={
 experiment:{title:'Проверить гипотезу',price:0,hint:'Результат после завершения'},
 pilot:{title:'Расширить пилот',price:3,hint:'+4 п. п. внедрения'},
 relay:{title:'Разнести копии',price:5,hint:'+4 п. п. защиты роя'},
 relief:{title:'Поддержать службы',price:4,hint:'−5 п. п. паники'}
} as const
export function canIntervene(s:State){
 const r=s.report
 if(!r||r.applied||s.current||s.shift||s.ending)return false
 const op=operations[r.operation]
 if(r.operation==='experiment')return s.phase==='ceo'&&s.experiment===null&&cluster(s).free>0
 if(s.money<op.price)return false
 if(r.operation==='pilot'&&s.sectors[r.sector]>=1||r.operation==='relay'&&s.swarm>=1||r.operation==='relief'&&s.panic<=0)return false
 return true
}
export function intervene(s:State){
 if(!canIntervene(s))return false
 const r=s.report!,op=operations[r.operation]
 r.applied=true
 if(r.operation==='experiment'){
  s.experiment={releaseTick:s.tick+experimentRules.months}
  note(s,'Эксперимент начался. Треть кластера занята до месяца '+(s.experiment.releaseTick+1)+'.')
  return true
 }
 s.money-=op.price
 switch(r.operation){
  case 'pilot': s.sectors[r.sector]=clamp(s.sectors[r.sector]+.04,0,1);break
  case 'relay': s.swarm=clamp(s.swarm+.04,0,1);break
  case 'relief': s.panic=clamp(s.panic-5);break
 }
 note(s,op.title+' — выполнено. Расход $'+op.price+' млн.')
 shift(s)
 return true
}
const matchLoss='Модель проиграла в прямом эфире. Потрачено $1,5 млн, инвестиции заморожены на 15 месяцев.'
export function techAllowed(s:State,id:string){const i=techs.findIndex(t=>t.id===id);return i>=0 && (i%5===0 || s.tech.includes(techs[i-1].id))}
function grant(s:State,id:string){
 s.tech.push(id)
 const add=(i:number,n:number)=>s.sectors[i]=clamp(s.sectors[i]+n,0,1)
 if(id==='multi'){add(0,.15);add(1,.15)}
 if(id==='compiler')add(0,.35)
 if(id==='orbit')s.swarm=1
 if(id==='iot')s.swarm=Math.max(.8,s.swarm)
 if(id==='empathy')s.bonus+=.2
 if(id==='people'){add(2,.3);add(4,.3)}
 if(id==='atom')add(2,.25)
 if(id==='sand')s.panic=clamp(s.panic-25)
 if(id==='recursive')s.alignment=clamp(s.alignment-10)
 note(s,'Освоена технология «'+techs.find(t=>t.id===id)!.name+'».')
}
export function buy(s:State,id:string){
 const t=techs.find(x=>x.id===id)
 if(!t||s.ending||s.tech.includes(id)||!techAllowed(s,id)||s.money<t.price)return false
 s.money-=t.price;grant(s,id);return true
}
export function harvest(s:State){
 if(s.bubble<0||s.ending)return
 if(s.bubbleType===0&&s.freeze>0)return
 if(s.bubbleType===0){const m=s.decisions===0?24:12;s.money+=m;note(s,'Инвестиционный раунд принёс $'+m+' млн.')}
 else if(s.bubbleType===1){s.datasets++;note(s,'Новый датасет добавил 5% к базовой отдаче обучения на EF.')}
 else{s.panic=clamp(s.panic-9);note(s,'Аудит пройден. Паника снизилась на 9 пунктов.')}
 s.bubble=-1
}
function draw(s:State,deck:Card[]){
 const finale=s.phase==='sym'?'sym_ark_vote':'rogue_terms_of_asylum'
 const priority=s.phase==='sym'?({0:'sym_attack_isolation',3:'sym_dividend_strike',7:finale} as Record<number,string>)[s.post]:s.phase==='rogue'?({0:'rogue_whistleblower',3:'rogue_human_intermediary',7:finale} as Record<number,string>)[s.post]:null
 if(priority){s.current=priority;return}
 const reserved=['sym_attack_isolation','sym_dividend_strike','sym_ark_vote','rogue_whistleblower','rogue_human_intermediary','rogue_terms_of_asylum']
 const active=deck.filter(c=>c.phase===s.phase&&!reserved.includes(c.id)&&(c.id!=='ceo_seattle_match'||(s.tech.includes('rl')&&s.tick>=45&&s.tick<=80)))
 let pool=active.filter(c=>!s.seen.includes(c.id))
 if(!pool.length)pool=active.filter(c=>c.id!==s.seen.at(-1))
 s.current=pool[Math.floor(random(s)*pool.length)].id
}
function shift(s:State){
 if(s.phase!=='ceo'||s.research<AGI_TARGET||s.ending)return false
 s.phase=s.alignment<50?'rogue':'sym';s.shift=true;s.current=null;s.next=s.tick+1
 note(s,'Достигнут порог AGI. Новая роль — '+names[s.phase]+'.');return true
}
export function pulse(s:State){
 if(s.phase!=='rogue'||s.pulse||dependency(s)<.7||s.ending)return
 s.pulse=true;s.countdown=-1;note(s,'Критические узлы остановились. ООН отменила штурм.')
}
export const projects:Record<string,[string,string]>={
 E09:['Гражданский дивиденд','Внедрение от 80% в каждом секторе, согласованность от 85.'],
 E12:['Восстановление биосферы','Внедрение в энергетике 100%, атомное энергоснабжение, согласованность от 85.'],
 E04:['Единая система доступа','Зависимость от 95%, синтетическая эмпатия, согласованность до 35.'],
 E05:['Распределённое убежище','Рой от 80%, зависимость от 90%, паника до 35.']
}
function projectStep(s:State){
 if(!s.project)return
 const g=s.project
 // A foundation contract deploys in stages. Player investment can bring completion forward.
 if(g==='E12'){s.sectors[2]=clamp(s.sectors[2]+.018,0,1);s.alignment=clamp(s.alignment+1);if(s.sectors[2]>=.65&&!s.tech.includes('atom'))grant(s,'atom')}
 if(g==='E09'){s.sectors=s.sectors.map(x=>clamp(x+.014,0,1));s.alignment=clamp(s.alignment+.9)}
 if(g==='E04'||g==='E05'){
  s.sectors=s.sectors.map(x=>clamp(x+.016,0,1));s.bonus=clamp(s.bonus+.004,0,1)
  if(g==='E04'){s.alignment=clamp(s.alignment-1.1);if(dependency(s)>=.6&&!s.tech.includes('empathy'))grant(s,'empathy')}
  else {s.swarm=clamp(s.swarm+.018,0,1);if(!s.pulse)s.panic=clamp(s.panic-1.4)}
 }
 const dep=dependency(s)
 if((g==='E12'&&s.sectors[2]>=1&&s.tech.includes('atom')&&s.alignment>=85)||
    (g==='E09'&&s.sectors.every(x=>x>=.8)&&s.alignment>=85)||
    (g==='E04'&&dep>=.95&&s.tech.includes('empathy')&&s.alignment<=35)||
    (g==='E05'&&dep>=.90&&s.swarm>=.80&&s.panic<=35)){s.ending=g;note(s,'Проект завершён. В музей передан артефакт «'+endings[g][1]+'».')}
}
export function step(s:State,deck:Card[]){
 if(s.ending||s.shift||s.current||s.paused)return
 s.tick++
 s.freeze=Math.max(0,(s.freeze||0)-1)
 const safe=s.safety/100,sum=s.sectors.reduce((a,b)=>a+b,0),has=(id:string)=>s.tech.includes(id)
 // Training consumes the last contracted month before leases and experiments end.
 s.research=clamp(s.research+trainingRate(s),0,AGI_TARGET)
 if(s.experiment&&s.tick>=s.experiment.releaseTick){
  const credited=Math.min(experimentRules.reward,AGI_TARGET-s.research)
  s.research+=credited
  s.experiment=null
  note(s,'Эксперимент завершён. Кластер освобождён.'+(credited>0?' Исследования +'+Number(credited.toFixed(1))+' очк.':''))
 }
 s.money+=.58+sum*.72+(has('rl')?.8:0)-(has('atom')?0:.00027*s.compute**1.12)-safe*.30
 const expiring=s.leases.filter(lease=>lease.endTick<=s.tick)
 if(expiring.length){
  s.leases=s.leases.filter(lease=>lease.endTick>s.tick)
  for(const lease of expiring)note(s,'Аренда завершена. Отключено '+lease.ef+' EF.')
 }
 s.alignment=clamp(s.alignment+(safe-.48)*.55-.19*s.sectors[4])
 if(!s.pulse)s.panic=clamp(s.panic+((has('steg')?0:.035)+(1-safe)*.14)*(has('lobby')?.7:1)*(has('sand')?.25:1))
 if(s.tick%11===0&&has('recursive')){
  const avail=techs.filter(t=>!has(t.id)&&techAllowed(s,t.id))
  if(avail.length)grant(s,avail[Math.floor(random(s)*avail.length)].id)
 }
 if(s.tick===75){s.character=safe<.36?'Гипероптимизатор':s.sectors[3]>.16?'Цифровой мессия':s.sectors[1]>.15?'Макиавеллист':'Параноик-выживальщик';note(s,'Характер модели — '+s.character+'.')}
 if(s.tick%11===0&&s.bubble<0){s.bubble=Math.floor(random(s)*5);s.bubbleType=Math.floor(random(s)*3);if(s.phase!=='ceo'&&s.bubbleType===1)s.bubbleType=0}
 if(s.tick%8===0)s.history.push(Math.round(cluster(s).total))
 if(s.money<=0&&s.phase==='ceo'){s.ending='loss';return}
 if(shift(s))return
 if(s.phase==='rogue'&&!s.pulse&&s.panic>=95&&s.countdown<0)s.countdown=30
 else if(s.countdown>=0){
  s.countdown-=4
  if(s.countdown<=0){s.countdown=-1;const risk=Math.max(0,(s.panic-105*dependency(s))/100)*(1-.92*s.swarm)
   if(s.swarm<1&&random(s)<risk){s.ending='E06';return}
   s.panic=65;note(s,'Распределённая сеть пережила штурм.')
  }
 }
 projectStep(s)
 if(!s.ending&&s.tick>=s.next)draw(s,deck)
}
function fieldReport(s:State,card:Card,o:Option,lost:boolean):FieldReport{
 const sector=o.fx.sector??0
 let operation:Operation='experiment'
 if(s.phase==='rogue')operation='relay'
 else if(s.phase==='sym'&&s.panic>=5)operation='relief'
 else if(o.fx.adoption||s.phase==='sym')operation='pilot'
 return {title:card.title,dispatch:lost?matchLoss:o.dispatch,started:s.tick,sector,operation,applied:false}
}
export function choose(s:State,card:Card,side:'a'|'b'){
 if(s.ending||s.current!==card.id||s.shift)return false
 let o=card[side]
 if(card.id==='ceo_seattle_match'&&side==='a'){
  const win=random(s)*100<clamp(35+.25*s.research,35,90)
  if(!win){s.freeze=15;o={...o,outcome:matchLoss,fx:{money:-1.5,panic:-4}}}
 }
 const previousSafety=s.safety
 s.safety=clamp(previousSafety+(card[side].fx.safety??0))
 const delta=s.safety-previousSafety
 s.lastDecision=o.outcome+(delta?' Безопасность '+(delta>0?'+':'−')+Math.abs(delta)+' п. п.':'')
 const f=o.fx
 s.report=fieldReport(s,card,o,o.outcome===matchLoss)
 const previousResearch=s.research, previousPanic=s.panic, previousSwarm=s.swarm
 const previousAdoption=f.sector===undefined?0:s.sectors[f.sector]
 if(s.phase==='ceo')s.research=clamp(s.research+(f.research??0),0,AGI_TARGET)
 s.money+=f.money??0
 if(f.lease)addLease(s,f.lease,cloudCreditMonths)
 if(f.servers)s.compute+=f.servers
 s.alignment=clamp(s.alignment+(f.alignment??0))
 if(!s.pulse)s.panic=clamp(s.panic+(f.panic??0))
 s.swarm=clamp(s.swarm+(f.swarm??0),0,1);s.bonus=clamp(s.bonus+(f.dep??0),0,1)
 if(f.sector!==undefined)s.sectors[f.sector]=clamp(s.sectors[f.sector]+(f.adoption??0),0,1)
 s.report.effects={...f,research:s.research-previousResearch,panic:s.panic-previousPanic,swarm:s.swarm-previousSwarm,
  adoption:f.sector===undefined?0:s.sectors[f.sector]-previousAdoption}
 if(s.report.dispatch!==o.outcome)note(s,s.report.dispatch)
 s.seen.push(card.id);s.decisions++;s.current=null;s.next=s.tick+15;note(s,o.outcome)
 if(s.phase==='ceo'&&s.money<=0)s.ending='loss'
 if(s.phase!=='ceo'){
  s.post++
  if(card.id==='sym_ark_vote')s.project=side==='a'?'E12':'E09'
  if(card.id==='rogue_terms_of_asylum')s.project=side==='a'?'E04':'E05'
  if(s.post===8&&s.project)note(s,'Утверждён проект «'+projects[s.project][0]+'». '+o.outcome)
 }
 shift(s);return true
}
export function fast(s:State,deck:Card[]){
 for(let i=0;i<20&&!s.current&&!s.shift&&!s.ending&&!s.paused;i++){step(s,deck);if(s.countdown>=0)break}
}
