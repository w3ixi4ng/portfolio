import { useState, useEffect, useRef, type ReactNode } from 'react'
import { SiGithub } from 'react-icons/si'
import { FaFileAlt, FaLinkedinIn, FaCode, FaStar, FaEnvelope, FaBriefcase, FaSun, FaMoon } from 'react-icons/fa'
import { DraggableWindow } from './DraggableWindow'
import { TerminalPane, type TerminalPaneHandle } from './TerminalPane'
import { ResumePane } from './ResumePane'
import { ProjectsPane } from './ProjectsPane'
import { SkillsPane } from './SkillsPane'
import { ExperiencePane } from './ExperiencePane'
import { CommandBar } from './CommandBar'
import { PixelDuck } from './PixelDuck'
import { profile } from '../data/profile'
import { PALETTES, type PaletteId } from '../data/palettes'

const TERMINAL_TITLE = `${profile.username}@${profile.promptHost} — bash`

const WALLPAPER_ASCII = `
██╗    ██╗███████╗██╗██╗  ██╗██╗ █████╗ ███╗   ██╗ ██████╗
██║    ██║██╔════╝██║╚██╗██╔╝██║██╔══██╗████╗  ██║██╔════╝
██║ █╗ ██║█████╗  ██║ ╚███╔╝ ██║███████║██╔██╗ ██║██║  ███╗
██║███╗██║██╔══╝  ██║ ██╔██╗ ██║██╔══██║██║╚██╗██║██║   ██║
╚███╔███╔╝███████╗██║██╔╝ ██╗██║██║  ██║██║ ╚████║╚██████╔╝
 ╚══╝╚══╝ ╚══════╝╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝`.trim()

type AppId    = 'terminal' | 'resume' | 'experience' | 'projects' | 'skills'
type WinState = 'open' | 'docked' | 'closed'

const APP_META: Record<AppId, { title: string; w: number; h: number }> = {
  terminal:   { title: TERMINAL_TITLE, w: 720, h: 560 },
  resume:     { title: 'Lau_Wei_Xiang.pdf', w: 700, h: 600 },
  experience: { title: 'Experience',  w: 660, h: 480 },
  projects:   { title: 'Projects',    w: 700, h: 520 },
  skills:     { title: 'Skills',      w: 600, h: 480 },
}

const WINDOW_APPS: { id: AppId; label: string; icon: ReactNode; text?: boolean }[] = [
  { id: 'terminal',   label: 'Terminal',   icon: '>_',                  text: true },
  { id: 'resume',     label: 'Resume',     icon: <FaFileAlt  size={16} />          },
  { id: 'experience', label: 'Experience', icon: <FaBriefcase size={15} />         },
  { id: 'projects',   label: 'Projects',   icon: <FaCode     size={16} />          },
  { id: 'skills',     label: 'Skills',     icon: <FaStar     size={15} />          },
]

const LINK_APPS = [
  { id: 'email',    label: 'Email',    icon: <FaEnvelope   size={15} />, url: `mailto:${profile.email}`  },
  { id: 'linkedin', label: 'LinkedIn', icon: <FaLinkedinIn size={15} />, url: profile.linkedin            },
  { id: 'github',   label: 'GitHub',   icon: <SiGithub     size={16} />, url: profile.github              },
]

function centeredPos(w: number, h: number, offsetX = 0, offsetY = 0) {
  return {
    x: Math.max(40, Math.floor((window.innerWidth  - w) / 2) + offsetX),
    y: Math.max(36, Math.floor((window.innerHeight - h) / 3) + offsetY),
  }
}

const OFFSETS: Record<AppId, [number, number]> = {
  terminal:   [  0,   0],
  resume:     [ 40,  30],
  experience: [ 10,  10],
  projects:   [-30,  20],
  skills:     [ 20, -20],
}

