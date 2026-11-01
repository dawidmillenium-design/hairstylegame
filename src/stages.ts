export const STAGES = [
{city:'TOKYO',place:'Ocean Container Port',sky:['#101b47','#f84fa2'],ground:'#233f66',accent:'#ff5a9c',landmarks:['🚢','🏗️','📦']},
{city:'HONG KONG',place:'Truck Parking & Mega Ship',sky:['#112c57','#ff9a56'],ground:'#34465c',accent:'#ffbd4a',landmarks:['🚛','🚢','🏙️']},
{city:'DA NANG',place:'Ocean View Hotel Road',sky:['#057dba','#8de6ed'],ground:'#37697c',accent:'#74e6ff',landmarks:['🌴','🏨','🌊']},
{city:'SIEM REAP',place:'Angkor Wat Temple',sky:['#57315b','#fbb76b'],ground:'#775e46',accent:'#ffc879',landmarks:['🌴','🛕','🌅']},
{city:'BANGKOK–PATTAYA',place:'Neon Restaurant Strip',sky:['#22134c','#d62a88'],ground:'#49365b',accent:'#ff66dd',landmarks:['🍜','💃','🍹']},
{city:'AHMEDABAD',place:'Belly Dance Festival',sky:['#722952','#ffb052'],ground:'#754c4b',accent:'#ffd35e',landmarks:['🪷','💃','🎪']},
{city:'UKRAINE',place:'American Disco Jambo',sky:['#18265c','#8146cf'],ground:'#353a75',accent:'#6ef5ff',landmarks:['🪩','🎶','✨']},
{city:'PARIS',place:'Midnight Boulevard',sky:['#1d1a54','#ae67b3'],ground:'#414066',accent:'#f3b3ff',landmarks:['🗼','🥐','✨']},
{city:'LONDON',place:'The Grand Finale',sky:['#18243f','#617ba1'],ground:'#3d4c62',accent:'#a5e9ff',landmarks:['🎡','🚌','👑']},
{city:'BOSTON',place:'Secret Harbor Bonus',sky:['#172d59','#dd688f'],ground:'#3a536e',accent:'#7efae0',landmarks:['⚓','🏙️','🎆']},
{city:'MEXICO–USA BORDER',place:'Open Desert Crossing · No Wall',sky:['#b44b69','#ffc47c'],ground:'#986b4b',accent:'#ffdb6b',landmarks:['🌵','🛣️','☀️']}
] as const;
export const STAGE_FRAMES=300;
export const getStageIndex=(frame:number)=>Math.min(Math.floor(Math.max(0,frame)/STAGE_FRAMES),STAGES.length-1);
