import type React from 'react'
import type { FileSystemNode } from '../types'
import { profile, projects, experience } from './profile'
import { skillSections } from './skills'
import { SkillTag } from '../components/SkillTag'

const G  = (t: string) => <span className="t-green">{t}</span>
const D  = (t: string) => <span className="t-dim">{t}</span>
const B  = (t: string) => <span className="t-bold t-white">{t}</span>
const Lk = (label: string, href: string) => (
  <a className="t-link" href={href} target="_blank" rel="noreferrer">{label}</a>
)

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="output-panel">
      <div className="panel-title">{title}</div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="panel-row">
      <span className="panel-label">{label}</span>
      <span className="panel-value">{value}</span>
    </div>
  )
}

function Bullet({ text }: { text: string }) {
  // auto-highlight percentages and "→ X" metric patterns
  const highlighted = text.replace(/(→\s*\d[\d%\s\w]+(?:faster|less|fewer|more)[^,]*|\d+%)/g, match =>
    `__HL__${match}__HL__`
  )
  const parts = highlighted.split('__HL__')
  return (
    <div className="panel-bullet">
      <span className="t-green">▸</span>{' '}
      {parts.map((p, i) => i % 2 === 1 ? <span key={i} className="t-green">{p}</span> : p)}
    </div>
  )
}

export const filesystem: Record<string, FileSystemNode> = {
  'about.txt': {
    type: 'file',
    content: (
      <Panel title="about.txt">
        <Row label="name"    value={B(profile.name)} />
        <Row label="role"    value={profile.roles.join(' · ')} />
        <Row label="uni"     value={profile.university} />
        <Row label="degree"  value={profile.degree} />
        <Row label="gpa"     value={<>{G(profile.gpa)} {D(profile.honors)}</>} />
        <Row label="awards"  value={profile.scholarship} />
        <div className="panel-spacer" />
        <div className="panel-bio">{profile.bio}</div>
        <div className="panel-hint">{D('→ cat ~/contact.txt to reach me')}</div>
      </Panel>
    ),
  },

  'contact.txt': {
    type: 'file',
    content: (
      <Panel title="contact.txt">
        <Row label="email"    value={Lk(profile.email, `mailto:${profile.email}`)} />
        <Row label="github"   value={Lk(profile.githubDisplay, profile.github)} />
        <Row label="linkedin" value={Lk(profile.linkedinDisplay, profile.linkedin)} />
        <Row label="phone"    value={profile.phone} />
      </Panel>
    ),
  },

  'projects': {
    type: 'dir',
    children: Object.fromEntries(
      projects.map(p => [
        `${p.name.toLowerCase().replace(/\s+/g, '-')}.txt`,
        {
          type: 'file' as const,
          content: (
            <Panel title={`projects/${p.name.toLowerCase()}`}>
              <Row label="role"   value={p.role} />
              <Row label="period" value={p.period} />
              <Row label="stack"  value={p.stack.join(' · ')} />
              <div className="panel-spacer" />
              {p.bullets.map((b, i) => <Bullet key={i} text={b} />)}
            </Panel>
          ),
        },
      ])
    ),
  },

  'experience': {
    type: 'dir',
    children: Object.fromEntries(
      experience.map(e => [
        `${e.company.toLowerCase().replace(/\s+/g, '-').slice(0, 20)}.txt`,
        {
          type: 'file' as const,
          content: (
            <Panel title={`experience/${e.company}`}>
              <Row label="company" value={B(e.company)} />
              <Row label="role"    value={e.role} />
              <Row label="period"  value={e.period} />
              <div className="panel-spacer" />
              {e.bullets.map((b, i) => <Bullet key={i} text={b} />)}
            </Panel>
          ),
        },
      ])
    ),
  },

  'skills': {
    type: 'dir',
    children: Object.fromEntries(
      skillSections.map(sec => [
        `${sec.label.toLowerCase()}.txt`,
        {
          type: 'file' as const,
          content: (
            <Panel title={`skills/${sec.label.toLowerCase()}`}>
              <div className="skill-tags">
                {sec.skills.map(s => <SkillTag key={s.name} icon={s.icon} label={s.name} />)}
              </div>
            </Panel>
          ),
        },
      ])
    ),
  },
}
