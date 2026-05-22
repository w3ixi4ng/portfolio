import { useState, useCallback, useRef } from 'react'
import type { HistoryEntry } from '../types'
import { runCommand } from '../commands'

export function useTerminal(initialCmd?: string) {
  const idRef = useRef(initialCmd ? 1 : 0)

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    if (!initialCmd) return []
    const { output } = runCommand(initialCmd, '~')
    return [{ id: 0, input: initialCmd, output }]
  })
  const [inputHistory, setInputHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [cwd, setCwd] = useState('~')

  const pushEntry = useCallback((input: string, output: React.ReactNode) => {
    const id = idRef.current++
    setHistory(h => [...h, { id, input, output }])
  }, [])

  const submit = useCallback((raw: string) => {
    const input = raw.trim()
    if (!input) return

    setInputHistory(h => [input, ...h])
    setHistoryIndex(-1)

    const { output, newCwd } = runCommand(input, cwd)
    if (newCwd !== undefined) setCwd(newCwd)

    if (input === 'clear') {
      setHistory([])
    } else {
      pushEntry(input, output)
    }
  }, [cwd, pushEntry])

  const navigateHistory = useCallback((direction: 'up' | 'down') => {
    setHistoryIndex(i => {
      if (direction === 'up') return Math.min(i + 1, inputHistory.length - 1)
      return Math.max(i - 1, -1)
    })
    return direction === 'up'
      ? inputHistory[Math.min(historyIndex + 1, inputHistory.length - 1)] ?? ''
      : inputHistory[Math.max(historyIndex - 1, -1)] ?? ''
  }, [historyIndex, inputHistory])

  return { history, cwd, submit, navigateHistory, inputHistory, historyIndex }
}
