import { profile } from '../data/profile'
import { TerminalPane } from './TerminalPane'

interface Props {
  onClose: () => void
}

export function Terminal({ onClose }: Props) {
  return (
    <div className="terminal-wrapper">
      <div className="terminal-titlebar">
        <span className="dot dot-red"    onClick={onClose} style={{ cursor: 'pointer' }} title="Close" />
        <span className="dot dot-yellow" onClick={onClose} style={{ cursor: 'pointer' }} title="Minimize" />
        <span className="dot dot-green"                    style={{ cursor: 'default' }} title="Already fullscreen" />
        <span className="titlebar-title">{profile.username}@{profile.promptHost} — bash</span>
      </div>
      <TerminalPane showBanner />
    </div>
  )
}
