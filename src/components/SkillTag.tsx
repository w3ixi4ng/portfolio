import type { IconType } from 'react-icons'

export function SkillTag({ icon: Icon, label }: { icon: IconType; label: string }) {
  return (
    <span className="skill-tag">
      <Icon className="skill-icon" aria-hidden />
      {label}
    </span>
  )
}
