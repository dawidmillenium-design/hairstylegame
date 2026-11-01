import { GORILLA_URL, MERHUJUS_URL, MRPING_URL } from './assets/extra';
import { tileStyle } from './assets/gameArt';
import { STAGES } from './stages';
import './cinematicWorld.css';

type Props = {
  lives: number;
  score: number;
  highScore: number;
  combo: number;
  tires: number;
  gold: number;
  souvenirs: number;
  stageIndex: number;
  boostReady: boolean;
  onRpg: () => void;
  onTrade: () => void;
  onDash: () => void;
  onJump: () => void;
};
/** Overlay chrome is kept independent from the simulation: player actions remain testable. */
export default function ArcadeChrome(p:Props) {
  const city = STAGES[Math.min(STAGES.length-1,p.stageIndex)];
  const best = p.highScore > 0 && p.score > p.highScore;
  return (
    <div className="world-chrome" aria-label="Cinematic pixel arcade heads-up display">
      <div className="world-top">
        <div className="world-logo"><b>BLACKHUJUS</b><strong>SHADOW ROUTES</strong><small>WORLD TRUCK TOUR • VOL. 02</small></div>
        <div className="world-party" aria-label="Four comedy characters">
          <div><img src={MRPING_URL} alt="" /><span>MR PING</span></div>
          <div className="world-party-main"><img src={GORILLA_URL} alt="" /><span>BLACKHUJUS</span></div>
          <div><img src={MERHUJUS_URL} alt="" /><span>MERHUJUS</span></div>
          <div className="world-bunny"><span style={tileStyle('bunnyCafe')} aria-hidden="true" /><span>MR BUNNY</span></div>
        </div>
        <div className="world-wallet">
          <div className="world-hearts" aria-label={p.lives+' lives'}><strong>{'♥'.repeat(Math.min(p.lives,10))}</strong><span>×{p.lives}</span></div>
          <div className="world-gold"><span>🪙 GOLD</span> <b>{p.gold.toLocaleString()}</b></div>
        </div>
      </div>
      <div className="world-left">
        <div className="world-hud-panel world-location">
          <span>✦ STAGE {p.stageIndex+1} / 11</span>
          <strong>{city.city}</strong>
          <small>{city.place}</small>
        </div>
        <div className="world-hud-panel world-quests">
          <b>📜 QUEST LOG</b>
          <p>□ Collect black truck tires</p>
          <p className={p.tires>=5?'completed':''}>{p.tires>=5?'☑':'□'} Trade 5 tires for 1 gold</p>
          <p className={p.souvenirs>0?'completed':''}>{p.souvenirs>0?'☑':'□'} Find rare souvenirs</p>
          <p>□ Explore the secret routes</p>
        </div>
      </div>
      <div className="world-right">
        <div className="world-hud-panel world-minimap">
          <div>✧ WORLD ROUTES <span>GLOBAL</span></div>
          <div className="world-minimap-img" style={tileStyle('shadowMap')} aria-label="Pixel art travel map" role="img" />
          <small>📍 {city.city} · NEXT: {STAGES[Math.min(p.stageIndex+1,STAGES.length-1)].city}</small>
        </div>
        <div className="world-hud-panel world-dialogue">
          <strong>🐰 MR BUNNY SAYS</strong>
          <p>{p.combo>2?'That combo is so hot it needs a fire extinguisher!':p.tires>=5?'Five tires? Congratulations, your rubber is turning into gold!':'Collect tires! My calculator is wearing sunglasses!'}</p>
          <button type="button" onClick={p.onRpg}>💬 OPEN RPG · QUESTS</button>
        </div>
      </div>
      <div className="world-bottom">
        <div className="world-stat"><b>LV {1+Math.floor(p.score/750)} BLACKHUJUS</b><span>EXP {p.score.toLocaleString()} {best?'✦ NEW BEST':''}</span><i style={{width:(p.score%750)/7.5+'%'}}/></div>
        <div className="world-items">
          <span>🗺️ {p.souvenirs}</span><span>💿 {p.souvenirs}</span><span>💵 {p.souvenirs}</span><span>🛞 {p.tires}</span>
          <span className="world-gold-small">🪙 {p.gold}</span>
          <button type="button" onClick={p.onTrade} disabled={p.tires<5} title="Trade five tires for one gold bar">⇄ TRADE E</button>
        </div>
        <div className="world-action-buttons">
          <button type="button" className="world-dash" disabled={!p.boostReady} onClick={p.onDash}>⚡ DASH <small>SHIFT</small></button>
          <button type="button" className="world-jump" onClick={p.onJump}>↑ JUMP</button>
        </div>
      </div>
    </div>
  );
}
