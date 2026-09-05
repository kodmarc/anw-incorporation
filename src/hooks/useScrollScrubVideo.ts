import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type ScrubOptions = {
  wrapRef: RefObject<HTMLElement>;
  pinRef: RefObject<HTMLElement>;
  videoRef: RefObject<HTMLVideoElement>;
  copyRef: RefObject<HTMLElement>;
  enabled: boolean;
};

/**
 * Ties a video's playhead to scroll position: the hero pins, the film advances as
 * the page is scrolled, and once it reaches the end the pin releases and the page
 * carries on to the next section.
 *
 * Smoothness comes from three rules, all of which matter:
 *
 *  1. Never issue a seek while one is still in flight. A decoder handed a new
 *     currentTime on every frame queues work it cannot retire, and the picture
 *     freezes and then jumps. Seeks are paced by the "seeked" event instead, so
 *     the video advances exactly as fast as the decoder can actually go.
 *  2. Never seek into an unbuffered range. That turns a local decode into a
 *     network round trip and stalls the hero. Targets are clamped to buffered data.
 *  3. Ease the playhead toward the scroll target rather than snapping to it, so
 *     the motion reads as film rather than as discrete steps.
 */
export function useScrollScrubVideo({ wrapRef, pinRef, videoRef, copyRef, enabled }: ScrubOptions) {
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const pin = pinRef.current;
    const video = videoRef.current;
    if (!enabled || !wrap || !pin || !video) return undefined;

    // Scrubbed, never played.
    video.pause();
    video.removeAttribute('autoplay');

    let frameId = 0;
    let target = 0;
    let eased = 0;
    let seekPending = false;
    let ctx: gsap.Context | null = null;

    const onSeeked = () => {
      seekPending = false;
    };
    video.addEventListener('seeked', onSeeked);

    /** Latest playable time at or before `time`, so we never seek into a hole. */
    const clampToBuffered = (time: number) => {
      const ranges = video.buffered;
      for (let i = 0; i < ranges.length; i += 1) {
        if (time >= ranges.start(i) && time <= ranges.end(i)) return time;
      }
      // Not buffered yet: hold at the end of the first range rather than stalling.
      return ranges.length ? Math.min(time, ranges.end(0)) : null;
    };

    const start = () => {
      const duration = video.duration;
      if (!duration || Number.isNaN(duration) || !Number.isFinite(duration)) return;

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: wrap,
          start: 'top top',
          end: 'bottom bottom',
          pin,
          pinSpacing: false,
          scrub: true,
          onUpdate: (self) => {
            target = self.progress * duration;
          },
        });

        // The copy holds through the opening, then clears so the closing frames
        // are seen on their own before the next section arrives.
        if (copyRef.current) {
          gsap.to(copyRef.current, {
            opacity: 0,
            y: -24,
            ease: 'none',
            scrollTrigger: { trigger: wrap, start: '45% top', end: '88% top', scrub: true },
          });
        }
      }, wrap);

      const tick = () => {
        frameId = window.requestAnimationFrame(tick);

        const distance = target - eased;
        // Close enough: park exactly on target so the last frame is not left short.
        eased = Math.abs(distance) < 0.004 ? target : eased + distance * 0.24;

        if (seekPending || video.seeking || video.readyState < 2) return;
        if (Math.abs(eased - video.currentTime) < 0.02) return;

        const playable = clampToBuffered(eased);
        if (playable === null) return;

        seekPending = true;
        video.currentTime = playable;
      };
      tick();

      ScrollTrigger.refresh();
    };

    if (video.readyState >= 1) {
      start();
    } else {
      video.addEventListener('loadedmetadata', start, { once: true });
    }

    return () => {
      video.removeEventListener('loadedmetadata', start);
      video.removeEventListener('seeked', onSeeked);
      window.cancelAnimationFrame(frameId);
      ctx?.revert();
      if (copyRef.current) gsap.set(copyRef.current, { opacity: 1, y: 0 });
    };
  }, [enabled, wrapRef, pinRef, videoRef, copyRef]);
}
