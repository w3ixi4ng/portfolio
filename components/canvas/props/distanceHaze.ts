import type { WebGLProgramParametersWithUniforms } from "three";

/**
 * onBeforeCompile hook for ground materials: blends toward the scene's fog colour by how far
 * a fragment is from the dropzone (world XZ), independent of camera distance. Scene fog alone
 * leaves far treetops dark when the camera is close; this fades them into the haze.
 */
export function distanceHaze(shader: WebGLProgramParametersWithUniforms) {
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", "#include <common>\nvarying vec3 vHazePos;")
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
    .replace("#include <common>", "#include <common>\nvarying vec3 vHazePos;")
    .replace(
      "#include <fog_fragment>",
      `#ifdef USE_FOG
        float hzAmt = smoothstep(10.0, 34.0, length(vHazePos.xz));
        gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, hzAmt);
      #endif
      #include <fog_fragment>`,
    );
}

export const distanceHazeKey = () => "distance-haze";
