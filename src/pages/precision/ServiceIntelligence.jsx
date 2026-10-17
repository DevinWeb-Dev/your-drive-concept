
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  FileCheck2,
  Gauge,
  Plus,
  Printer,
  ShieldAlert,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import {
  SERVICES,
  formatPeso,
} from "../../data/autoData.js";

import "../../styles/service-intelligence.css";

const STORAGE_KEY = "your-drive:service-intelligence:v1";

const STAGES = [
  "Intake",
  "Inspection",
  "Approval",
  "In service",
  "Quality check",
  "Handover",
];

const SECTIONS = [
  ["inspection", "01 / Inspection"],
  ["workflow", "02 / Work order"],
  ["estimate", "03 / Estimate desk"],
  ["handover", "04 / Owner report"],
];

const CHECKS = [
  {
    id: "fluids",
    category: "POWERTRAIN",
    label: "Engine oil & fluid condition",
    help: "Visual level and visible contamination",
  },
  {
    id: "leaks",
    category: "POWERTRAIN",
    label: "Visible engine fluid leaks",
    help: "Check for visible drips or residue",
  },
  {
    id: "cooling",
    category: "POWERTRAIN",
    label: "Cooling system overview",
    help: "Hoses, reservoir and visible condition",
  },
  {
    id: "brakes",
    category: "CONTROL",
    label: "Brake pad / rotor condition",
    help: "Visual condition; proper measurement required",
  },
  {
    id: "tires",
    category: "CONTROL",
    label: "Tire tread & visible damage",
    help: "Inspect wear and obvious damage",
  },
  {
    id: "steering",
    category: "CONTROL",
    label: "Steering & suspension",
    help: "Unusual looseness or physical damage",
  },
  {
    id: "battery",
    category: "ELECTRICAL",
    label: "Battery terminals & housing",
    help: "Visible corrosion and connection state",
  },
  {
    id: "lights",
    category: "ELECTRICAL",
    label: "Exterior lighting",
    help: "Function of visible light assemblies",
  },
  {
    id: "dashboard",
    category: "ELECTRICAL",
    label: "Dashboard warning indicators",
    help: "Record driver-reported warnings",
  },
  {
    id: "wipers",
    category: "BODY & CABIN",
    label: "Wipers & windshield",
    help: "Visible damage and cleaning performance",
  },
  {
    id: "ac",
    category: "BODY & CABIN",
    label: "Cabin climate system",
    help: "Driver comfort and air-flow concerns",
  },
  {
    id: "paint",
    category: "BODY & CABIN",
    label: "Body & finish condition",
    help: "Visible wear and detailing observations",
  },
];

const OPTIONS = [
  "Not checked",
  "Pass",
  "Monitor",
  "Attention",
];

const stamp = () => new Date().toISOString();

