"use client";

import { TextField } from "../TextField";
import { ToggleField } from "../ToggleField";

export function SettingsTab() {
  return (
    <div className="space-y-5">
      <ToggleField
        path={["settings", "showResumeDownload"]}
        label="Show résumé download"
        hint="Adds a download button at the dropzone."
      />
      <ToggleField
        path={["settings", "singaporeTouch"]}
        label="Singapore touch"
        hint="Kopi stall and the HDB estate at the dropzone."
      />
      <ToggleField path={["settings", "easterEggsEnabled"]} label="Easter eggs" />
      <ToggleField
        path={["settings", "soundDefaultOn"]}
        label="Sound toggle starts on"
        hint="Audio still never autoplays; it waits for the first interaction."
      />
      <TextField
        path={["settings", "siteUrl"]}
        label="Site URL"
        hint="Canonical domain for metadata and share images."
      />
    </div>
  );
}