export function Desktop() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark'
  )
  const [paletteId, setPaletteId] = useState<PaletteId>(() =>
    (localStorage.getItem('palette') as PaletteId) ?? 'purple'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const p = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0]
    const d = theme === 'dark' ? p.dim.dark : p.dim.light
    const r = document.documentElement.style
    r.setProperty('--accent',        p.accent)
    r.setProperty('--accent2',       p.accent2)
    r.setProperty('--accent3',       p.accent3)
    r.setProperty('--lavender',      p.lavender)
    r.setProperty('--accent-rgb',    p.rgb)
    r.setProperty('--pl-dim-u-bg',   d[0])
    r.setProperty('--pl-dim-u-fg',   d[1])
    r.setProperty('--pl-dim-h-bg',   d[2])
    r.setProperty('--pl-dim-c-bg',   d[3])
    r.setProperty('--pl-dim-c-fg',   d[4])
    localStorage.setItem('palette', paletteId)
  }, [paletteId, theme])

  const [states, setStates] = useState<Record<AppId, WinState>>({
    terminal:   'open',
    resume:     'closed',
    experience: 'closed',
    projects:   'closed',
    skills:     'closed',
  })
  const [zOrder, setZOrder] = useState<AppId[]>(['terminal'])
  const [time, setTime] = useState(new Date())
  const terminalRef = useRef<TerminalPaneHandle>(null)

  function bringToFront(id: AppId) {
    setZOrder(prev => [...prev.filter(x => x !== id), id])
  }

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  function set(id: AppId, s: WinState) {
    setStates(prev => ({ ...prev, [id]: s }))
  }

  function toggle(id: AppId) {
    setStates(prev => {
      const next = prev[id] === 'open' ? 'docked' : 'open'
      if (next === 'open') bringToFront(id)
      return { ...prev, [id]: next }
    })
  }

  const fmt = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  function renderContent(id: AppId) {
    switch (id) {
      case 'terminal':   return <TerminalPane ref={terminalRef} showBanner />
      case 'resume':     return <ResumePane />
      case 'experience': return <ExperiencePane />
      case 'projects':   return <ProjectsPane />
      case 'skills':     return <SkillsPane />
    }
  }

  return (
    <div className="desktop">
      <div className="desktop-bar">
        <span style={{ color: 'var(--accent)', fontWeight: 700 }}>
          {profile.username}@{profile.promptHost}
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {PALETTES.map(p => (
            <button
              key={p.id}
              title={p.id}
              onClick={() => setPaletteId(p.id)}
              style={{
                width: 11, height: 11, borderRadius: '50%',
                background: p.accent,
                border: paletteId === p.id ? `2px solid var(--white)` : '2px solid transparent',
                cursor: 'pointer', padding: 0, flexShrink: 0,
                boxShadow: paletteId === p.id ? `0 0 0 1px ${p.accent}` : 'none',
              }}
            />
          ))}
          <span style={{ width: 1, height: 12, background: 'var(--border)', margin: '0 2px' }} />
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dim)', display: 'flex', alignItems: 'center', padding: 0 }}
          >
            {theme === 'dark' ? <FaSun size={13} /> : <FaMoon size={13} />}
          </button>
          <span className="t-dim" style={{ marginLeft: 2 }}>{fmt}</span>
        </span>
      </div>

      <PixelDuck />

      <div className="wallpaper">
        <pre className="wallpaper-name">{WALLPAPER_ASCII}</pre>
        <div className="wallpaper-sub">
          {profile.roles.map((role, i) => (
            <span key={role}>
              {i > 0 && <span>·</span>}
              {role}
            </span>
          ))}
          <span>·</span>
          <span>{profile.bannerTag}</span>
        </div>
        <span className="wallpaper-hint">click the dock to explore</span>
      </div>

      {WINDOW_APPS.map(app => {
        if (states[app.id] !== 'open') return null
        const { title, w, h } = APP_META[app.id]
        const [ox, oy] = OFFSETS[app.id]
        const z = 10 + zOrder.indexOf(app.id)
        return (
          <DraggableWindow
            key={app.id}
            title={title}
            initialPos={centeredPos(w, h, ox, oy)}
            zIndex={z}
            width={w}
            height={h}
            onClose={() => set(app.id, 'closed')}
            onMinimize={() => set(app.id, 'docked')}
            onFocus={() => bringToFront(app.id)}
            toolbar={app.id === 'terminal'
              ? <CommandBar onRun={cmd => terminalRef.current?.submit(cmd)} />
              : undefined
            }
          >
            {renderContent(app.id)}
          </DraggableWindow>
        )
      })}

      <div className="dock">
        {WINDOW_APPS.map(app => {
          const s = states[app.id]
          return (
            <button
              key={app.id}
              className={`dock-item${s === 'docked' ? ' dock-item-docked' : ''}`}
              onClick={() => toggle(app.id)}
              title={app.label}
            >
              <div className={`dock-app-icon${app.text ? ' dock-icon-text' : ''}`}>
                {app.icon}
              </div>
              <span className="dock-label">{app.label}</span>
              {s !== 'closed' && (
                <span className={`dock-dot${s === 'docked' ? ' dock-dot-docked' : ''}`} />
              )}
            </button>
          )
        })}

        <div className="dock-separator" />

        {LINK_APPS.map(app => (
          <button
            key={app.id}
            className="dock-item"
            onClick={() => window.open(app.url, '_blank')}
            title={app.label}
          >
            <div className="dock-app-icon">{app.icon}</div>
            <span className="dock-label">{app.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
