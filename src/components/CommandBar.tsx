import { useState } from 'react'

const BUTTONS = [
  { label: 'About',      command: 'about'      },
  { label: 'Experience', command: 'experience' },
  { label: 'Projects',   command: 'projects'   },
  { label: 'Skills',     command: 'skills'     },
  { label: 'Contact',    command: 'contact'    },
]

export function CommandBar({ onRun }: { onRun: (cmd: string) => void }) {
  const [active, setActive] = useState<string | null>(null)

  function handleClick(cmd: string) {
    setActive(cmd)
    onRun(cmd)
  }

  return (
    <div className="command-bar">
      {BUTTONS.map(({ label, command }) => (
        <button
          key={command}
          className={`cmd-btn${active === command ? ' cmd-btn-active' : ''}`}
          onClick={() => handleClick(command)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
