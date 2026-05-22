export const PALETTES = [
  {
    id: 'purple', accent: '#a855f7', accent2: '#7c3aed', accent3: '#1e0a3c', lavender: '#c4b5fd', rgb: '168,85,247',
    dim: { dark:  ['#2d1b4e','#7c5fa0','#1e1030','#110820','#5a4a70'],
           light: ['#ddd6fe','#7c3aed','#ede9fe','#f5f3ff','#a78bfa'] },
  },
  {
    id: 'cyan',   accent: '#06b6d4', accent2: '#0891b2', accent3: '#0c2a30', lavender: '#a5f3fc', rgb: '6,182,212',
    dim: { dark:  ['#0c2a34','#3a8090','#081820','#050f14','#2a5a66'],
           light: ['#cffafe','#0891b2','#e0f9ff','#f0fdff','#67e8f9'] },
  },
  {
    id: 'teal',   accent: '#14b8a6', accent2: '#0d9488', accent3: '#042420', lavender: '#99f6e4', rgb: '20,184,166',
    dim: { dark:  ['#0a2824','#3a8078','#061816','#040f0e','#2a5a56'],
           light: ['#ccfbf1','#0d9488','#e0fdf4','#f0fdf9','#5eead4'] },
  },
  {
    id: 'orange', accent: '#f97316', accent2: '#ea580c', accent3: '#2a0e02', lavender: '#fdba74', rgb: '249,115,22',
    dim: { dark:  ['#2a1a08','#906040','#1a1005','#100a03','#664030'],
           light: ['#ffedd5','#ea580c','#fff7ed','#fffbf5','#fb923c'] },
  },
  {
    id: 'pink',   accent: '#ec4899', accent2: '#db2777', accent3: '#2a0518', lavender: '#f9a8d4', rgb: '236,72,153',
    dim: { dark:  ['#2a0f1e','#904060','#1a0812','#10040a','#663050'],
           light: ['#fce7f3','#db2777','#fdf2f8','#fef9fc','#f472b6'] },
  },
] as const

export type PaletteId = typeof PALETTES[number]['id']
