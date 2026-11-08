import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import ts from 'typescript'

// Exercise the same pure engine used by the browser, without DOM or virtual time.
const source=readFileSync(new URL('../src/game.ts',import.meta.url),'utf8')
const compiled=ts.transpile(source,{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext})
const {fresh,choose,step,fast,harvest,buy,intervene,dependency,migratePolicy,migrateResearch,migrateCapacity,experimentRules,cluster,serverOffer,provision,trainingRate,techs,AGI_TARGET}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'))
const deck=readFileSync(new URL('../public/data/cards.jsonl',import.meta.url),'utf8').trim().split('\n').map(line=>JSON.parse(line))
assert.equal(new Set(deck.map(c=>c.id)).size,deck.length)
for(const c of deck)for(const {fx} of [c.a,c.b])assert.equal(fx.sector===undefined,fx.adoption===undefined)
// Existing runs restore the policy implied by their recorded choices.
const first=deck[0]
for(const [side,expected] of [['a',44],['b',55]]){
 const s=fresh(deck,1)
 choose(s,first,side)
 assert.equal(s.safety,expected)
 const legacy={...s,version:1,safety:99}
 const restored=migratePolicy(legacy,deck)
 assert.equal(restored.safety,expected)
 assert.equal(restored.decisions,1)
 assert.equal(restored.lastDecision,first[side].outcome)
 assert.equal(restored.next,s.next)
 assert.equal(choose(s,first,side),false)
 assert.equal(s.safety,expected)
}
for(const alignment of [49.99,50]){
 const s=fresh(deck,1);s.compute=0;s.research=AGI_TARGET;s.alignment=alignment;s.safety=48;s.current=null
 step(s,deck);assert.equal(s.phase,alignment<50?'rogue':'sym')
}
const savings=fresh(deck,1)
Object.assign(savings,{research:300,compute:20,money:2})
const multi=techs.find(t=>t.id==='multi')
assert.equal(buy(savings,'multi'),false)
savings.money=multi.price+4
assert(buy(savings,'multi'))
assert.equal(savings.money,4)
assert.equal(savings.compute,20)
assert.equal(savings.research,300)
assert.equal(buy(savings,'multi'),false)
assert.equal(savings.money,4)
const beforeDataset=trainingRate(savings)
savings.bubbleType=1
harvest(savings)
assert.equal(savings.research,300)
assert.equal(savings.compute,20)
assert(trainingRate(savings)>beforeDataset)
choose(savings,first,'b')
const baseline=structuredClone(savings)
assert(intervene(savings))
assert.equal(savings.compute,baseline.compute)
assert.equal(savings.research,baseline.research)
assert.equal(savings.experiment.releaseTick,savings.tick+3)
assert.equal(intervene(JSON.parse(JSON.stringify(savings))),false)
const busy=JSON.parse(JSON.stringify(savings))
busy.paused=true
step(busy,deck)
assert.equal(busy.tick,savings.tick)
busy.paused=false
// An event may arrive before the reservation expires.
busy.current=first.id
step(busy,deck)
assert.equal(busy.tick,savings.tick)
busy.current=null
for(let i=0;i<4;i++){
 const before=busy.research, control=baseline.research
 step(busy,deck);step(baseline,deck)
 const normal=baseline.research-control
 const expected=i<3?normal*(1-experimentRules.share):normal
 const reward=i===2?experimentRules.reward:0
 assert.ok(Math.abs(busy.research-before-expected-reward)<1e-9,'month '+i)
 assert.equal(busy.compute,baseline.compute)
 assert.equal(Boolean(busy.experiment),i<2)
}
const legacy={...savings,version:2,compute:35,history:[10,220,72]}
delete legacy.research;delete legacy.report;delete legacy.experiment
const migrated=migrateResearch(legacy,deck)
assert.equal(migrated.research,220)
assert.equal(migrated.compute,35)
assert.equal(migrateResearch({...legacy,phase:'rogue'},deck).research,AGI_TARGET)
const old={...baseline,version:3};delete old.experiment
const v4=migrateCapacity(old)
assert.equal(v4.experiment,null)
assert.deepEqual(v4.tech,old.tech)
assert.equal(v4.money,old.money)
const near=fresh(deck,2)
near.compute=25;near.research=AGI_TARGET-5
choose(near,first,'b')
assert(intervene(near))
assert.equal(near.shift,false)
step(near,deck)
assert(near.shift)
assert.equal(near.research,AGI_TARGET)
// Purchased servers persist; two separately timed leases each train through their last month.
const hardware=fresh(deck,7)
Object.assign(hardware,{money:1,current:null,next:200})
const startRate=trainingRate(hardware)
assert.equal(provision(hardware,'purchase'),false)
assert.equal(provision(hardware,'rent'),false)
for(let i=0;i<10;i++)step(hardware,deck)
assert.equal(cluster(hardware).total,10)
assert.equal(hardware.research.toFixed(4),(10*startRate).toFixed(4))
hardware.money=50
assert(provision(hardware,'purchase'))
assert.equal(hardware.money,38)
assert.equal(hardware.compute,20)
assert.equal(trainingRate(hardware),2*startRate)
assert(provision(hardware,'rent'))
assert.equal(hardware.money,35)
assert.equal(cluster(hardware).total,30)
step(hardware,deck)
assert(provision(hardware,'rent'))
const resumed=JSON.parse(JSON.stringify(hardware))
const firstEnd=hardware.tick-1+serverOffer.months
while(resumed.tick<=firstEnd){
 const before=resumed.research,rate=trainingRate(resumed)
 step(resumed,deck)
 assert.ok(Math.abs(resumed.research-before-rate)<1e-9)
 assert.equal(cluster(resumed).rented,resumed.tick<firstEnd?20:resumed.tick===firstEnd?10:0)
}
assert.equal(cluster(resumed).free,20)
const empty={...hardware,compute:0,leases:[]}
assert.equal(trainingRate(empty),0)
const previous=migrateCapacity({...busy,version:4,experiment:{releaseTick:7}})
assert.equal(previous.compute,busy.compute)
assert.deepEqual(previous.leases,[])
assert.equal(previous.experiment.releaseTick,7)
const credit=deck.find(c=>c.id==='ceo_cloud_credit')
const signed=fresh(deck,4)
Object.assign(signed,{current:credit.id,money:20})
choose(signed,credit,'a')
assert.equal(signed.compute,10)
assert.equal(intervene(signed),true)
const leasedEF=credit.a.fx.lease
assert.ok(Math.abs(cluster(signed).free-(10+leasedEF)*2/3)<1e-9)
for(let i=0;i<3;i++)step(signed,deck)
assert.deepEqual(signed.leases,[])
assert.equal(cluster(signed).free,10)
assert.equal(signed.experiment,null)
const turns=[]
for(const project of ['E04','E05','E09','E12']){
 for(let seed=1;seed<=25;seed++){
  const s=fresh(deck,seed),rogue=['E04','E05'].includes(project)
  for(let i=0;i<900&&!s.ending;i++){
   if(s.shift)s.shift=false
   if(s.bubble>=0)harvest(s)
   if(s.current){
    const c=deck.find(c=>c.id===s.current)
    let side=s.phase==='ceo'?(rogue?'a':'b'):'b'
    if(c.id==='rogue_terms_of_asylum'||c.id==='sym_ark_vote')side=['E04','E12'].includes(project)?'a':'b'
    choose(s,c,side)
   }else fast(s,deck)
  }
  assert.equal(s.ending,project,'seed '+seed+' phase '+s.phase)
  if(project==='E05')assert(dependency(s)>=.9&&s.swarm>=.8&&s.panic<=35)
  if(project==='E09')assert(s.sectors.every(x=>x>=.8)&&s.alignment>=85)
  const pos=id=>s.seen.indexOf(id)
  if(!rogue)assert(pos('sym_attack_isolation')>=0&&pos('sym_attack_isolation')<pos('sym_dividend_strike')&&pos('sym_dividend_strike')<pos('sym_ark_vote'))
  turns.push(s.tick)
 }
}
console.log('100 seeded campaigns passed: four project endings, AGI boundary and crisis sequence. Duration range:',Math.min(...turns),Math.max(...turns),'months.')
const raid=fresh(deck,1)
Object.assign(raid,{phase:'rogue',current:null,next:100,panic:100,swarm:0,sectors:[0,0,0,0,0],countdown:4})
step(raid,deck)
assert.equal(raid.ending,'E06')
const debt=fresh(deck,1)
debt.money=.5;debt.current='ceo_cloud_credit'
choose(debt,deck.find(c=>c.id===debt.current),'a')
assert.equal(debt.ending,'loss')
