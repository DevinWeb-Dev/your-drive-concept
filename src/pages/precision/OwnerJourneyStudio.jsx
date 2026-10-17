import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleAlert,
  ClipboardCheck,
  Download,
  Gauge,
  History,
  MessageSquareText,
  Plus,
  Printer,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import { formatPeso } from "../../data/autoData.js";
import "../../styles/owner-journey.css";

const KEY = "your-drive:owner-journey:v1";
const V3_KEY = "your-drive:service-intelligence:v1";

const STAGES = [
  "Intake",
  "Inspection",
  "Approval",
  "In service",
  "Quality check",
  "Handover",
];

const SECTIONS = [
  ["journey", "Journey overview", Gauge],
  ["approvals", "Service approvals", ClipboardCheck],
  ["care", "Maintenance planner", CalendarDays],
  ["updates", "Owner updates", MessageSquareText],
];

const DEMO = {
  id: "your-drive-owner-demo",
  reference: "YD-SAMPLE-001",
  vehicle: "2022 Demonstration Sedan",
  customer: "Sample Owner",
  stage: 2,
  serviceLines: [
    {
      id: "demo-oil",
      name: "Preventive maintenance package",
      price: 2900,
    },
    {
      id: "demo-brake",
      name: "Brake system inspection",
      price: 1250,
    },
  ],
  checks: {
    brakes: { status: "Monitor" },
    fluids: { status: "Pass" },
  },
  updatedAt: new Date().toISOString(),
};

const CARE_DEFAULTS = [
  {
    id: "oil",
    name: "Engine oil & filter",
    interval: 8000,
    months: 6,
    lastKm: 20000,
    date: "",
  },
  {
    id: "tires",
    name: "Tire rotation",
    interval: 10000,
    months: 12,
    lastKm: 20000,
    date: "",
  },
  {
    id: "brakes",
    name: "Brake inspection",
    interval: 15000,
    months: 12,
    lastKm: 20000,
    date: "",
  },
];

const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const clamp = (v, max = 9999999) =>
  Math.max(0, Math.min(max, Number(v) || 0));

const clean = (v) => String(v ?? "").trim();
const stamp = () => new Date().toISOString();

const dateFmt = (v) => {
  const d = new Date(v);

  return v && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not set";
};

function getV3() {
  try {
    const data = JSON.parse(
      localStorage.getItem(V3_KEY) || "null"
    );

    if (Array.isArray(data?.jobs)) {
      return data.jobs
        .filter(
          (j) =>
            j &&
            typeof j.id === "string"
        )
        .slice(0, 60);
    }
  } catch {
    // No V3 draft data in this browser.
  }

  return [];
}

function getSaved() {
  try {
    const data = JSON.parse(
      localStorage.getItem(KEY) || "null"
    );

    if (
      data &&
      data.records &&
      typeof data.records === "object" &&
      !Array.isArray(data.records)
    ) {
      return {
        records: data.records,
        selected: clean(data.selected),
      };
    }
  } catch {
    // Browser data unavailable.
  }

  return {
    records: {},
    selected: "",
  };
}

function makeRecord(job) {
  return {
    mileage: 26000,

    lines: (
      Array.isArray(job.serviceLines)
        ? job.serviceLines
        : []
    ).map((line) => ({
      id: uid(),
      name:
        clean(line.name) ||
        "Proposed service",
      price: clamp(line.price),
      decision: "Pending",
      note: "",
    })),

    care: CARE_DEFAULTS.map(
      (item) => ({ ...item })
    ),

    notes: [],
  };
}

function nextDate(start, months) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      start || ""
    )
  ) {
    return null;
  }

  const d = new Date(
    `${start}T12:00:00`
  );

  if (Number.isNaN(d.getTime())) {
    return null;
  }

  d.setMonth(
    d.getMonth() +
      Math.max(0, Number(months) || 0)
  );

  return d;
}

