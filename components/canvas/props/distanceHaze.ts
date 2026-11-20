import type { WebGLProgramParametersWithUniforms } from "three";

/**
 * onBeforeCompile hook for ground materials: blends toward the scene's fog colour by how far
 * a fragment is from the dropzone (world XZ), independent of camera distance. Scene fog alone
 * leaves far treetops dark when the camera is close; this fades them into the haze.
 */
/**
 * How much of that haze applies right now (0-1). Sky.tsx drives it from altitude: none from
 * the sky, so freefall shows the whole patchwork; it builds up only as you come in to land,
 * where the low camera looks at the horizon.
 */
export const haze = { amount: { value: 0 } };

export function distanceHaze(shader: WebGLProgramParametersWithUniforms) {
  shader.uniforms.uHazeAmount = haze.amount;
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      "#include <common>\nvarying vec3 vHazePos;\nuniform float uHazeAmount;",
    )
    .replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      vec4 hz = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        hz = instanceMatrix * hz;
      #endif
      vHazePos = (modelMatrix * hz).xyz;`,
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      "#include <common>\nvarying vec3 vHazePos;\nuniform float uHazeAmount;",
    )
    .replace(
      "#include <fog_fragment>",
      `#ifdef USE_FOG
        float hzAmt = smoothstep(80.0, 170.0, length(vHazePos.xz)) * 0.45 * uHazeAmount;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, hzAmt);
      #endif
      #include <fog_fragment>`,
    );
}

export const distanceHazeKey = () => "distance-haze";
