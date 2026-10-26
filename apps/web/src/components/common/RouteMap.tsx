export function RouteMap() {
  return (
    <svg viewBox="0 0 620 320" className="h-[320px] w-full bg-[#F3F1EB]" role="img" aria-labelledby="map-title map-desc">
      <title id="map-title">Evaluated night corridor from work to home</title>
      <desc id="map-desc">A route across Nagpur night corridor with verified police posts, pharmacies, and safe havens.</desc>
      <path d="M-30 278 C120 210 215 345 385 281 S590 214 680 255" fill="none" stroke="#D8E0DF" strokeWidth="28" />
      <path d="M432 -20 L508 34 473 133 397 114 385 45Z" fill="#E4E7DA" />
      <g fill="none" stroke="#DDD9CF" strokeWidth="5">
        <path d="M-30 60 L660 180" /><path d="M-10 177 L635 44" /><path d="M65 -20 L115 340" />
        <path d="M248 -20 L271 340" /><path d="M547 -20 L509 340" /><path d="M-20 235 L645 313" />
      </g>
      <g fill="none" stroke="#E7E3DA" strokeWidth="2">
        <path d="M-20 110 L640 234" /><path d="M167 -20 L205 340" /><path d="M333 -20 L352 340" /><path d="M-20 24 L650 112" />
      </g>
      <path d="M93 260 C104 214 147 220 176 187 S195 113 260 128 S347 194 390 159 S427 85 512 75" fill="none" stroke="#12233A" strokeWidth="3" strokeLinecap="round" />
      <g fontFamily="monospace" fontSize="10" fill="#5B6672">
        <text x="72" y="287">WORK</text><text x="498" y="56">HOME</text><text x="405" y="145">PARK</text>
      </g>
      <g stroke="#FFFFFF" strokeWidth="3">
        <circle cx="93" cy="260" r="8" fill="#12233A" /><circle cx="512" cy="75" r="9" fill="#F2B54A" stroke="#12233A" />
      </g>
      <g fill="#FFFFFF" stroke="#8C918C" strokeWidth="1.5">
        <rect x="278" y="186" width="20" height="20" rx="3" /><rect x="183" y="71" width="20" height="20" rx="3" />
      </g>
      <g fill="#5B6672" fontFamily="sans-serif" fontSize="12" fontWeight="600" textAnchor="middle">
        <text x="288" y="201">+</text><text x="193" y="86">F</text>
      </g>
    </svg>
  );
}
