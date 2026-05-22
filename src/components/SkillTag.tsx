import type { IconType } from 'react-icons'

export function SkillTag({ icon: Icon, label, color }: { icon: IconType; label: string; color: string }) {
  return (
    <span className="skill-tag">
      <Icon className="skill-icon" aria-hidden color={color} />
      <span className="skill-label">{label}</span>
    </span>
  )
}
