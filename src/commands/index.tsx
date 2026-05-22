import React from 'react'
import { profile } from '../data/profile'
import { normalizePath, resolveNode, cwdNorm } from '../utils/fs'
import { WX, LAPTOP } from '../data/asciiArt'

const green = (t: string) => <span className="t-green">{t}</span>
const dim = (t: string) => <span className="t-dim">{t}</span>
const bold = (t: string) => <span className="t-bold">{t}</span>
const err = (t: string) => <span className="t-error">{t}</span>

function resolvePath(path: string, cwd: string) {
  const base = cwdNorm(cwd)
  return resolveNode(normalizePath(path, base))
}

function cwdDisplay(cwd: string) {
  return cwd === '~' ? '~' : `~/${cwdNorm(cwd)}`
}

function lsNode(node: { type: string; children?: Record<string, { type: string }> }) {
  if (node.type !== 'dir' || !node.children) return err('not a directory')
  const entries = Object.entries(node.children)
  if (entries.length === 0) return <span className="t-dim">empty</span>
  return (
    <div className="ls-grid">
      {entries.map(([name, child]) =>
        child.type === 'dir'
          ? <span key={name} className="t-green t-bold">{name}/</span>
          : <span key={name} className="t-white">{name}</span>
      )}
    </div>
  )
}

