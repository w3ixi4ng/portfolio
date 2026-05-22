import { skillSections } from '../data/skills'
import { SkillTag } from './SkillTag'

export function SkillsPane() {
  return (
    <div className="skills-body">
      {skillSections.map(sec => (
        <div key={sec.label} className="skills-section">
          <div className="skills-section-label">{sec.label}</div>
          <div className="skill-tags">
            {sec.skills.map(s => (
              <SkillTag key={s.name} icon={s.icon} label={s.name} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
