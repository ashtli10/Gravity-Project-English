import { useEffect, useCallback, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { slides } from "./slides";

export default function PresenterView() {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("key") ?? "";
  const [authorized, setAuthorized] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const lastTriggeredSlide = useRef(-1);

  const session = useQuery(api.sessions.getCurrent);
  const createSession = useMutation(api.sessions.create);
  const advance = useMutation(api.sessions.advanceSlide);
  const goBack = useMutation(api.sessions.previousSlide);
  const triggerEvent = useMutation(api.sessions.triggerEvent);

  useEffect(() => {
    if (key === "gravity2026") {
      setAuthorized(true);
      createSession({ presenterKey: key });
    }
  }, [key]);

  const handleNav = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!session || !authorized || transitioning) return;
      e.preventDefault();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const half = window.innerWidth / 2;

      setTransitioning(true);
      setTimeout(() => setTransitioning(false), 400);

      if (clientX > half) {
        if (session.slideIndex < slides.length - 1) {
          advance({ sessionId: session._id, presenterKey: key });
        }
      } else {
        goBack({ sessionId: session._id, presenterKey: key });
      }
    },
    [session, authorized, key, transitioning]
  );

  // Auto-trigger student events
  useEffect(() => {
    if (!session || !authorized) return;
    const slide = slides[session.slideIndex];
    if (slide?.studentEvent && session.slideIndex !== lastTriggeredSlide.current) {
      lastTriggeredSlide.current = session.slideIndex;
      triggerEvent({
        sessionId: session._id,
        presenterKey: key,
        eventType: slide.studentEvent as any,
      });
    }
  }, [session?.slideIndex]);

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

  const currentSlide = slides[session.slideIndex];
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
      <div key={session.slideIndex} style={{ animation: "fade-in 0.4s ease forwards" }}>
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
        {session.slideIndex + 1} / {slides.length}
      </div>
    </div>
  );
}
