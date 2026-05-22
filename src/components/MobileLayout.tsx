import { useState, useEffect } from 'react'
import { SiGithub } from 'react-icons/si'
import { FaLinkedinIn, FaCode, FaStar, FaEnvelope, FaBriefcase, FaUser, FaSun, FaMoon } from 'react-icons/fa'
import { ExperiencePane } from './ExperiencePane'
import { ProjectsPane } from './ProjectsPane'
import { SkillsPane } from './SkillsPane'
import { profile } from '../data/profile'
import { PALETTES, type PaletteId } from '../data/palettes'

type TabId = 'about' | 'experience' | 'projects' | 'skills' | 'contact'

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'about',      label: 'About',      icon: <FaUser size={16} />      },
  { id: 'experience', label: 'Experience', icon: <FaBriefcase size={15} /> },
  { id: 'projects',   label: 'Projects',   icon: <FaCode size={16} />      },
  { id: 'skills',     label: 'Skills',     icon: <FaStar size={15} />      },
  { id: 'contact',    label: 'Contact',    icon: <FaEnvelope size={15} />  },
]

function applyPalette(paletteId: PaletteId, theme: 'dark' | 'light') {
  const p = PALETTES.find(p => p.id === paletteId) ?? PALETTES[0]
  const d = theme === 'dark' ? p.dim.dark : p.dim.light
  const r = document.documentElement.style
  r.setProperty('--accent',      p.accent)
  r.setProperty('--accent2',     p.accent2)
  r.setProperty('--accent3',     p.accent3)
  r.setProperty('--lavender',    p.lavender)
  r.setProperty('--accent-rgb',  p.rgb)
  r.setProperty('--pl-dim-u-bg', d[0])
  r.setProperty('--pl-dim-u-fg', d[1])
  r.setProperty('--pl-dim-h-bg', d[2])
  r.setProperty('--pl-dim-c-bg', d[3])
  r.setProperty('--pl-dim-c-fg', d[4])
}

function AboutTab() {
  return (
    <div className="mob-about">
      <div className="mob-hero">
        <div className="mob-hero-name" style={{ color: 'var(--accent)' }}>{profile.name}</div>
        <div className="mob-hero-role">{profile.roles.join(' · ')}</div>
        <div className="mob-hero-tag">{profile.bannerTag}</div>
      </div>

      <div className="mob-card">
        <div className="mob-section-label">Bio</div>
        <p className="mob-bio">{profile.bio}</p>
      </div>

      <div className="mob-card">
        <div className="mob-section-label">Education</div>
        <div className="mob-row"><span className="mob-key">University</span><span>{profile.university}</span></div>
        <div className="mob-row"><span className="mob-key">Degree</span><span>{profile.degreeShort}</span></div>
        <div className="mob-row"><span className="mob-key">GPA</span><span style={{ color: 'var(--accent)' }}>{profile.gpa}</span></div>
        <div className="mob-row"><span className="mob-key">Scholarship</span><span>{profile.scholarship}</span></div>
      </div>

    </div>
  )
}

function ContactTab() {
  const links = [
    { icon: <FaEnvelope size={15} />,   label: 'Email',    value: profile.email,           href: `mailto:${profile.email}` },
    { icon: <SiGithub size={15} />,     label: 'GitHub',   value: profile.githubDisplay,   href: profile.github   },
    { icon: <FaLinkedinIn size={14} />, label: 'LinkedIn', value: profile.linkedinDisplay, href: profile.linkedin },
  ]
  return (
    <div className="mob-contact">
      {links.map(l => (
        <a key={l.label} className="mob-contact-row" href={l.href} target="_blank" rel="noreferrer">
          <span className="mob-contact-icon">{l.icon}</span>
          <div>
            <div className="mob-contact-label">{l.label}</div>
            <div className="mob-contact-value">{l.value}</div>
          </div>
        </a>
      ))}
    </div>
  )
}

export function MobileLayout() {
  const [tab,       setTab]       = useState<TabId>('about')
  const [theme,     setTheme]     = useState<'dark' | 'light'>(() =>
    (localStorage.getItem('theme') as 'dark' | 'light') ?? 'dark'
  )
  const [paletteId, setPaletteId] = useState<PaletteId>(() =>
    (localStorage.getItem('palette') as PaletteId) ?? 'purple'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
    applyPalette(paletteId, theme)
  }, [theme, paletteId])

  return (
    <div className="mob">
      <div className="desktop-bar">
        <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.85em' }}>
          {profile.username}@{profile.promptHost}
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {PALETTES.map(p => (
            <button
              key={p.id}
              title={p.id}
              onClick={() => setPaletteId(p.id)}
              style={{
                width: 11, height: 11, borderRadius: '50%',
                background: p.accent,
                border: paletteId === p.id ? '2px solid var(--white)' : '2px solid transparent',
                cursor: 'pointer', padding: 0, flexShrink: 0,
                boxShadow: paletteId === p.id ? `0 0 0 1px ${p.accent}` : 'none',
              }}
            />
          ))}
          <span style={{ width: 1, height: 12, background: 'var(--border)', margin: '0 2px' }} />
          <button
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dim)', display: 'flex', alignItems: 'center', padding: 0 }}
          >
            {theme === 'dark' ? <FaSun size={13} /> : <FaMoon size={13} />}
          </button>
        </span>
      </div>

      <div className="mob-content">
        {tab === 'about'      && <AboutTab />}
        {tab === 'experience' && <div className="mob-pane"><ExperiencePane /></div>}
        {tab === 'projects'   && <div className="mob-pane"><ProjectsPane /></div>}
        {tab === 'skills'     && <div className="mob-pane"><SkillsPane /></div>}
        {tab === 'contact'    && <ContactTab />}
      </div>

      <div className="mob-desktop-hint">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="13" rx="2"/>
          <polyline points="8 21 12 17 16 21"/>
          <line x1="12" y1="17" x2="12" y2="16"/>
          <polyline points="5 8 8 11 5 14" strokeWidth="1.4"/>
          <line x1="11" y1="11" x2="14" y2="11" strokeWidth="1.4"/>
        </svg>
        <span>Visit on desktop for the full terminal experience</span>
      </div>

      <nav className="mob-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`mob-tab${tab === t.id ? ' mob-tab-active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
