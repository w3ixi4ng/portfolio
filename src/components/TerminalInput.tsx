import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Prompt } from './Prompt'
import { getCompletions, longestCommonPrefix } from '../utils/fs'

interface Props {
  cwd: string
  onSubmit: (value: string) => void
  inputHistory: string[]
  historyIndex: number
  onHistoryNavigate: (dir: 'up' | 'down') => string
}

const COMMANDS = [
  'about', 'cat', 'cd', 'clear', 'contact', 'experience',
  'help', 'ls', 'projects', 'pwd', 'skills', 'sudo', 'whoami',
]

export function TerminalInput({ cwd, onSubmit, onHistoryNavigate }: Props) {
  const [value, setValue] = useState('')
  const [tabHints, setTabHints] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function clearHints() { if (tabHints.length) setTabHints([]) }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      onSubmit(value)
      setValue('')
      clearHints()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      clearHints()
      setValue(onHistoryNavigate('up'))
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      clearHints()
      setValue(onHistoryNavigate('down'))
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const hasArg = value.includes(' ')

      if (!hasArg) {
        const matches = COMMANDS.filter(c => c.startsWith(value) && c !== value)
        if (matches.length === 1) {
          setValue(matches[0])
          clearHints()
        } else if (matches.length > 1) {
          const prefix = longestCommonPrefix(matches)
          if (prefix.length > value.length) {
            setValue(prefix)
            clearHints()
          } else {
            setTabHints(matches)
          }
        }
      } else {
        const spaceIdx = value.indexOf(' ')
        const cmd = value.slice(0, spaceIdx)
        const partial = value.slice(spaceIdx + 1)

        const SUDO_CMDS = ['hire-me']
        if (cmd === 'sudo') {
          const matches = SUDO_CMDS.filter(s => s.startsWith(partial) && s !== partial)
          if (matches.length === 1) { setValue(`sudo ${matches[0]}`); clearHints() }
          else if (matches.length > 1) setTabHints(matches)
          else clearHints()
          return
        }

        const onlyDirs = cmd === 'cd'
        const completions = getCompletions(partial, cwd, onlyDirs)

        if (completions.length === 1) {
          setValue(`${cmd} ${completions[0]}`)
          clearHints()
        } else if (completions.length > 1) {
          const prefix = longestCommonPrefix(completions)
          if (prefix.length > partial.length) {
            setValue(`${cmd} ${prefix}`)
            clearHints()
          } else {
            setTabHints(completions)
          }
        } else {
          clearHints()
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      onSubmit('clear')
      setValue('')
      clearHints()
    } else {
      clearHints()
    }
  }

  return (
    <div className="input-area">
      {tabHints.length > 0 && (
        <div className="tab-hints">
          {tabHints.map(h => (
            <span key={h} className={h.endsWith('/') ? 't-green t-bold' : 't-white'}>
              {h}
            </span>
          ))}
        </div>
      )}
      <div className="terminal-input-row" onClick={() => inputRef.current?.focus()}>
        <Prompt cwd={cwd} />
        <input
          ref={inputRef}
          className="terminal-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="terminal input"
        />
      </div>
    </div>
  )
}
