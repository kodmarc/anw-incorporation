import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

type StructureFrameProps = {
  reducedMotion: boolean;
  className?: string;
};

/**
 * Hero WebGL scene: a post-and-beam structural frame that assembles itself on load.
 *
 * Motion justification (skill section 5, "motion must be motivated"): the studio's
 * pitch is that it builds the structure and designs the interior. The hero shows the
 * structure being built. It is the argument, not decoration.
 *
 * Isolated leaf component. GSAP drives the assembly, a single RAF loop drives the
 * drift and pointer parallax, and nothing here touches React state per frame
 * (skill section 3.B).
 */
export function StructureFrame({ reducedMotion, className }: StructureFrameProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const readToken = (name: string, fallback: string) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return value || fallback;
    };

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
    camera.position.set(11.5, 6.4, 13.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth || 1, mount.clientHeight || 1, false);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    mount.appendChild(renderer.domElement);

    const beamColor = new THREE.Color(readToken('--scene-beam', '#8d94a3'));
    const accentColor = new THREE.Color(readToken('--scene-accent', '#4d7cff'));
    const plateColor = new THREE.Color(readToken('--scene-plate', '#5b6270'));

    const beamMaterial = new THREE.MeshStandardMaterial({ color: beamColor, metalness: 0.4, roughness: 0.55 });
    const accentMaterial = new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.25, roughness: 0.4 });
    const plateMaterial = new THREE.MeshStandardMaterial({ color: plateColor, metalness: 0.15, roughness: 0.8 });

    const frame = new THREE.Group();
    scene.add(frame);

    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    const members: THREE.Mesh[] = [];

    const addMember = (
      material: THREE.Material,
      size: [number, number, number],
      position: [number, number, number],
      growAxis: 'x' | 'y' | 'z',
    ) => {
      const mesh = new THREE.Mesh(unitBox, material);
      mesh.scale.set(size[0], size[1], size[2]);
      mesh.position.set(position[0], position[1], position[2]);
      mesh.userData.finalScale = new THREE.Vector3(size[0], size[1], size[2]);
      mesh.userData.growAxis = growAxis;
      frame.add(mesh);
      members.push(mesh);
      return mesh;
    };

    const columnXs = [-4.4, 0, 4.4];
    const columnZs = [-3.6, 0, 3.6];
    const columnHeight = 5.4;
    const post = 0.24;

    // Ground plate.
    addMember(plateMaterial, [10.4, 0.14, 8.8], [0, -0.07, 0], 'y');

    // Columns. The centre position stays open so the volume reads as a room.
    columnXs.forEach((x) => {
      columnZs.forEach((z) => {
        if (x === 0 && z === 0) return;
        addMember(beamMaterial, [post, columnHeight, post], [x, columnHeight / 2, z], 'y');
      });
    });

    // Beams running along x at two levels, accent on the upper ring.
    [2.8, columnHeight].forEach((y, level) => {
      const material = level === 1 ? accentMaterial : beamMaterial;
      columnZs.forEach((z) => {
        addMember(material, [9.6, 0.2, post], [0, y, z], 'x');
      });
      columnXs.forEach((x) => {
        addMember(material, [post, 0.2, 8.0], [x, y, 0], 'z');
      });
    });

    // Mezzanine plate over one bay.
    addMember(plateMaterial, [4.2, 0.1, 7.9], [2.6, 2.92, 0], 'x');

    // Roof joists.
    for (let i = 0; i < 7; i += 1) {
      const x = -3.9 + i * 1.3;
      addMember(beamMaterial, [0.12, 0.14, 7.9], [x, columnHeight + 0.24, 0], 'z');
    }

    // Single diagonal brace, the one member that breaks the orthogonal grid.
    const brace = addMember(accentMaterial, [0.16, 5.9, 0.16], [-4.4, 2.7, -1.8], 'y');
    brace.rotation.x = Math.PI / 7;

    // Blueprint edge pass over the whole frame.
    const edgeGroup = new THREE.Group();
    members.forEach((mesh) => {
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(unitBox),
        new THREE.LineBasicMaterial({ color: accentColor, transparent: true, opacity: 0.22 }),
      );
      edges.scale.copy(mesh.scale);
      edges.position.copy(mesh.position);
      edges.rotation.copy(mesh.rotation);
      edges.userData.source = mesh;
      edgeGroup.add(edges);
    });
    frame.add(edgeGroup);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x20242c, 1.5);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
    key.position.set(6, 10, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight(accentColor, 0.7);
    rim.position.set(-8, 4, -6);
    scene.add(rim);

    frame.position.y = -2.3;
    frame.rotation.y = -0.35;

    // Base camera position, re-derived on resize. The render loop offsets from this
    // rather than from a hard-coded height, so the mobile pull-back is preserved.
    const basePosition = camera.position.clone();

    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      // Pull the camera back on narrow viewports so the frame never crops.
      basePosition.copy(camera.position).setLength(width < 720 ? 25 : 19);
      camera.position.copy(basePosition);
      camera.lookAt(0, 0.4, 0);
      camera.updateProjectionMatrix();
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const syncEdges = () => {
      edgeGroup.children.forEach((edge) => {
        const source = (edge as THREE.LineSegments).userData.source as THREE.Mesh;
        edge.scale.copy(source.scale);
      });
    };

    let frameId = 0;
    let timeline: gsap.core.Timeline | null = null;
    const pointer = { x: 0, y: 0 };
    const smoothed = { x: 0, y: 0 };

    if (reducedMotion) {
      syncEdges();
      renderer.render(scene, camera);
    } else {
      // Assemble from the ground up.
      const ordered = [...members].sort((a, b) => a.position.y - b.position.y);
      ordered.forEach((mesh) => {
        const axis = mesh.userData.growAxis as 'x' | 'y' | 'z';
        mesh.scale[axis] = 0.001;
      });

      timeline = gsap.timeline({ delay: 0.15 });
      ordered.forEach((mesh, index) => {
        const axis = mesh.userData.growAxis as 'x' | 'y' | 'z';
        const target = (mesh.userData.finalScale as THREE.Vector3)[axis];
        timeline!.to(
          mesh.scale,
          { [axis]: target, duration: 0.85, ease: 'power3.out' },
          index * 0.028,
        );
      });

      const handlePointer = (event: PointerEvent) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener('pointermove', handlePointer, { passive: true });

      let visible = true;
      const visibility = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
        },
        { threshold: 0 },
      );
      visibility.observe(mount);

      const clock = new THREE.Clock();
      const render = () => {
        frameId = window.requestAnimationFrame(render);
        if (!visible) return;

        const elapsed = clock.getElapsedTime();
        smoothed.x += (pointer.x - smoothed.x) * 0.045;
        smoothed.y += (pointer.y - smoothed.y) * 0.045;

        frame.rotation.y = -0.35 + Math.sin(elapsed * 0.12) * 0.08 + smoothed.x * 0.22;
        frame.rotation.x = smoothed.y * 0.06;
        camera.position.y = basePosition.y - smoothed.y * 1.2;
        camera.lookAt(0, 0.4, 0);

        syncEdges();
        renderer.render(scene, camera);
      };
      render();

      return () => {
        window.removeEventListener('pointermove', handlePointer);
        visibility.disconnect();
        resizeObserver.disconnect();
        window.cancelAnimationFrame(frameId);
        timeline?.kill();
        renderer.dispose();
        unitBox.dispose();
        edgeGroup.children.forEach((edge) => {
          const line = edge as THREE.LineSegments;
          line.geometry.dispose();
          (line.material as THREE.Material).dispose();
        });
        [beamMaterial, accentMaterial, plateMaterial].forEach((material) => material.dispose());
        mount.removeChild(renderer.domElement);
      };
    }

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frameId);
      renderer.dispose();
      unitBox.dispose();
      edgeGroup.children.forEach((edge) => {
        const line = edge as THREE.LineSegments;
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
      [beamMaterial, accentMaterial, plateMaterial].forEach((material) => material.dispose());
      mount.removeChild(renderer.domElement);
    };
  }, [reducedMotion]);

  return <div className={className} ref={mountRef} aria-hidden="true" />;
}
