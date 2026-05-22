import { useState, useRef, type ReactNode } from 'react'

interface Props {
  title: string
  initialPos: { x: number; y: number }
  zIndex: number
  width?: number
  height?: number
  onClose: () => void
  onMinimize: () => void
  onFocus: () => void
  toolbar?: ReactNode
  children: ReactNode
}

export function DraggableWindow({ title, initialPos, zIndex, width = 620, height = 500, onClose, onMinimize, onFocus, toolbar, children }: Props) {
  const [pos, setPos] = useState(initialPos)
  const [maximized, setMaximized] = useState(false)
  const drag = useRef<{ startMX: number; startMY: number; startPX: number; startPY: number } | null>(null)

  function handleTitleMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('dot')) return
    if (maximized) return
    e.preventDefault()
    drag.current = { startMX: e.clientX, startMY: e.clientY, startPX: pos.x, startPY: pos.y }

    function onMove(ev: MouseEvent) {
      if (!drag.current) return
      const nx = drag.current.startPX + (ev.clientX - drag.current.startMX)
      const ny = drag.current.startPY + (ev.clientY - drag.current.startMY)
      setPos({
        x: Math.max(0, Math.min(nx, window.innerWidth  - width)),
        y: Math.max(28, Math.min(ny, window.innerHeight - 80)),
      })
    }
    function onUp() {
      drag.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const style = maximized
    ? { left: 0, top: 28, right: 0, bottom: 72, width: 'auto', height: 'auto', zIndex }
    : { left: pos.x, top: pos.y, zIndex, width, height }

  return (
    <div
      className={`dw${maximized ? ' dw-maximized' : ''}`}
      style={style}
      onMouseDown={onFocus}
    >
      <div className="dw-titlebar" onMouseDown={handleTitleMouseDown}>
        <span
          className="dot dot-red"
          onClick={e => { e.stopPropagation(); onClose() }}
          style={{ cursor: 'pointer' }}
          title="Close"
        />
        <span
          className="dot dot-yellow"
          onClick={e => { e.stopPropagation(); onMinimize() }}
          style={{ cursor: 'pointer' }}
          title="Minimise to dock"
        />
        <span
          className="dot dot-green"
          onClick={e => { e.stopPropagation(); setMaximized(m => !m) }}
          style={{ cursor: 'pointer' }}
          title={maximized ? 'Restore' : 'Maximise'}
        />
        <span className="dw-title">{title}</span>
      </div>
      {toolbar && <div className="dw-toolbar">{toolbar}</div>}
      <div className="dw-body">
        {children}
      </div>
    </div>
  )
}
