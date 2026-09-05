import { useEffect, useRef, useState, type VideoHTMLAttributes } from 'react';

type LazyVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  eager?: boolean;
};

export function LazyVideo({ src, className, eager = false, ...rest }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);

  useEffect(() => {
    if (eager || shouldLoad) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '220px 0px' },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [eager, shouldLoad]);

  useEffect(() => {
    if (ref.current && shouldLoad) {
      ref.current.load();
      if (rest.autoPlay !== false) {
        void ref.current.play().catch(() => undefined);
      }
    }
  }, [rest.autoPlay, shouldLoad]);

  const shouldAutoPlay = rest.autoPlay !== false;

  return (
    <video
      ref={ref}
      className={className}
      src={shouldLoad ? src : undefined}
      preload={shouldLoad ? 'auto' : 'none'}
      autoPlay={shouldAutoPlay}
      {...rest}
    />
  );
}