'use strict';
/* errlog-console.js — forward console.error/console.warn to the central errlog
 * (fluxive.science). Production-only, throttled, fire-and-forget, fail-safe.
 * Never touches console.log/info; never throws. (C4-ERRLOG-CONSOLE) */
try {
  const SYSTEM = process.env.MFORCE_SYSTEM || 'mForceUtilities';
  const URL = process.env.ERRLOG_URL || 'https://fluxive.science/api/errlog/ingest';
  const MAX_PER_MIN = 60; let sent = 0, ws = Date.now();
  function fwd(level, args){
    if (process.env.NODE_ENV !== 'production') return;
    const now = Date.now(); if (now - ws > 60000){ ws = now; sent = 0; }
    if (sent >= MAX_PER_MIN) return; sent++;
    try {
      const message = args.map((a)=>{ try { return typeof a==='string'?a:JSON.stringify(a);}catch(_){return String(a);} }).join(' ').slice(0,2000);
      if (typeof fetch === 'function') fetch(URL,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({system:SYSTEM,level,message,ts:new Date().toISOString()})}).catch(()=>{});
    } catch(_){}
  }
  for (const lvl of ['error','warn']){ const o=console[lvl].bind(console); console[lvl]=function(...a){o(...a); fwd(lvl,a);}; }
} catch(_){}
module.exports = {};
