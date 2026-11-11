// Íconos e ilustraciones de reemplazo (se usan cuando un producto todavía no tiene fotos).
export const ICO = {
  wa:`<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z"/></svg>`,
  bag:`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>`,
  x:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  plus:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`,
  minus:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>`,
  check:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>`,
  trash:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/></svg>`,
  link:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>`,
  truck:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>`,
  card:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/></svg>`,
  chat:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z"/></svg>`
  ,search:`<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
  eye:`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`,
  arrow:`<svg class="arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7l10 10M17 9v8H9"/></svg>`
};
const INK="#2a241e", TERRA="#b85c38", SAGE="#6f8064", SAND="#d6b48f", CREAM="#fffaf2";
export const ART = {
  taza: A => `<ellipse cx="100" cy="150" rx="58" ry="10" fill="${INK}" opacity=".08"/>
    <ellipse cx="100" cy="146" rx="52" ry="9" fill="${CREAM}" stroke="${INK}" stroke-width="2.5"/>
    <path d="M132 95c22-4 26 30 2 32" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <path d="M132 95c22-4 26 30 2 32" fill="none" stroke="${A}" stroke-width="3" stroke-linecap="round"/>
    <path d="M64 80h72v44a20 20 0 0 1-20 20H84a20 20 0 0 1-20-20z" fill="${A}" stroke="${INK}" stroke-width="2.5"/>
    <path d="M64 96h72" stroke="${CREAM}" stroke-width="3" opacity=".6"/>
    <path d="M86 66c-6-8 6-12 0-22M100 66c-6-8 6-12 0-22M114 66c-6-8 6-12 0-22" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>`,
  vasos: A => `<ellipse cx="100" cy="154" rx="72" ry="9" fill="${INK}" opacity=".08"/>
    ${[[52,0],[100,-10],[148,0]].map(([x,o])=>`<path d="M${x-22} ${70+o}h44l-6 ${82-o}H${x-16}z" fill="${CREAM}" fill-opacity=".55" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M${x-19} ${100+o/2}h38l-4 ${50-o/2}H${x-15}z" fill="${SAGE}" opacity=".35"/>
    <path d="M${x-12} ${80+o}l-2 50" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`).join("")}`,
  toallas: A => `<ellipse cx="100" cy="156" rx="66" ry="8" fill="${INK}" opacity=".08"/>
    <rect x="40" y="118" width="120" height="34" rx="12" fill="${SAND}" stroke="${INK}" stroke-width="2.5"/>
    <rect x="48" y="86" width="104" height="34" rx="12" fill="${A}" stroke="${INK}" stroke-width="2.5"/>
    <rect x="58" y="56" width="84" height="32" rx="11" fill="${CREAM}" stroke="${INK}" stroke-width="2.5"/>
    <path d="M40 140h120M48 108h104M58 76h84" stroke="${INK}" stroke-width="2" opacity=".25"/>`,
  vela: A => `<ellipse cx="100" cy="156" rx="48" ry="8" fill="${INK}" opacity=".08"/>
    <rect x="62" y="78" width="76" height="76" rx="14" fill="${CREAM}" fill-opacity=".6" stroke="${INK}" stroke-width="2.5"/>
    <rect x="66" y="96" width="68" height="54" rx="10" fill="${SAND}"/>
    <rect x="72" y="112" width="56" height="22" rx="4" fill="${CREAM}" stroke="${INK}" stroke-width="1.5"/>
    <path d="M100 96V84" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M100 52c10 12 10 22 0 30-10-8-10-18 0-30z" fill="${TERRA}"/>
    <path d="M100 64c4 6 4 11 0 15-4-4-4-9 0-15z" fill="#f2c56b"/>`,
  tabla: A => `<ellipse cx="104" cy="160" rx="64" ry="8" fill="${INK}" opacity=".08"/>
    <path d="M60 46h80a14 14 0 0 1 14 14v84a14 14 0 0 1-14 14H60a14 14 0 0 1-14-14V60a14 14 0 0 1 14-14z" fill="${SAND}" stroke="${INK}" stroke-width="2.5" transform="rotate(-8 100 100)"/>
    <g transform="rotate(-8 100 100)" stroke="${INK}" stroke-width="1.6" fill="none" opacity=".3"><path d="M66 70c20 4 50-4 70 2M62 96c26 6 48-6 76 0M64 122c24 4 50-4 72 2"/></g>
    <circle cx="100" cy="58" r="7" fill="${CREAM}" stroke="${INK}" stroke-width="2.5" transform="rotate(-8 100 100)"/>`,
  florero: A => `<ellipse cx="100" cy="158" rx="40" ry="7" fill="${INK}" opacity=".08"/>
    <path d="M96 96C90 70 76 54 60 44M102 96c2-30 8-48 20-62M104 96c8-20 24-32 42-36" fill="none" stroke="${SAGE}" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="66" cy="54" rx="12" ry="6" fill="${SAGE}" transform="rotate(35 66 54)"/>
    <ellipse cx="118" cy="44" rx="12" ry="6" fill="${SAGE}" transform="rotate(-60 118 44)"/>
    <ellipse cx="138" cy="64" rx="12" ry="6" fill="${SAGE}" transform="rotate(-20 138 64)"/>
    <circle cx="60" cy="42" r="7" fill="${TERRA}"/><circle cx="124" cy="32" r="6" fill="#f2c56b"/>
    <path d="M88 96h24c0 10 22 18 22 36s-12 26-34 26-34-8-34-26 22-26 22-36z" fill="${A}" stroke="${INK}" stroke-width="2.5"/>
    <path d="M70 128c20 6 40 6 60 0" stroke="${INK}" stroke-width="2" fill="none" opacity=".25"/>`,
  manta: A => `<ellipse cx="100" cy="156" rx="70" ry="8" fill="${INK}" opacity=".08"/>
    <rect x="38" y="70" width="124" height="80" rx="14" fill="${CREAM}" stroke="${INK}" stroke-width="2.5"/>
    <path d="M38 96h124M38 124h124" stroke="${A}" stroke-width="7"/>
    <path d="M38 104h124M38 116h124" stroke="${SAND}" stroke-width="3"/>
    <path d="M52 70V56M64 70V54M76 70V56M88 70V54M100 70V56M112 70V54M124 70V56M136 70V54M148 70V56" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".5"/>`,
  cubiertos: A => `<ellipse cx="100" cy="164" rx="56" ry="7" fill="${INK}" opacity=".08"/>
    <g stroke="${INK}" stroke-width="2.5" fill="${CREAM}" stroke-linejoin="round">
      <path d="M64 40v30c0 8 6 12 6 18v66h8V88c0-6 6-10 6-18V40"/><path d="M70 40v26M78 40v26" fill="none"/>
      <path d="M108 40c12 10 14 40 2 54v60h-8V40z"/>
      <ellipse cx="136" cy="62" rx="12" ry="20"/><path d="M132 82h8v72h-8z"/></g>
    <path d="M110 46c6 10 6 30 0 40" stroke="${SAND}" stroke-width="3" fill="none"/>`,
  frascos: A => `<ellipse cx="100" cy="158" rx="76" ry="8" fill="${INK}" opacity=".08"/>
    <rect x="30" y="134" width="140" height="18" rx="6" fill="${SAND}" stroke="${INK}" stroke-width="2.5"/>
    ${[[56,"#5f7a52"],[100,CREAM],[144,"#6b4a33"]].map(([x,f],i)=>`<rect x="${x-18}" y="${76-i*6}" width="36" height="${58+i*6}" rx="8" fill="${CREAM}" fill-opacity=".6" stroke="${INK}" stroke-width="2.5"/>
      <rect x="${x-15}" y="${100-i*2}" width="30" height="${32+i*2}" rx="5" fill="${f}" opacity=".75"/>
      <rect x="${x-20}" y="${66-i*6}" width="40" height="12" rx="4" fill="${A}" stroke="${INK}" stroke-width="2.5"/>`).join("")}`
};
