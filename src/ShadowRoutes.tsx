import { useEffect, useState } from 'react';
import { GAME_ART, tileStyle, type ArtKey } from './assets/gameArt';
import { GORILLA_URL, MERHUJUS_URL, MRPING_URL } from './assets/extra';
import './shadowRoutes.css';

type Tab = 'routes' | 'crew' | 'quests' | 'archive';
type Character = 'bunny' | 'ping' | 'trucker' | 'gorilla';
type Progress = { xp: number; trust: number; comedy: number; verified: boolean; jokes: number; traded: number; postcards: number };

const DEFAULT: Progress = { xp: 0, trust: 45, comedy: 32, verified: false, jokes: 0, traded: 0, postcards: 0 };
const CREW: { id: Character; name: string; title: string; quote: string; art: ArtKey; emoji: string }[] = [
  { id: 'ping', name: 'MR PING', title: 'The Deal-Maker', quote: 'My prices are so low, even my calculator asked for a raise.', art: 'character', emoji: '⚡' },
  { id: 'gorilla', name: 'BLACKHUJUS', title: 'Tire Kingpin', quote: 'Five tires for a gold bar? I thought I was ordering five-star room service!', art: 'gorilla', emoji: '🦍' },
  { id: 'trucker', name: 'MERHUJUS', title: 'The European Hauler', quote: 'I have driven all week. At least the tires never ask for a bathroom break.', art: 'polishTrucker', emoji: '🚛' },
  { id: 'bunny', name: 'MR BUNNY', title: 'The SEO Adventurer', quote: 'I ranked a container on Google. Unfortunately, it was an empty box.', art: 'bunnyCafe', emoji: '🐰' },
];
const ROUTES = [
  ['TOKYO', 'HONG KONG', 'DA NANG', 'SIEM REAP'],
  ['BANGKOK', 'AHMEDABAD', 'UKRAINE', 'PARIS'],
  ['LONDON', 'BOSTON (SECRET)', 'TEXAS–MEXICO (GHOST)']
];

function readProgress(): Progress {
  try {
    const saved = window.localStorage.getItem('blackhujus-rpg-v1');
    if (saved) {
      const v = JSON.parse(saved) as Partial<Progress>;
      return { ...DEFAULT, ...v };
    }
  } catch { /* Privacy mode: continue without storage */ }
  return { ...DEFAULT };
}

