// Extra character artwork embedded as data URIs so the sprites ship with the source.
// Gorilla Blackhujus (black-wine transformation), Merhujus and Mr Ping (background cameos).
// Payloads live in ./sprites/*.ts as 64-column wrapped base64 parts (whitespace stripped on import).
import { GORILLA_B64_1 } from './sprites/gorilla1';
import { GORILLA_B64_2 } from './sprites/gorilla2';
import { GORILLA_B64_3 } from './sprites/gorilla3';
import { GORILLA_B64_4 } from './sprites/gorilla4';
import { MERHUJUS_B64_1 } from './sprites/merhujus1';
import { MERHUJUS_B64_2 } from './sprites/merhujus2';
import { MERHUJUS_B64_3 } from './sprites/merhujus3';
import { MRPING_B64_1 } from './sprites/mrping1';
import { MRPING_B64_2 } from './sprites/mrping2';

const clean = (s: string) => s.replace(/\s/g, '');

export const GORILLA_URL = 'data:image/png;base64,' + clean(GORILLA_B64_1 + GORILLA_B64_2 + GORILLA_B64_3 + GORILLA_B64_4);
export const MERHUJUS_URL = 'data:image/png;base64,' + clean(MERHUJUS_B64_1 + MERHUJUS_B64_2 + MERHUJUS_B64_3);
export const MRPING_URL = 'data:image/png;base64,' + clean(MRPING_B64_1 + MRPING_B64_2);