import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { useTerminal } from '../hooks/useTerminal'
import { TerminalInput } from './TerminalInput'
import { Prompt } from './Prompt'
import { AsciiBanner } from './AsciiBanner'

interface Props {
  initialCmd?: string
  showBanner?: boolean
}

export interface TerminalPaneHandle {
  submit: (cmd: string) => void
}

export const TerminalPane = forwardRef<TerminalPaneHandle, Props>(
  function TerminalPane({ initialCmd, showBanner }, ref) {
    const { history, cwd, submit, navigateHistory, inputHistory, historyIndex } = useTerminal(initialCmd)
    const bottomRef = useRef<HTMLDivElement>(null)
    const bodyRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({ submit }), [submit])

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [history])

    return (
      <div
        ref={bodyRef}
        className="terminal-body"
        onClick={() => bodyRef.current?.querySelector<HTMLInputElement>('.terminal-input')?.focus()}
      >
        {showBanner && <AsciiBanner />}
        {showBanner && (
          <div className="welcome-msg">
            <p><span className="t-green">Welcome!</span> Click the <span className="t-bold t-white">buttons above</span> to explore — or type <span className="t-bold t-white">help</span> if you speak terminal.</p>
            <p className="t-dim">Tab autocomplete · ↑↓ history · Ctrl+L to clear</p>
          </div>
        )}

        {history.map(entry => (
          <div key={entry.id} className="history-entry">
            <div className="history-prompt-line">
              <Prompt cwd={cwd} dim />
              <span className="history-input">{entry.input}</span>
            </div>
            {entry.output && <div className="history-output">{entry.output}</div>}
          </div>
        ))}

        <TerminalInput
          cwd={cwd}
          onSubmit={submit}
          inputHistory={inputHistory}
          historyIndex={historyIndex}
          onHistoryNavigate={navigateHistory}
        />
        <div ref={bottomRef} />
      </div>
    )
  }
)
