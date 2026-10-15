import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Compass,
  Gauge,
  X,
} from "lucide-react";

import "../styles/final-polish.css";

const TOUR = [
  {
    to: "/",
    title: "Premium first impression",
    tag: "01 / THE EXPERIENCE",
    description:
      "Start with the cinematic automotive homepage, editorial storytelling, and the full service collection.",
  },
  {
    to: "/services",
    title: "Explore the services",
    tag: "02 / SERVICE CATALOG",
    description:
      "Search and filter six automotive service concepts, then inspect their individual detail pages.",
  },
  {
    to: "/compare",
    title: "Compare with clarity",
    tag: "03 / COMPARISON",
    description:
      "Compare up to three services and transfer the combination into the interactive estimator.",
  },
  {
    to: "/estimate",
    title: "Build an estimate",
    tag: "04 / LIVE ESTIMATOR",
    description:
      "Change vehicle categories and selected services to see illustrative Philippine peso totals update.",
  },
  {
    to: "/schedule",
    title: "Plan a preferred visit",
    tag: "05 / CALENDAR",
    description:
      "Choose a sample service date and time, then continue to the browser-local appointment planner.",
  },
  {
    to: "/garage",
    title: "Meet My Garage",
    tag: "06 / VEHICLE PROFILES",
    description:
      "Save fictional vehicle profiles and connect them to planning requests and maintenance records.",
  },
  {
    to: "/maintenance",
    title: "Follow the maintenance journal",
    tag: "07 / VEHICLE EXPERIENCE",
    description:
      "Enter demo mileage and sample service records, with clearly illustrative reminder intervals.",
  },
  {
    to: "/workshop",
    title: "Explore workshop operations",
    tag: "08 / COMMAND CENTER",
    description:
      "View the simulated service desk, technician planning, service bays, reports, and analytics.",
  },
  {
    to: "/workshop/reports",
    title: "See the business intelligence",
    tag: "09 / REPORTS",
    description:
      "Review sample request trends and browse data management tools without any real customer data.",
  },
];

const REVEAL_SELECTORS = [
  ".yd-service-card",
  ".yd-workflow-card",
  ".yd-editorial-copy",
  ".yd-estimate-banner-inner > div",
  ".yd-faq details",
  ".yd2-maintenance-card",
  ".yd2-compare-card",
  ".yd2-history-metrics article",
  ".yd3-kpis article",
  ".yd3-panel",
  ".ydi-metric",
  ".ydi-panel",
].join(", ");

function prefersReducedMotion() {
  return (
    window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches === true
  );
}

