import { useEffect, useRef, useState } from 'react';
import { PlayIcon } from '@phosphor-icons/react';
import type { ClientVideo } from '../types';

type Props = {
  video: ClientVideo;
  label: string;
  /** False under reduced motion, where nothing should start moving on its own. */
  autoPlay: boolean;
};

/**
 * A YouTube video that starts muted once it scrolls into view.
 *
 * It deliberately does not load on page load. Four embeds mounted upfront pull
 * roughly a megabyte of player code each plus their video streams, which is more
 * than the rest of the page combined. Waiting for the card to actually reach the
 * viewport keeps the autoplay the client asked for without paying for it on every
 * visit, including from people who never scroll this far.
 */
export function YouTubeEmbed({ video, label, autoPlay }: Props) {
  // idle -> nothing loaded. auto -> started by scrolling, muted. manual -> clicked, with sound.
  const [mode, setMode] = useState<'idle' | 'auto' | 'manual'>('idle');
  const holderRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [thumb, setThumb] = useState(`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`);

  useEffect(() => {
    if (!autoPlay || mode !== 'idle') return undefined;
    const node = holderRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMode('auto');
          observer.disconnect();
        }
      },
      { rootMargin: '120px 0px', threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [autoPlay, mode]);

  // Restarts the clip when it finishes. If the handshake is ever ignored the video
  // simply plays once instead of looping, which is a safe way to fail.
  useEffect(() => {
    const frame = frameRef.current;
    if (mode === 'idle' || !frame) return undefined;

    const send = (body: Record<string, unknown>) =>
      frame.contentWindow?.postMessage(JSON.stringify(body), 'https://www.youtube.com');

    const onLoad = () => send({ event: 'listening', id: video.youtubeId });
    frame.addEventListener('load', onLoad);

    const onMessage = (event: MessageEvent) => {
      if (!event.origin.includes('youtube.com') || event.source !== frame.contentWindow) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        // info 0 is the "ended" player state.
        if (data?.event === 'onStateChange' && data.info === 0) {
          send({ event: 'command', func: 'playVideo', args: [] });
        }
      } catch {
        // Not a player message we care about.
      }
    };
    window.addEventListener('message', onMessage);

    return () => {
      frame.removeEventListener('load', onLoad);
      window.removeEventListener('message', onMessage);
    };
  }, [mode, video.youtubeId]);

  if (mode !== 'idle') {
    const muted = mode === 'auto' ? 1 : 0;
    // Deliberately no loop/playlist parameters. Looping a single video requires
    // passing it as its own playlist, and that playlist lookup fails for unlisted
    // videos, which makes the player report "video unavailable". The replay is
    // handled through the player API below instead.
    const params = new URLSearchParams({
      autoplay: '1',
      mute: String(muted),
      playsinline: '1',
      // Everything below strips the player furniture: no control bar, no keyboard
      // handling, no fullscreen button, no annotations, no suggested videos from
      // other channels. The title, channel name and share button only surface on
      // hover, which the CSS blocks by making the frame non-interactive.
      controls: '0',
      disablekb: '1',
      fs: '0',
      iv_load_policy: '3',
      rel: '0',
      modestbranding: '1',
      enablejsapi: '1',
    });
    return (
      <div className="client-video is-playing" ref={holderRef}>
        <iframe
          ref={frameRef}
          // The standard host, not youtube-nocookie.com: the privacy-enhanced domain
          // refuses unlisted videos and renders "video unavailable" instead.
          src={`https://www.youtube.com/embed/${video.youtubeId}?${params.toString()}`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="client-video" ref={holderRef}>
      <button type="button" onClick={() => setMode('manual')} aria-label={`Play: ${label}`}>
        <img
          src={thumb}
          alt=""
          loading="lazy"
          // Shorts do not always publish a maxres still; fall back rather than gap.
          onError={() => setThumb(`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`)}
        />
        <span className="client-video__scrim" />
        <span className="client-video__play">
          <PlayIcon weight="fill" size={24} />
        </span>
      </button>
    </div>
  );
}
