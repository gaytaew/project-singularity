import type {Phase} from './game'
export const hubs=[['Сан-Франциско',-122,37,'SFO'],['Лондон',0,51,'LON'],['Сингапур',104,1,'SIN'],['Токио',139,36,'TYO'],['Сан-Паулу',-47,-23,'GRU']] as const
export const position=(lon:number,lat:number)=>[(lon+180)*2.5,(83-lat)*2.52]
export const icons:Record<string,string>={
 map:'<circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="3.5" ry="8"/><path d="M4 12h16"/>',
 lab:'<path d="M9 3h6m-5 0v6L4 19q-.5 2 2 2h12q2 0 2-2l-6-10V3M7 15h10"/>',
 arch:'<path d="m3 8 9-5 9 5-9 5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
 museum:'<path d="m3 8 9-5 9 5M3 9h18M5 18v-6m5 6v-6m4 6v-6m5 6v-6M3 21h18"/>',
 log:'<path d="M4 5h16v14H4zM7 9h9m-9 5h6"/>',
 sound:'<path d="m3 9 4 0 5-4v14l-5-4H3zM15 8q4 4 0 8m3-11q7 7 0 14"/>',
 mute:'<path d="m3 9 4 0 5-4v14l-5-4H3zM16 9l5 6m0-6-5 6"/>',
 pause:'<path d="M8 5v14m8-14v14" stroke-width="3"/>',play:'<path d="m8 4 11 8-11 8z"/>',
 cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/><rect x="10" y="10" width="4" height="4"/>',
 money:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h1m10 0h1"/>',
 link:'<path d="m9 14 6-6m-7 8-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 5 0m4 2 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-5 0" transform="translate(1 0)"/>',
 pulse:'<path d="M2 13h5l3-9 4 16 3-7h5"/>',
 arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 tuning:'<path d="M3 6h18M3 12h18M3 18h18"/><path d="M8 3v6m8 0v6M9 15v6" stroke-width="3"/>',
 shield:'<path d="m12 2 8 3v6q0 7-8 11-8-4-8-11V5z"/><path d="m8 12 3 3 5-6"/>',
 chip:'<path d="m12 3 9 5v9l-9 5-9-5V8zM3 8l9 5 9-5m-9 5v9"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',plus:'<path d="M5 12h14m-7-7v14"/>',
 flag:'<path d="M5 21V4q4-3 8 0t7 0v10q-3 3-7 0t-8 0"/>'
}
export function icon(k:string){return '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linejoin="round" stroke-linecap="round">'+(icons[k]||icons.chip)+'</svg>'}
export function illustration(phase:Phase,num:number,category=''){
 const dark=phase==='rogue',ink=dark?'#91f1ce':phase==='sym'?'#81703d':'#3b6285',paper=dark?'#133233':phase==='sym'?'#f6efe0':'#e4edf2'
 let art=''
 const tower=(x:number,y:number,w:number,layers:number)=>{
  let str=''
  for(let j=0;j<layers;j++){
   const yy=y-j*6, h=w*.45
   str+='<path d="M'+x+' '+yy+'l'+w+' '+(-h)+' '+w+' '+h+' '+(-w)+' '+h+'Z" fill="'+paper+'"/><path d="M'+x+' '+yy+'v4l'+w+' '+h+' '+w+' '+(-h)+'v-4l'+(-w)+' '+h+'z" fill="'+ink+'" fill-opacity=".2"/>'
   for(let k=1;k<6;k++)str+='<path opacity=".7" d="M'+(x+w*k/6)+' '+(yy+h*k/6+1)+'v2"/>'
  }
  return str
 }
 for(let i=0;i<13;i++){let v=i*12;art+='<path opacity=".14" d="M'+(7+v)+' 84l81 35m-98 '+(-35+v*.1)+' 116-50"/>'}
 if(['reputation','public_contact','communication','crisis_attack','replication','network'].includes(category)){
  art+='<ellipse cx="102" cy="83" rx="42" ry="9"/><path d="m88 79 12-44 10 1 11 44z" fill="'+paper+'"/><path d="m77 27q21 55 49 26z" fill="'+paper+'"/><path d="m99 45 20-24m-5-2 8 6m4-16q14 11 15 24m-13-31q21 15 23 30"/>'
 }else if(['ethics','checkpoint','governance','transparency','legitimacy','safety'].includes(category)){
  art+='<path d="m52 82 54-31 44 23-53 32z" fill="'+paper+'"/><path d="m50 73 54-31 44 23-53 32z" fill="'+paper+'"/><path d="m53 62 54-31 44 23-53 32z" fill="'+paper+'"/><path d="m73 60 35-20m-29 23 35-20m-29 23 35-20m-29 23 22-13"/><circle cx="141" cy="36" r="13" fill="'+paper+'"/><path d="m135 36 4 4 8-8"/>'
 }else if(phase==='sym'){art+=tower(54,77,24,4)+tower(111,77,22,6)+'<g fill="none"><circle cx="102" cy="44" r="23"/><ellipse cx="102" cy="44" rx="10" ry="23"/><path d="M79 44h46m-44-8h42m-42 15h42"/></g>'}
 else art+=tower(45,78,23,5)+tower(84,66,25,7)+tower(110,93,21,4)
 return '<svg aria-hidden="true" class="illustration" viewBox="0 0 205 110"><g stroke="'+ink+'" stroke-width=".95" stroke-linejoin="round" fill="none">'+art+'<path opacity=".6" stroke-dasharray="2 3" d="M18 76h25M159 73h26M107 11V3"/><circle cx="17" cy="76" r="1.8"/><circle cx="186" cy="73" r="1.8"/></g><text x="9" y="107" font-size="5" font-family="monospace" fill="'+ink+'">FIG. '+String(num).padStart(2,'0')+'</text></svg>'
}
