import { useMemo, useState } from "react";

import {
  Link,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Gauge,
  Search,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react";

import {
  APPOINTMENT_TIMES,
  findService,
  formatDate,
  formatPeso,
  localDateKey,
} from "../../data/autoData.js";

import {
  WORK_STAGES,
  TECHNICIANS,
  SERVICE_BAYS,
  WORK_TASKS,
  getWork,
  stageName,
  shortRequest,
  daySummary,
} from "../../data/workshopOps.js";

// ========================================
// REUSABLE OPERATIONS COMPONENTS
// ========================================

function Heading({
  eyebrow,
  title,
  accent,
  description,
  children,
}) {
  return (
    <div className="yd3-page-heading">
      <div>
        <span className="yd3-kicker">
          {eyebrow}
        </span>

        <h1>
          {title} <em>{accent}</em>
        </h1>

        <p>{description}</p>
      </div>

      {children}
    </div>
  );
}

function Badge({
  stage,
  cancelled = false,
}) {
  return (
    <span
      className={`yd3-badge ${
        cancelled
          ? "is-cancelled"
          : `stage-${stage}`
      }`}
    >
      {cancelled
        ? "Cancelled draft"
        : stageName(stage)}
    </span>
  );
}

function Empty({
  title = "No demo requests found.",
  description = "Create a sample service request from the public appointment planner.",
}) {
  return (
    <div className="yd3-empty">
      <ClipboardCheck size={35} />

      <h3>{title}</h3>
      <p>{description}</p>

      <Link
        to="/book"
        className="yd3-button"
      >
        Open Appointment Planner
        <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}

function RequestTile({
  request,
  operations,
  children,
}) {
  const work = getWork(
    operations,
    request.id
  );

  const time =
    APPOINTMENT_TIMES.find(
      (t) => t.id === request.time
    )?.name || request.time;

  return (
    <article className="yd3-request">
      <div className="yd3-request-top">
        <small>
          {shortRequest(request)}
        </small>

        <Badge
          stage={work.stage}
          cancelled={
            request.status === "cancelled"
          }
        />
      </div>

      <h3>{request.requestAlias}</h3>

      <p>
        <CarFront size={16} />
        {request.vehicleAlias}
      </p>

      <p>
        <CalendarDays size={16} />
        {formatDate(request.date)}
        {" · "}
        {time}
      </p>

      <p>
        <Wrench size={16} />
        {(request.serviceIds || []).length}
        {" "}services ·{" "}
        {formatPeso(request.total)}
        {" "}demo estimate
      </p>

      {children}
    </article>
  );
}

// ========================================
// PAGE 1 — WORKSHOP COMMAND CENTER
// ========================================

export function CommandCenterPage() {
  const {
    requests,
    operations,
  } = useOutletContext();

  const active = requests.filter(
    (r) => r.status !== "cancelled"
  );

  const unassigned = active.filter(
    (r) =>
      !getWork(operations, r.id).technicianId
  );

  const today = localDateKey();

  const todayPlans = active.filter(
    (r) => r.date === today
  );

  const upcoming = [...active]
    .filter((r) => r.date >= today)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        a.time.localeCompare(b.time)
    );

  const status = WORK_STAGES.map(
    (stage) => ({
      ...stage,

      count: active.filter(
        (r) =>
          getWork(
            operations,
            r.id
          ).stage === stage.id
      ).length,
    })
  );

  const max = Math.max(
    1,
    ...status.map((s) => s.count)
  );

  return (
    <div className="yd3-page">
      <Heading
        eyebrow="OPERATIONS / OVERVIEW"
        title="THE WORKSHOP"
        accent="PULSE."
        description="A command view of saved fictional service requests and illustrative planning assignments."
      >
        <Link
          to="/workshop/desk"
          className="yd3-button"
        >
          Open Service Desk
          <ArrowUpRight size={17} />
        </Link>
      </Heading>

      <div className="yd3-kpis">
        <article>
          <ClipboardCheck size={24} />

          <strong>
            {active.length}
          </strong>

          <span>Active request drafts</span>
          <small>Not confirmed appointments</small>
        </article>

        <article>
          <UsersRound size={24} />

          <strong>
            {unassigned.length}
          </strong>

          <span>Without demo technician</span>
          <small>Staff assignment concepts</small>
        </article>

        <article>
          <CalendarDays size={24} />

          <strong>
            {todayPlans.length}
          </strong>

          <span>Drafts proposed today</span>
          <small>Not a real workshop schedule</small>
        </article>

        <article>
          <Gauge size={24} />

          <strong>
            {
              active.filter(
                (r) =>
                  getWork(
                    operations,
                    r.id
                  ).stage === "review"
              ).length
            }
          </strong>

          <span>In simulated review</span>
          <small>No actual work performed</small>
        </article>
      </div>

      <div className="yd3-dashboard-grid">
        <section className="yd3-panel">
          <span className="yd3-kicker">
            SAMPLE WORKFLOW PIPELINE
          </span>

          <h2>
            Planning <em>stages.</em>
          </h2>

          <div className="yd3-progress-list">
            {status.map((item) => (
              <div
                className="yd3-progress-row"
                key={item.id}
              >
                <div>
                  <strong>
                    {item.label}
                  </strong>

                  <span>
                    {item.count} draft
                    {item.count === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="yd3-progress-track">
                  <span
                    style={{
                      width: `${
                        (item.count / max) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="yd3-panel">
          <span className="yd3-kicker">
            UPCOMING PROPOSALS
          </span>

          <h2>
            What's <em>next.</em>
          </h2>

          {upcoming.length ? (
            <div className="yd3-short-list">
              {upcoming.slice(0, 5).map((r) => (
                <Link
                  key={r.id}
                  to={`/workshop/desk?request=${encodeURIComponent(
                    r.id
                  )}`}
                >
                  <span>
                    <strong>
                      {r.requestAlias}
                    </strong>

                    <small>
                      {formatDate(r.date)}
                      {" / "}
                      {r.time}
                    </small>
                  </span>

                  <ChevronRight size={18} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="yd3-muted">
              No upcoming local proposals.
              Create a demo request to
              populate your dashboard.
            </p>
          )}
        </section>
      </div>

      <div className="yd3-quick-links">
        <Link to="/workshop/team">
          <UsersRound />
          Technician Board
          <ArrowRight size={17} />
        </Link>

        <Link to="/workshop/bays">
          <CalendarDays />
          Service Bay Planner
          <ArrowRight size={17} />
        </Link>
      </div>

      <p className="yd3-disclaimer">
        <ShieldCheck size={19} />
        All figures come exclusively from
        fictional, browser-local requests.
        Nothing shown indicates real staffing,
        capacity, earnings, or completed repairs.
      </p>
    </div>
  );
}

// ========================================
// PAGE 2 — SERVICE REQUEST DESK
// ========================================

export function ServiceDeskPage() {
  const {
    requests,
    operations,
    onUpdateWork,
    onToggleTask,
  } = useOutletContext();

  const [params] = useSearchParams();

  const [search, setSearch] =
    useState("");

  const [stage, setStage] =
    useState("all");

  const [selectedId, setSelectedId] =
    useState(
      () => params.get("request") || ""
    );

  const [noteDraft, setNoteDraft] =
    useState("");

  const [feedback, setFeedback] =
    useState("");

  const ordered = [...requests].sort(
    (a, b) =>
      (b.createdAt || "").localeCompare(
        a.createdAt || ""
      )
  );

  const filtered = ordered.filter((r) => {
    const match =
      `${r.requestAlias} ${r.vehicleAlias} ${r.id}`
        .toLowerCase()
        .includes(
          search.toLowerCase()
        );

    const stageMatch =
      stage === "all" ||
      (stage === "cancelled"
        ? r.status === "cancelled"
        : r.status !== "cancelled" &&
          getWork(operations, r.id).stage ===
            stage);

    return match && stageMatch;
  });

  const selected =
    filtered.find(
      (r) => r.id === selectedId
    ) ||
    filtered[0] ||
    null;

  const work = selected
    ? getWork(operations, selected.id)
    : null;

  const editingAllowed =
    selected?.status !== "cancelled";

  function choose(id) {
    setSelectedId(id);

    setNoteDraft(
      getWork(operations, id).note
    );

    setFeedback("");
  }

  function saveNote() {
    if (!selected || !editingAllowed) {
      return;
    }

    onUpdateWork(selected.id, {
      note:
        selectedId === selected.id
          ? noteDraft
          : work.note,
    });

    setFeedback(
      "Planning note saved to this browser."
    );
  }

  return (
    <div className="yd3-page">
      <Heading
        eyebrow="OPERATIONS / SERVICE REQUESTS"
        title="SERVICE"
        accent="DESK."
        description="Review demo proposals, set planning stages, allocate sample staff and bays, and complete a concept checklist."
      />

      <div className="yd3-desk">
        <section className="yd3-panel yd3-desk-list">
          <div className="yd3-filters">
            <label>
              <Search size={17} />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search demo requests"
                aria-label="Search demo requests"
              />
            </label>

            <select
              aria-label="Filter by stage"
              value={stage}
              onChange={(e) =>
                setStage(e.target.value)
              }
            >
              <option value="all">
                All requests
              </option>

              {WORK_STAGES.map((s) => (
                <option
                  key={s.id}
                  value={s.id}
                >
                  {s.label}
                </option>
              ))}

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </div>

          <div className="yd3-list-scroll">
            {filtered.length ? (
              filtered.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() =>
                    choose(r.id)
                  }
                  className={`yd3-select-request ${
                    selected?.id === r.id
                      ? "is-selected"
                      : ""
                  }`}
                  aria-pressed={
                    selected?.id === r.id
                  }
                >
                  <small>
                    {shortRequest(r)}
                  </small>

                  <strong>
                    {r.requestAlias}
                  </strong>

                  <span>
                    {r.vehicleAlias}
                    {" · "}
                    {r.date}
                  </span>

                  <Badge
                    stage={
                      getWork(
                        operations,
                        r.id
                      ).stage
                    }
                    cancelled={
                      r.status === "cancelled"
                    }
                  />
                </button>
              ))
            ) : (
              <p className="yd3-muted">
                No matching drafts.
              </p>
            )}
          </div>
        </section>

        <section className="yd3-panel yd3-detail">
          {!selected ? (
            <Empty />
          ) : (
            <>
              <span className="yd3-kicker">
                SELECTED DEMO REQUEST /{" "}
                {shortRequest(selected)}
              </span>

              <h2>
                {selected.requestAlias}
              </h2>

              <div className="yd3-detail-facts">
                <span>
                  <CarFront size={16} />
                  {selected.vehicleAlias}
                </span>

                <span>
                  <CalendarDays size={16} />
                  {formatDate(selected.date)}
                </span>

                <span>
                  <Clock3 size={16} />
                  {selected.time}
                </span>

                <span>
                  {formatPeso(selected.total)}
                  {" "}sample estimate
                </span>
              </div>

              <div className="yd3-services">
                <strong>
                  Selected demo services
                </strong>

                <div>
                  {(selected.serviceIds || []).map(
                    (id) => (
                      <span key={id}>
                        {findService(id)?.name || id}
                      </span>
                    )
                  )}
                </div>
              </div>

              {selected.status === "cancelled" && (
                <p className="yd3-alert">
                  This request was cancelled
                  in My Garage. Operations are
                  read-only for this draft.
                </p>
              )}

              <div className="yd3-fields">
                <label>
                  <span>PLANNING STAGE</span>

                  <select
                    disabled={!editingAllowed}
                    value={work.stage}
                    onChange={(e) =>
                      onUpdateWork(
                        selected.id,
                        {
                          stage: e.target.value,
                        }
                      )
                    }
                  >
                    {WORK_STAGES.map((s) => (
                      <option
                        key={s.id}
                        value={s.id}
                      >
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>
                    FICTIONAL TECHNICIAN
                  </span>

                  <select
                    disabled={!editingAllowed}
                    value={work.technicianId}
                    onChange={(e) =>
                      onUpdateWork(
                        selected.id,
                        {
                          technicianId:
                            e.target.value,
                        }
                      )
                    }
                  >
                    <option value="">
                      Not assigned
                    </option>

                    {TECHNICIANS.map((tech) => (
                      <option
                        key={tech.id}
                        value={tech.id}
                      >
                        {tech.name}
                        {" — "}
                        {tech.focus}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>
                    WORKSPACE / SERVICE BAY
                  </span>

                  <select
                    disabled={!editingAllowed}
                    value={work.bayId}
                    onChange={(e) =>
                      onUpdateWork(
                        selected.id,
                        {
                          bayId:
                            e.target.value,
                        }
                      )
                    }
                  >
                    <option value="">
                      Not assigned
                    </option>

                    {SERVICE_BAYS.map((bay) => (
                      <option
                        key={bay.id}
                        value={bay.id}
                      >
                        {bay.name}
                        {" — "}
                        {bay.focus}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="yd3-checklist">
                <div>
                  <span className="yd3-kicker">
                    ILLUSTRATIVE WORKFLOW
                  </span>

                  <strong>
                    {work.tasks.length}
                    /{WORK_TASKS.length} checked
                  </strong>
                </div>

                {WORK_TASKS.map((task) => (
                  <label key={task.id}>
                    <input
                      type="checkbox"
                      checked={work.tasks.includes(
                        task.id
                      )}
                      disabled={!editingAllowed}
                      onChange={() =>
                        onToggleTask(
                          selected.id,
                          task.id
                        )
                      }
                    />

                    <span>
                      {task.name}
                    </span>
                  </label>
                ))}
              </div>

              <label className="yd3-note">
                <span className="yd3-kicker">
                  PRIVATE DEMO PLANNING NOTE
                </span>

                <textarea
                  rows={4}
                  maxLength={400}
                  disabled={!editingAllowed}
                  value={
                    selectedId === selected.id
                      ? noteDraft
                      : work.note
                  }
                  onChange={(e) => {
                    setSelectedId(selected.id);
                    setNoteDraft(e.target.value);
                    setFeedback("");
                  }}
                  placeholder="Add fictional operations notes only..."
                />
              </label>

              <button
                type="button"
                disabled={!editingAllowed}
                className="yd3-button"
                onClick={saveNote}
              >
                Save Planning Note
                <Check size={18} />
              </button>

              {feedback && (
                <p
                  className="yd3-confirm"
                  role="status"
                >
                  {feedback}
                </p>
              )}
            </>
          )}
        </section>
      </div>

      <p className="yd3-disclaimer">
        <ShieldCheck size={19} />
        Planning stages and checkmarks
        simulate a workshop process.
        They do not prove diagnostics,
        service delivery, or completion
        of safety checks.
      </p>
    </div>
  );
}

// ========================================
// PAGE 3 — TECHNICIAN BOARD
// ========================================

export function TechnicianBoardPage() {
  const {
    requests,
    operations,
    onUpdateWork,
  } = useOutletContext();

  const active = requests.filter(
    (r) => r.status !== "cancelled"
  );

  const teams = [
    {
      id: "",
      name: "Unassigned",
      initials: "?",
      focus: "Waiting for a demo technician",
    },
    ...TECHNICIANS,
  ];

  return (
    <div className="yd3-page">
      <Heading
        eyebrow="OPERATIONS / RESOURCE CONCEPT"
        title="THE TEAM"
        accent="BOARD."
        description="Assign fictional technicians to service proposals. Cards update immediately and persist locally."
      />

      <div className="yd3-team-grid">
        {teams.map((team) => {
          const jobs = active.filter(
            (r) =>
              getWork(
                operations,
                r.id
              ).technicianId === team.id
          );

          return (
            <section
              className="yd3-team-column"
              key={team.id || "unassigned"}
            >
              <div className="yd3-team-heading">
                <span className="yd3-avatar">
                  {team.initials}
                </span>

                <div>
                  <h2>
                    {team.name}
                  </h2>

                  <p>
                    {team.focus}
                  </p>
                </div>

                <strong>
                  {jobs.length}
                </strong>
              </div>

              <div className="yd3-team-cards">
                {jobs.length ? (
                  jobs.map((r) => (
                    <RequestTile
                      key={r.id}
                      request={r}
                      operations={operations}
                    >
                      <label className="yd3-small-select">
                        <span>
                          Reassign demo technician
                        </span>

                        <select
                          aria-label={`Reassign ${r.requestAlias}`}
                          value={team.id}
                          onChange={(e) =>
                            onUpdateWork(r.id, {
                              technicianId:
                                e.target.value,
                            })
                          }
                        >
                          <option value="">
                            Unassigned
                          </option>

                          {TECHNICIANS.map(
                            (t) => (
                              <option
                                key={t.id}
                                value={t.id}
                              >
                                {t.name}
                              </option>
                            )
                          )}
                        </select>
                      </label>

                      <Link
                        to={`/workshop/desk?request=${encodeURIComponent(
                          r.id
                        )}`}
                        className="yd3-mini-link"
                      >
                        Open planning checklist
                        <ArrowRight size={15} />
                      </Link>
                    </RequestTile>
                  ))
                ) : (
                  <p className="yd3-team-empty">
                    No fictional proposals
                    in this column.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="yd3-disclaimer">
        <ShieldCheck size={19} />
        These are example technician identities
        and conceptual assignments, not
        real staff schedules or service work.
      </p>
    </div>
  );
}

// ========================================
// PAGE 4 — SERVICE BAY PLANNER
// ========================================

export function ServiceBayPage() {
  const {
    requests,
    operations,
    onUpdateWork,
  } = useOutletContext();

  const [date, setDate] =
    useState(localDateKey());

  const active = requests.filter(
    (r) =>
      r.status !== "cancelled" &&
      r.date === date
  );

  const unassigned = active.filter(
    (r) => !getWork(operations, r.id).bayId
  );

  const summary = daySummary(
    requests,
    operations,
    date
  );

  return (
    <div className="yd3-page">
      <Heading
        eyebrow="OPERATIONS / DAILY LAYOUT"
        title="SERVICE BAY"
        accent="PLANNER."
        description="Explore a fictional workshop floor with time-based proposal markers. Duplicate slots are shown as conflicts, never confirmed availability."
      />

      <div className="yd3-date-panel">
        <label>
          <span>
            PROPOSED SERVICE DATE
          </span>

          <input
            aria-label="Planning date"
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />
        </label>

        <div>
          <strong>
            {summary.total}
          </strong>

          <span>
            Demo proposals this date
          </span>
        </div>

        <div>
          <strong>
            {unassigned.length}
          </strong>

          <span>
            Without sample bay
          </span>
        </div>
      </div>

      <div
        className="yd3-table-wrap"
        role="region"
        aria-label="Daily service bay planning matrix"
        tabIndex={0}
      >
        <table className="yd3-bay-table">
          <thead>
            <tr>
              <th>TIME</th>

              {SERVICE_BAYS.map((bay) => (
                <th key={bay.id}>
                  {bay.name}

                  <small>
                    {bay.focus}
                  </small>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {APPOINTMENT_TIMES.map(
              (slot) => (
                <tr key={slot.id}>
                  <th scope="row">
                    {slot.name}
                  </th>

                  {SERVICE_BAYS.map((bay) => {
                    const matches =
                      active.filter(
                        (r) =>
                          r.time === slot.id &&
                          getWork(
                            operations,
                            r.id
                          ).bayId === bay.id
                      );

                    return (
                      <td
                        key={bay.id}
                        className={
                          matches.length > 1
                            ? "has-conflict"
                            : ""
                        }
                      >
                        {matches.length ? (
                          matches.map((r) => (
                            <Link
                              key={r.id}
                              to={`/workshop/desk?request=${encodeURIComponent(
                                r.id
                              )}`}
                              className="yd3-bay-request"
                            >
                              <strong>
                                {r.requestAlias}
                              </strong>

                              <small>
                                {r.vehicleAlias}
                              </small>
                            </Link>
                          ))
                        ) : (
                          <span className="yd3-empty-cell">
                            No saved drafts
                          </span>
                        )}

                        {matches.length > 1 && (
                          <small className="yd3-clash">
                            {matches.length} plans
                            overlap in this demo
                          </small>
                        )}
                      </td>
                    );
                  })}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <section className="yd3-panel yd3-unassigned">
        <span className="yd3-kicker">
          SAVED PLANS WITH NO DEMO BAY
        </span>

        <h2>
          Needs <em>placement.</em>
        </h2>

        {unassigned.length ? (
          <div className="yd3-unassigned-grid">
            {unassigned.map((r) => (
              <RequestTile
                key={r.id}
                request={r}
                operations={operations}
              >
                <label className="yd3-small-select">
                  <span>
                    Assign simulated bay
                  </span>

                  <select
                    value=""
                    aria-label={`Assign bay to ${r.requestAlias}`}
                    onChange={(e) =>
                      onUpdateWork(r.id, {
                        bayId: e.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select bay...
                    </option>

                    {SERVICE_BAYS.map((bay) => (
                      <option
                        key={bay.id}
                        value={bay.id}
                      >
                        {bay.name}
                      </option>
                    ))}
                  </select>
                </label>
              </RequestTile>
            ))}
          </div>
        ) : (
          <p className="yd3-muted">
            No unassigned proposals for
            this selected date.
          </p>
        )}
      </section>

      <p className="yd3-disclaimer">
        <ShieldCheck size={19} />
        This is a visualization of locally
        saved preferences only. It is not
        a real bay availability or reservation
        management service.
      </p>
    </div>
  );
}