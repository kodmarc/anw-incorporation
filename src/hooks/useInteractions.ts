import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';

/**
 * Pointer-driven 3D tilt for media cards, and magnetic pull for primary buttons.
 *
 * Both write through gsap.quickTo, which mutates the DOM outside the React render
 * cycle. Continuous pointer values must never live in useState (skill section 3.B).
 */
export function useInteractions(rootRef: RefObject<HTMLElement>, enabled: boolean) {
  useLayoutEffect(() => {
    if (!enabled || !rootRef.current) return undefined;

    const root = rootRef.current;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!finePointer) return undefined;

    const cleanups: Array<() => void> = [];

    root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
      const rotateX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const rotateY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      const lift = gsap.quickTo(card, 'y', { duration: 0.6, ease: 'power3.out' });
      let bounds: DOMRect | null = null;

      const onEnter = () => {
        bounds = card.getBoundingClientRect();
        lift(-8);
      };
      const onMove = (event: PointerEvent) => {
        if (!bounds) bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        rotateY(x * 11);
        rotateX(-y * 9);
      };
      const onLeave = () => {
        bounds = null;
        rotateX(0);
        rotateY(0);
        lift(0);
      };

      card.addEventListener('pointerenter', onEnter);
      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
      cleanups.push(() => {
        card.removeEventListener('pointerenter', onEnter);
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerleave', onLeave);
        gsap.set(card, { rotationX: 0, rotationY: 0, y: 0 });
      });
    });

    root.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((button) => {
      const moveX = gsap.quickTo(button, 'x', { duration: 0.5, ease: 'power3.out' });
      const moveY = gsap.quickTo(button, 'y', { duration: 0.5, ease: 'power3.out' });
      let bounds: DOMRect | null = null;

      const onEnter = () => {
        bounds = button.getBoundingClientRect();
      };
      const onMove = (event: PointerEvent) => {
        if (!bounds) bounds = button.getBoundingClientRect();
        moveX((event.clientX - (bounds.left + bounds.width / 2)) * 0.22);
        moveY((event.clientY - (bounds.top + bounds.height / 2)) * 0.32);
      };
      const onLeave = () => {
        bounds = null;
        moveX(0);
        moveY(0);
      };

      button.addEventListener('pointerenter', onEnter);
      button.addEventListener('pointermove', onMove);
      button.addEventListener('pointerleave', onLeave);
      cleanups.push(() => {
        button.removeEventListener('pointerenter', onEnter);
        button.removeEventListener('pointermove', onMove);
        button.removeEventListener('pointerleave', onLeave);
        gsap.set(button, { x: 0, y: 0 });
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [enabled, rootRef]);
}