export function runCommand(raw: string, cwd: string): { output: React.ReactNode; newCwd?: string } {
  const [cmd, ...args] = raw.trim().split(/\s+/)

  switch (cmd) {
    case 'help':
      return {
        output: (
          <div className="output-panel">
            <div className="panel-title">available commands</div>
            {([
              ['about',       'who I am'],
              ['projects',    'things I\'ve built'],
              ['experience',  'where I\'ve worked'],
              ['skills',      'what I know'],
              ['contact',     'how to reach me'],
            ] as [string, string][]).map(([cmd, desc]) => (
              <div key={cmd} className="panel-row">
                <span className="panel-label">{green(cmd)}</span>
                <span className="panel-value t-dim">{desc}</span>
              </div>
            ))}
            <div className="panel-spacer" />
            <div className="panel-hint t-dim t-bold">filesystem commands</div>
            {([
              ['ls [path]',  'list directory'],
              ['cd <path>',  'change directory'],
              ['cat <file>', 'read a file'],
              ['pwd',        'current path'],
              ['clear',      'clear screen'],
            ] as [string, string][]).map(([cmd, desc]) => (
              <div key={cmd} className="panel-row">
                <span className="panel-label">{dim(cmd)}</span>
                <span className="panel-value t-dim">{desc}</span>
              </div>
            ))}
            <div className="panel-spacer" />
            <div className="panel-hint t-dim">easter egg: sudo hire-me</div>
          </div>
        ),
      }

    case 'pwd':
      return { output: <span>{cwdDisplay(cwd)}</span> }

    case 'whoami':
      return {
        output: (
          <div className="neofetch">
            <pre className="nf-art">{WX}</pre>
            <div className="nf-info">
              <div className="nf-title">
                <span className="t-green t-bold">{profile.username}</span>
                <span className="t-dim">@</span>
                <span className="t-green t-bold">{profile.promptHost}</span>
              </div>
              <div className="nf-sep">{'─'.repeat(28)}</div>
              <div className="panel-row"><span className="panel-label t-dim">name</span><span className="panel-value">{bold(profile.name)}</span></div>
              <div className="panel-row"><span className="panel-label t-dim">uni</span><span className="panel-value t-dim">{profile.university}</span></div>
              <div className="panel-row"><span className="panel-label t-dim">degree</span><span className="panel-value t-dim">{profile.degreeShort}</span></div>
              <div className="panel-row"><span className="panel-label t-dim">gpa</span><span className="panel-value">{green(profile.gpa)}</span></div>
              <div className="panel-row"><span className="panel-label t-dim">award</span><span className="panel-value t-dim">{profile.scholarship}</span></div>

            </div>
          </div>
        ),
      }

    case 'ls': {
      const target = args[0] ?? ''
      const node = resolvePath(target || '.', cwd)
      if (!node) return { output: err(`ls: ${args[0]}: No such file or directory`) }
      if (node.type === 'file') return { output: <span>{args[0]}</span> }
      return { output: lsNode(node) }
    }

    case 'cd': {
      const target = args[0] ?? '~'
      if (target === '~' || target === '/') return { output: null, newCwd: '~' }
      const base = cwdNorm(cwd)
      const resolved = normalizePath(target, base)
      const node = resolveNode(resolved)
      if (!node) return { output: err(`cd: ${target}: No such file or directory`) }
      if (node.type === 'file') return { output: err(`cd: ${target}: Not a directory`) }
      return { output: null, newCwd: resolved ? `~/${resolved}` : '~' }
    }

    case 'cat': {
      if (!args[0]) return { output: err('cat: missing operand') }
      const node = resolvePath(args[0], cwd)
      if (!node) return { output: err(`cat: ${args[0]}: No such file or directory`) }
      if (node.type === 'dir') return { output: err(`cat: ${args[0]}: Is a directory`) }
      return { output: node.content }
    }

    case 'sudo':
      if (args[0] === 'hire-me') {
        return {
          output: (
            <div className="hire-me-wrap">
              <pre className="hire-art t-green">{LAPTOP}</pre>
              <div className="output-panel" style={{ flex: 1 }}>
                <div className="panel-title">sudo hire-me</div>
                <div className="panel-row"><span className="panel-label t-dim">[sudo]</span><span className="panel-value t-dim">password: ········</span></div>
                <div className="panel-spacer" />
                <div className="panel-row"><span className="panel-label t-dim">qualifications</span><span className="panel-value">{green('✓ PASS')}</span></div>
                <div className="panel-row"><span className="panel-label t-dim">{profile.gpaLabel}</span><span className="panel-value">{green('✓ PASS')}</span></div>
                <div className="panel-row"><span className="panel-label t-dim">skills audit</span><span className="panel-value">{green('✓ PASS')}</span></div>
                <div className="panel-row"><span className="panel-label t-dim">project review</span><span className="panel-value">{green('✓ PASS')}</span></div>
                <div className="panel-spacer" />
                <div className="panel-value t-bold t-green">All checks passed. Offer extended.</div>
                <div className="panel-hint t-dim">→ cat ~/contact.txt to proceed</div>
              </div>
            </div>
          ),
        }
      }
      return { output: err('sudo: command not found (try: sudo hire-me)') }

    // ── Alias commands for non-tech visitors ──
    case 'about':
      return runCommand('cat about.txt', '~')

    case 'contact':
      return runCommand('cat contact.txt', '~')

    case 'projects': {
      const dir = resolveNode('projects')
      if (!dir || dir.type !== 'dir' || !dir.children) return { output: null }
      return {
        output: (
          <div className="alias-stack">
            {Object.values(dir.children).map((node, i) =>
              node.type === 'file' ? <div key={i}>{node.content}</div> : null
            )}
          </div>
        ),
      }
    }

    case 'experience': {
      const dir = resolveNode('experience')
      if (!dir || dir.type !== 'dir' || !dir.children) return { output: null }
      return {
        output: (
          <div className="alias-stack">
            {Object.values(dir.children).map((node, i) =>
              node.type === 'file' ? <div key={i}>{node.content}</div> : null
            )}
          </div>
        ),
      }
    }

    case 'skills': {
      const lang  = resolveNode('skills/languages.txt')
      const fw    = resolveNode('skills/frameworks.txt')
      const tools = resolveNode('skills/tools.txt')
      const cloud = resolveNode('skills/cloud.txt')
      return {
        output: (
          <div className="alias-stack">
            {lang?.content}
            {fw?.content}
            {tools?.content}
            {cloud?.content}
          </div>
        ),
      }
    }

    case 'clear':
      return { output: null }

    case '':
      return { output: null }

    default:
      return {
        output: err(`command not found: ${cmd}. Type 'help' for available commands.`),
      }
  }
}
