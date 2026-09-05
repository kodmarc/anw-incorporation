import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { BuildPhase } from '../types';

type BuildSequenceProps = {
  phases: BuildPhase[];
  reducedMotion: boolean;
};

const clampRange = (progress: number, start: number, end: number) =>
  THREE.MathUtils.clamp((progress - start) / (end - start), 0, 1);

/**
 * Pinned WebGL scrolltelling: a bare structural frame is enclosed into a shell and
 * then finished as an interior, driven entirely by scroll position.
 *
 * Motion justification (skill section 5): this is the studio's actual process, and
 * it is the one thing a competitor's photo grid cannot show. Scroll drives the
 * narrative, so the user controls the pace.
 *
 * Follows the canonical pin skeleton from skill section 5.B: start "top top",
 * pin: true, scrub. No scroll listeners, no React state per frame.
 */
export function BuildSequence({ phases, reducedMotion }: BuildSequenceProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const captionRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const mount = mountRef.current;
    const wrap = wrapRef.current;
    const viewport = viewportRef.current;
    if (!mount || !wrap || !viewport) return undefined;

    const readToken = (name: string, fallback: string) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return value || fallback;
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 160);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const accentColor = new THREE.Color(readToken('--scene-accent', '#4d7cff'));
    const beamColor = new THREE.Color(readToken('--scene-beam', '#8d94a3'));
    const shellColor = new THREE.Color(readToken('--scene-shell', '#4a5261'));
    const interiorColor = new THREE.Color(readToken('--scene-interior', '#c8bfae'));
    const softColor = new THREE.Color(readToken('--scene-soft', '#8a7f70'));

    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(item: T) => {
      disposables.push(item);
      return item;
    };

    // Geometry with its origin at the base, so scale.y grows upward from the floor.
    const risingBox = () => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      geometry.translate(0, 0.5, 0);
      return track(geometry);
    };

    const frameGeometry = risingBox();
    const flatGeometry = track(new THREE.BoxGeometry(1, 1, 1));

    const beamMaterial = track(new THREE.MeshStandardMaterial({ color: beamColor, metalness: 0.45, roughness: 0.5 }));
    const accentMaterial = track(new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.3, roughness: 0.45 }));
    const shellMaterial = track(
      new THREE.MeshStandardMaterial({ color: shellColor, roughness: 0.9, metalness: 0.05, transparent: true, opacity: 0 }),
    );
    const interiorMaterial = track(
      new THREE.MeshStandardMaterial({ color: interiorColor, roughness: 0.75, metalness: 0.05, transparent: true, opacity: 0 }),
    );
    const softMaterial = track(
      new THREE.MeshStandardMaterial({ color: softColor, roughness: 0.95, metalness: 0, transparent: true, opacity: 0 }),
    );

    const root = new THREE.Group();
    scene.add(root);

    // Phase 1: the structural frame.
    const frameGroup = new THREE.Group();
    root.add(frameGroup);

    const slab = new THREE.Mesh(flatGeometry, beamMaterial);
    slab.scale.set(11, 0.16, 9);
    slab.position.y = -0.08;
    frameGroup.add(slab);

    const columnPositions: Array<[number, number]> = [];
    [-5, 0, 5].forEach((x) => {
      [-4, 0, 4].forEach((z) => {
        if (x === 0 && z === 0) return;
        columnPositions.push([x, z]);
      });
    });

    const columns: THREE.Mesh[] = columnPositions.map(([x, z]) => {
      const column = new THREE.Mesh(frameGeometry, beamMaterial);
      column.scale.set(0.26, 5.2, 0.26);
      column.position.set(x, 0, z);
      frameGroup.add(column);
      return column;
    });

    const beams: THREE.Mesh[] = [];
    [-4, 0, 4].forEach((z) => {
      const beam = new THREE.Mesh(flatGeometry, accentMaterial);
      beam.scale.set(10.4, 0.22, 0.24);
      beam.position.set(0, 5.3, z);
      frameGroup.add(beam);
      beams.push(beam);
    });
    [-5, 0, 5].forEach((x) => {
      const beam = new THREE.Mesh(flatGeometry, accentMaterial);
      beam.scale.set(0.24, 0.22, 8.4);
      beam.position.set(x, 5.3, 0);
      frameGroup.add(beam);
      beams.push(beam);
    });

    // Phase 2: the shell that encloses the frame.
    const shellGroup = new THREE.Group();
    root.add(shellGroup);

    const makeWall = (scale: [number, number, number], position: [number, number, number]) => {
      const wall = new THREE.Mesh(frameGeometry, shellMaterial);
      wall.scale.set(scale[0], scale[1], scale[2]);
      wall.position.set(position[0], position[1], position[2]);
      shellGroup.add(wall);
      return wall;
    };

    const walls = [
      makeWall([10.6, 5.2, 0.22], [0, 0, -4.1]),
      makeWall([0.22, 5.2, 8.4], [-5.2, 0, 0]),
      makeWall([0.22, 5.2, 8.4], [5.2, 0, 0]),
      // Front wall stops short, leaving the opening the camera moves through.
      makeWall([3.1, 5.2, 0.22], [-3.7, 0, 4.1]),
    ];

    const roof = new THREE.Mesh(flatGeometry, shellMaterial);
    roof.scale.set(10.8, 0.2, 8.6);
    roof.position.y = 5.55;
    shellGroup.add(roof);

    // Phase 3: the interior.
    const interiorGroup = new THREE.Group();
    root.add(interiorGroup);

    const addInterior = (
      material: THREE.Material,
      scale: [number, number, number],
      position: [number, number, number],
    ) => {
      const mesh = new THREE.Mesh(flatGeometry, material);
      mesh.scale.set(scale[0], scale[1], scale[2]);
      mesh.position.set(position[0], position[1], position[2]);
      interiorGroup.add(mesh);
      return mesh;
    };

    addInterior(interiorMaterial, [10.4, 0.06, 8.2], [0, 0.05, 0]); // finished floor
    addInterior(softMaterial, [5.2, 0.04, 3.6], [-0.6, 0.1, 0.9]); // rug
    addInterior(interiorMaterial, [3.4, 0.72, 1.5], [-2.4, 0.4, -0.6]); // seating
    addInterior(softMaterial, [3.4, 0.5, 0.35], [-2.4, 0.95, -1.2]); // back cushions
    addInterior(interiorMaterial, [1.5, 0.1, 0.9], [-0.4, 0.45, 1.1]); // low table
    addInterior(interiorMaterial, [0.35, 2.6, 3.2], [2.9, 0.05, -1.4]); // joinery volume
    addInterior(interiorMaterial, [2.6, 0.08, 0.5], [2.4, 1.6, 1.6]); // shelf
    const pendant = addInterior(accentMaterial, [0.6, 0.12, 0.6], [-0.4, 3.4, 1.1]);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x14171d, 1.1);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(8, 12, 9);
    scene.add(key);
    // Neutral fill, not an accent-coloured one. Tinting the lights washes the floor
    // in blue and reads as a glow effect rather than as architecture.
    const coolRim = new THREE.DirectionalLight(0xc9d2e4, 0.42);
    coolRim.position.set(-9, 5, -7);
    scene.add(coolRim);
    // Warm interior light, only present once the space is finished.
    const warm = new THREE.PointLight(new THREE.Color('#ffb877'), 0, 26, 2);
    warm.position.set(-0.4, 3.2, 1.1);
    scene.add(warm);

    // Starts wide enough to hold the whole frame in shot, ends at eye level inside
    // the finished room.
    const cameraPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(19.5, 13, 22),
      new THREE.Vector3(15.5, 9.2, 17.5),
      new THREE.Vector3(10.5, 5.6, 13),
      new THREE.Vector3(5.6, 2.9, 9),
      new THREE.Vector3(2.6, 1.7, 6),
    ]);
    const lookStart = new THREE.Vector3(0, 2.2, 0);
    const lookEnd = new THREE.Vector3(-0.8, 1.35, -0.8);
    const lookAt = new THREE.Vector3();

    const resize = () => {
      const width = viewport.clientWidth || 1;
      const height = viewport.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = width < 720 ? 54 : 42;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(viewport);

    let activeCaption = -1;
    const setCaption = (index: number) => {
      if (index === activeCaption) return;
      activeCaption = index;
      captionRefs.current.forEach((node, i) => {
        if (node) node.classList.toggle('is-active', i === index);
      });
    };

    const applyProgress = (progress: number) => {
      const framePhase = clampRange(progress, 0, 0.34);
      const shellPhase = clampRange(progress, 0.3, 0.66);
      const interiorPhase = clampRange(progress, 0.62, 0.94);

      columns.forEach((column, index) => {
        const stagger = index / columns.length;
        column.scale.y = 5.2 * THREE.MathUtils.clamp((framePhase - stagger * 0.35) / 0.65, 0.001, 1);
      });
      beams.forEach((beam, index) => {
        const appear = clampRange(framePhase, 0.55 + (index % 3) * 0.06, 1);
        beam.visible = appear > 0.01;
        beam.position.y = 5.3 - (1 - appear) * 0.7;
      });

      walls.forEach((wall, index) => {
        const appear = clampRange(shellPhase, index * 0.12, 0.6 + index * 0.1);
        wall.scale.y = 5.2 * Math.max(appear, 0.001);
      });
      roof.visible = shellPhase > 0.55;
      roof.position.y = 5.55 + (1 - clampRange(shellPhase, 0.55, 1)) * 1.6;

      // The pendant uses the opaque accent material, so the whole interior group is
      // hidden until its phase begins rather than floating in the empty shell.
      interiorGroup.visible = interiorPhase > 0.01;
      interiorMaterial.opacity = interiorPhase;
      softMaterial.opacity = interiorPhase;
      pendant.position.y = 3.4 - (1 - interiorPhase) * 0.5;
      warm.intensity = interiorPhase * 34;
      coolRim.intensity = 0.42 * (1 - interiorPhase * 0.6);
      // The shell fades back once the interior arrives, so the room reads from inside.
      shellMaterial.opacity = shellPhase * 0.96 * (1 - interiorPhase * 0.45);

      camera.position.copy(cameraPath.getPoint(THREE.MathUtils.clamp(progress, 0, 1)));
      lookAt.lerpVectors(lookStart, lookEnd, THREE.MathUtils.smoothstep(progress, 0.35, 1));
      camera.lookAt(lookAt);

      if (progress < 0.34) setCaption(0);
      else if (progress < 0.66) setCaption(1);
      else setCaption(2);
    };

    if (reducedMotion) {
      applyProgress(1);
      renderer.render(scene, camera);
      captionRefs.current.forEach((node) => node?.classList.add('is-active'));

      return () => {
        resizeObserver.disconnect();
        renderer.dispose();
        disposables.forEach((item) => item.dispose());
        mount.removeChild(renderer.domElement);
      };
    }

    const progressRef = { current: 0, rendered: -1 };
    let visible = false;
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    visibility.observe(viewport);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrap,
        start: 'top top',
        end: 'bottom bottom',
        pin: viewport,
        pinSpacing: false,
        scrub: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });
    }, wrap);

    let frameId = 0;
    const render = () => {
      frameId = window.requestAnimationFrame(render);
      if (!visible) return;
      // Only redraw when the scroll position actually moved.
      if (Math.abs(progressRef.current - progressRef.rendered) < 0.0004) return;
      progressRef.rendered = progressRef.current;
      applyProgress(progressRef.current);
      renderer.render(scene, camera);
    };
    applyProgress(0);
    renderer.render(scene, camera);
    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      visibility.disconnect();
      resizeObserver.disconnect();
      ctx.revert();
      renderer.dispose();
      disposables.forEach((item) => item.dispose());
      mount.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  return (
    <div className="sequence" ref={wrapRef}>
      <div className="sequence__viewport" ref={viewportRef}>
        <div className="sequence__canvas" ref={mountRef} />
        <div className="sequence__captions">
          {phases.map((phase, index) => (
            <div
              className="sequence__caption"
              key={phase.label}
              ref={(node) => {
                captionRefs.current[index] = node;
              }}
            >
              <span className="sequence__label">{phase.label}</span>
              <h3>{phase.title}</h3>
              <p>{phase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