export default function FinalExperience() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const closeRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [canGoUp, setCanGoUp] = useState(false);

  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // SCROLL PROGRESS AND BACK-TO-TOP VISIBILITY
  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;

      const scrollable = Math.max(
        0,
        document.documentElement.scrollHeight -
          window.innerHeight
      );

      const percent = scrollable
        ? Math.min(
            100,
            Math.max(
              0,
              (window.scrollY / scrollable) * 100
            )
          )
        : 0;

      setProgress(percent);
      setCanGoUp(window.scrollY > 550);
    }

    function onScroll() {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    }

    update();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  // SCROLL-REVEAL EFFECTS
  useEffect(() => {
    if (
      prefersReducedMotion() ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("yd5-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px -25px 0px",
      }
    );

    for (const [index, element] of [
      ...document.querySelectorAll(REVEAL_SELECTORS),
    ].entries()) {
      element.classList.add("yd5-reveal");

      element.style.setProperty(
        "--yd5-delay",
        `${Math.min(index % 4, 3) * 60}ms`
      );

      if (
        element.getBoundingClientRect().top <=
        window.innerHeight * 0.92
      ) {
        element.classList.add("yd5-visible");
      } else {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [pathname]);

  // KEYBOARD ESCAPE CLOSE
  useEffect(() => {
    if (!tourOpen) return;

    closeRef.current?.focus();

    function onKey(event) {
      if (event.key === "Escape") {
        setTourOpen(false);
      }
    }

    window.addEventListener("keydown", onKey);

    return () =>
      window.removeEventListener("keydown", onKey);
  }, [tourOpen]);

  function openTour() {
    const index = TOUR.findIndex(
      (step) => step.to === pathname
    );

    setTourStep(index >= 0 ? index : 0);
    setTourOpen(true);
  }

  function goToStep(index) {
    if (index >= TOUR.length) {
      setTourOpen(false);
      return;
    }

    const safeIndex = Math.max(0, index);

    setTourStep(safeIndex);
    navigate(TOUR[safeIndex].to);
  }

  function goToTop() {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion()
        ? "auto"
        : "smooth",
    });
  }

  function skipToContent() {
    const target =
      document.getElementById("main-content");

    if (!target) return;

    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: false });
  }

  const current = TOUR[tourStep];

  return (
    <>
      <button
        className="yd5-skip"
        type="button"
        onClick={skipToContent}
      >
        Skip to main content
      </button>

      <div
        className="yd5-reading-progress"
        aria-hidden="true"
      >
        <span
          style={{
            transform: `scaleX(${progress / 100})`,
          }}
        />
      </div>

      <button
        className="yd5-tour-launch"
        type="button"
        onClick={openTour}
        aria-expanded={tourOpen}
        aria-controls="yd5-guided-tour"
      >
        <Compass size={19} />
        <span>Explore Demo</span>
      </button>

      {tourOpen && (
        <section
          className="yd5-tour"
          id="yd5-guided-tour"
          aria-label="Guided portfolio tour"
        >
          <div className="yd5-tour-top">
            <div className="yd5-tour-mark">
              <Gauge size={22} />
            </div>

            <div>
              <strong>YOUR DRIVE.</strong>
              <small>GUIDED PORTFOLIO TOUR</small>
            </div>

            <button
              ref={closeRef}
              type="button"
              className="yd5-tour-close"
              onClick={() => setTourOpen(false)}
              aria-label="Close guided tour"
            >
              <X size={19} />
            </button>
          </div>

          <div
            className="yd5-tour-body"
            aria-live="polite"
          >
            <div className="yd5-tour-meta">
              <span>{current.tag}</span>

              <span>
                {String(tourStep + 1).padStart(2, "0")}
                {" / "}
                {String(TOUR.length).padStart(2, "0")}
              </span>
            </div>

            <h2>
              {current.title}<em>.</em>
            </h2>

            <p>{current.description}</p>

            <div
              className="yd5-tour-steps"
              aria-label="Tour progress"
            >
              {TOUR.map((step, index) => (
                <button
                  key={step.to}
                  type="button"
                  title={step.title}
                  aria-label={`Go to step ${index + 1}: ${step.title}`}
                  aria-current={
                    index === tourStep
                      ? "step"
                      : undefined
                  }
                  className={
                    index === tourStep
                      ? "is-current"
                      : ""
                  }
                  onClick={() => goToStep(index)}
                />
              ))}
            </div>

            <div className="yd5-tour-controls">
              <button
                type="button"
                className="yd5-tour-back"
                disabled={tourStep === 0}
                onClick={() =>
                  goToStep(tourStep - 1)
                }
              >
                <ArrowLeft size={17} />
                Back
              </button>

              <button
                type="button"
                className="yd5-tour-next"
                onClick={() =>
                  goToStep(tourStep + 1)
                }
              >
                {tourStep === TOUR.length - 1 ? (
                  <>
                    Finish
                    <Check size={18} />
                  </>
                ) : (
                  <>
                    Next page
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="yd5-tour-footnote">
            Portfolio simulation. No real workshop
            bookings or repair data.
          </p>
        </section>
      )}

      {canGoUp && (
        <button
          type="button"
          className="yd5-back-to-top"
          aria-label="Back to top"
          onClick={goToTop}
        >
          <ArrowUp size={21} />
        </button>
      )}
    </>
  );
}