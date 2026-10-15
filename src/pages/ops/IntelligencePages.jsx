import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useOutletContext,
} from "react-router-dom";

import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Database,
  Download,
  Gauge,
  Info,
  Layers3,
  RefreshCcw,
  Settings2,
  ShieldCheck,
  TrendingUp,
  Upload,
  UsersRound,
  Wrench,
} from "lucide-react";

import {
  formatPeso,
} from "../../data/autoData.js";

import {
  DEFAULT_STUDIO_SETTINGS,
  buildWorkshopIntelligence,
  makeDemoBackup,
  parseDemoBackup,
} from "../../data/workshopIntelligence.js";

import "../../styles/intelligence.css";

// ========================================
// SHARED INTELLIGENCE COMPONENTS
// ========================================

function PageHeading({
  eyebrow,
  title,
  accent,
  description,
  children,
}) {
  return (
    <div className="ydi-heading">
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

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}) {
  return (
    <article className="ydi-metric">
      <span className="ydi-metric-icon">
        <Icon size={23} />
      </span>

      <strong>{value}</strong>

      <span>{label}</span>

      <small>{detail}</small>
    </article>
  );
}

function Bars({
  items,
  emptyText = "No fictional activity yet.",
  format = (value) => String(value),
}) {
  const maximum = Math.max(
    1,
    ...items.map((item) => item.count)
  );

  return (
    <div className="ydi-bars">
      {items.every((item) => item.count === 0) && (
        <p className="ydi-muted">
          {emptyText}
        </p>
      )}

      {items.map((item) => (
        <div
          className="ydi-bar-item"
          key={item.id || item.key}
        >
          <div className="ydi-bar-labels">
            <strong>
              {item.name || item.label}
            </strong>

            <span>
              {format(item.count)}
            </span>
          </div>

          <div
            className="ydi-bar-track"
            role="img"
            aria-label={
              `${item.name || item.label}: ` +
              `${format(item.count)}`
            }
          >
            <span
              style={{
                width:
                  item.count === 0
                    ? "0%"
                    : `${
                        (item.count / maximum) * 100
                      }%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Notice({ children }) {
  return (
    <div className="ydi-notice">
      <ShieldCheck size={21} />
      <p>{children}</p>
    </div>
  );
}

function useIntelligence() {
  const context = useOutletContext();

  const data = useMemo(
    () =>
      buildWorkshopIntelligence({
        requests: context.requests,
        workshop: context.operations,
        vehicles: context.vehicles,
        serviceLogs: context.serviceLogs,
      }),
    [
      context.requests,
      context.operations,
      context.vehicles,
      context.serviceLogs,
    ]
  );

  return {
    ...context,
    intelligence: data,
  };
}

// ========================================
// PAGE 1 — REPORTS & TRENDS
// ========================================

export function ReportsPage() {
  const {
    intelligence: data,
    settings,
  } = useIntelligence();

  const highestMonth = Math.max(
    1,
    ...data.monthlyPlans.map(
      (item) => item.count
    )
  );

  const maximumDaily = Math.max(
    1,
    ...data.nextSevenDays.map(
      (day) => day.count
    ),
    settings.dailyPlanningGoal
  );

  return (
    <div className="yd3-page ydi-page">
      <PageHeading
        eyebrow="BUSINESS INTELLIGENCE / 01"
        title="REPORTS"
        accent="& TRENDS."
        description="Understand your saved demo request patterns, sample estimate totals, and simulated workflow assignments."
      />

      <div className="ydi-metrics">
        <Metric
          icon={BarChart3}
          value={data.activeRequests}
          label="Active demo proposals"
          detail="Not confirmed bookings"
        />

        <Metric
          icon={Gauge}
          value={formatPeso(
            data.plannedValue
          )}
          label="Combined indicative estimates"
          detail="Not actual revenue"
        />

        <Metric
          icon={TrendingUp}
          value={formatPeso(
            data.averageEstimate
          )}
          label="Average demo estimate"
          detail="Among active request drafts"
        />

        <Metric
          icon={UsersRound}
          value={data.assignedTechnicians}
          label="Assigned sample technicians"
          detail="Fictional assignments"
        />
      </div>

      <div className="ydi-two-columns">
        <section className="ydi-panel">
          <div className="ydi-panel-heading">
            <span className="yd3-kicker">
              PROPOSED SERVICE MONTH
            </span>

            <h2>
              Planning <em>horizon.</em>
            </h2>

            <p>
              Number of active fictional requests
              grouped by proposed visit month.
            </p>
          </div>

          <div className="ydi-month-chart">
            {data.monthlyPlans.map(
              (month) => (
                <div
                  key={month.key}
                  className="ydi-month-column"
                >
                  <span>
                    {month.count}
                  </span>

                  <div className="ydi-month-bar-space">
                    <div
                      style={{
                        height:
                          month.count === 0
                            ? "0%"
                            : `${
                                (month.count /
                                  highestMonth) *
                                100
                              }%`,
                      }}
                    />
                  </div>

                  <small>
                    {month.label}
                  </small>
                </div>
              )
            )}
          </div>
        </section>

        <section className="ydi-panel">
          <div className="ydi-panel-heading">
            <span className="yd3-kicker">
              WORKSHOP DEMONSTRATION
            </span>

            <h2>
              Workflow <em>mix.</em>
            </h2>

            <p>
              Active proposals across the
              planning stages of the concept.
            </p>
          </div>

          <Bars items={data.stageTotals} />
        </section>
      </div>

      <section className="ydi-panel">
        <div className="ydi-panel-heading">
          <span className="yd3-kicker">
            UPCOMING SEVEN DAYS
          </span>

          <h2>
            Daily <em>planning.</em>
          </h2>

          <p>
            A comparison between your configurable
            demo planning target and saved draft
            requests. It does not represent
            actual workshop capacity.
          </p>
        </div>

        <div className="ydi-day-chart">
          {data.nextSevenDays.map(
            (day) => {
              const progress =
                (day.count / maximumDaily) *
                100;

              const target =
                (settings.dailyPlanningGoal /
                  maximumDaily) *
                100;

              return (
                <div
                  className="ydi-day-row"
                  key={day.date}
                >
                  <strong>
                    {day.label}
                  </strong>

                  <div className="ydi-day-track">
                    <span
                      className="ydi-day-target"
                      style={{
                        left: `${target}%`,
                      }}
                      aria-hidden="true"
                    />

                    <span
                      className="ydi-day-fill"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <b>{day.count}</b>
                </div>
              );
            }
          )}
        </div>

        <p className="ydi-helper">
          Vertical markers show the current
          illustrative daily target:{" "}
          <strong>
            {settings.dailyPlanningGoal} plans
          </strong>.
        </p>
      </section>

      <div className="ydi-summary-strip">
        <div>
          <CalendarDays size={24} />
          <strong>
            {data.totalRequests}
          </strong>
          <span>
            Total saved request drafts
          </span>
        </div>

        <div>
          <CarFront size={24} />
          <strong>
            {data.savedVehicles}
          </strong>
          <span>
            Local Garage profiles
          </span>
        </div>

        <div>
          <Wrench size={24} />
          <strong>
            {data.serviceRecords}
          </strong>
          <span>
            Manual demo maintenance entries
          </span>
        </div>

        <div>
          <Activity size={24} />
          <strong>
            {data.cancelledRequests}
          </strong>
          <span>
            Cancelled request drafts
          </span>
        </div>
      </div>

      <Notice>
        These reports summarize browser-local
        demonstration records. They are not
        verified business transactions,
        earnings, staff productivity,
        or completed automotive services.
      </Notice>
    </div>
  );
}

// ========================================
// PAGE 2 — SERVICE INSIGHTS
// ========================================

export function ServiceInsightsPage() {
  const {
    intelligence: data,
  } = useIntelligence();

  const [view, setView] = useState(
    "services"
  );

  const choices = [
    {
      id: "services",
      label: "Service Mix",
      icon: Wrench,
    },
    {
      id: "vehicles",
      label: "Vehicle Mix",
      icon: CarFront,
    },
    {
      id: "technicians",
      label: "Technicians",
      icon: UsersRound,
    },
    {
      id: "bays",
      label: "Service Bays",
      icon: Layers3,
    },
  ];

  const groups = {
    services: data.serviceTotals,
    vehicles: data.vehicleTotals,
    technicians: data.technicianTotals,
    bays: data.bayTotals,
  };

  const selected = groups[view];

  const overall = selected.reduce(
    (sum, item) =>
      sum + item.count,
    0
  );

  const leader =
    selected.find(
      (item) => item.count > 0
    ) || null;

  return (
    <div className="yd3-page ydi-page">
      <PageHeading
        eyebrow="BUSINESS INTELLIGENCE / 02"
        title="SERVICE"
        accent="INSIGHTS."
        description="Explore which service concepts, vehicle categories, technicians, and sample bays appear most often in your saved proposals."
      />

      <div className="ydi-insight-hero">
        <div>
          <span className="yd3-kicker">
            WORKSHOP DATA EXPLORER
          </span>

          <h2>
            Every detail.
            <br />
            <em>One clear view.</em>
          </h2>

          <p>
            Switch between views to compare
            locally saved sample activity.
          </p>
        </div>

        <div className="ydi-insight-symbol">
          <BarChart3 size={68} />
        </div>
      </div>

      <div className="ydi-tabs">
        {choices.map(
          ({
            id,
            label,
            icon: Icon,
          }) => (
            <button
              type="button"
              key={id}
              className={
                view === id
                  ? "is-selected"
                  : ""
              }
              aria-pressed={view === id}
              onClick={() => setView(id)}
            >
              <Icon size={18} />
              {label}
            </button>
          )
        )}
      </div>

      <div className="ydi-two-columns">
        <section className="ydi-panel">
          <div className="ydi-panel-heading">
            <span className="yd3-kicker">
              COMPARISON / {view.toUpperCase()}
            </span>

            <h2>
              Distribution
              <em> overview.</em>
            </h2>
          </div>

          <Bars items={selected} />
        </section>

        <section className="ydi-panel">
          <div className="ydi-panel-heading">
            <span className="yd3-kicker">
              SELECTED VIEW SUMMARY
            </span>

            <h2>
              Reading the
              <em> data.</em>
            </h2>
          </div>

          <div className="ydi-insight-metrics">
            <div>
              <span>
                COUNTED SELECTIONS
              </span>

              <strong>
                {overall}
              </strong>
            </div>

            <div>
              <span>
                HIGHEST RECORDED CATEGORY
              </span>

              <strong className="is-name">
                {leader?.name || "No data yet"}
              </strong>
            </div>

            <div>
              <span>
                SAVED ACTIVE PROPOSALS
              </span>

              <strong>
                {data.activeRequests}
              </strong>
            </div>
          </div>

          <p className="ydi-helper">
            Service counts can exceed the
            number of proposals because a
            single sample request may
            include several services.
          </p>
        </section>
      </div>

      <section className="ydi-panel">
        <div className="ydi-panel-heading">
          <span className="yd3-kicker">
            RESOURCE ALLOCATION
          </span>

          <h2>
            Planning
            <em> coverage.</em>
          </h2>

          <p>
            These percentages describe assigned
            demo records, not workforce efficiency
            or actual garage utilization.
          </p>
        </div>

        <div className="ydi-coverage-grid">
          <div>
            <div className="ydi-coverage-header">
              <span>
                Technician assignments
              </span>

              <strong>
                {data.activeRequests
                  ? Math.round(
                      (data.assignedTechnicians /
                        data.activeRequests) *
                        100
                    )
                  : 0}
                %
              </strong>
            </div>

            <div className="ydi-bar-track">
              <span
                style={{
                  width: `${
                    data.activeRequests
                      ? (data.assignedTechnicians /
                          data.activeRequests) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="ydi-coverage-header">
              <span>
                Sample bay assignments
              </span>

              <strong>
                {data.activeRequests
                  ? Math.round(
                      (data.assignedBays /
                        data.activeRequests) *
                        100
                    )
                  : 0}
                %
              </strong>
            </div>

            <div className="ydi-bar-track">
              <span
                style={{
                  width: `${
                    data.activeRequests
                      ? (data.assignedBays /
                          data.activeRequests) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <Notice>
        Insights change as you save fictional
        requests, choose services, or modify
        simulated workshop assignments.
        Every view is based on data from
        this browser only.
      </Notice>
    </div>
  );
}

// ========================================
// PAGE 3 — STUDIO SETTINGS
// ========================================

export function StudioSettingsPage() {
  const {
    settings,
    onSaveSettings,
  } = useOutletContext();

  const [form, setForm] = useState(
    () => ({ ...settings })
  );

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  function update(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setError("");
  }

  function submit(event) {
    event.preventDefault();

    const result = onSaveSettings(form);

    if (!result.ok) {
      setError(result.error);
      setMessage("");
      return;
    }

    setMessage(
      "Studio preferences saved in this browser."
    );

    setError("");
  }

  function reset() {
    if (
      !window.confirm(
        "Restore the default portfolio studio preferences?"
      )
    ) {
      return;
    }

    const result = onSaveSettings(
      DEFAULT_STUDIO_SETTINGS
    );

    if (result.ok) {
      setForm({ ...DEFAULT_STUDIO_SETTINGS });
      setError("");
      setMessage(
        "Default studio preferences restored."
      );
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="yd3-page ydi-page">
      <PageHeading
        eyebrow="STUDIO MANAGEMENT / 03"
        title="STUDIO"
        accent="SETTINGS."
        description="Personalize the visible operations workspace and its illustrative planning targets."
      />

      <div className="ydi-settings-layout">
        <form
          className="ydi-panel ydi-settings-form"
          onSubmit={submit}
        >
          <div className="ydi-panel-heading">
            <span className="yd3-kicker">
              PRESENTATION PREFERENCES
            </span>

            <h2>
              Make it
              <em> yours.</em>
            </h2>
          </div>

          <label className="ydi-field">
            <span>
              OPERATIONS STUDIO LABEL
            </span>

            <input
              required
              minLength={3}
              maxLength={55}
              value={form.studioLabel}
              onChange={(e) =>
                update(
                  "studioLabel",
                  e.target.value
                )
              }
            />
          </label>

          <label className="ydi-field">
            <span>
              STUDIO DESCRIPTION / REGION
            </span>

            <input
              required
              minLength={3}
              maxLength={65}
              value={form.regionLabel}
              onChange={(e) =>
                update(
                  "regionLabel",
                  e.target.value
                )
              }
            />
          </label>

          <label className="ydi-field">
            <span>
              ILLUSTRATIVE DAILY PLANNING TARGET
            </span>

            <input
              type="number"
              min={1}
              max={40}
              step={1}
              required
              value={form.dailyPlanningGoal}
              onChange={(e) =>
                update(
                  "dailyPlanningGoal",
                  e.target.value
                )
              }
            />

            <small>
              Used only as a visual comparison
              in Reports & Trends, not real
              workshop capacity.
            </small>
          </label>

          <label className="ydi-switch-row">
            <input
              type="checkbox"
              checked={form.showDemoNotice}
              onChange={(e) =>
                update(
                  "showDemoNotice",
                  e.target.checked
                )
              }
            />

            <span>
              <strong>
                Show portfolio demo reminder
              </strong>

              <small>
                Controls an additional banner
                on the operations workspace.
              </small>
            </span>
          </label>

          {error && (
            <p className="ydi-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p
              className="ydi-success"
              role="status"
            >
              <CheckCircle2 size={18} />
              {message}
            </p>
          )}

          <div className="ydi-form-actions">
            <button
              type="submit"
              className="yd3-button"
            >
              Save Studio Preferences
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="ydi-secondary-button"
              onClick={reset}
            >
              <RefreshCcw size={17} />
              Restore Defaults
            </button>
          </div>
        </form>

        <aside className="ydi-settings-preview">
          <Settings2 size={31} />

          <span className="yd3-kicker">
            LIVE EDITOR PREVIEW
          </span>

          <h2>
            {form.studioLabel ||
              "YOUR DRIVE. STUDIO"}
          </h2>

          <p>
            {form.regionLabel ||
              "Portfolio operations concept"}
          </p>

          <div>
            <strong>
              {form.dailyPlanningGoal || 0}
            </strong>

            <span>
              ILLUSTRATIVE DAILY TARGET
            </span>
          </div>

          <small>
            Preview updates while typing;
            save to apply the preferences.
          </small>
        </aside>
      </div>

      <Notice>
        These settings affect only the
        presentation of the demo portal.
        They do not configure live staff,
        workshop capacity, vehicle repairs,
        payments, or notifications.
      </Notice>
    </div>
  );
}

// ========================================
// PAGE 4 — DATA CENTER / BACKUPS
// ========================================

export function DataCenterPage() {
  const {
    vehicles,
    requests,
    serviceLogs,
    odometers,
    operations,
    settings,
    onRestoreBackup,
  } = useOutletContext();

  const inputRef = useRef(null);

  const [preview, setPreview] =
    useState(null);

  const [confirmed, setConfirmed] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  function exportBackup() {
    try {
      makeDemoBackup({
        vehicles,
        requests,
        serviceLogs,
        odometers,
        workshop: operations,
        settings,
      });

      setError("");
      setMessage(
        "A JSON backup download was prepared."
      );
    } catch {
      setError(
        "Could not export the demo backup."
      );
      setMessage("");
    }
  }

  async function openFile(event) {
    const file =
      event.target.files?.[0];

    setPreview(null);
    setConfirmed(false);
    setError("");
    setMessage("");

    if (!file) return;

    if (file.size > 2_000_000) {
      setError(
        "Please use a JSON backup smaller than 2 MB."
      );
      return;
    }

    try {
      const text = await file.text();

      const result =
        parseDemoBackup(text);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setPreview(result);
    } catch {
      setError(
        "The selected file could not be read."
      );
    }
  }

  function restore() {
    if (!preview || !confirmed) {
      setError(
        "Preview the backup and acknowledge replacement first."
      );
      return;
    }

    if (
      !window.confirm(
        "Replace ALL current YOUR DRIVE. demo vehicles, requests, maintenance logs, odometers, workshop assignments, and studio settings with this backup?"
      )
    ) {
      return;
    }

    const result = onRestoreBackup(
      preview.data
    );

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setPreview(null);
    setConfirmed(false);
    setError("");

    setMessage(
      "Demo backup restored successfully. The displayed reports now use the restored local data."
    );

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="yd3-page ydi-page">
      <PageHeading
        eyebrow="STUDIO MANAGEMENT / 04"
        title="DATA"
        accent="CENTER."
        description="Export and restore your fictional vehicle, appointment, maintenance, workshop, and studio-preference records."
      />

      <div className="ydi-data-overview">
        <div>
          <Database size={26} />

          <strong>
            {vehicles.length}
          </strong>

          <span>Vehicle profiles</span>
        </div>

        <div>
          <CalendarDays size={26} />

          <strong>
            {requests.length}
          </strong>

          <span>Request drafts</span>
        </div>

        <div>
          <Wrench size={26} />

          <strong>
            {serviceLogs.length}
          </strong>

          <span>Maintenance entries</span>
        </div>

        <div>
          <Layers3 size={26} />

          <strong>
            {Object.keys(
              operations
            ).length}
          </strong>

          <span>Workshop records</span>
        </div>
      </div>

      <div className="ydi-two-columns">
        <section className="ydi-panel ydi-data-card">
          <span className="ydi-data-icon">
            <Download size={28} />
          </span>

          <span className="yd3-kicker">
            EXPORT / DEMO DATA
          </span>

          <h2>
            Keep a
            <em> backup.</em>
          </h2>

          <p>
            Download one JSON file containing
            the fictional records currently
            saved in this browser.
          </p>

          <div className="ydi-data-details">
            <span>
              <CheckCircle2 size={17} />
              Browser-local vehicles and mileage
            </span>

            <span>
              <CheckCircle2 size={17} />
              Sample service requests and history
            </span>

            <span>
              <CheckCircle2 size={17} />
              Workshop stages and checklist entries
            </span>

            <span>
              <CheckCircle2 size={17} />
              Studio preferences
            </span>
          </div>

          <button
            type="button"
            className="yd3-button"
            onClick={exportBackup}
          >
            <Download size={18} />
            Export JSON Backup
          </button>
        </section>

        <section className="ydi-panel ydi-data-card">
          <span className="ydi-data-icon">
            <Upload size={28} />
          </span>

          <span className="yd3-kicker">
            IMPORT / RESTORE DATA
          </span>

          <h2>
            Restore
            <em> a session.</em>
          </h2>

          <p>
            Select a YOUR DRIVE. backup file.
            The app validates its format
            before allowing replacement.
          </p>

          <label className="ydi-file-picker">
            <Upload size={23} />

            <span>
              SELECT YOUR DRIVE. JSON BACKUP
            </span>

            <input
              ref={inputRef}
              type="file"
              accept=".json,application/json"
              onChange={openFile}
            />
          </label>

          {preview && (
            <div className="ydi-backup-preview">
              <strong>
                BACKUP CONTENTS
              </strong>

              <div>
                <span>Vehicles</span>

                <b>
                  {preview.summary.vehicles}
                </b>
              </div>

              <div>
                <span>Request drafts</span>

                <b>
                  {preview.summary.requests}
                </b>
              </div>

              <div>
                <span>Maintenance entries</span>

                <b>
                  {preview.summary.serviceLogs}
                </b>
              </div>

              <div>
                <span>Workshop records</span>

                <b>
                  {preview.summary.workshopRecords}
                </b>
              </div>
            </div>
          )}

          <label className="ydi-restore-check">
            <input
              type="checkbox"
              disabled={!preview}
              checked={confirmed}
              onChange={(event) =>
                setConfirmed(
                  event.target.checked
                )
              }
            />

            <span>
              I understand this replaces all
              existing browser-local YOUR DRIVE.
              demo data on this device.
            </span>
          </label>

          <button
            type="button"
            className="yd3-button"
            disabled={
              !preview || !confirmed
            }
            onClick={restore}
          >
            <RefreshCcw size={18} />
            Restore Selected Backup
          </button>
        </section>
      </div>

      {error && (
        <p
          className="ydi-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          className="ydi-success"
          role="status"
        >
          <CheckCircle2 size={18} />
          {message}
        </p>
      )}

      <Notice>
        Backups are exported only when you
        click the button. No server receives
        your local demo records. Imported
        backups replace existing data in
        this browser, so export your current
        data first if you want to preserve it.
        Avoid storing real customer information
        in this portfolio demo.
      </Notice>
    </div>
  );
}