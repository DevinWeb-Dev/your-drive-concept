
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
