
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
