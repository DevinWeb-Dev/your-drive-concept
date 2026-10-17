
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();
const appPath = join(root, "src/App.jsx");
const mainPath = join(root, "src/main.jsx");

for (const file of [
  "package.json",
  "src/App.jsx",
  "src/main.jsx",
  "src/data/autoData.js",
]) {
  if (!existsSync(join(root, file))) {
    throw Error(
      "Missing " + file +
      ". Run this inside the original YOUR DRIVE project."
    );
  }
}

const pages = {
  "src/pages/precision/PrecisionHome.jsx": String.raw`
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
`,

  "src/pages/precision/DiagnosticLab.jsx": String.raw`
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  AlertTriangle,
  ScanLine,
  ShieldAlert
} from "lucide-react";

const systems = [
  {
    id: "ENGINE",
    title: "Engine & powertrain",
    xy: [51, 22],
    service: "computer-diagnostics",
    issues: [
      "Check-engine light",
      "Loss of power or hesitation",
      "Temperature warning / overheating"
    ]
  },
  {
    id: "BRAKES",
    title: "Braking system",
    xy: [19, 40],
    service: "brake-system-care",
    issues: [
      "Brake grinding or squealing",
      "Soft brake pedal",
      "Brake warning indicator"
    ]
  },
  {
    id: "WHEELS",
    title: "Tires & chassis",
    xy: [82, 73],
    service: "tire-wheel-inspection",
    issues: [
      "Steering vibration",
      "Uneven tire wear",
      "Damaged or deflated tire"
    ]
  },
  {
    id: "CLIMATE",
    title: "Air conditioning",
    xy: [21, 62],
    service: "aircon-performance",
    issues: [
      "Cabin not cooling",
      "Odor from air vents",
      "Water accumulating inside"
    ]
  },
  {
    id: "ELECTRICAL",
    title: "Electrical system",
    xy: [82, 28],
    service: "computer-diagnostics",
    issues: [
      "Slow or failed starting",
      "Multiple dashboard warnings",
      "Flickering lights"
    ]
  },
  {
    id: "DETAILING",
    title: "Exterior & interior",
    xy: [75, 51],
    service: "premium-detailing",
    issues: [
      "Swirl marks or scratches",
      "Embedded paint contamination",
      "Interior care and stains"
    ]
  }
];

const safetyTerms =
  /overheat|soft brake|deflated|damaged|temperature warning/i;

export default function DiagnosticLab() {
  const [index, setIndex] = useState(0);
  const [symptom, setSymptom] = useState(0);

  const current = systems[index];
  const selected = current.issues[symptom];
  const highRisk = safetyTerms.test(selected);

  return (
    <main className="ydv-module">
      <header className="ydv-module-hero">
        <div className="ydv-kicker">
          01 / INTELLIGENT AUTO CARE
        </div>

        <h1>
          DIAGNOSTIC
          <br />
          <em>LAB.</em>
        </h1>

        <p>
          Explore six vehicle systems and eighteen
          concern paths. Informational only, not a
          mechanical diagnosis or electronic scan.
        </p>

        <Link
          to="/estimate"
          className="ydv-btn ydv-btn-hot"
        >
          BUILD AN ESTIMATE
          <ArrowUpRight size={18} />
        </Link>
      </header>

      <section className="ydv-lab">
        <div className="ydv-lab-map">
          <div className="ydv-panel-top">
            YD / SYSTEM SCHEMATIC
            <span>SELECT A SENSOR REGION</span>
          </div>

          <div className="ydv-lab-schematic">
            <svg
              viewBox="0 0 280 480"
              aria-label="Car system illustration"
            >
              <path
                d="M90 20H190L222 86 230 162V344L209 418 184 466H96L71 418 50 344V162L58 86Z"
                fill="#3f677255"
                stroke="#a6d7df"
                strokeWidth="3"
              />

              <path
                d="M79 110Q140 87 201 110L216 184H64ZM63 226H217V340H63ZM73 376H207L191 434H89Z"
                stroke="#a6d7df"
                fill="none"
                strokeWidth="2"
              />

              <rect x="23" y="130" width="25" height="90" rx="9" stroke="#a6d7df" />
              <rect x="232" y="130" width="25" height="90" rx="9" stroke="#a6d7df" />
              <rect x="23" y="323" width="25" height="90" rx="9" stroke="#a6d7df" />
              <rect x="232" y="323" width="25" height="90" rx="9" stroke="#a6d7df" />

              <path
                d="M140 20V466"
                stroke="#fe825b"
                strokeDasharray="6 7"
              />

              <circle
                cx="140"
                cy="241"
                r="36"
                stroke="#fe825b"
                strokeDasharray="4 7"
              />
            </svg>

            {systems.map((system, i) => (
              <button
                type="button"
                className={
                  "ydv-map-pin " +
                  (i === index ? "selected" : "")
                }
                key={system.id}
                style={{
                  left: system.xy[0] + "%",
                  top: system.xy[1] + "%"
                }}
                onClick={() => {
                  setIndex(i);
                  setSymptom(0);
                }}
                aria-label={"Choose " + system.title}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>

          <div className="ydv-panel-foot">
            INTERACTIVE EXPLORER /
            NO LIVE VEHICLE CONNECTION
          </div>
        </div>

        <article className="ydv-lab-detail">
          <div className="ydv-kicker">
            SYSTEM 0{index + 1} / 06
          </div>

          <h2>
            {current.title}
            <em>.</em>
          </h2>

          <div className="ydv-lab-system-list">
            {systems.map((system, i) => (
              <button
                key={system.id}
                onClick={() => {
                  setIndex(i);
                  setSymptom(0);
                }}
                className={
                  index === i ? "selected" : ""
                }
              >
                {system.id}
              </button>
            ))}
          </div>

          <h3>WHAT ARE YOU NOTICING?</h3>

          {current.issues.map((issue, i) => (
            <button
              key={issue}
              className={
                "ydv-symptom " +
                (i === symptom ? "selected" : "")
              }
              onClick={() => setSymptom(i)}
            >
              <span>
                {String(i + 1).padStart(2, "0")}
              </span>

              {issue}

              <ArrowUpRight size={16} />
            </button>
          ))}

          <div className={
            "ydv-advisory " +
            (highRisk ? "urgent" : "")
          }>
            <AlertTriangle size={24} />

            <div>
              <strong>
                {highRisk
                  ? "STOP AND SEEK PROFESSIONAL HELP"
                  : "PROFESSIONAL INSPECTION ADVISED"}
              </strong>

              <p>
                {highRisk
                  ? "If the vehicle is unsafe, stop safely and arrange qualified roadside or workshop assistance."
                  : "A technician must examine the vehicle to determine the actual cause. Symptoms alone cannot confirm a failed component."}
              </p>
            </div>
          </div>

          <Link
            to={"/services/" + current.service}
            className="ydv-btn ydv-btn-hot"
          >
            EXPLORE RELATED SERVICE
            <ArrowUpRight size={17} />
          </Link>
        </article>
      </section>

      <div className="ydv-safety">
        <ShieldAlert />

        <span>
          Never use an online symptom guide
          as confirmation that a vehicle
          is safe to drive.
        </span>
      </div>
    </main>
  );
}
`,

  "src/pages/precision/WorkshopAtlas.jsx": String.raw`
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Wrench,
  ScanLine,
  Droplets,
  Gauge,
  CheckCircle2,
  Cog
} from "lucide-react";

import { IMAGES } from "../../data/autoData.js";

const zones = [
  {
    name: "Reception & intake",
    label: "SERVICE DESK",
    desc: "Vehicle walkaround, concern capture and service consultation.",
    icon: Gauge,
    img: IMAGES.showroom
  },
  {
    name: "Diagnostic lab",
    label: "DIAGNOSTICS",
    desc: "Professional assessment and fault-code interpretation.",
    icon: ScanLine,
    img: IMAGES.precision
  },
  {
    name: "General service bays",
    label: "SERVICE BAYS",
    desc: "Preventive maintenance and illustrated job checkpoints.",
    icon: Wrench,
    img: IMAGES.garage
  },
  {
    name: "Wheels & chassis",
    label: "CHASSIS SUITE",
    desc: "Tire, wheel and suspension inspection workflows.",
    icon: Cog,
    img: IMAGES.drive
  },
  {
    name: "Detailing atelier",
    label: "DETAILING",
    desc: "Exterior finish and interior materials care.",
    icon: Droplets,
    img: IMAGES.sport
  },
  {
    name: "Quality & handover",
    label: "QUALITY GATE",
    desc: "Final quality review and owner guidance.",
    icon: CheckCircle2,
    img: IMAGES.details
  }
];

const workflow = [
  "RECEIVE",
  "INSPECT",
  "PROPOSE",
  "SERVICE",
  "VERIFY",
  "HANDOVER"
];

export default function WorkshopAtlas() {
  const [active, setActive] = useState(1);
  const [phase, setPhase] = useState(1);

  const selected = zones[active];
  const Icon = selected.icon;

  const stages = [
    "A considered arrival",
    "Understand the concern",
    "Present the options",
    "Care with purpose",
    "Verify every detail",
    "A confident handover"
  ];

  const descriptions = [
    "Listen to the driver and capture vehicle concerns.",
    "Use inspection to identify options rather than guessing.",
    "Explain scope, indicative pricing and expected work.",
    "Follow deliberate service and quality-check processes.",
    "Review completed work and document observations.",
    "Hand over service documentation and care guidance."
  ];

  return (
    <main className="ydv-module">
      <header className="ydv-module-hero ydv-facility-hero">
        <div className="ydv-kicker">
          02 / SERVICE ARCHITECTURE
        </div>

        <h1>
          BEHIND THE
          <br />
          <em>BAY DOORS.</em>
        </h1>

        <p>
          Explore an illustrated six-zone
          automotive care environment.
        </p>
      </header>

      <section className="ydv-atlas">
        <div className="ydv-atlas-map">
          <div className="ydv-panel-top">
            YD / FLOOR PLAN 001
            <span>NOT TO SCALE</span>
          </div>

          <div className="ydv-bay-grid">
            {zones.map((zone, i) => (
              <button
                className={
                  "ydv-bay " +
                  (active === i ? "selected" : "")
                }
                key={zone.name}
                onClick={() => setActive(i)}
              >
                <span>
                  ZONE 0{i + 1}
                  <ArrowUpRight size={14} />
                </span>

                <b>✳</b>
                <strong>{zone.label}</strong>
              </button>
            ))}
          </div>

          <div className="ydv-panel-foot">
            CENTRAL SERVICE CORRIDOR /
            CONCEPTUAL LAYOUT
          </div>
        </div>

        <div className="ydv-bay-detail">
          <img
            src={selected.img}
            alt={selected.name}
            loading="lazy"
          />

          <div>
            <div className="ydv-kicker">
              ZONE 0{active + 1} / 06
            </div>

            <Icon size={37} strokeWidth={1.3} />

            <h2>
              {selected.name}
              <em>.</em>
            </h2>

            <p>{selected.desc}</p>

            <button
              className="ydv-textlink"
              onClick={() =>
                setActive((active + 1) % zones.length)
              }
            >
              NEXT WORK ZONE
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="ydv-section">
        <div className="ydv-section-head">
          <div>
            <div className="ydv-kicker">
              03 / SERVICE JOURNEY
            </div>

            <h2>
              ONE CONTINUOUS
              <br />
              <em>WORKFLOW.</em>
            </h2>
          </div>

          <p>
            Select each step to see how the
            conceptual workshop operates.
          </p>
        </div>

        <div className="ydv-flow">
          {workflow.map((step, i) => (
            <button
              key={step}
              className={
                i === phase ? "selected" : ""
              }
              onClick={() => setPhase(i)}
            >
              <span>0{i + 1}</span>
              <strong>{step}</strong>
            </button>
          ))}
        </div>

        <article className="ydv-flow-detail">
          <span>
            PROCESS STEP / 0{phase + 1}
          </span>

          <h3>{stages[phase]}</h3>
          <p>{descriptions[phase]}</p>
        </article>
      </section>

      <section className="ydv-facility-end">
        <h2>
          ENGINEERED TO
          <br />
          <em>MOVE FORWARD.</em>
        </h2>

        <Link
          className="ydv-btn ydv-btn-hot"
          to="/services"
        >
          EXPLORE SERVICE CATALOG
          <ArrowUpRight size={18} />
        </Link>
      </section>

      <div className="ydv-safety">
        This facility is an architectural
        illustration, not a real bookable
        auto repair workshop.
      </div>
    </main>
  );
}
`,

  "src/styles/precision-v2.css": String.raw`
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');

:root {
  --ydv-ink: #0b1e23;
  --ydv-teal: #173941;
  --ydv-orange: #ff7950;
  --ydv-ice: #d6e3df;
  --ydv-paper: #f0f1eb;
}

html { scroll-behavior: smooth; }
body { overflow-x: hidden; }

.ydv-home,
.ydv-module {
  background: var(--ydv-paper);
  color: var(--ydv-ink);
  font-family: "DM Sans", sans-serif;
  min-width: 0;
  overflow: hidden;
}

.ydv-home *,
.ydv-module * {
  box-sizing: border-box;
}

.ydv-home a,
.ydv-module a {
  text-decoration: none;
}

.ydv-home h1,
.ydv-home h2,
.ydv-home h3,
.ydv-module h1,
.ydv-module h2,
.ydv-module h3 {
  font-family: "Barlow Condensed", Impact, sans-serif;
  letter-spacing: -.025em;
  line-height: .92;
  margin: 0;
  font-weight: 800;
}

.ydv-home em,
.ydv-module em {
  color: var(--ydv-orange);
  font-style: normal;
}

.ydv-home p,
.ydv-module p {
  line-height: 1.8;
}

.ydv-kicker,
.ydv-overline {
  font-size: 11px;
  letter-spacing: .22em;
  font-weight: 700;
}

.ydv-kicker { color: #54716e; }

.ydv-hero {
  min-height: min(900px, 95svh);
  position: relative;
  background: #07151a;
  color: #fff;
  display: flex;
  align-items: center;
  isolation: isolate;
}

.ydv-hero-image,
.ydv-hero-shade,
.ydv-grid {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.ydv-hero-image {
  object-fit: cover;
  opacity: .66;
  filter: contrast(1.15);
}

.ydv-hero-shade {
  background:
    linear-gradient(
      90deg,
      #05151af5,
      #0d2836d9 42%,
      #101f2533
    ),
    linear-gradient(
      0deg,
      #07151a 0,
      transparent 40%
    );
}

.ydv-grid {
  opacity: .16;
  background-image:
    linear-gradient(#a1e8de44 1px, transparent 1px),
    linear-gradient(90deg, #a1e8de44 1px, transparent 1px);
  background-size: 80px 80px;
}

.ydv-hero-content {
  position: relative;
  z-index: 2;
  width: min(1480px, 100%);
  margin: auto;
  padding: 100px clamp(24px, 6vw, 98px) 65px;
}

.ydv-hero h1 {
  font-size: clamp(85px, 13vw, 205px);
  margin: 50px 0 25px;
  max-width: 1000px;
}

.ydv-hero h1 span,
.ydv-hero h1 em {
  display: block;
}

.ydv-hero h1 span {
  color: #d3e5e0;
}

.ydv-hero p {
  max-width: 580px;
  color: #d4dfdc;
  font-size: 15px;
}

.ydv-beacon {
  display: inline-block;
  background: #ff7950;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 20px 6px #ff795066;
  margin-right: 9px;
  animation: ydv-pulse 2s infinite;
}

.ydv-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.ydv-btn {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
  padding: 17px 20px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .06em;
  transition: transform .25s, background .25s;
}

.ydv-btn:hover {
  transform: translateY(-3px);
}

.ydv-btn-hot {
  background: var(--ydv-orange);
  color: #07151a !important;
}

.ydv-btn-hot:hover { background: #ffa07d; }

.ydv-btn-line {
  border: 1px solid #aacdd39c;
  color: #fff !important;
}

.ydv-hero-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 80px;
  color: #92b5b9;
  font-size: 10px;
  letter-spacing: .16em;
}

.ydv-orbit {
  position: absolute;
  right: -130px;
  top: 18%;
  height: 580px;
  width: 580px;
  border: 1px solid #c7ffff3a;
  border-radius: 50%;
  animation: ydv-spin 25s linear infinite;
}

.ydv-orbit div {
  position: absolute;
  inset: 50px;
  border: 1px dashed #c7ffff45;
  border-radius: 50%;
}

.ydv-marquee {
  overflow: hidden;
  background: var(--ydv-orange);
  color: #11191a;
  white-space: nowrap;
  font: 800 24px "Barlow Condensed", sans-serif;
  padding: 14px 0;
}

.ydv-marquee div {
  width: max-content;
  animation: ydv-marquee 30s linear infinite;
}

.ydv-section {
  max-width: 1520px;
  padding: 110px clamp(24px, 6vw, 98px);
  margin: auto;
}

.ydv-section h2,
.ydv-end h2 {
  font-size: clamp(55px, 7vw, 116px);
}

.ydv-manifesto {
  display: grid;
  grid-template-columns: 180px 1fr 200px;
  align-items: center;
  gap: 25px;
}

.ydv-manifesto p {
  max-width: 620px;
  color: #687c79;
}

.ydv-stamp {
  aspect-ratio: 1;
  border: 2px solid #b8c9c4;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-radius: 50%;
  font: 800 72px "Barlow Condensed", sans-serif;
  transform: rotate(-14deg);
}

.ydv-stamp span {
  font: 700 8px "DM Sans", sans-serif;
  letter-spacing: .1em;
}

.ydv-section-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 35px;
  margin-bottom: 36px;
}

.ydv-section-head p {
  max-width: 330px;
  color: #657a77;
}

.ydv-service-grid {
  display: grid;
  grid-template-columns: 1.15fr .88fr .88fr;
  gap: 15px;
}

.ydv-service {
  min-height: 490px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  padding: 25px;
  color: white !important;
  background: #10262d;
}

.ydv-service img,
.ydv-service-shade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.ydv-service img {
  object-fit: cover;
  transition: transform .7s;
  filter: saturate(.7);
}

.ydv-service:hover img {
  transform: scale(1.08);
}

.ydv-service-shade {
  background:
    linear-gradient(
      180deg,
      #0b141c79,
      transparent 30%,
      #071015ee
    );
}

.ydv-service > span,
.ydv-service > div {
  position: relative;
  z-index: 1;
}

.ydv-service > span {
  font-size: 11px;
  letter-spacing: .15em;
}

.ydv-service h3 {
  font-size: clamp(35px, 3.8vw, 62px);
  text-transform: uppercase;
}

.ydv-service p {
  font-size: 10px;
  letter-spacing: .1em;
}

.ydv-service b {
  display: inline-flex;
  gap: 15px;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid #fff7;
  font-size: 10px;
  width: 100%;
  margin-top: 16px;
}

.ydv-textlink {
  display: inline-flex;
  gap: 15px;
  align-items: center;
  border: 0;
  border-bottom: 1px solid #bd7d65;
  background: transparent;
  color: #5a3429;
  cursor: pointer;
  padding: 10px 0;
  margin-top: 20px;
  font-size: 12px;
  font-weight: 800;
}

.ydv-diagnostic-promo {
  background: #0b252d;
  color: #fff;
}

.ydv-diag-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.ydv-diag-content h2 { margin: 17px 0; }

.ydv-diag-content p {
  max-width: 470px;
  color: #b7cccb;
}

.ydv-diag-content .ydv-btn {
  margin-top: 24px;
}

.ydv-car-graphic {
  position: relative;
  min-height: 580px;
  border: 1px solid #8ac5c344;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle, #25505a, #08181e);
}

.ydv-car-graphic svg {
  width: 210px;
  max-width: 55%;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 15px #72cdd055);
}

.ydv-graphic-ring {
  height: 390px;
  width: 390px;
  max-width: 90%;
  border: 1px dashed #8bcbc488;
  border-radius: 50%;
  position: absolute;
  animation: ydv-spin 24s linear infinite;
}

.ydv-car-graphic > span,
.ydv-car-graphic > small {
  position: absolute;
  left: 18px;
  font-size: 9px;
  letter-spacing: .1em;
  color: #9ec2c5;
}

.ydv-car-graphic > span { top: 18px; }
.ydv-car-graphic > small { bottom: 18px; }

.ydv-journey {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #cfded9;
}

.ydv-journey > div { padding: 35px; }

.ydv-journey > div button {
  width: 100%;
  padding: 24px 15px;
  border: 0;
  border-bottom: 1px solid #a2b7b1;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 20px;
  text-align: left;
  font-size: 18px;
  cursor: pointer;
}

.ydv-journey > div button span {
  font-size: 11px;
}

.ydv-journey > div button svg {
  margin-left: auto;
}

.ydv-journey > div button.selected {
  color: #e56c45;
  background: #17343a;
}

.ydv-journey article {
  background: #11303a;
  color: #fff;
  padding: 65px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.ydv-journey article > span {
  font-size: 11px;
  color: #a6c1c0;
  margin-top: 30px;
}

.ydv-journey h3 {
  font-size: 60px;
  margin: 20px 0;
}

.ydv-journey article p {
  color: #bed0cc;
  max-width: 440px;
}

.ydv-journey article .ydv-btn {
  margin-top: auto;
}

.ydv-end {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 550px;
  background: #e2e3db;
}

.ydv-end > div {
  padding: 85px clamp(24px, 6vw, 95px);
}

.ydv-end p {
  max-width: 450px;
  color: #677d77;
}

.ydv-end .ydv-btn { margin-top: 24px; }

.ydv-end img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ydv-module-hero {
  background:
    radial-gradient(circle at 80% 10%, #42626b, #0c1d24 55%);
  padding: 120px max(24px, calc((100vw - 1320px) / 2));
  color: white;
}

.ydv-module-hero h1 {
  font-size: clamp(80px, 12vw, 176px);
  margin: 28px 0;
}

.ydv-module-hero p {
  max-width: 700px;
  color: #bfd0d1;
}

.ydv-module-hero .ydv-btn { margin-top: 25px; }

.ydv-facility-hero {
  background:
    linear-gradient(95deg, #071a21ec, #1c323fc9),
    url("https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1800&q=85")
      center / cover;
}

.ydv-lab,
.ydv-atlas {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(350px, 1fr);
  max-width: 1470px;
  gap: 24px;
  margin: 60px auto;
  padding: 0 24px;
}

.ydv-lab-map,
.ydv-atlas-map {
  background: #102b34;
  color: #fff;
  padding: 22px;
  min-width: 0;
}

.ydv-panel-top,
.ydv-panel-foot {
  font-size: 10px;
  letter-spacing: .12em;
  color: #a1c9c9;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.ydv-panel-foot { margin-top: 18px; }

.ydv-lab-schematic {
  position: relative;
  min-height: 610px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle, #2b5059, #091c24 74%);
  margin-top: 15px;
}

.ydv-lab-schematic svg {
  max-width: 75%;
  height: 540px;
  display: block;
  filter: drop-shadow(0 0 19px #77dbdb55);
}

.ydv-map-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  height: 40px;
  width: 40px;
  background: #082129;
  border: 1px solid #97baba;
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  font-weight: 800;
}

.ydv-map-pin.selected {
  background: var(--ydv-orange);
  color: #111;
  box-shadow: 0 0 0 9px #ff795044;
}

.ydv-lab-detail,
.ydv-bay-detail {
  background: white;
  padding: 35px;
  min-width: 0;
}

.ydv-lab-detail h2,
.ydv-bay-detail h2 {
  font-size: clamp(42px, 5vw, 76px);
  margin: 14px 0 25px;
}

.ydv-lab-system-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 27px;
}

.ydv-lab-system-list button {
  padding: 8px 10px;
  background: #eef2ef;
  border: 1px solid #cfdbd6;
  color: #213e41;
  font-size: 10px;
  cursor: pointer;
}

.ydv-lab-system-list button.selected {
  background: var(--ydv-orange);
  border-color: var(--ydv-orange);
}

.ydv-lab-detail h3 {
  font: 800 14px "DM Sans", sans-serif;
  letter-spacing: .1em;
  margin-bottom: 10px;
}

.ydv-symptom {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  padding: 17px 9px;
  width: 100%;
  background: white;
  border: 0;
  border-bottom: 1px solid #e0e7e2;
  cursor: pointer;
}

.ydv-symptom svg { margin-left: auto; }

.ydv-symptom.selected {
  background: #e3eee7;
  color: #ad533b;
}

.ydv-symptom span {
  font-size: 10px;
  color: #b17b69;
}

.ydv-advisory {
  background: #e1ede7;
  display: flex;
  gap: 13px;
  padding: 19px;
  margin: 24px 0;
  color: #38584d;
}

.ydv-advisory.urgent {
  background: #fbe1d6;
  color: #963d2b;
}

.ydv-advisory p {
  margin: 5px 0 0;
  font-size: 12px;
}

.ydv-safety {
  max-width: 1470px;
  margin: 40px auto 60px;
  padding: 18px 25px;
  background: #e7d5c7;
  display: flex;
  align-items: center;
  gap: 18px;
  color: #694839;
}

.ydv-bay-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  padding: 40px 0;
}

.ydv-bay {
  height: 200px;
  background: #24444c;
  border: 1px solid #769ea0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: left;
  padding: 15px;
  color: #d4efeb;
  cursor: pointer;
}

.ydv-bay > span {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
}

.ydv-bay > b {
  font-size: 40px;
  color: #789da0;
}

.ydv-bay strong {
  font: 700 19px "Barlow Condensed", sans-serif;
}

.ydv-bay.selected {
  background: #e97954;
  color: #0d1e21;
  border-color: #ffc7ac;
}

.ydv-bay-detail { padding: 0; }

.ydv-bay-detail img {
  width: 100%;
  height: 275px;
  object-fit: cover;
}

.ydv-bay-detail > div { padding: 35px; }

.ydv-bay-detail > div p { color: #6f817a; }

.ydv-flow {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  margin: 35px 0;
}

.ydv-flow button {
  background: #dce7e0;
  border: 1px solid #9eafa8;
  padding: 24px 6px;
  cursor: pointer;
  text-align: center;
}

.ydv-flow button span {
  display: block;
  font-size: 10px;
}

.ydv-flow button strong {
  font: 700 20px "Barlow Condensed", sans-serif;
}

.ydv-flow button.selected {
  background: #132f36;
  color: #fff;
}

.ydv-flow-detail {
  background: #153640;
  color: white;
  padding: 40px;
  max-width: 780px;
}

.ydv-flow-detail span {
  font-size: 10px;
  color: #8baeb0;
}

.ydv-flow-detail h3 {
  font-size: 50px;
  margin: 14px 0;
}

.ydv-flow-detail p { color: #b5cacc; }

.ydv-facility-end {
  padding: 90px 24px;
  background: #102c33;
  color: white;
  text-align: center;
}

.ydv-facility-end h2 {
  font-size: clamp(55px, 7vw, 110px);
  margin-bottom: 23px;
}

@keyframes ydv-spin {
  to { transform: rotate(360deg); }
}

@keyframes ydv-pulse {
  50% {
    opacity: .35;
    box-shadow: 0 0 5px 1px #ff7950;
  }
}

@keyframes ydv-marquee {
  to { transform: translateX(-50%); }
}

@media (max-width: 1050px) {
  .ydv-service-grid {
    grid-template-columns: 1fr 1fr;
  }

  .ydv-service:first-child {
    grid-column: 1 / -1;
  }

  .ydv-manifesto {
    grid-template-columns: 120px 1fr;
  }

  .ydv-stamp { display: none; }

  .ydv-atlas,
  .ydv-lab {
    grid-template-columns: 1fr;
  }

  .ydv-bay-detail {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .ydv-bay-detail img { height: 100%; }
}

@media (max-width: 720px) {
  .ydv-hero { min-height: 770px; }

  .ydv-hero-content {
    padding: 110px 23px 40px;
  }

  .ydv-hero h1 {
    font-size: clamp(77px, 16vw, 130px);
  }

  .ydv-hero-meta {
    display: grid;
    margin-top: 55px;
  }

  .ydv-orbit { opacity: .25; }

  .ydv-section { padding: 60px 22px; }

  .ydv-manifesto,
  .ydv-diag-content,
  .ydv-journey,
  .ydv-end {
    display: block;
  }

  .ydv-section h2,
  .ydv-end h2 {
    font-size: clamp(55px, 12vw, 90px);
  }

  .ydv-section-head { display: block; }

  .ydv-section-head p { margin-top: 18px; }

  .ydv-service-grid { display: block; }

  .ydv-service {
    min-height: 370px;
    margin-bottom: 12px;
  }

  .ydv-car-graphic {
    margin-top: 32px;
    min-height: 470px;
  }

  .ydv-journey > div { padding: 17px; }

  .ydv-journey article {
    padding: 35px;
    min-height: 400px;
  }

  .ydv-end img { height: 320px; }

  .ydv-end > div { padding: 55px 22px; }

  .ydv-module-hero { padding: 90px 24px; }

  .ydv-module-hero h1 {
    font-size: clamp(70px, 14vw, 110px);
  }

  .ydv-lab,
  .ydv-atlas {
    margin: 20px auto;
    display: block;
    padding: 0 13px;
  }

  .ydv-lab-detail { padding: 23px; }

  .ydv-lab-schematic { min-height: 510px; }

  .ydv-lab-schematic svg { height: 450px; }

  .ydv-bay-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .ydv-bay { height: 150px; }

  .ydv-bay-detail { display: block; }

  .ydv-bay-detail img { height: 230px; }

  .ydv-flow {
    grid-template-columns: repeat(3, 1fr);
  }

  .ydv-safety { margin: 20px 13px 40px; }
}

@media (prefers-reduced-motion: reduce) {
  .ydv-home *,
  .ydv-module * {
    animation: none !important;
    transition: none !important;
  }

  html { scroll-behavior: auto; }
}
`
};

