"use client";

import { ColorField } from "../ColorField";
import { TextField } from "../TextField";

export function ProfileTab() {
  return (
    <div className="space-y-4">
      <TextField path={["profile", "name"]} label="Name" />
      <TextField path={["profile", "title"]} label="Title" />
      <TextField path={["profile", "pitch"]} label="One-line pitch" multiline />
      <TextField path={["profile", "bio"]} label="Short bio (About card)" multiline />
      <TextField path={["profile", "location"]} label="Location" />
      <TextField path={["profile", "email"]} label="Email" type="email" />
      <TextField path={["profile", "links", "linkedin"]} label="LinkedIn URL" type="url" optional />
      <TextField path={["profile", "links", "github"]} label="GitHub URL" type="url" optional />
      <TextField
        path={["profile", "resume"]}
        label="Résumé path"
        hint='A file in /public, e.g. "/resume.pdf".'
      />
      <fieldset className="space-y-4 rounded-lg border border-border p-4">
        <legend className="px-1 font-semibold">Avatar</legend>
        <ColorField path={["profile", "avatar", "suitColor"]} label="Jumpsuit colour" />
      </fieldset>
    </div>
  );
}
