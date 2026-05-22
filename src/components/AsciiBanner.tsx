import { profile } from '../data/profile'

const NAME = `
██╗    ██╗███████╗██╗██╗  ██╗██╗ █████╗ ███╗   ██╗ ██████╗
██║    ██║██╔════╝██║╚██╗██╔╝██║██╔══██╗████╗  ██║██╔════╝
██║ █╗ ██║█████╗  ██║ ╚███╔╝ ██║███████║██╔██╗ ██║██║  ███╗
██║███╗██║██╔══╝  ██║ ██╔██╗ ██║██╔══██║██║╚██╗██║██║   ██║
╚███╔███╔╝███████╗██║██╔╝ ██╗██║██║  ██║██║ ╚████║╚██████╔╝
 ╚══╝╚══╝ ╚══════╝╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝`.trim()

export function AsciiBanner() {
  return (
    <div className="banner-wrap" aria-label={profile.name}>
      <pre className="banner-name">{NAME}</pre>
      <div className="banner-sub">
        {profile.roles.map((role, i) => (
          <>
            {i > 0 && <span key={`dot-${i}`} className="banner-dot">·</span>}
            <span key={role} className="banner-tag">{role}</span>
          </>
        ))}
        <span className="banner-dot">·</span>
        <span className="banner-tag">{profile.bannerTag}</span>
      </div>
    </div>
  )
}
