"use client";

import { Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Link from "next/link";
import { Suspense } from "react";
import { CAMERA_FOV } from "./path";
import { worldHtmlLayer } from "./worldHtmlLayer";
import { CameraRig } from "./CameraRig";
import { DaylightDriver } from "./DaylightDriver";
import { Effects } from "./Effects";
import { Lights } from "./Lights";
import { ProgressBridge } from "./ProgressBridge";
import { QualityGovernor } from "./QualityGovernor";
import { Sky } from "./Sky";
import { SpeedLines } from "./SpeedLines";
import { ViewportSync } from "./ViewportSync";
import { Ground } from "./props/Ground";
import { CityBackdrop } from "./props/CityBackdrop";
import { Avatar } from "./characters/Avatar";
import { DeploymentZone } from "./zones/DeploymentZone";
import { DropzoneZone } from "./zones/DropzoneZone";
import { FormationZone } from "./zones/FormationZone";
import { IslandsZone } from "./zones/IslandsZone";
import { PlaneZone } from "./zones/PlaneZone";
import { SkyEggs } from "./zones/SkyEggs";

function WebGLFallback() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <p className="panel max-w-sm p-5 text-center">
        Your browser can&apos;t show the 3D jump.{" "}
        <Link href="/plain" className="font-bold text-teal-ink underline">
          Read the plain version
        </Link>
        .
      </p>
    </div>
  );
}

/** Fixed full-screen diorama scene (low-FOV perspective, CLAUDE.md §4). Scroll is native page scroll (lib/scrollState.ts). */
export function Experience() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <ProgressBridge />
      <Canvas
        // Plain PCF shadows: variance (VSM) shadows can flash black patches when the shadow
        // camera moves every frame, as ours follows the avatar.
        shadows="percentage"
        dpr={[1, 2]}
        resize={{ debounce: 0 }}
        camera={{ fov: CAMERA_FOV, near: 0.5, far: 700, position: [12, 142, 14] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        fallback={<WebGLFallback />}
      >
        <ViewportSync />
        <DaylightDriver />
        <QualityGovernor />
        <Lights />
        <Sky />
        <CameraRig />
        <Ground />
        <CityBackdrop />
        <SpeedLines />
        <Suspense fallback={null}>
          <PlaneZone />
        </Suspense>
        <Suspense fallback={null}>
          <FormationZone />
        </Suspense>
        <Suspense fallback={null}>
          <IslandsZone />
        </Suspense>
        <Suspense fallback={null}>
          <DeploymentZone />
        </Suspense>
        <Suspense fallback={null}>
          <DropzoneZone />
        </Suspense>
        <Suspense fallback={null}>
          <Avatar />
        </Suspense>
        <Suspense fallback={null}>
          <SkyEggs />
        </Suspense>
        {/* Compile every material (incl. hidden zones) now, behind the loader, so scrolling into a
            zone never stalls or flashes while shaders build. */}
        <Suspense fallback={null}>
          <Preload all />
        </Suspense>
        <Effects />
      </Canvas>
      {/* Stable home for in-world labels (see worldHtmlLayer.ts). */}
      <div
        ref={(el) => {
          worldHtmlLayer.current = el;
        }}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      />
    </div>
  );
}
