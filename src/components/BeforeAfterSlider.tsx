import { useEffect, useRef, useState } from 'react';

type BeforeAfterSliderProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel?: string;
  afterLabel?: string;
};

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  beforeLabel = 'Before',
  afterLabel = 'After',
}: BeforeAfterSliderProps) {
  const [value, setValue] = useState(58);
  const dragging = useRef(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      if (!dragging.current || !trackRef.current) return;
      const bounds = trackRef.current.getBoundingClientRect();
      const next = ((event.clientX - bounds.left) / bounds.width) * 100;
      setValue(Math.min(92, Math.max(8, next)));
    };

    const handleUp = () => {
      dragging.current = false;
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      className="before-after"
      onPointerDown={(event) => {
        dragging.current = true;
        const bounds = event.currentTarget.getBoundingClientRect();
        const next = ((event.clientX - bounds.left) / bounds.width) * 100;
        setValue(Math.min(92, Math.max(8, next)));
      }}
    >
      {/* The finished room is the base layer and the stripped shell is clipped over
          it from the left, so dragging right wipes the build away to reveal the
          result. Reversing these two puts "after" on the left, against the labels. */}
      <div className="before-after__layer">
        <img className="before-after__media" src={afterSrc} alt={afterAlt} loading="lazy" decoding="async" />
      </div>
      <div
        className="before-after__layer before-after__layer--before"
        style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
      >
        {/* Empty alt: the pair is already described by the base image's alt and the
            visible labels, so announcing it twice is noise. */}
        <img className="before-after__media" src={beforeSrc} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="before-after__legend">
        <span>{beforeLabel}</span>
        <span>{afterLabel}</span>
      </div>
      <div className="before-after__handle" style={{ left: `${value}%` }} aria-hidden="true">
        <span className="before-after__knob" />
      </div>
      <input
        aria-label={`Compare the room before and after. ${beforeAlt}`}
        className="before-after__range"
        max={100}
        min={0}
        type="range"
        value={value}
        onChange={(event) => setValue(Number(event.currentTarget.value))}
      />
    </div>
  );
}
