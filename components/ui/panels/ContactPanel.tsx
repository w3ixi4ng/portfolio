import { isTodo, profile, settings } from "@/content";

export function ContactPanel() {
  const { linkedin, github } = profile.links;
  return (
    <div className="space-y-4">
      <p>Hiring, collaborating, or just want to say hi? My inbox is open.</p>
      <ul className="flex flex-col gap-2">
        <li>
          <a href={`mailto:${profile.email}`} className="btn w-full">
            ✉ {profile.email}
          </a>
        </li>
        {!isTodo(linkedin) && (
          <li>
            <a href={linkedin} target="_blank" rel="noreferrer" className="btn btn-teal w-full">
              LinkedIn ↗
            </a>
          </li>
        )}
        {!isTodo(github) && (
          <li>
            <a href={github} target="_blank" rel="noreferrer" className="btn btn-cream w-full">
              GitHub ↗
            </a>
          </li>
        )}
        {settings.showResumeDownload && !isTodo(profile.resume) && (
          <li>
            <a href={profile.resume} download className="btn btn-red w-full">
              Download résumé (PDF)
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