function due(item, mileage) {
  const km =
    clamp(item.lastKm) +
    Math.max(
      1,
      Number(item.interval) || 1
    );

  const remaining =
    km - clamp(mileage);

  const date = nextDate(
    item.date,
    item.months
  );

  const days = date
    ? Math.ceil(
        (date.getTime() - Date.now()) /
          86400000
      )
    : null;

  const urgent =
    remaining <= 0 ||
    (days !== null && days <= 0);

  const upcoming =
    !urgent &&
    (
      remaining <= 500 ||
      (days !== null && days <= 30)
    );

  return {
    km,
    remaining,
    date,
    days,
    urgent,
    upcoming,
  };
}

function saveFile(name, text) {
  const url = URL.createObjectURL(
    new Blob([text], {
      type: "application/json",
    })
  );

  const a = document.createElement("a");

  a.href = url;
  a.download = name;

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function Pill({
  children,
  kind = "plain",
}) {
  return (
    <span
      className={
        `oj-pill oj-pill--${kind}`
      }
    >
      {children}
    </span>
  );
}

/* ======================================
   CUSTOMER-FACING EXPERIENCE PREVIEW
====================================== */

function OwnerPreview({
  job,
  record,
  onDecision,
  onClose,
}) {
  const [message, setMessage] =
    useState("");

  const plans = record.care.map(
    (c) => ({
      ...c,
      ...due(c, record.mileage),
    })
  );

  const amount = record.lines.reduce(
    (n, l) => n + clamp(l.price),
    0
  );

  const decided = record.lines.filter(
    (l) => l.decision !== "Pending"
  ).length;

  useEffect(() => {
    function closeOnEscape(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener(
      "keydown",
      closeOnEscape
    );

    return () =>
      window.removeEventListener(
        "keydown",
        closeOnEscape
      );
  }, [onClose]);

  return (
    <div
      className="oj-portal"
      role="dialog"
      aria-modal="true"
      aria-label="Owner experience preview"
    >
      <div className="oj-portal-top">
        <strong>
          YOUR DRIVE
          <span>
            {" "}/ OWNER EXPERIENCE DEMO
          </span>
        </strong>

        <div>
          <button
            onClick={() => window.print()}
          >
            <Printer size={15} />
            Print
          </button>

          <button onClick={onClose}>
            <X size={16} />
            Exit preview
          </button>
        </div>
      </div>

      <div className="oj-portal-hero">
        <span>
          ONE VEHICLE. EVERY DETAIL IN VIEW.
        </span>

        <h2>
          Your drive,{" "}
          <em>in progress.</em>
        </h2>

        <p>
          {job.vehicle} · {job.reference}
        </p>

        <div className="oj-portal-hero-meta">
          <div>
            <small>CURRENT STAGE</small>

            <b>
              {
                STAGES[
                  Math.max(
                    0,
                    Math.min(
                      5,
                      Number(job.stage) || 0
                    )
                  )
                ]
              }
            </b>
          </div>

          <div>
            <small>
              PROPOSED SERVICES
            </small>

            <b>{record.lines.length}</b>
          </div>

          <div>
            <small>
              ILLUSTRATIVE TOTAL
            </small>

            <b>{formatPeso(amount)}</b>
          </div>
        </div>
      </div>

      <div className="oj-portal-content">
        <section className="oj-preview-section">
          <span className="oj-overline">
            01 / YOUR SERVICE JOURNEY
          </span>

          <h3>
            Transparency at{" "}
            <em>every turn.</em>
          </h3>

          <div className="oj-preview-steps">
            {STAGES.map(
              (stage, index) => (
                <div
                  key={stage}
                  className={
                    index <= job.stage
                      ? "done"
                      : ""
                  }
                >
                  <span>
                    {index < job.stage ? (
                      <Check size={16} />
                    ) : (
                      String(
                        index + 1
                      ).padStart(2, "0")
                    )}
                  </span>

                  <strong>
                    {stage}
                  </strong>
                </div>
              )
            )}
          </div>

          <p className="oj-muted">
            Stages are read from a local V3
            demonstration job card. They are
            not a live workshop feed.
          </p>
        </section>

        <section className="oj-preview-section">
          <span className="oj-overline">
            02 / REVIEW PROPOSED WORK
          </span>

          <h3>
            Make an{" "}
            <em>informed choice.</em>
          </h3>

          <p className="oj-muted">
            Review each line and simulate
            a decision. Nothing below
            authorizes an actual repair
            or payment.
          </p>

          {record.lines.length ? (
            record.lines.map(
              (line) => (
                <div
                  className="oj-approval-card"
                  key={line.id}
                >
                  <div>
                    <strong>
                      {line.name}
                    </strong>

                    <span>
                      {formatPeso(
                        line.price
                      )}
                      {" "}· Illustrative service price
                    </span>
                  </div>

                  <Pill
                    kind={
                      line.decision.toLowerCase()
                    }
                  >
                    {line.decision}
                  </Pill>

                  <div className="oj-approval-actions">
                    <button
                      className={
                        line.decision ===
                        "Approved"
                          ? "selected"
                          : ""
                      }
                      onClick={() => {
                        onDecision(
                          line.id,
                          "Approved"
                        );

                        setMessage(
                          "Demo approval selection saved locally."
                        );
                      }}
                    >
                      Approve demo
                    </button>

                    <button
                      className={
                        line.decision ===
                        "Declined"
                          ? "selected reject"
                          : ""
                      }
                      onClick={() => {
                        onDecision(
                          line.id,
                          "Declined"
                        );

                        setMessage(
                          "Demo decline selection saved locally."
                        );
                      }}
                    >
                      Decline demo
                    </button>

                    <button
                      onClick={() => {
                        onDecision(
                          line.id,
                          "Pending"
                        );

                        setMessage(
                          "Decision returned to pending."
                        );
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )
            )
          ) : (
            <p className="oj-muted">
              No service proposals have
              been prepared yet.
            </p>
          )}

          <div className="oj-decision-foot">
            {decided} of{" "}
            {record.lines.length} sample
            decisions recorded.{" "}
            <strong>
              No real authorization transmitted.
            </strong>
          </div>

          {message && (
            <p
              role="status"
              className="oj-feedback"
            >
              {message}
            </p>
          )}
        </section>

        <section className="oj-preview-section oj-preview-care">
          <span className="oj-overline">
            03 / SMARTER OWNERSHIP
          </span>

          <h3>
            Care beyond{" "}
            <em>the workshop.</em>
          </h3>

          <p className="oj-muted">
            Odometer entered in this demo:{" "}
            {Math.round(
              record.mileage
            ).toLocaleString()}{" "}
            km. Recommendations are generic
            examples, not manufacturer-specific
            intervals.
          </p>

          <div className="oj-preview-care-grid">
            {plans.map(
              (plan) => (
                <article key={plan.id}>
                  <span>
                    {plan.urgent
                      ? "DUE / REVIEW"
                      : plan.upcoming
                        ? "COMING UP"
                        : "PLANNED"}
                  </span>

                  <strong>
                    {plan.name}
                  </strong>

                  <small>
                    {plan.remaining <= 0
                      ? `${Math.abs(
                          plan.remaining
                        ).toLocaleString()} km over sample threshold`
                      : `${plan.remaining.toLocaleString()} km to sample threshold`}
                  </small>

                  <small>
                    {plan.date
                      ? `Date target: ${dateFmt(
                          plan.date
                        )}`
                      : "No date-based target set"}
                  </small>
                </article>
              )
            )}
          </div>
        </section>

        <section className="oj-preview-section">
          <span className="oj-overline">
            04 / SERVICE UPDATES
          </span>

          <h3>
            Follow the{" "}
            <em>journey.</em>
          </h3>

          {record.notes.length ? (
            [...record.notes]
              .reverse()
              .map((note) => (
                <article
                  key={note.id}
                  className="oj-update"
                >
                  <small>
                    {dateFmt(
                      note.at
                    )}
                  </small>

                  <strong>
                    {note.title}
                  </strong>

                  <p>
                    {note.message}
                  </p>
                </article>
              ))
          ) : (
            <p className="oj-muted">
              No demo updates have
              been posted for this job.
            </p>
          )}
        </section>

        <div className="oj-portal-disclaimer">
          <ShieldAlert size={19} />

          <span>
            LOCAL PROTOTYPE / No authentication,
            customer notification, legally
            binding consent, or remote
            synchronization. Do not use real
            customer information.
          </span>
        </div>
      </div>

      <footer className="oj-portal-footer">
        YOUR DRIVE.

        <span>
          PRECISION IN EVERY MILE /
          CONCEPT EXPERIENCE V5
        </span>
      </footer>
    </div>
  );
}

/* ======================================
   WORKSHOP OWNER JOURNEY STUDIO
====================================== */

export default function OwnerJourneyStudio() {
  const [v3Jobs, setV3Jobs] =
    useState(getV3);

  const [state, setState] =
    useState(getSaved);

  const [section, setSection] =
    useState("journey");

  const [preview, setPreview] =
    useState(false);

  const [feedback, setFeedback] =
    useState("");

  const [storeFailed, setStoreFailed] =
    useState(false);

  const [updateTitle, setUpdateTitle] =
    useState("");

  const [updateText, setUpdateText] =
    useState("");

  const [proposalName, setProposalName] =
    useState("");

  const [proposalPrice, setProposalPrice] =
    useState("0");

  const jobs = useMemo(
    () =>
      v3Jobs.length
        ? v3Jobs
        : [DEMO],
    [v3Jobs]
  );

  const selected =
    jobs.find(
      (j) => j.id === state.selected
    ) || jobs[0];

  const record =
    state.records[selected.id] ||
    makeRecord(selected);

  const mileage = clamp(
    record.mileage,
    2000000
  );

  const maintenance = record.care.map(
    (item) => ({
      ...item,
      ...due(item, mileage),
    })
  );

  const dueCount =
    maintenance.filter(
      (item) => item.urgent
    ).length;

  const pendingCount =
    record.lines.filter(
      (item) =>
        item.decision === "Pending"
    ).length;

  const total =
    record.lines.reduce(
      (sum, item) =>
        sum + clamp(item.price),
      0
    );

  const stage = Math.max(
    0,
    Math.min(
      STAGES.length - 1,
      Number(selected.stage) || 0
    )
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify(state)
      );

      setStoreFailed(false);
    } catch {
      setStoreFailed(true);
    }
  }, [state]);

  function edit(patch) {
    setState((old) => ({
      ...old,
      selected: selected.id,

      records: {
        ...old.records,

        [selected.id]: {
          ...(
            old.records[selected.id] ||
            makeRecord(selected)
          ),
          ...patch,
        },
      },
    }));
  }

  function updateLine(id, decision) {
    edit({
      lines: record.lines.map(
        (line) =>
          line.id === id
            ? {
                ...line,
                decision,
              }
            : line
      ),
    });
  }

  function updateCare(id, patch) {
    edit({
      care: record.care.map(
        (item) =>
          item.id === id
            ? {
                ...item,
                ...patch,
              }
            : item
      ),
    });
  }

  function addLine(e) {
    e.preventDefault();

    if (
      !clean(proposalName) ||
      record.lines.length >= 20
    ) {
      return;
    }

    edit({
      lines: [
        ...record.lines,
        {
          id: uid(),
          name: clean(proposalName),
          price: clamp(proposalPrice),
          decision: "Pending",
          note: "",
        },
      ],
    });

    setProposalName("");
    setProposalPrice("0");

    setFeedback(
      "Demo proposal added. Review in the Owner Preview."
    );
  }

  function addUpdate(e) {
    e.preventDefault();

    if (
      !clean(updateTitle) ||
      !clean(updateText) ||
      record.notes.length >= 40
    ) {
      return;
    }

    edit({
      notes: [
        ...record.notes,
        {
          id: uid(),
          at: stamp(),
          title: clean(updateTitle),
          message: clean(updateText),
        },
      ],
    });

    setUpdateTitle("");
    setUpdateText("");

    setFeedback(
      "Update posted to this browser's preview only."
    );
  }

  function refresh() {
    const changed = getV3();

    setV3Jobs(changed);

    setFeedback(
      changed.length
        ? `${changed.length} local V3 job(s) found.`
        : "No V3 jobs in this browser; sample mode enabled."
    );
  }

  function exportData() {
    saveFile(
      `your-drive-v5-${
        selected.reference || "demo"
      }.json`,

      JSON.stringify(
        {
          kind: "your-drive-v5-local-backup",
          exportedAt: stamp(),
          jobReference:
            selected.reference,
          data: record,
        },
        null,
        2
      )
    );
  }

  return (
    <main className="oj-root">
      <header className="oj-head">
        <div>
          <span className="oj-overline">
            <Sparkles size={15} />
            YOUR DRIVE / EXPERIENCE
            ARCHITECTURE / V5
          </span>

          <h1>
            THE OWNER{" "}
            <em>JOURNEY.</em>
          </h1>

          <p>
            An editorial customer experience,
            built around repair transparency,
            sample approvals, thoughtful
            communication and proactive
            care planning.
          </p>

          <button
            className="oj-main-button"
            onClick={() => setPreview(true)}
          >
            Enter owner experience
            <ArrowUpRight size={18} />
          </button>
        </div>

        <div
          className="oj-head-art"
          aria-hidden="true"
        >
          <span>05</span>
          <b>
            ONE CONTINUOUS EXPERIENCE
          </b>
          <div className="oj-head-ring" />
        </div>
      </header>

      <div className="oj-workspace">
        <div className="oj-warning">
          <ShieldAlert size={20} />

          <div>
            <strong>
              Demonstration workspace,
              not a real client portal.
            </strong>
            {" "}Preview only: no secure login,
            email/SMS, e-signature, public
            guest links, live repair feeds,
            or legally valid service
            authorization. Data is stored
            on this browser. Use sample identities.
          </div>
        </div>

        {storeFailed && (
          <p
            className="oj-feedback"
            role="alert"
          >
            Browser storage is unavailable;
            changes may be lost.
          </p>
        )}

        {feedback && (
          <div
            className="oj-feedback"
            role="status"
          >
            {feedback}

            <button
              aria-label="Dismiss message"
              onClick={() =>
                setFeedback("")
              }
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="oj-toolbar">
          <label>
            ACTIVE SERVICE EXPERIENCE

            <select
              value={selected.id}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  selected: e.target.value,
                }))
              }
            >
              {jobs.map((j) => (
                <option
                  value={j.id}
                  key={j.id}
                >
                  {j.reference || j.id}
                  {" — "}
                  {j.vehicle}
                </option>
              ))}
            </select>
          </label>

          <div className="oj-toolbar-actions">
            <button onClick={refresh}>
              <RefreshCw size={15} />
              Refresh V3 jobs
            </button>

            <button onClick={exportData}>
              <Download size={15} />
              Export V5 JSON
            </button>

            <button
              className="oj-main-button"
              onClick={() =>
                setPreview(true)
              }
            >
              Owner preview
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        <div className="oj-stats">
          <article>
            <span>
              CONNECTED JOB
            </span>

            <strong>
              {selected.reference ||
                "SAMPLE"}
            </strong>

            <small>
              {v3Jobs.length
                ? "Read-only V3 source"
                : "Offline fictional example"}
            </small>
          </article>

          <article>
            <span>
              WORKSHOP STAGE
            </span>

            <strong>
              {STAGES[stage]}
            </strong>

            <small>
              Cannot be changed from V5
            </small>
          </article>

          <article>
            <span>
              DECISIONS PENDING
            </span>

            <strong>
              {pendingCount
                .toString()
                .padStart(2, "0")}
            </strong>

            <small>
              Demo review items
            </small>
          </article>

          <article>
            <span>
              CARE ALERTS
            </span>

            <strong>
              {dueCount
                .toString()
                .padStart(2, "0")}
            </strong>

            <small>
              Generic service thresholds
            </small>
          </article>
        </div>

        <div className="oj-layout">
          <nav
            className="oj-nav"
            aria-label="Owner studio sections"
          >
            <span>
              CLIENT EXPERIENCE SYSTEM
            </span>

            {SECTIONS.map(
              ([key, label, Icon], i) => (
                <button
                  key={key}
                  onClick={() =>
                    setSection(key)
                  }
                  className={
                    section === key
                      ? "active"
                      : ""
                  }
                >
                  <small>
                    {String(
                      i + 1
                    ).padStart(2, "0")}
                  </small>

                  <Icon size={18} />
                  {label}

                  <ArrowUpRight size={15} />
                </button>
              )
            )}

            <div className="oj-nav-bottom">
              <span>
                LOCAL MODE / READ ONLY V3 SOURCE
              </span>

              <strong>
                Precision requires clarity.
              </strong>
            </div>
          </nav>

          <div className="oj-panel">
            {section === "journey" && (
              <>
                <div className="oj-section-title">
                  <span>
                    01 / CONNECTED REPAIR EXPERIENCE
                  </span>

                  <h2>
                    A clearer road{" "}
                    <em>ahead.</em>
                  </h2>

                  <p>
                    Actual workflow stage is
                    mirrored from the V3 local
                    job card. V5 never updates
                    that job.
                  </p>
                </div>

                <div className="oj-stage-list">
                  {STAGES.map(
                    (label, i) => (
                      <div
                        className={
                          i <= stage
                            ? "complete"
                            : ""
                        }
                        key={label}
                      >
                        <span>
                          {i < stage ? (
                            <Check size={17} />
                          ) : (
                            String(
                              i + 1
                            ).padStart(2, "0")
                          )}
                        </span>

                        <strong>
                          {label}
                        </strong>

                        <small>
                          {i === stage
                            ? "CURRENT"
                            : i < stage
                              ? "PRIOR STAGE"
                              : "PENDING"}
                        </small>
                      </div>
                    )
                  )}
                </div>

                <div className="oj-feature-row">
                  <div>
                    <ClipboardCheck size={29} />

                    <span>
                      Proposed value
                    </span>

                    <strong>
                      {formatPeso(total)}
                    </strong>

                    <small>
                      Demo estimate only;
                      not an invoice
                    </small>
                  </div>

                  <div>
                    <History size={29} />

                    <span>
                      Owner communications
                    </span>

                    <strong>
                      {record.notes.length}
                    </strong>

                    <small>
                      Local updates, never
                      sent externally
                    </small>
                  </div>
                </div>
              </>
            )}

            {section === "approvals" && (
              <>
                <div className="oj-section-title">
                  <span>
                    02 / DIGITAL SERVICE REVIEW
                  </span>

                  <h2>
                    Decisions with{" "}
                    <em>context.</em>
                  </h2>

                  <p>
                    Stage proposed work, then
                    simulate the owner's
                    approve/decline decisions
                    in Preview.
                  </p>
                </div>

                {record.lines.map(
                  (line, i) => (
                    <div
                      className="oj-line"
                      key={line.id}
                    >
                      <b>
                        {String(
                          i + 1
                        ).padStart(2, "0")}
                      </b>

                      <div>
                        <strong>
                          {line.name}
                        </strong>

                        <small>
                          Illustrative price —
                          {" "}
                          {formatPeso(
                            line.price
                          )}
                        </small>
                      </div>

                      <Pill
                        kind={
                          line.decision.toLowerCase()
                        }
                      >
                        {line.decision}
                      </Pill>

                      <button
                        aria-label={
                          `Delete ${line.name}`
                        }
                        onClick={() =>
                          edit({
                            lines:
                              record.lines.filter(
                                (l) =>
                                  l.id !==
                                  line.id
                              ),
                          })
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                )}

                {!record.lines.length && (
                  <p className="oj-muted">
                    No service items yet.
                    Add a demo proposal below.
                  </p>
                )}

                <form
                  className="oj-form-row"
                  onSubmit={addLine}
                >
                  <label>
                    PROPOSED SERVICE

                    <input
                      required
                      maxLength={100}
                      placeholder="e.g. Wheel alignment"
                      value={proposalName}
                      onChange={(e) =>
                        setProposalName(
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    ILLUSTRATIVE PRICE (PHP)

                    <input
                      type="number"
                      min="0"
                      max="9999999"
                      step="50"
                      value={proposalPrice}
                      onChange={(e) =>
                        setProposalPrice(
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <button
                    type="submit"
                    className="oj-main-button"
                  >
                    <Plus size={16} />
                    Add proposal
                  </button>
                </form>

                <div className="oj-inline-note">
                  <CircleAlert size={17} />

                  Decision buttons exist only
                  in owner preview. Approvals
                  do not authorize real repairs.
                </div>
              </>
            )}

            {section === "care" && (
              <>
                <div className="oj-section-title">
                  <span>
                    03 / PREVENTIVE CARE INTELLIGENCE
                  </span>

                  <h2>
                    Know what's{" "}
                    <em>next.</em>
                  </h2>

                  <p>
                    Change the sample odometer,
                    previous service mileage
                    and intervals. No vehicle
                    sensor or manufacturer
                    schedule is connected.
                  </p>
                </div>

                <div className="oj-odometer">
                  <Gauge size={34} />

                  <label>
                    CURRENT DEMO ODOMETER (KM)

                    <input
                      type="number"
                      min="0"
                      max="2000000"
                      step="100"
                      value={record.mileage}
                      onChange={(e) =>
                        edit({
                          mileage: clamp(
                            e.target.value,
                            2000000
                          ),
                        })
                      }
                    />
                  </label>

                  <span>
                    <b>{dueCount}</b>
                    {" "}item(s) due by
                    these generic thresholds
                  </span>
                </div>

                <div className="oj-care-grid">
                  {maintenance.map(
                    (plan) => (
                      <article
                        key={plan.id}
                        className={
                          plan.urgent
                            ? "urgent"
                            : ""
                        }
                      >
                        <div className="oj-care-top">
                          <span>
                            {plan.urgent
                              ? "REVIEW NOW"
                              : plan.upcoming
                                ? "COMING UP"
                                : "PLANNED"}
                          </span>

                          <Wrench size={19} />
                        </div>

                        <h3>
                          {plan.name}
                        </h3>

                        <p>
                          {plan.remaining <= 0
                            ? `${Math.abs(
                                plan.remaining
                              ).toLocaleString()} km past sample interval`
                            : `${plan.remaining.toLocaleString()} km remaining`}
                        </p>

                        <div className="oj-care-meter">
                          <span
                            style={{
                              width: `${
                                Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    (
                                      (
                                        record.mileage -
                                        plan.lastKm
                                      ) /
                                      Math.max(
                                        1,
                                        plan.interval
                                      )
                                    ) * 100
                                  )
                                )
                              }%`,
                            }}
                          />
                        </div>

                        <div className="oj-care-fields">
                          <label>
                            LAST SERVICE KM

                            <input
                              type="number"
                              min="0"
                              max="2000000"
                              step="100"
                              value={plan.lastKm}
                              onChange={(e) =>
                                updateCare(
                                  plan.id,
                                  {
                                    lastKm: clamp(
                                      e.target.value,
                                      2000000
                                    ),
                                  }
                                )
                              }
                            />
                          </label>

                          <label>
                            INTERVAL KM

                            <input
                              type="number"
                              min="1"
                              max="100000"
                              step="500"
                              value={plan.interval}
                              onChange={(e) =>
                                updateCare(
                                  plan.id,
                                  {
                                    interval: Math.max(
                                      1,
                                      clamp(
                                        e.target.value,
                                        100000
                                      )
                                    ),
                                  }
                                )
                              }
                            />
                          </label>

                          <label>
                            LAST SERVICE DATE

                            <input
                              type="date"
                              value={
                                plan.date || ""
                              }
                              onChange={(e) =>
                                updateCare(
                                  plan.id,
                                  {
                                    date:
                                      e.target.value,
                                  }
                                )
                              }
                            />
                          </label>

                          <label>
                            INTERVAL MONTHS

                            <input
                              type="number"
                              min="1"
                              max="60"
                              value={plan.months}
                              onChange={(e) =>
                                updateCare(
                                  plan.id,
                                  {
                                    months: Math.max(
                                      1,
                                      clamp(
                                        e.target.value,
                                        60
                                      )
                                    ),
                                  }
                                )
                              }
                            />
                          </label>
                        </div>

                        <small>
                          {plan.date
                            ? `Estimated date threshold: ${dateFmt(
                                plan.date
                              )}`
                            : "Optional date schedule not configured"}
                          {" "}· Kilometer target:{" "}
                          {plan.km.toLocaleString()}
                          {" "}km
                        </small>
                      </article>
                    )
                  )}
                </div>

                <p className="oj-muted">
                  Follow the vehicle
                  manufacturer's maintenance
                  schedule and qualified
                  technician advice. This demo
                  must not be treated as a
                  real service recommendation.
                </p>
              </>
            )}

            {section === "updates" && (
              <>
                <div className="oj-section-title">
                  <span>
                    04 / OWNER COMMUNICATION JOURNAL
                  </span>

                  <h2>
                    Keep the story{" "}
                    <em>moving.</em>
                  </h2>

                  <p>
                    Write demonstration updates
                    that appear in the owner
                    preview. Nothing is emailed,
                    texted or published.
                  </p>
                </div>

                <form
                  className="oj-update-form"
                  onSubmit={addUpdate}
                >
                  <label>
                    UPDATE HEADLINE

                    <input
                      required
                      maxLength={90}
                      placeholder="e.g. Inspection review prepared"
                      value={updateTitle}
                      onChange={(e) =>
                        setUpdateTitle(
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    OWNER-FACING MESSAGE

                    <textarea
                      required
                      maxLength={500}
                      rows={4}
                      placeholder="Explain the progress clearly..."
                      value={updateText}
                      onChange={(e) =>
                        setUpdateText(
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <button
                    type="submit"
                    className="oj-main-button"
                  >
                    <Plus size={17} />
                    Post demo update
                  </button>
                </form>

                <div className="oj-update-list">
                  {[...record.notes]
                    .reverse()
                    .map((note) => (
                      <div
                        className="oj-update"
                        key={note.id}
                      >
                        <span>
                          {dateFmt(
                            note.at
                          )}
                        </span>

                        <div>
                          <strong>
                            {note.title}
                          </strong>

                          <p>
                            {note.message}
                          </p>
                        </div>

                        <button
                          aria-label={
                            `Remove ${note.title}`
                          }
                          onClick={() =>
                            edit({
                              notes:
                                record.notes.filter(
                                  (n) =>
                                    n.id !==
                                    note.id
                                ),
                            })
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                  {!record.notes.length && (
                    <p className="oj-muted">
                      No owner updates yet.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <footer className="oj-footer">
          YOUR DRIVE / OWNER EXPERIENCE SYSTEM

          <span>
            V5.0 — LOCAL PROTOTYPE /
            NO CUSTOMER AUTHENTICATION
          </span>
        </footer>
      </div>

      {preview && (
        <OwnerPreview
          job={{
            ...selected,
            stage,
          }}
          record={record}
          onDecision={updateLine}
          onClose={() =>
            setPreview(false)
          }
        />
      )}
    </main>
  );
}