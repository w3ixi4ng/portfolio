import { experience } from '../data/profile'

export function ExperiencePane() {
  return (
    <div className="proj-body">
      {experience.map(exp => (
        <div key={exp.company} className="proj-card">
          <div className="proj-card-header">
            <div>
              <div className="proj-name">{exp.company}</div>
              <div className="proj-role">{exp.role}</div>
            </div>
            <span className="proj-period">{exp.period}</span>
          </div>
          <ul className="proj-bullets">
            {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      ))}
    </div>
  )
}
