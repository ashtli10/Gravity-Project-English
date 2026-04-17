import { useEffect, useCallback, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { slides } from "./slides";

export default function PresenterView() {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key") ?? "";
  const [authorized, setAuthorized] = useState(false);

  const session = useQuery(api.sessions.getCurrent);
  const createSession = useMutation(api.sessions.create);
  const advance = useMutation(api.sessions.advanceSlide);
  const goBack = useMutation(api.sessions.previousSlide);

  // Optimistic local slide index — instant navigation, server catches up
  const [localIndex, setLocalIndex] = useState<number | null>(null);
  const slideIndex = localIndex ?? session?.slideIndex ?? 0;

  // Sync: clear optimistic state once server confirms
  useEffect(() => {
    if (session && localIndex !== null && session.slideIndex === localIndex) {
      setLocalIndex(null);
    }
  }, [session?.slideIndex, localIndex]);

  // Also sync if server is ahead (e.g. another presenter tab)
  useEffect(() => {
    if (session && localIndex !== null && session.slideIndex !== localIndex) {
      // Give server 2s to catch up, then trust it
      const t = setTimeout(() => setLocalIndex(null), 2000);
      return () => clearTimeout(t);
    }
  }, [session?.slideIndex, localIndex]);

  const navLock = useRef(false);

  useEffect(() => {
    if (key === "gravity2026") {
      setAuthorized(true);
      createSession({ presenterKey: key });
    }
  }, [key]);

  const handleNav = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!session || !authorized || navLock.current) return;
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const half = window.innerWidth / 2;

      // Brief lock to prevent double-tap (150ms, not 400ms)
      navLock.current = true;
      setTimeout(() => { navLock.current = false; }, 150);

      if (clientX > half) {
        if (slideIndex < slides.length - 1) {
          const nextIdx = slideIndex + 1;
          const nextSlide = slides[nextIdx];
          setLocalIndex(nextIdx); // Instant
          advance({
            sessionId: session._id,
            presenterKey: key,
            studentEvent: nextSlide?.studentEvent,
          });
        }
      } else {
        if (slideIndex > 0) {
          const prevIdx = slideIndex - 1;
          const prevSlide = slides[prevIdx];
          setLocalIndex(prevIdx); // Instant
          goBack({
            sessionId: session._id,
            presenterKey: key,
            studentEvent: prevSlide?.studentEvent,
          });
        }
      }
    },
    [session, authorized, key, slideIndex]
  );

  if (!authorized) {
    return (
      <div style={{
        width: "100vw", height: "100vh",
        display: "flex", justifyContent: "center", alignItems: "center",
        background: "#0a0a0f", color: "#ff2d7b",
        fontSize: "1.5rem", fontFamily: "var(--font-display)",
      }}>
        Access denied. Add ?key=gravity2026 to the URL.
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{
        width: "100vw", height: "100vh",
        display: "flex", justifyContent: "center", alignItems: "center",
        background: "#0a0a0f", color: "#00e5ff",
        fontSize: "1.2rem",
      }}>
        Loading...
      </div>
    );
  }

  const currentSlide = slides[slideIndex];
  if (!currentSlide) {
    return (
      <div style={{
        width: "100vw", height: "100vh",
        display: "flex", justifyContent: "center", alignItems: "center",
        background: "#0a0a0f", color: "#e0e0e8",
        fontSize: "2rem",
      }}>
        End of presentation
      </div>
    );
  }

  const SlideComponent = currentSlide.component;

  return (
    <div
      onClick={handleNav}
      onTouchStart={handleNav}
      style={{ width: "100vw", height: "100vh", cursor: "pointer", position: "relative", overflow: "hidden" }}
    >
      <div key={slideIndex} style={{ animation: "fade-in 0.25s ease forwards" }}>
        <SlideComponent active={true} />
      </div>

      {/* Slide counter */}
      <div style={{
        position: "fixed",
        bottom: "1rem",
        right: "1.5rem",
        fontSize: "0.85rem",
        color: "rgba(255,255,255,0.25)",
        fontFamily: "var(--font-mono)",
        zIndex: 100,
        pointerEvents: "none",
      }}>
        {slideIndex + 1} / {slides.length}
      </div>
    </div>
  );
}