// Validate the original project before writing anything.

const app = readFileSync(appPath, "utf8")
  .replace(/\r\n/g, "\n");

const main = readFileSync(mainPath, "utf8")
  .replace(/\r\n/g, "\n");

const signature =
  'import PrecisionHome from "./pages/precision/PrecisionHome.jsx";';

if (app.includes(signature)) {
  console.log(
    "YOUR DRIVE V2 is already installed. No changes made."
  );
  process.exit(0);
}

function replaceOne(source, before, after, description) {
  if (source.split(before).length !== 2) {
    throw Error(
      "Cannot find unique " +
      description +
      " anchor. No files changed."
    );
  }

  return source.replace(before, after);
}

// Add imports.

let next = replaceOne(
  app,
  'import "./styles/site.css";',
  signature + "\n" +
  'import DiagnosticLab from "./pages/precision/DiagnosticLab.jsx";\n' +
  'import WorkshopAtlas from "./pages/precision/WorkshopAtlas.jsx";\n' +
  'import "./styles/site.css";',
  "App imports"
);

// Preserve the original site modules;
// replace only the homepage implementation.

const homeStart = next.indexOf("function HomePage() {");

const homeEnd = next.indexOf(
  "// ==================================================\n// PUBLIC SERVICE CATALOG",
  homeStart
);

