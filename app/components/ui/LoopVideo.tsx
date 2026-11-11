import { useEffect, useRef } from "react";

type LoopVideoProps = { src: string; poster: string; label: string; className?: string };

// A silent looping clip. It downloads and plays only while on screen, and stays on its poster for reduced motion.
export function LoopVideo({ src, poster, label, className }: LoopVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.getAttribute("src")) video.src = src;
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [src]);

  return <video ref={ref} poster={poster} aria-label={label} muted loop playsInline preload="none" className={className} />;
}
