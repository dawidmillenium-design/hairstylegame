/**
 * Check all 12 user-provided image previews survived GitHub text transport.
 * The game stores them as one carefully compressed WebP atlas.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const directory = path.resolve('src/assets');
const parts = [];
for (let i = 0; i < 9; i++) {
  const filename = path.join(directory, `atlasChunk0${i}.ts`);
  const text = fs.readFileSync(filename, 'utf8');
  const match = text.match(/^export default '([A-Za-z0-9+/=]+)';\s*$/);
  if (!match) throw new Error(`Invalid or missing art chunk: ${filename}`);
  parts.push(match[1]);
}
const packed = parts.join('');
const webp = Buffer.from(packed, 'base64');
const sha1 = crypto.createHash('sha1').update(`blob ${webp.length}\0`).update(webp).digest('hex');
const expected = 'e4043d413ebc10d50bb919d00ff4a033820f24c2';
if (webp.toString('ascii', 0, 4) !== 'RIFF' ||
    webp.toString('ascii', 8, 12) !== 'WEBP') throw new Error('Art atlas is not a valid RIFF/WebP file.');
if (webp.length !== 5894 || sha1 !== expected) {
  throw new Error(`Atlas corrupted: ${webp.length} bytes, git hash ${sha1}`);
}
const manifest = fs.readFileSync(path.join(directory, 'gameArt.ts'), 'utf8');
const keys = ['crew','character','storyboard','truckLot','shadowMap','threeLeaders',
  'bunnyCafe','hongKong','hongKongRpg','worldHub','gorilla','polishTrucker'];
for (const key of keys) {
  if (!manifest.includes(`${key}: { tile:`)) throw new Error(`Missing art tile: ${key}`);
}
console.log(`✅ Verified ${keys.length} artwork tiles in ${webp.length} WebP bytes (hash ${sha1})`);
