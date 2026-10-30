import { Renderer, Camera, Transform, Box, Cylinder, Program, Mesh, Vec3 } from 'ogl';

export interface Hero3DInstance {
  destroy: () => void;
  updateScroll: (progress: number) => void;
}

export function initHero3D(container: HTMLElement, onReady?: () => void): Hero3DInstance | null {
  const testCanvas = document.createElement('canvas');
  const glTest = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
  if (!glTest) return null;

  const renderer = new Renderer({
    alpha: true,
    antialias: true,
    dpr: Math.min(window.devicePixelRatio, 2),
    powerPreference: 'high-performance'
  });

  const gl = renderer.gl;
  gl.clearColor(0, 0, 0, 0);

  const canvas = gl.canvas;
  canvas.classList.add('hero-3d-canvas');
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.opacity = '0';
  canvas.style.transition = 'opacity 0.4s ease';

  container.appendChild(canvas);

  const camera = new Camera(gl, { fov: 38 });
  camera.position.set(0, 1.2, 6.0);
  camera.lookAt([0, 0, 0]);

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height);
    camera.perspective({ aspect: width / height });
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  const scene = new Transform();
  const tiltPivot = new Transform();
  tiltPivot.setParent(scene);

  // --- CUBE SHADER ---
  // Matches exact logo gradient: Top golden-amber, Left deep red-orange, Right vibrant orange
  const cubeVertexShader = /* glsl */ `
    attribute vec3 position;
    attribute vec3 normal;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat3 normalMatrix;

    varying vec3 vNormal;
    varying vec3 vWorldNormal;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vWorldNormal = normalize(normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const cubeFragmentShader = /* glsl */ `
    precision highp float;
    varying vec3 vNormal;
    varying vec3 vWorldNormal;

    uniform vec3 uLightPos;
    uniform float uGlowRing;
    uniform float uOpacity;

    void main() {
      vec3 lightDir = normalize(uLightPos);
      float diff = max(dot(vNormal, lightDir), 0.0);

      // Exact logo colors
      vec3 colorTop = vec3(1.0, 0.74, 0.22);
      vec3 colorLeft = vec3(0.92, 0.24, 0.10);
      vec3 colorRight = vec3(1.0, 0.50, 0.12);

      vec3 baseColor;
      if (vWorldNormal.y > 0.5) {
        baseColor = colorTop;
      } else if (vWorldNormal.x < -0.3) {
        baseColor = colorLeft;
      } else {
        baseColor = colorRight;
      }

      vec3 ambient = vec3(0.14, 0.16, 0.22);
      vec3 lit = baseColor * (diff * 0.82 + ambient);

      // Subtle edge rim light
      float rim = 1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0);
      rim = pow(rim, 2.5);
      lit += vec3(1.0, 0.6, 0.2) * rim * 0.4;

      // Passing glow flash
      lit += vec3(1.0, 0.6, 0.2) * uGlowRing * 0.8;

      gl_FragColor = vec4(lit, uOpacity);
    }
  `;

  const cubeGeometry = new Box(gl, { width: 1.5, height: 1.5, depth: 1.5 });
  const cubeProgram = new Program(gl, {
    vertex: cubeVertexShader,
    fragment: cubeFragmentShader,
    uniforms: {
      uLightPos: { value: new Vec3(-3, 6, 5) },
      uGlowRing: { value: 0 },
      uOpacity: { value: 1.0 }
    },
    transparent: true,
    cullFace: null
  });

  const cubeMesh = new Mesh(gl, { geometry: cubeGeometry, program: cubeProgram });
  cubeMesh.setParent(tiltPivot);

  // Initial isometric corner balance
  const cornerAngleX = Math.atan(1 / Math.SQRT2);
  cubeMesh.rotation.x = cornerAngleX;
  cubeMesh.rotation.y = Math.PI / 4;
  cubeMesh.position.y = 1.0;

  // --- ADAPTABLE HOLE SHADER (Matches logo elliptical socket) ---
  const holeVertexShader = /* glsl */ `
    attribute vec3 position;
    attribute vec2 uv;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const holeFragmentShader = /* glsl */ `
    precision highp float;
    varying vec2 vUv;
    uniform float uMorphProgress; // 0 (round) -> 1 (square adapter)
    uniform float uGlowRing;

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float rCircle = length(p);

      vec2 rotP = vec2(p.x + p.y, p.x - p.y) * 0.7071;
      float rSquare = max(abs(rotP.x), abs(rotP.y));

      float r = mix(rCircle, rSquare, uMorphProgress);

      if (r > 1.0) discard;

      // Dark navy hole gradient matching logo
      vec3 navyDeep = vec3(0.024, 0.055, 0.10);
      vec3 navyEdge = vec3(0.118, 0.294, 0.561);
      vec3 col = mix(navyDeep, navyEdge, pow(r, 2.0));

      // Glow ring at rim during pass-through
      float edgeRing = smoothstep(0.85, 0.98, r) * (1.0 - smoothstep(0.98, 1.0, r));
      vec3 glowCol = vec3(1.0, 0.58, 0.12);
      col = mix(col, glowCol, edgeRing * (uMorphProgress * 0.35 + uGlowRing * 1.4));

      gl_FragColor = vec4(col, 0.96);
    }
  `;

  const holeGeometry = new Cylinder(gl, {
    radiusTop: 1.55,
    radiusBottom: 1.55,
    height: 0.05,
    radialSegments: 48
  });

  const holeProgram = new Program(gl, {
    vertex: holeVertexShader,
    fragment: holeFragmentShader,
    uniforms: {
      uMorphProgress: { value: 0 },
      uGlowRing: { value: 0 }
    },
    transparent: true,
    cullFace: null
  });

  const holeMesh = new Mesh(gl, { geometry: holeGeometry, program: holeProgram });
  holeMesh.setParent(tiltPivot);
  holeMesh.position.set(0, -0.8, 0);
  holeMesh.scale.set(1.2, 1, 0.72); // Elliptical base perspective

  // Mouse tilt
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  function onMouseMove(e: MouseEvent) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetTiltY = ((e.clientX - cx) / cx) * 0.18;
    targetTiltX = ((e.clientY - cy) / cy) * 0.14;
  }
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Scroll Progress Engine (0 to 1)
  let scrollProgress = 0;
  let targetScrollProgress = 0;

  function updateScroll(p: number) {
    targetScrollProgress = Math.min(Math.max(p, 0), 1);
  }

  // Animation Loop
  let isVisible = true;
  let animationId = 0;
  let clock = 0;
  let lastTime = performance.now();
  let firstFrame = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      isVisible = e.isIntersecting;
      if (isVisible && !animationId) {
        lastTime = performance.now();
        animationId = requestAnimationFrame(render);
      }
    });
  }, { threshold: 0.05 });

  observer.observe(container);

  function render(now: number) {
    if (!isVisible) {
      animationId = 0;
      return;
    }

    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    clock += dt;

    // Smooth tilt lerp
    currentTiltX += (targetTiltX - currentTiltX) * 0.08;
    currentTiltY += (targetTiltY - currentTiltY) * 0.08;
    tiltPivot.rotation.x = currentTiltX;
    tiltPivot.rotation.y = currentTiltY;

    scrollProgress += (targetScrollProgress - scrollProgress) * 0.1;

    // SCROLL SEQUENCE:
    // 0–20%: Idle hover
    // 20–60%: Cube aligns, hole flexes, cube drops through with glow ring
    // 60–100%: Cube fades cleanly below the hole into next section (no re-emergence)

    if (scrollProgress < 0.20) {
      // Idle Stage
      holeProgram.uniforms.uMorphProgress.value = 0;
      holeProgram.uniforms.uGlowRing.value = 0;
      cubeProgram.uniforms.uGlowRing.value = 0;
      cubeProgram.uniforms.uOpacity.value = 1.0;

      const idleFloat = Math.sin(clock * 1.8) * 0.08;
      cubeMesh.position.y = 1.0 + idleFloat;
      cubeMesh.rotation.y = Math.PI / 4 + Math.sin(clock * 0.8) * 0.04;
      cubeMesh.rotation.x = cornerAngleX;

    } else if (scrollProgress >= 0.20 && scrollProgress < 0.60) {
      // Pass-Through Stage
      const t = (scrollProgress - 0.20) / 0.40; // 0 to 1
      holeProgram.uniforms.uMorphProgress.value = t;

      // Glow ring flashes at the moment of passing (around t = 0.5)
      const glow = Math.sin(t * Math.PI) * 1.3;
      holeProgram.uniforms.uGlowRing.value = glow;
      cubeProgram.uniforms.uGlowRing.value = glow;
      cubeProgram.uniforms.uOpacity.value = 1.0;

      // Cube drops through hole: from y = 1.0 to y = -2.6
      cubeMesh.position.y = 1.0 - (t * 3.6);

      // Alignment rotation
      cubeMesh.rotation.y = (Math.PI / 4) + (t * 0.35);
      cubeMesh.rotation.x = cornerAngleX;

    } else {
      // Post Pass-Through Stage (60% - 100%): Clean fade-out into the void
      const tAfter = (scrollProgress - 0.60) / 0.40; // 0 to 1
      holeProgram.uniforms.uMorphProgress.value = Math.max(1.0 - tAfter * 0.5, 0.0);
      holeProgram.uniforms.uGlowRing.value = 0;
      cubeProgram.uniforms.uGlowRing.value = 0;

      // Fade cube opacity cleanly so it does not re-emerge
      cubeProgram.uniforms.uOpacity.value = Math.max(1.0 - (tAfter * 2.0), 0.0);
      cubeMesh.position.y = -2.6 - (tAfter * 2.0);
    }

    renderer.render({ scene, camera });

    if (!firstFrame) {
      firstFrame = true;
      canvas.style.opacity = '1';
      if (onReady) onReady();
    }

    animationId = requestAnimationFrame(render);
  }

  animationId = requestAnimationFrame(render);

  return {
    destroy: () => {
      cancelAnimationFrame(animationId);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    },
    updateScroll
  };
}