export default function ShadowRoutes({
  onClose, onArcade, onTrade, tireCount, goldBars
}: { onClose: () => void; onArcade: () => void; onTrade: () => boolean; tireCount: number; goldBars: number }) {
  const [tab, setTab] = useState<Tab>('routes');
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [activeNpc, setActiveNpc] = useState<Character>('bunny');
  const [dialogue, setDialogue] = useState('I found the secret port. First question: are we here for tires or for the snacks?');
  const [scene, setScene] = useState<ArtKey>('worldHub');
  const [toast, setToast] = useState('');
  const [archiveIndex, setArchiveIndex] = useState(0);
  const artKeys = Object.keys(GAME_ART) as ArtKey[];

  useEffect(() => {
    try { window.localStorage.setItem('blackhujus-rpg-v1', JSON.stringify(progress)); } catch { /* storage optional */ }
  }, [progress]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      if (e.key.toLowerCase() === 'q') setTab('quests');
      if (e.key.toLowerCase() === 'm') setTab('routes');
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose]);

  const respond = (kind: 'verify' | 'joke' | 'trade' | 'refuse') => {
    if (kind === 'trade') {
      if (!onTrade()) { setToast('🛞 Collect 5 truck tires in arcade mode before trading.'); return; }
      setProgress(v => ({ ...v, traded: v.traded + 1, xp: v.xp + 175, trust: Math.min(100, v.trust + 5) }));
      setDialogue('Sold! Five black tires become one golden bar. This is the most expensive rubber ducky in history!');
      setToast('🪙 +1 GOLD · +175 XP · Delivery postcard unlocked!');
    } else if (kind === 'verify') {
      setProgress(v => ({ ...v, verified: true, trust: Math.min(100, v.trust + 12), xp: v.xp + 120 }));
      setDialogue('MERHUJUS: Cargo verified. All the boxes are empty except one with an extremely fashionable banana.');
      setToast('🔎 Verified cargo · +120 XP · +12 trust');
    } else if (kind === 'joke') {
      setProgress(v => ({ ...v, jokes: v.jokes + 1, comedy: Math.min(100, v.comedy + 18), xp: v.xp + 95 }));
      const jokes = [
        'MR BUNNY: I put SEO on a tire. Now it ranks in a circular search.',
        'MR PING: Why did the truck stop in Tokyo? It needed a Japanese brake!',
        'BLACKHUJUS: My GPS said take the next exit. I said only if it has bananas!'
      ];
      setDialogue(jokes[progress.jokes % jokes.length]);
      setToast('😂 Comedy combo! +95 XP · +18 comedy');
    } else {
      setProgress(v => ({ ...v, trust: Math.min(100, v.trust + 7), xp: v.xp + 80 }));
      setDialogue('BLACKHUJUS: No shady shortcuts. We have a legitimate map, a ridiculous playlist, and ten lives.');
      setToast('🛡️ Safe route selected · +80 XP');
    }
  };

  const crew = CREW.find(c => c.id === activeNpc)!;
  const level = 1 + Math.floor(progress.xp / 500);
  const questCount = Number(progress.verified) + Number(progress.jokes > 0) + Number(progress.traded > 0);
  return (
    <div className="rpg-overlay" role="dialog" aria-modal="true" aria-label="Shadow Routes RPG adventure">
      <div className="rpg-shell">
        <header className="rpg-header">
          <div className="rpg-brand">
            <span className="rpg-brand-icon">🦍</span>
            <div><h2>BLACKHUJUS <span>SHADOW ROUTES</span></h2><p>ARCADE RUNNER × RPG COMEDY · WORLD TOUR</p></div>
          </div>
          <button className="rpg-close" onClick={onClose} aria-label="Close RPG and return to game">✕ CLOSE</button>
        </header>
        <nav className="rpg-nav" aria-label="RPG features">
          {(['routes','crew','quests','archive'] as Tab[]).map(t =>
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t === 'routes' ? '🌍 ROUTES' : t === 'crew' ? '👑 CREW' : t === 'quests' ? '📜 QUESTS' : '🖼️ ART ARCHIVE'}
            </button>)}
          <button className="rpg-play" onClick={onArcade}>▶ PLAY ARCADE</button>
        </nav>
        <div className="rpg-main">
          <div className="rpg-content">
            {tab === 'routes' && <>
              <div className="rpg-hero-map" style={tileStyle('worldHub')} role="img" aria-label="Pixel-art world map with intercontinental routes">
                <div className="rpg-map-label">WORLD NETWORK <span>11 DESTINATIONS · 2 GHOST WORLDS</span></div>
              </div>
              <div className="rpg-route-groups">
                {ROUTES.map((route,i) => <div className="rpg-route" key={i}>
                  <strong>{i === 2 ? '👻 SECRET ROUTE' : '🌐 CHAPTER ' + (i + 1)}</strong>
                  <span>{route.join(' → ')}</span>
                </div>)}
              </div>
              <div className="rpg-story-preview" style={tileStyle('hongKongRpg')} role="img" aria-label="Hong Kong port illustrated pixel-art scene">
                <span>📍 HONG KONG PORT · USA & INDIA BIG-RIG PARKING</span>
              </div>
            </>}
            {tab === 'crew' && <>
              <div className="rpg-crew-banner" style={tileStyle('crew')} role="img" aria-label="Four playable story characters"></div>
              <div className="rpg-crew-grid">
                {CREW.map(c => <button key={c.id} className={activeNpc === c.id ? 'rpg-crew-card active' : 'rpg-crew-card'} onClick={() => { setActiveNpc(c.id);setScene(c.art);setDialogue(c.quote); }}>
                  <div className="rpg-portrait" style={tileStyle(c.art)}>
                    {c.id === 'gorilla' && <img src={GORILLA_URL} alt="" loading="lazy" />}
                    {c.id === 'trucker' && <img src={MERHUJUS_URL} alt="" loading="lazy" />}
                    {c.id === 'ping' && <img src={MRPING_URL} alt="" loading="lazy" />}
                  </div>
                  <strong>{c.emoji} {c.name}</strong><small>{c.title}</small>
                </button>)}
              </div>
              <p className="rpg-description">Characters trade jokes, share side quests and give advice. Choose a character to hear their latest message.</p>
            </>}
            {tab === 'quests' && <>
              <div className="rpg-story-preview" style={tileStyle('storyboard')} role="img" aria-label="Illustrated Green Powder Trail chapter storyboard"><span>📜 THE GREEN POWDER TRAIL — FICTIONAL STORY CHAPTERS</span></div>
              <div className="rpg-quest-grid">
                <div className={progress.verified?'done':''}>🔎 <b>Verify the cargo</b><p>Inspect the container manifest before making a deal.</p><span>{progress.verified?'✅ COMPLETED':'NOT COMPLETED'}</span></div>
                <div className={progress.jokes>0?'done':''}>😂 <b>Comedy of Errors</b><p>Tell a joke that makes Mr Bunny rethink SEO.</p><span>{progress.jokes>0?'✅ COMPLETED':'NOT COMPLETED'}</span></div>
                <div className={progress.traded>0?'done':''}>🛞 <b>The Golden Exchange</b><p>Trade five truck tires for one fictional gold bar.</p><span>{progress.traded>0?'✅ COMPLETED':'NOT COMPLETED'}</span></div>
              </div>
              <div className="rpg-quest-progress"><span>QUEST COMPLETION</span><strong>{questCount}/3</strong><div><i style={{width:`${questCount/3*100}%`}}/></div></div>
            </>}
            {tab === 'archive' && <>
              <div className="rpg-archive-stage" style={tileStyle(artKeys[archiveIndex])} role="img" aria-label={GAME_ART[artKeys[archiveIndex]].label}></div>
              <div className="rpg-archive-actions">
                <button onClick={() => setArchiveIndex(i => (i + artKeys.length - 1) % artKeys.length)}>← PREVIOUS</button>
                <div><b>{GAME_ART[artKeys[archiveIndex]].label}</b><small>{archiveIndex+1} / {artKeys.length} ORIGINAL ARTWORKS</small></div>
                <button onClick={() => setArchiveIndex(i => (i + 1) % artKeys.length)}>NEXT →</button>
              </div>
              <div className="rpg-art-grid">{artKeys.map((key,i) =>
                <button key={key} className={i===archiveIndex?'active':''} aria-label={GAME_ART[key].label} onClick={()=>setArchiveIndex(i)}>
                  <span style={tileStyle(key)} aria-hidden="true" /><small>{GAME_ART[key].label}</small>
                </button>)}</div>
            </>}
          </div>
          <aside className="rpg-side">
            <div className="rpg-side-title">👑 CREW & CARGO</div>
            <div className="rpg-stat"><span>LEVEL {level}</span><strong>{progress.xp.toLocaleString()} XP</strong></div>
            <div className="rpg-meter"><span>🤝 TRUST {progress.trust}%</span><div><i style={{width:progress.trust+'%'}} /></div></div>
            <div className="rpg-meter comedy"><span>😂 COMEDY {progress.comedy}%</span><div><i style={{width:progress.comedy+'%'}} /></div></div>
            <div className="rpg-stat"><span>🛞 TIRES</span><strong>{tireCount}</strong></div>
            <div className="rpg-stat"><span>🪙 GOLD</span><strong>{goldBars}</strong></div>
            <div className="rpg-dialogue-portrait" style={tileStyle(scene)} role="img" aria-label={GAME_ART[scene].label}></div>
            <h3>{crew.name} SAYS…</h3>
            <p className="rpg-dialogue" aria-live="polite">{dialogue}</p>
            <div className="rpg-choice-group">
              <button onClick={()=>respond('verify')}>🔎 VERIFY CARGO</button>
              <button onClick={()=>respond('trade')} disabled={tireCount<5}>🪙 TRADE 5 TIRES → GOLD</button>
              <button onClick={()=>respond('joke')}>😂 TELL A RIDICULOUS JOKE</button>
              <button onClick={()=>respond('refuse')}>🛡️ CHOOSE SAFE ROUTE</button>
            </div>
            {toast && <div className="rpg-toast" role="status">{toast}</div>}
          </aside>
        </div>
        <footer className="rpg-footer">M = ROUTES · Q = QUESTS · ESC = CLOSE · EXPLORE, COLLECT, TRADE & LAUGH · FANTASY GAME</footer>
      </div>
    </div>
  );
}
