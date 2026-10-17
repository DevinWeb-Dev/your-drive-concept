
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ScanLine,
  Gauge,
  CalendarCheck,
  Wrench
} from "lucide-react";
import {
  IMAGES,
  SERVICES,
  formatPeso
} from "../../data/autoData.js";

const chapters = [
  {
    title: "01 / INSPECT",
    name: "Diagnostic intelligence",
    body: "Explore symptoms, vehicle systems and suggested inspection pathways.",
    to: "/diagnostics",
    icon: ScanLine
  },
  {
    title: "02 / CONFIGURE",
    name: "Transparent estimates",
    body: "Build an illustrative PHP estimate using the existing service catalog.",
    to: "/estimate",
    icon: Gauge
  },
  {
    title: "03 / SCHEDULE",
    name: "Thoughtful service planning",
    body: "Choose a preferred visit and explore the appointment planning experience.",
    to: "/schedule",
    icon: CalendarCheck
  },
  {
    title: "04 / CARE",
    name: "Connected ownership",
    body: "Manage sample vehicle history and maintenance in My Garage.",
    to: "/garage",
    icon: Wrench
  }
];

const picks = [
  "preventive-maintenance",
  "computer-diagnostics",
  "premium-detailing"
];

export default function PrecisionHome() {
  const [active, setActive] = useState(0);
  const selected = chapters[active];
  const SelectedIcon = selected.icon;

  return (
    <main className="ydv-home">
      <section className="ydv-hero">
        <img
          src={IMAGES.hero}
          className="ydv-hero-image"
          alt="Premium automotive visual"
        />
        <div className="ydv-hero-shade" />
        <div className="ydv-grid" />

        <div className="ydv-hero-content">
          <div className="ydv-overline">
            <span className="ydv-beacon" />
            YOUR DRIVE / PRECISION AUTOMOTIVE / V2.0
          </div>

          <h1>
            DRIVE
            <span>BEYOND</span>
            <em>ORDINARY.</em>
          </h1>

          <p>
            Architectural automotive care: technical
            diagnostics, engineered maintenance,
            refined detailing and a smarter journey
            from concern to confidence.
          </p>

          <div className="ydv-actions">
            <Link
              className="ydv-btn ydv-btn-hot"
              to="/diagnostics"
            >
              ENTER THE DIAGNOSTIC LAB
              <ArrowUpRight size={19} />
            </Link>

            <Link
              className="ydv-btn ydv-btn-line"
              to="/services"
            >
              EXPLORE SERVICES
              <ArrowRight size={19} />
            </Link>
          </div>

          <div className="ydv-hero-meta">
            <span>01 / THE FUTURE OF AUTO CARE</span>
            <span>CONCEPT EXPERIENCE / NO LIVE SENSORS</span>
          </div>
        </div>

        <div className="ydv-orbit" aria-hidden="true">
          <div />
        </div>
      </section>

      <div className="ydv-marquee" aria-hidden="true">
        <div>
          PRECISION DIAGNOSTICS ✳ ENGINEERED MAINTENANCE
          ✳ CAR CARE INTELLIGENCE ✳ WORKSHOP ARCHITECTURE
          ✳ PRECISION DIAGNOSTICS ✳ ENGINEERED MAINTENANCE
          ✳ CAR CARE INTELLIGENCE ✳ WORKSHOP ARCHITECTURE ✳
        </div>
      </div>

      <section className="ydv-section ydv-manifesto">
        <div className="ydv-kicker">
          01 / MANIFESTO
        </div>

        <div>
          <h2>
            NOT JUST REPAIR.
            <br />
            <em>RETHINK THE DRIVE.</em>
          </h2>
          <p>
            Your car deserves more than a guess.
            This automotive service concept puts
            visibility, process and intelligent
            choices at the center of every journey.
          </p>
        </div>

        <div className="ydv-stamp">
          YD
          <span>PRECISION BY DESIGN</span>
        </div>
      </section>

      <section className="ydv-section">
        <div className="ydv-section-head">
          <div>
            <div className="ydv-kicker">
              02 / OUR DISCIPLINES
            </div>

            <h2>
              ENGINEERED FOR
              <br />
              <em>EVERY MILE.</em>
            </h2>
          </div>

          <p>
            From computer diagnostics to preventive
            maintenance and finish restoration.
          </p>
        </div>

        <div className="ydv-service-grid">
          {picks.map((id, i) => {
            const service = SERVICES.find(
              (item) => item.id === id
            );

            const images = [
              IMAGES.garage,
              IMAGES.precision,
              IMAGES.sport
            ];

            return (
              <Link
                to={"/services/" + id}
                className={"ydv-service ydv-service-" + i}
                key={id}
              >
                <img
                  src={images[i]}
                  alt={service?.name || id}
                  loading="lazy"
                />

                <div className="ydv-service-shade" />

                <span>
                  0{i + 1} / {service?.category || "SERVICE"}
                </span>

                <div>
                  <h3>
                    {service?.name || id.replaceAll("-", " ")}
                  </h3>

                  <p>
                    FROM {formatPeso(service?.basePrice || 0)}
                    {" / ILLUSTRATIVE"}
                  </p>

                  <b>
                    EXPLORE SERVICE
                    <ArrowUpRight size={19} />
                  </b>
                </div>
              </Link>
            );
          })}
        </div>

        <Link className="ydv-textlink" to="/services">
          VIEW ALL AUTOMOTIVE SERVICES
          <ArrowUpRight size={18} />
        </Link>
      </section>

      <section className="ydv-diagnostic-promo">
        <div className="ydv-section ydv-diag-content">
          <div>
            <div className="ydv-kicker">
              03 / DIGITAL DIAGNOSTICS
            </div>

            <h2>
              DON'T GUESS.
              <br />
              <em>DECODE.</em>
            </h2>

            <p>
              Choose a vehicle system, explore common
              symptoms and receive safety-first
              guidance. This is not a real diagnosis.
            </p>

            <Link
              to="/diagnostics"
              className="ydv-btn ydv-btn-hot"
            >
              EXPLORE DIAGNOSTIC LAB
              <ScanLine size={19} />
            </Link>
          </div>

          <div className="ydv-car-graphic">
            <div className="ydv-graphic-ring" />
            <span>
              VEHICLE / SYSTEM OVERVIEW
            </span>

            <svg
              viewBox="0 0 220 410"
              fill="none"
              aria-label="Technical car schematic"
            >
              <path
                d="M70 20H150L174 67 185 150V285L168 355 145 395H75L52 355 35 285V150L46 67Z"
                stroke="#a8d6da"
                strokeWidth="3"
                fill="#34525e55"
              />

              <path
                d="M60 110Q110 85 160 110L172 165H48ZM49 200H171V279H49ZM52 324H168L150 369H70Z"
                stroke="#a8d6da"
              />

              <rect x="10" y="95" width="24" height="78" rx="10" stroke="#a8d6da" />
              <rect x="186" y="95" width="24" height="78" rx="10" stroke="#a8d6da" />
              <rect x="10" y="260" width="24" height="78" rx="10" stroke="#a8d6da" />
              <rect x="186" y="260" width="24" height="78" rx="10" stroke="#a8d6da" />

              <path
                d="M110 20V395M35 217H185"
                stroke="#ff8059"
                strokeDasharray="5 8"
              />

              <circle cx="110" cy="217" r="38" stroke="#ff8059" strokeDasharray="3 6" />
              <circle cx="110" cy="217" r="6" fill="#ff8059" />
            </svg>

            <small>
              YD / DIAGNOSTICS VISUALIZATION / CONCEPT
            </small>
          </div>
        </div>
      </section>

      <section className="ydv-section">
        <div className="ydv-section-head">
          <div>
            <div className="ydv-kicker">
              04 / SERVICE PROTOCOL
            </div>

            <h2>
              YOUR JOURNEY.
              <br />
              <em>REENGINEERED.</em>
            </h2>
          </div>

          <p>
            Diagnosis, planning, scheduling and
            vehicle care, connected in one journey.
          </p>
        </div>

        <div className="ydv-journey">
          <div role="tablist" aria-label="Service stages">
            {chapters.map((item, i) => (
              <button
                key={item.title}
                role="tab"
                aria-selected={i === active}
                className={i === active ? "selected" : ""}
                onClick={() => setActive(i)}
              >
                <span>0{i + 1}</span>
                {item.name}
                <ArrowUpRight size={17} />
              </button>
            ))}
          </div>

          <article role="tabpanel">
            <SelectedIcon size={54} strokeWidth={1.3} />

            <span>{selected.title}</span>

            <h3>{selected.name}</h3>

            <p>{selected.body}</p>

            <Link
              className="ydv-btn ydv-btn-hot"
              to={selected.to}
            >
              EXPLORE THIS STAGE
              <ArrowRight size={18} />
            </Link>
          </article>
        </div>
      </section>

      <section className="ydv-end">
        <div>
          <div className="ydv-kicker">
            05 / SPACE & SYSTEMS
          </div>

          <h2>
            BEHIND THE
            <br />
            <em>BAY DOORS.</em>
          </h2>

          <p>
            Explore a conceptual six-zone auto care
            facility with an interactive floor plan.
          </p>

          <Link
            to="/facility"
            className="ydv-btn ydv-btn-hot"
          >
            ENTER WORKSHOP ATLAS
            <ArrowUpRight size={19} />
          </Link>
        </div>

        <img
          src={IMAGES.garage}
          alt="Automotive workshop concept"
          loading="lazy"
        />
      </section>
    </main>
  );
}
