'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyVideoProps {
  src: string;
  poster: string;
  className?: string;
}

/**
 * Muted background video that shows its poster immediately and only starts
 * downloading once the page has finished loading and the video is on screen,
 * so it never competes with the page's own content.
 */
export function LazyVideo({ src, poster, className }: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let observer: IntersectionObserver | undefined;
    const observe = () => {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setActive(true);
            observer?.disconnect();
          }
        },
        { rootMargin: '200px' }
      );
      observer.observe(video);
    };

    if (document.readyState === 'complete') observe();
    else window.addEventListener('load', observe, { once: true });

    return () => {
      window.removeEventListener('load', observe);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (active) videoRef.current?.play().catch(() => {});
  }, [active]);

  return (
    <video
      ref={videoRef}
      src={active ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      className={className}
    />
  );
}