if (homeStart < 0 || homeEnd < homeStart) {
  throw Error(
    "Cannot find original HomePage boundaries. No files changed."
  );
}

next =
  next.slice(0, homeStart) +
  "function HomePage() { return <PrecisionHome />; }\n\n" +
  next.slice(homeEnd);

// Add page titles.

next = replaceOne(
  next,
  '  "/": "Home",',
  '  "/": "Home",\n' +
  '  "/diagnostics": "Diagnostic Lab",\n' +
  '  "/facility": "Workshop Atlas",',
  "page titles"
);

// Upgrade navigation.

const navStart = next.indexOf("const NAV_ITEMS = [");
const navEnd = next.indexOf("];", navStart);

if (navStart < 0 || navEnd < 0) {
  throw Error(
    "Cannot find original navigation. No files changed."
  );
}

next =
  next.slice(0, navStart) +
  `const NAV_ITEMS = [
    ["Home", "/"],
    ["Services", "/services"],
    ["Diagnostic Lab", "/diagnostics"],
    ["Workshop Atlas", "/facility"],
    ["Compare", "/compare"],
    ["Calendar", "/schedule"],
    ["My Garage", "/garage"],
    ["About", "/about"],
  ]` +
  next.slice(navEnd + 1);

// Add the two new routes.

