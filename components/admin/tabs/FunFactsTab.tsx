"use client";

import { StringListField } from "../StringListField";

export function FunFactsTab() {
  return (
    <StringListField
      path={["funFacts"]}
      label="Fun facts"
      itemLabel="fun fact"
      hint="Shown when visitors snap a selfie with the camera-flyer. 3–5 is plenty."
    />
  );
}
