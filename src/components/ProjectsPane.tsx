import { projects } from '../data/profile'

export function ProjectsPane() {
  return (
    <div className="proj-body">
      {projects.map(p => (
        <div key={p.name} className="proj-card">
          <div className="proj-card-header">
            <div>
              <div className="proj-name">{p.name}</div>
              <div className="proj-role">{p.role}</div>
            </div>
            <span className="proj-period">{p.period}</span>
          </div>
          <div className="proj-stack">
            {p.stack.map(s => <span key={s} className="proj-tag">{s}</span>)}
          </div>
          <ul className="proj-bullets">
            {p.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      ))}
    </div>
  )
}