const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `yd-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

const safeText = (value) =>
  String(value ?? "").trim();

function displayDate(date) {
  if (!date) return "Not scheduled";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "Not scheduled";
  }

  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function readStore() {
  try {
    const value = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "null"
    );

    if (
      value &&
      Array.isArray(value.jobs) &&
      value.jobs.length <= 200
    ) {
      return {
        jobs: value.jobs,
        selected: safeText(value.selected),
      };
    }
  } catch {
    // No saved store.
  }

  return {
    jobs: [],
    selected: "",
  };
}

function newJob(input = {}) {
  const id = uid();

  return {
    id,
    reference: `YDI-${Date.now().toString().slice(-7)}`,
    linkedRequestId: safeText(input.linkedRequestId),

    vehicle:
      safeText(input.vehicle) || "Demo vehicle",

    customer:
      safeText(input.customer) || "Sample customer",

    date: safeText(input.date),
    stage: 0,
    createdAt: stamp(),
    updatedAt: stamp(),

    checks: {},
    notes: "",

    serviceLines: Array.isArray(input.serviceLines)
      ? input.serviceLines
      : [],

    requestEstimate:
      typeof input.requestEstimate === "number"
        ? input.requestEstimate
        : null,

    actions: [
      {
        id: uid(),
        date: stamp(),
        title: "Draft job card created",
      },
    ],
  };
}

function statuses(job) {
  const counts = {
    Pass: 0,
    Monitor: 0,
    Attention: 0,
    "Not checked": 0,
  };

  CHECKS.forEach((item) => {
    const status =
      job.checks?.[item.id]?.status ||
      "Not checked";

    counts[status] =
      (counts[status] ?? 0) + 1;
  });

  return counts;
}

function sumItems(job) {
  return (job.serviceLines || []).reduce(
    (sum, item) =>
      sum + Math.max(
        0,
        Number(item.price) || 0
      ),
    0
  );
}

function downloadText(
  filename,
  contents,
  type
) {
  const url = URL.createObjectURL(
    new Blob([contents], { type })
  );

  const a = document.createElement("a");

  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

function SummaryCard({
  label,
  value,
  note,
  icon: Icon,
}) {
  return (
    <article className="yd3-metric">
      <span>
        {label}
        <Icon size={17} strokeWidth={1.5} />
      </span>

      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export default function ServiceIntelligence({
  vehicles = [],
  requests = [],
}) {
  const [store, setStore] =
    useState(readStore);

  const [tab, setTab] =
    useState("inspection");

  const [preview, setPreview] =
    useState(false);

  const [serviceId, setServiceId] =
    useState(SERVICES[0]?.id || "");

  const [message, setMessage] =
    useState("");

  const [storageError, setStorageError] =
    useState(false);

  const jobs = store.jobs;

  const active =
    jobs.find(
      (job) => job.id === store.selected
    ) || jobs[0] || null;

  const counts =
    active ? statuses(active) : null;

  const total =
    active ? sumItems(active) : 0;

  const evaluated = counts
    ? CHECKS.length - counts["Not checked"]
    : 0;

  const completion =
    Math.round(
      (evaluated / CHECKS.length) * 100
    );

  const unlinked = (
    Array.isArray(requests) ? requests : []
  ).filter(
    (req) =>
      !jobs.some(
        (job) =>
          job.linkedRequestId === req.id
      )
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(store)
      );
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [store]);

  function updateJob(
    patch,
    eventTitle
  ) {
    if (!active) return;

    setStore((old) => ({
      ...old,

      jobs: old.jobs.map((job) =>
        job.id !== active.id
          ? job
          : {
              ...job,
              ...patch,
              updatedAt: stamp(),

              actions: eventTitle
                ? [
                    {
                      id: uid(),
                      date: stamp(),
                      title: eventTitle,
                    },
                    ...(job.actions || []),
                  ].slice(0, 80)
                : job.actions,
            }
      ),
    }));
  }

  function makeSample() {
    if (jobs.length >= 25) {
      setMessage(
        "Maximum 25 draft job cards in this browser."
      );
      return;
    }

    const demo = newJob();

    setStore((old) => ({
      jobs: [
        demo,
        ...old.jobs,
      ],
      selected: demo.id,
    }));

    setTab("inspection");

    setMessage(
      "A fictional job card was added to this browser."
    );
  }

  function fromRequest(id) {
    const req = unlinked.find(
      (item) => item.id === id
    );

    if (!req || jobs.length >= 25) {
      return;
    }

    const car = vehicles.find(
      (v) => v.id === req.savedVehicleId
    );

    const linkedLines = (
      req.serviceIds || []
    )
      .map((selectedServiceId) => {
        const item = SERVICES.find(
          (service) =>
            service.id === selectedServiceId
        );

        return item
          ? {
              id: uid(),
              serviceId: item.id,
              name: item.name,
              price:
                Number(item.basePrice) || 0,
            }
          : null;
      })
      .filter(Boolean);

    const job = newJob({
      linkedRequestId: req.id,

      customer:
        req.requestAlias ||
        "Demo request",

      vehicle: car
        ? `${car.year} ${car.make} ${car.model}`
        : req.vehicleAlias ||
          req.vehicleType ||
          "Unspecified vehicle",

      date: req.date,

      requestEstimate:
        Number.isFinite(Number(req.total))
          ? Number(req.total)
          : null,

      serviceLines: linkedLines,
    });

    setStore((old) => ({
      jobs: [
        job,
        ...old.jobs,
      ],
      selected: job.id,
    }));

    setTab("inspection");

    setMessage(
      "Draft imported read-only from the service request. The original request was not changed."
    );
  }

  function setCheck(id, status) {
    if (!active) return;

    updateJob({
      checks: {
        ...active.checks,

        [id]: {
          ...(active.checks?.[id] || {}),
          status,
        },
      },
    });
  }

  function setCheckNote(id, note) {
    if (!active) return;

    updateJob({
      checks: {
        ...active.checks,

        [id]: {
          ...(active.checks?.[id] || {}),
          note,
        },
      },
    });
  }

  function addService() {
    if (!active) return;

    const service = SERVICES.find(
      (item) => item.id === serviceId
    );

    if (!service) return;

    updateJob(
      {
        serviceLines: [
          ...active.serviceLines,
          {
            id: uid(),
            serviceId: service.id,
            name: service.name,
            price:
              Number(service.basePrice) || 0,
          },
        ],
      },
      `${service.name} added to draft estimate`
    );
  }

  function removeJob() {
    if (
      !active ||
      !window.confirm(
        "Delete this local draft job card? Original booking data will remain unchanged."
      )
    ) {
      return;
    }

    setStore((old) => {
      const rest = old.jobs.filter(
        (job) => job.id !== active.id
      );

      return {
        jobs: rest,
        selected: rest[0]?.id || "",
      };
    });

    setMessage(
      "Draft job card deleted. Original service records untouched."
    );
  }

  function exportJob() {
    if (!active) return;

    downloadText(
      `${active.reference}.json`,

      JSON.stringify(
        {
          schema: "your-drive-inspection-v1",
          exportedAt: stamp(),
          job: active,
        },
        null,
        2
      ),

      "application/json"
    );
  }

  return (
    <main className="yd3-main">
      <section className="yd3-hero">
        <div className="yd3-hero-copy">
          <span className="yd3-eyebrow">
            <span className="yd3-dot" />
            YOUR DRIVE / SERVICE INTELLIGENCE / V3.0
          </span>

          <h1>
            EVERY DETAIL.
            <em>ACCOUNTED FOR.</em>
          </h1>

          <p>
            A digital inspection and repair-job
            experience, designed to make work
            visible from first concern to
            final handover.
          </p>

          <div className="yd3-hero-actions">
            <a
              href="#yd3-workspace"
              className="yd3-button"
            >
              ENTER WORKSPACE
              <ArrowUpRight size={17} />
            </a>

            <Link
              to="/diagnostics"
              className="yd3-hero-link"
            >
              BACK TO DIAGNOSTIC LAB
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <div className="yd3-orbit">
          <div className="yd3-orbit-inner">
            YD
            <span>INTELLIGENCE</span>
          </div>
        </div>

        <span className="yd3-hero-foot">
          PROTOTYPE / NO LIVE VEHICLE CONNECTION /
          BROWSER-LOCAL RECORDS
        </span>
      </section>

      <section
        className="yd3-workspace"
        id="yd3-workspace"
      >
        <div className="yd3-workspace-heading">
          <div>
            <span className="yd3-kicker">
              OPERATIONS / 001
            </span>

            <h2>
              REPAIR <em>INTELLIGENCE.</em>
            </h2>
          </div>

          <p>
            Import a demo service request or
            build a fictional job card.
            No actual workshop booking is created.
          </p>
        </div>

        <div className="yd3-warning">
          <ShieldAlert size={20} />

          <span>
            <strong>
              Interactive concept only.
            </strong>{" "}
            Inspection results, workflow stages
            and estimated amounts are manually
            entered. They are not certified
            diagnostics, invoices, payments or
            confirmed repairs. Do not enter real
            customer personal information.
          </span>
        </div>

        {storageError && (
          <p
            className="yd3-alert"
            role="alert"
          >
            Browser storage unavailable.
            Your edits may not persist.
          </p>
        )}

        {message && (
          <div
            className="yd3-alert"
            role="status"
          >
            {message}

            <button
              aria-label="Dismiss message"
              onClick={() =>
                setMessage("")
              }
            >
              ×
            </button>
          </div>
        )}

        <div className="yd3-manager">
          <aside className="yd3-drawer">
            <span className="yd3-kicker">
              INBOX / LOCAL JOB CARDS
            </span>

            <h3>
              Active drafts
              <strong>
                {jobs.length
                  .toString()
                  .padStart(2, "0")}
              </strong>
            </h3>

            <button
              className="yd3-create"
              onClick={makeSample}
            >
              <Plus size={17} />
              CREATE FICTIONAL JOB
            </button>

            {unlinked.length > 0 && (
              <div className="yd3-import">
                <label htmlFor="yd3-request-select">
                  IMPORT SAVED DEMO REQUEST
                </label>

                <select
                  id="yd3-request-select"
                  defaultValue=""
                  onChange={(e) => {
                    fromRequest(e.target.value);
                    e.target.value = "";
                  }}
                >
                  <option
                    value=""
                    disabled
                  >
                    Choose a request...
                  </option>

                  {unlinked.map((r) => (
                    <option
                      key={r.id}
                      value={r.id}
                    >
                      {r.id} ·{" "}
                      {r.vehicleAlias ||
                        r.vehicleType ||
                        "Vehicle"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="yd3-job-list">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  className={
                    "yd3-job " +
                    (active?.id === job.id
                      ? "active"
                      : "")
                  }
                  onClick={() =>
                    setStore((old) => ({
                      ...old,
                      selected: job.id,
                    }))
                  }
                >
                  <span>
                    {job.reference}
                    <ArrowUpRight size={15} />
                  </span>

                  <strong>
                    {job.vehicle}
                  </strong>

                  <small>
                    {STAGES[job.stage] ||
                      STAGES[0]}
                    {" · "}
                    {displayDate(job.date)}
                  </small>
                </button>
              ))}

              {!jobs.length && (
                <p className="yd3-empty-drawer">
                  No job cards yet.
                  Create a demo draft to begin.
                </p>
              )}
            </div>

            <div className="yd3-drawer-bottom">
              <span>
                READ ONLY LINKS TO ORIGINAL BOOKINGS
              </span>

              <Link to="/garage">
                GO TO MY GARAGE ↗
              </Link>
            </div>
          </aside>

          {!active ? (
            <div className="yd3-no-job">
              <ClipboardList
                size={54}
                strokeWidth={1}
              />

              <span className="yd3-kicker">
                START HERE / WORK ORDER
              </span>

              <h3>
                NOTHING TO INSPECT.
                <em> YET.</em>
              </h3>

              <p>
                Create a fictional vehicle job
                card or import a saved demo
                request to explore the complete
                service workflow.
              </p>

              <button
                onClick={makeSample}
                className="yd3-button"
              >
                CREATE SAMPLE JOB
                <Plus size={17} />
              </button>
            </div>
          ) : (
            <div className="yd3-right">
              <div className="yd3-job-head">
                <div>
                  <span className="yd3-kicker">
                    JOB CARD / {active.reference}
                  </span>

                  <h3>
                    {active.vehicle}
                  </h3>

                  <p>
                    {active.customer} ·{" "}
                    {active.linkedRequestId
                      ? `Linked demo request ${active.linkedRequestId}`
                      : "Independent demonstration"}
                  </p>
                </div>

                <div className="yd3-head-actions">
                  <span className="yd3-status">
                    {STAGES[active.stage] ||
                      STAGES[0]}
                  </span>

                  <button
                    aria-label="Delete draft"
                    title="Delete draft"
                    onClick={removeJob}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              <div className="yd3-metrics">
                <SummaryCard
                  label="INSPECTION COMPLETE"
                  value={`${completion}%`}
                  note={`${evaluated} of ${CHECKS.length} reviewed`}
                  icon={Gauge}
                />

                <SummaryCard
                  label="ATTENTION ITEMS"
                  value={String(
                    counts.Attention
                  ).padStart(2, "0")}
                  note="Requires technician review"
                  icon={ShieldAlert}
                />

                <SummaryCard
                  label="WORKFLOW STAGE"
                  value={`${String(
                    active.stage + 1
                  ).padStart(2, "0")} / 06`}
                  note={STAGES[active.stage]}
                  icon={Clock3}
                />

                <SummaryCard
                  label="DRAFT SERVICE TOTAL"
                  value={formatPeso(total)}
                  note="Illustrative, not an invoice"
                  icon={Wrench}
                />
              </div>

              <div
                className="yd3-tabs"
                role="tablist"
                aria-label="Job card areas"
              >
                {SECTIONS.map(([key, name]) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={tab === key}
                    className={
                      tab === key
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setTab(key)
                    }
                  >
                    {name}
                  </button>
                ))}
              </div>

              {tab === "inspection" && (
                <section className="yd3-panel">
                  <div className="yd3-panel-heading">
                    <div>
                      <span className="yd3-kicker">
                        DIGITAL CONDITION MAP
                      </span>

                      <h3>
                        THE 12-POINT
                        <em> INSPECTION.</em>
                      </h3>

                      <p>
                        Tap the condition recorded
                        for each area. Nothing is
                        measured automatically.
                      </p>
                    </div>

                    <div className="yd3-progress">
                      <strong>
                        {completion}%
                      </strong>

                      <div>
                        <span
                          style={{
                            width:
                              `${completion}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {[
                    ...new Set(
                      CHECKS.map(
                        (c) => c.category
                      )
                    ),
                  ].map((category) => (
                    <div
                      className="yd3-check-group"
                      key={category}
                    >
                      <h4>{category}</h4>

                      {CHECKS.filter(
                        (item) =>
                          item.category ===
                          category
                      ).map((item) => {
                        const finding =
                          active.checks?.[
                            item.id
                          ] || {};

                        return (
                          <div
                            className="yd3-check"
                            key={item.id}
                          >
                            <div className="yd3-check-title">
                              <strong>
                                {item.label}
                              </strong>

                              <small>
                                {item.help}
                              </small>
                            </div>

                            <div
                              className="yd3-condition"
                              aria-label={
                                `${item.label} condition`
                              }
                            >
                              {OPTIONS.map(
                                (option) => (
                                  <button
                                    key={option}
                                    className={
                                      "yd3-condition-option " +
                                      (
                                        finding.status === option ||
                                        (
                                          !finding.status &&
                                          option === "Not checked"
                                        )
                                          ? "selected "
                                          : ""
                                      ) +
                                      option
                                        .toLowerCase()
                                        .replace(/\s+/g, "-")
                                    }
                                    onClick={() =>
                                      setCheck(
                                        item.id,
                                        option
                                      )
                                    }
                                  >
                                    {option}
                                  </button>
                                )
                              )}
                            </div>

                            <input
                              aria-label={
                                `Note for ${item.label}`
                              }
                              maxLength={180}
                              placeholder="Observation / technician note (optional)"
                              value={
                                finding.note || ""
                              }
                              onChange={(e) =>
                                setCheckNote(
                                  item.id,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </section>
              )}

              {tab === "workflow" && (
                <section className="yd3-panel">
                  <div className="yd3-panel-heading">
                    <div>
                      <span className="yd3-kicker">
                        VISUAL REPAIR PROGRESS
                      </span>

                      <h3>
                        FROM CONCERN
                        <em> TO CARE.</em>
                      </h3>

                      <p>
                        Select the internal stage.
                        It does not change original
                        booking status.
                      </p>
                    </div>
                  </div>

                  <div className="yd3-stages">
                    {STAGES.map(
                      (name, index) => (
                        <button
                          key={name}
                          className={
                            index <= active.stage
                              ? "complete"
                              : ""
                          }
                          onClick={() =>
                            updateJob(
                              {
                                stage: index,
                              },
                              `Stage set to ${name}`
                            )
                          }
                        >
                          <span>
                            {index < active.stage ? (
                              <CheckCircle2
                                size={20}
                              />
                            ) : (
                              String(
                                index + 1
                              ).padStart(2, "0")
                            )}
                          </span>

                          <strong>
                            {name}
                          </strong>

                          <small>
                            {index === active.stage
                              ? "CURRENT STAGE"
                              : index < active.stage
                                ? "PREVIOUS"
                                : "PENDING"}
                          </small>
                        </button>
                      )
                    )}
                  </div>

                  <div className="yd3-workflow-bottom">
                    <label className="yd3-field">
                      <span>
                        INTERNAL ADVISOR NOTES
                      </span>

                      <textarea
                        rows={6}
                        maxLength={1500}
                        value={
                          active.notes || ""
                        }
                        placeholder="Internal remarks, handover preparation, next actions..."
                        onChange={(e) =>
                          updateJob({
                            notes:
                              e.target.value,
                          })
                        }
                      />
                    </label>

                    <aside>
                      <span className="yd3-kicker">
                        ACTIVITY FEED
                      </span>

                      {(active.actions || [])
                        .slice(0, 8)
                        .map((item) => (
                          <div key={item.id}>
                            <strong>
                              {item.title}
                            </strong>
                            <small>
                              {displayDate(
                                item.date
                              )}
                            </small>
                          </div>
                        ))}
                    </aside>
                  </div>
                </section>
              )}

              {tab === "estimate" && (
                <section className="yd3-panel">
                  <div className="yd3-panel-heading">
                    <div>
                      <span className="yd3-kicker">
                        PROPOSAL CONFIGURATION
                      </span>

                      <h3>
                        THE ESTIMATE
                        <em> DESK.</em>
                      </h3>

                      <p>
                        Add illustrative services
                        from the existing catalog.
                        This does not modify the
                        original estimate engine.
                      </p>
                    </div>
                  </div>

                  <div className="yd3-add-line">
                    <select
                      aria-label="Choose catalog service"
                      value={serviceId}
                      onChange={(e) =>
                        setServiceId(
                          e.target.value
                        )
                      }
                    >
                      {SERVICES.map(
                        (item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                            {" · "}
                            {formatPeso(
                              item.basePrice
                            )}
                          </option>
                        )
                      )}
                    </select>

                    <button
                      className="yd3-button"
                      onClick={addService}
                    >
                      ADD LINE
                      <Plus size={17} />
                    </button>
                  </div>

                  <div className="yd3-estimate-lines">
                    {active.serviceLines.map(
                      (line, index) => (
                        <div
                          key={line.id}
                          className="yd3-line"
                        >
                          <span>
                            {String(
                              index + 1
                            ).padStart(2, "0")}
                          </span>

                          <strong>
                            {line.name}
                          </strong>

                          <label>
                            <small>
                              PHP / EST.
                            </small>

                            <input
                              aria-label={
                                `Price for ${line.name}`
                              }
                              type="number"
                              min="0"
                              max="9999999"
                              step="50"
                              value={
                                line.price
                              }
                              onChange={(e) =>
                                updateJob({
                                  serviceLines:
                                    active.serviceLines.map(
                                      (entry) =>
                                        entry.id ===
                                        line.id
                                          ? {
                                              ...entry,
                                              price:
                                                Math.max(
                                                  0,
                                                  Math.min(
                                                    9999999,
                                                    Number(
                                                      e.target.value
                                                    ) || 0
                                                  )
                                                ),
                                            }
                                          : entry
                                    ),
                                })
                              }
                            />
                          </label>

                          <button
                            aria-label={
                              `Remove ${line.name}`
                            }
                            onClick={() =>
                              updateJob({
                                serviceLines:
                                  active.serviceLines.filter(
                                    (entry) =>
                                      entry.id !==
                                      line.id
                                  ),
                              })
                            }
                          >
                            <X size={17} />
                          </button>
                        </div>
                      )
                    )}

                    {!active.serviceLines.length && (
                      <p className="yd3-empty">
                        No proposed services.
                        Add one above to begin.
                      </p>
                    )}
                  </div>

                  <div className="yd3-estimate-total">
                    <div>
                      <span>
                        WORKING ESTIMATE
                      </span>

                      <small>
                        {active.requestEstimate == null
                          ? "No linked booking total"
                          : `Original request estimate: ${formatPeso(
                              active.requestEstimate
                            )}`}
                      </small>
                    </div>

                    <strong>
                      {formatPeso(total)}
                    </strong>
                  </div>

                  <p className="yd3-disclaimer">
                    Displayed prices are editable
                    samples. Taxes, parts sourcing,
                    diagnostic findings and actual
                    repair approvals are not
                    represented.
                  </p>
                </section>
              )}

              {tab === "handover" && (
                <section className="yd3-panel yd3-handover-panel">
                  <div className="yd3-panel-heading">
                    <div>
                      <span className="yd3-kicker">
                        QUALITY OF COMMUNICATION
                      </span>

                      <h3>
                        AN OWNER-READY
                        <em> REPORT.</em>
                      </h3>

                      <p>
                        Generate a print-ready
                        summary containing only
                        service details, inspection
                        observations and proposed
                        work. Internal advisor notes
                        stay private.
                      </p>
                    </div>
                  </div>

                  <div className="yd3-report-actions">
                    <button
                      className="yd3-button"
                      onClick={() =>
                        setPreview(true)
                      }
                    >
                      OPEN OWNER REPORT
                      <ArrowUpRight
                        size={17}
                      />
                    </button>

                    <button
                      className="yd3-secondary"
                      onClick={exportJob}
                    >
                      <Download size={16} />
                      EXPORT DRAFT JSON
                    </button>
                  </div>

                  <div className="yd3-handover-preview">
                    <FileCheck2
                      size={43}
                    />

                    <div>
                      <strong>
                        {active.reference}
                      </strong>

                      <span>
                        {active.vehicle}
                      </span>

                      <small>
                        {evaluated} inspections
                        recorded ·{" "}
                        {active.serviceLines.length}{" "}
                        proposed service items ·{" "}
                        {STAGES[active.stage]}
                      </small>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </section>

      {preview && active && (
        <div
          className="yd3-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Customer report preview"
        >
          <div className="yd3-modal-actions">
            <span>
              OWNER REPORT / PREVIEW ONLY
            </span>

            <div>
              <button
                onClick={() =>
                  window.print()
                }
              >
                <Printer size={16} />
                PRINT
              </button>

              <button
                onClick={() =>
                  setPreview(false)
                }
              >
                <X size={16} />
                CLOSE
              </button>
            </div>
          </div>

          <article className="yd3-report">
            <div className="yd3-report-top">
              <div>
                <span>
                  YOUR DRIVE / PRECISION SERVICE
                </span>

                <h2>
                  VEHICLE
                  <em> CARE REPORT.</em>
                </h2>
              </div>

              <div>
                <b>
                  {active.reference}
                </b>

                <small>
                  {displayDate(
                    active.updatedAt
                  )}
                </small>
              </div>
            </div>

            <div className="yd3-report-facts">
              <div>
                <span>VEHICLE</span>
                <strong>
                  {active.vehicle}
                </strong>
              </div>

              <div>
                <span>REFERENCE</span>
                <strong>
                  {active.reference}
                </strong>
              </div>

              <div>
                <span>WORKFLOW</span>
                <strong>
                  {STAGES[active.stage]}
                </strong>
              </div>
            </div>

            <h3>
              INSPECTION OBSERVATIONS
            </h3>

            <div className="yd3-report-checks">
              {CHECKS.filter(
                (c) =>
                  (
                    active.checks?.[
                      c.id
                    ]?.status ||
                    "Not checked"
                  ) !== "Not checked"
              ).map((c) => (
                <div key={c.id}>
                  <strong>
                    {c.label}
                  </strong>

                  <span>
                    {
                      active.checks[
                        c.id
                      ].status
                    }
                  </span>

                  <p>
                    {
                      active.checks[
                        c.id
                      ].note ||
                      "No additional note"
                    }
                  </p>
                </div>
              ))}

              {evaluated === 0 && (
                <p>
                  No inspections have been
                  recorded.
                </p>
              )}
            </div>

            <h3>
              PROPOSED SERVICE WORK
            </h3>

            <div className="yd3-report-lines">
              {active.serviceLines.map(
                (line) => (
                  <div key={line.id}>
                    <span>
                      {line.name}
                    </span>

                    <strong>
                      {formatPeso(
                        line.price
                      )}
                    </strong>
                  </div>
                )
              )}

              {!active.serviceLines.length && (
                <p>
                  No services proposed.
                </p>
              )}
            </div>

            <div className="yd3-report-total">
              <span>
                ILLUSTRATIVE SERVICE ESTIMATE
              </span>

              <strong>
                {formatPeso(total)}
              </strong>
            </div>

            <p className="yd3-report-legal">
              Concept-only summary. It is not a
              signed inspection, mechanical
              certification, completed repair
              record, tax invoice, accepted
              quotation or proof of payment.
              Vehicle safety must be assessed
              by a qualified professional.
            </p>

            <div className="yd3-report-footer">
              YOUR DRIVE. / ENGINEERED FOR
              THE ROAD AHEAD.
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