const serviceRoute =
  '          <Route\n' +
  '            path="services"\n' +
  '            element={<ServicesPage />}\n' +
  '          />';

next = replaceOne(
  next,
  serviceRoute,
  serviceRoute + "\n" +
  '          <Route path="diagnostics" element={<DiagnosticLab />} />\n' +
  '          <Route path="facility" element={<WorkshopAtlas />} />',
  "service route"
);

// Import the V2 design system.

const nextMain = replaceOne(
  main,
  'import App from "./App.jsx";',
  'import App from "./App.jsx";\n' +
  'import "./styles/precision-v2.css";',
  "main stylesheet"
);

// Create backups and write source files.

const updated = {
  ...pages,
  "src/App.jsx": next,
  "src/main.jsx": nextMain
};

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

for (const [name, content] of Object.entries(updated)) {
  const fullPath = join(root, name);

  mkdirSync(
    dirname(fullPath),
    { recursive: true }
  );

  if (existsSync(fullPath)) {
    const backup = join(
      tmpdir(),
      "your-drive-before-v2-" +
      stamp + "-" +
      name.replaceAll("/", "-") +
      ".bak"
    );

    copyFileSync(fullPath, backup);

    console.log("Backed up:", backup);
  }

  writeFileSync(
    fullPath,
    content,
    "utf8"
  );

  console.log("Installed:", name);
}

console.log("");
console.log("YOUR DRIVE V2 INSTALLED SUCCESSFULLY");
console.log("New pages: /#/diagnostics and /#/facility");
console.log("Original estimator, booking and My Garage retained.");
console.log("No GitHub operations performed.");
console.log("");
console.log("Run npm run build, then npm run dev.");
