import { useEffect, useRef } from 'react'

const SZ    = 6   // CSS pixels per duck pixel
const SPEED = 60  // px/sec

const COLOR: Record<string, string> = {
  K: '#1a5c1a',  // dark green head
  N: '#f0f0f0',  // white collar
  R: '#7a4020',  // russet brown body
  D: '#3d1e0a',  // dark brown wing shadow
  W: '#c0a882',  // cream chest/belly
  B: '#080808',  // eye
  O: '#d4a000',  // yellow beak
  F: '#cc5500',  // orange feet
}

// Mallard duck facing RIGHT (11 wide × 12 tall) — slimmer profile
// flip col-by-col when walking left: chest/beak stay at the "front"
const FRAMES: string[][] = [
  [
    '   KKKKK   ',
    '  KKKKKKK  ',
    '  KKKKKBK  ',   // B = eye near front-right
    '  KKKKKKOOO',   // OOO = beak at right
    '  NNNNNNN  ',   // white collar
    ' RRRRRRRRR ',
    'DRRRRRRWWWW',   // D = wing shadow, W = cream chest
    'DRRRRRRWWWW',
    ' RRRRRWWWWW',
    '  RRRWWWWW ',
    '   F    F   ',   // legs spread: back=col2, front=col7
    '  FFF  FFF  ',   // webbed feet
  ],
  [
    '   KKKKK   ',
    '  KKKKKKK  ',
    '  KKKKKBK  ',
    '  KKKKKKOOO',
    '  NNNNNNN  ',
    ' RRRRRRRRR ',
    'DRRRRRRWWWW',
    'DRRRRRRWWWW',
    ' RRRRRWWWWW',
    '  RRRWWWWW ',
    '     FF     ',   // legs crossing at cols 4-5 (both move inward)
    '    FFFF    ',   // feet merged at crossing
  ],
]

const DUCK_W = FRAMES[0][0].length * SZ
const DUCK_H = FRAMES[0].length * SZ

export function PixelDuck() {
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap   = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let x        = 120
    let vx       = SPEED
    let frameIdx = 0
    let lastSwap = 0
    let lastTime = performance.now()
    let animId   = 0

    const ro = new ResizeObserver(() => {
      canvas.width  = wrap.offsetWidth
      canvas.height = wrap.offsetHeight
    })
    ro.observe(wrap)
    canvas.width  = wrap.offsetWidth
    canvas.height = wrap.offsetHeight

    function tick(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      if (now - lastSwap > 340) {
        frameIdx = (frameIdx + 1) % FRAMES.length
        lastSwap = now
      }

      const c    = canvas!
      const maxX = c.width - DUCK_W
      x += vx * dt
      if (x >= maxX) { x = maxX; vx = -SPEED }
      if (x <= 0)    { x = 0;    vx =  SPEED }

      const y    = c.height - DUCK_H
      const flip = vx < 0
      const rows = FRAMES[frameIdx]

      const ct = ctx!
      ct.clearRect(0, 0, c.width, c.height)
      rows.forEach((row, ry) => {
        const len = row.length
        for (let col = 0; col < len; col++) {
          const ch    = flip ? row[len - 1 - col] : row[col]
          if (ch === ' ') continue
          const color = COLOR[ch]
          if (!color) continue
          ct.fillStyle = color
          ct.fillRect(Math.round(x + col * SZ), Math.round(y + ry * SZ), SZ, SZ)
        }
      })

      animId = requestAnimationFrame(tick)
    }

    animId = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(animId); ro.disconnect() }
  }, [])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'absolute',
        inset: '28px 0 0',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', imageRendering: 'pixelated' }}
      />
    </div>
  )
}
