import { filesystem } from '../data/filesystem'
import type { FileSystemNode } from '../types'

type DirNode = FileSystemNode & { children: Record<string, FileSystemNode> }

export function normalizePath(path: string, cwdNorm: string): string {
  if (path === '~' || path === '') return ''
  if (path.startsWith('~')) path = path.slice(1)
  if (path.startsWith('/')) return path.replace(/^\/+/, '')
  const combined = cwdNorm ? `${cwdNorm}/${path}` : path
  const resolved: string[] = []
  for (const p of combined.split('/')) {
    if (p === '..') resolved.pop()
    else if (p && p !== '.') resolved.push(p)
  }
  return resolved.join('/')
}

export function cwdNorm(cwd: string): string {
  return cwd === '~' ? '' : cwd.replace(/^~\/?/, '')
}

export function resolveNode(absPath: string): FileSystemNode | null {
  const parts = absPath.split('/').filter(Boolean)
  let node: FileSystemNode = { type: 'dir', children: filesystem }
  for (const part of parts) {
    const dir = node as DirNode
    if (!dir.children?.[part]) return null
    node = dir.children[part]
  }
  return node
}

export function getCompletions(partial: string, cwd: string, onlyDirs = false): string[] {
  const base = cwdNorm(cwd)
  const lastSlash = partial.lastIndexOf('/')
  const dirPart = lastSlash >= 0 ? partial.slice(0, lastSlash + 1) : ''
  const filePart = lastSlash >= 0 ? partial.slice(lastSlash + 1) : partial

  const lookupPath = dirPart
    ? normalizePath(dirPart.replace(/\/$/, ''), base)
    : base

  const node = resolveNode(lookupPath)
  if (!node || node.type !== 'dir') return []
  const dir = node as DirNode
  if (!dir.children) return []

  return Object.entries(dir.children)
    .filter(([name, child]) => {
      if (!name.startsWith(filePart)) return false
      if (onlyDirs && child.type !== 'dir') return false
      return true
    })
    .map(([name, child]) => dirPart + name + (child.type === 'dir' ? '/' : ''))
}

export function longestCommonPrefix(strs: string[]): string {
  if (!strs.length) return ''
  let prefix = strs[0]
  for (const s of strs.slice(1)) {
    while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1)
    if (!prefix) return ''
  }
  return prefix
}
