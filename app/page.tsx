import { LazyExperience } from "@/components/canvas/LazyExperience";
import { Overlay } from "@/components/ui/Overlay";
import { ClickSounds } from "@/components/ui/ClickSounds";
import { Loader } from "@/components/ui/Loader";
import { ScrollRuntime } from "@/components/ui/ScrollRuntime";
import { WebGLGate } from "@/components/ui/WebGLGate";
import { SCROLL_PAGES } from "@/lib/scroll";

export default function Home() {
  return (
    <main>
      <WebGLGate>
        <ScrollRuntime />
        <ClickSounds />
        <LazyExperience />
        {/* The page's own height is the scroll track; the scene and overlay are fixed. */}
        <div aria-hidden="true" style={{ height: `${SCROLL_PAGES * 100}vh` }} />
        <Overlay />
        <Loader />
      </WebGLGate>
      <noscript>
        <p className="fixed inset-x-0 top-0 z-50 bg-paper p-4 text-center">
          This site needs JavaScript for the 3D jump. <a href="/plain">Read the plain version</a>.
        </p>
      </noscript>
    </main>
  );
}
