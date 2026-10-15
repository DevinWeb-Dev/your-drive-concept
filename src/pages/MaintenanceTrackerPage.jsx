import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CarFront,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Gauge,
  Info,
  Plus,
  Save,
  ShieldAlert,
  Trash2,
  Wrench,
} from "lucide-react";

import {
  SERVICES,
  findService,
  formatDate,
  localDateKey,
} from "../data/autoData.js";

import {
  MAINTENANCE_RULES,
  MAINTENANCE_CATEGORIES,
  latestServiceLog,
  maintenanceCondition,
} from "../data/driveExperience.js";

import "../styles/experience.css";

export default function MaintenanceTrackerPage({
  vehicles = [],
  serviceLogs = [],
  odometers = {},
  onSaveOdometer,
  onAddServiceLog,
  onDeleteServiceLog,
}) {
  const [selectedId, setSelectedId] =
    useState(
      vehicles[0]?.id || ""
    );

  const [category, setCategory] =
    useState("All");

  const [readingDraft, setReadingDraft] =
    useState("");

  const [readingMessage, setReadingMessage] =
    useState("");

  const [readingError, setReadingError] =
    useState("");

  const [form, setForm] = useState({
    serviceId: MAINTENANCE_RULES[0].serviceId,
    performedDate: localDateKey(),
    mileage: "",
    note: "",
  });

  const [logMessage, setLogMessage] =
    useState("");

  const [logError, setLogError] =
    useState("");

  useEffect(() => {
    if (
      vehicles.length > 0 &&
      !vehicles.some(
        (item) => item.id === selectedId
      )
    ) {
      setSelectedId(
        vehicles[0].id
      );
    }

    if (vehicles.length === 0) {
      setSelectedId("");
    }
  }, [vehicles, selectedId]);

  const vehicle = vehicles.find(
    (item) => item.id === selectedId
  );

  const currentOdometer =
    typeof odometers[selectedId] === "number"
      ? odometers[selectedId]
      : null;

  useEffect(() => {
    setReadingDraft(
      currentOdometer === null
        ? ""
        : String(currentOdometer)
    );
  }, [selectedId, currentOdometer]);

  useEffect(() => {
    setReadingMessage("");
    setReadingError("");
    setLogMessage("");
    setLogError("");

    setForm({
      serviceId: MAINTENANCE_RULES[0].serviceId,
      performedDate: localDateKey(),
      mileage: "",
      note: "",
    });
  }, [selectedId]);

  const summary = useMemo(() => {
    if (!vehicle) return [];

    return MAINTENANCE_RULES.map((rule) => {
      const lastLog = latestServiceLog(
        serviceLogs,
        vehicle.id,
        rule.serviceId
      );

      return {
        ...rule,
        lastLog,

        condition: maintenanceCondition({
          rule,
          lastLog,
          odometer: currentOdometer,
        }),
      };
    });
  }, [
    vehicle,
    serviceLogs,
    currentOdometer,
  ]);

  const filtered = summary.filter(
    (item) =>
      category === "All" ||
      item.category === category
  );

  const dueCount = summary.filter(
    (item) => item.condition.state === "due"
  ).length;

  const nearCount = summary.filter(
    (item) => item.condition.state === "soon"
  ).length;

  const trackedCount = summary.filter(
    (item) => item.lastLog
  ).length;

  const ownLogs = serviceLogs
    .filter(
      (log) =>
        log.vehicleId === selectedId
    )
    .sort((a, b) =>
      b.performedDate.localeCompare(
        a.performedDate
      )
    );

  function saveMileage(event) {
    event.preventDefault();

    const result = onSaveOdometer(
      selectedId,
      readingDraft
    );

    if (!result.ok) {
      setReadingError(result.error);
      setReadingMessage("");
      return;
    }

    setReadingError("");

    setReadingMessage(
      "Demo odometer reading saved."
    );
  }

  function saveLog(event) {
    event.preventDefault();

    const result = onAddServiceLog({
      ...form,
      vehicleId: selectedId,
    });

    if (!result.ok) {
      setLogError(result.error);
      setLogMessage("");
      return;
    }

    setLogError("");

    setLogMessage(
      "Fictional maintenance entry saved."
    );

    setForm((current) => ({
      ...current,
      performedDate: localDateKey(),
      mileage: "",
      note: "",
    }));
  }

  if (!vehicle) {
    return (
      <div className="yd2-page">
        <section className="yd2-page-hero">
          <div className="yd-container">
            <span className="yd-eyebrow is-lime">
              YOUR DRIVE / MAINTENANCE TRACKER
            </span>

            <h1>
              STAY
              <br />
              <em>AHEAD.</em>
            </h1>

            <p>
              Track fictional service
              histories and illustrative
              maintenance reminders.
            </p>
          </div>
        </section>

        <section className="yd2-section yd-container">
          <div className="yd2-empty">
            <CarFront size={37} />

            <h2>
              YOUR GARAGE IS EMPTY.
            </h2>

            <p>
              Save a fictional vehicle profile
              first to start recording sample
              maintenance history.
            </p>

            <Link
              to="/garage"
              className="yd-button"
            >
              Add a Demo Vehicle
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="yd2-page">
      <section className="yd2-page-hero">
        <div className="yd-container">
          <span className="yd-eyebrow is-lime">
            YOUR DRIVE / MAINTENANCE TRACKER
          </span>

          <h1>
            STAY
            <br />
            <em>AHEAD.</em>
          </h1>

          <p>
            Organize fictional maintenance
            records, save sample mileage,
            and review illustrative next-service
            indicators for each demo vehicle.
          </p>
        </div>
      </section>

      <section className="yd2-section yd-container">
        <div className="yd2-section-heading">
          <span className="yd-eyebrow">
            01 / YOUR VEHICLE
          </span>

          <h2>
            KNOW YOUR
            <em> MACHINE.</em>
          </h2>
        </div>

        <div className="yd2-vehicle-overview">
          <div className="yd2-vehicle-profile">
            <CarFront size={36} />

            <label className="yd2-field">
              <span>SELECT SAVED VEHICLE</span>

              <select
                value={selectedId}
                onChange={(event) =>
                  setSelectedId(
                    event.target.value
                  )
                }
              >
                {vehicles.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.alias} —{" "}
                    {item.make} {item.model}
                  </option>
                ))}
              </select>
            </label>

            <h3>{vehicle.alias}</h3>

            <p>
              {vehicle.year} {vehicle.make}{" "}
              {vehicle.model}
            </p>
          </div>

          <form
            className="yd2-odometer"
            onSubmit={saveMileage}
          >
            <span className="yd-eyebrow">
              CURRENT FICTIONAL ODOMETER
            </span>

            <h3>
              KEEP MILEAGE
              <em> IN VIEW.</em>
            </h3>

            <label className="yd2-field">
              <span>
                SAMPLE ODOMETER / KILOMETERS
              </span>

              <input
                type="number"
                min="0"
                max="3000000"
                step="1"
                required
                placeholder="e.g. 42000"
                value={readingDraft}
                onChange={(event) => {
                  setReadingDraft(
                    event.target.value
                  );

                  setReadingMessage("");
                  setReadingError("");
                }}
              />
            </label>

            <button
              type="submit"
              className="yd-button"
            >
              <Save size={17} />
              Save Mileage
            </button>

            {readingError && (
              <p
                className="yd2-error"
                role="alert"
              >
                {readingError}
              </p>
            )}

            {readingMessage && (
              <p
                className="yd2-success"
                role="status"
              >
                <CheckCircle2 size={17} />
                {readingMessage}
              </p>
            )}
          </form>
        </div>

        <div className="yd2-tracker-stats">
          <article>
            <Gauge size={25} />

            <strong>
              {currentOdometer === null
                ? "—"
                : currentOdometer.toLocaleString(
                    "en-PH"
                  )}
            </strong>

            <span>Saved sample kilometers</span>
          </article>

          <article>
            <ClipboardCheck size={25} />

            <strong>
              {trackedCount}
            </strong>

            <span>Services with history</span>
          </article>

          <article>
            <ShieldAlert size={25} />

            <strong>
              {dueCount}
            </strong>

            <span>Illustrative reviews due</span>
          </article>

          <article>
            <CalendarClock size={25} />

            <strong>
              {nearCount}
            </strong>

            <span>Review intervals approaching</span>
          </article>
        </div>

        <div className="yd2-section-heading">
          <span className="yd-eyebrow">
            02 / SERVICE PLANNING
          </span>

          <h2>
            MAINTENANCE
            <em> OVERVIEW.</em>
          </h2>
        </div>

        <div className="yd2-filters">
          {MAINTENANCE_CATEGORIES.map(
            (item) => (
              <button
                type="button"
                key={item}
                aria-pressed={
                  category === item
                }
                className={
                  category === item
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  setCategory(item)
                }
              >
                {item}
              </button>
            )
          )}
        </div>

        <div className="yd2-maintenance-grid">
          {filtered.map((rule) => (
            <article
              key={rule.id}
              className="yd2-maintenance-card"
            >
              <div className="yd2-maintenance-top">
                <span className="yd-eyebrow">
                  {rule.category.toUpperCase()}
                </span>

                <span
                  className={`yd2-condition state-${rule.condition.state}`}
                >
                  {rule.condition.label}
                </span>
              </div>

              <h3>{rule.title}</h3>

              <p>{rule.description}</p>

              <div className="yd2-interval-note">
                DEMO INTERVAL /{" "}
                {rule.intervalKm.toLocaleString(
                  "en-PH"
                )}{" "}
                KM OR {rule.intervalMonths} MONTHS
              </div>

              <div className="yd2-progress-header">
                <span>
                  Sample interval progress
                </span>

                <strong>
                  {rule.lastLog
                    ? `${rule.condition.progress}%`
                    : "Not started"}
                </strong>
              </div>

              <div className="yd2-progress-track">
                <span
                  style={{
                    width:
                      `${rule.condition.progress}%`,
                  }}
                />
              </div>

              {rule.lastLog ? (
                <div className="yd2-condition-details">
                  <div>
                    <span>Last recorded</span>

                    <strong>
                      {formatDate(
                        rule.lastLog.performedDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Sample next date
                    </span>

                    <strong>
                      {formatDate(
                        rule.condition.dueDate
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Sample next mileage
                    </span>

                    <strong>
                      {rule.condition.dueKm.toLocaleString(
                        "en-PH"
                      )}{" "}
                      km
                    </strong>
                  </div>

                  <div>
                    <span>
                      KM until sample interval
                    </span>

                    <strong>
                      {rule.condition.kmLeft === null
                        ? "Add odometer"
                        : `${rule.condition.kmLeft.toLocaleString(
                            "en-PH"
                          )} km`}
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="yd2-no-history">
                  No fictional maintenance
                  record yet for this service.
                </p>
              )}

              <button
                type="button"
                className="yd2-card-action"
                onClick={() => {
                  setForm((current) => ({
                    ...current,
                    serviceId: rule.serviceId,
                  }));

                  document.getElementById(
                    "yd2-record-form"
                  )?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                Record Sample Service
                <ArrowUpRight size={18} />
              </button>
            </article>
          ))}
        </div>

        <div className="yd2-information-note">
          <ShieldAlert size={23} />

          <p>
            The reminders above use invented
            example intervals and previously
            entered fictional history. They
            do not diagnose mechanical condition,
            detect faults, or establish vehicle
            safety. Follow manufacturer guidance
            and qualified automotive advice.
          </p>
        </div>

        <section
          className="yd2-panel yd2-record-panel"
          id="yd2-record-form"
        >
          <div className="yd2-section-heading">
            <span className="yd-eyebrow">
              03 / VEHICLE SERVICE HISTORY
            </span>

            <h2>
              RECORD THE
              <em> DETAILS.</em>
            </h2>
          </div>

          <form
            className="yd2-record-form"
            onSubmit={saveLog}
          >
            <label className="yd2-field">
              <span>COMPLETED SAMPLE SERVICE</span>

              <select
                value={form.serviceId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    serviceId:
                      event.target.value,
                  }))
                }
              >
                {SERVICES.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="yd2-fields-two">
              <label className="yd2-field">
                <span>FICTIONAL SERVICE DATE</span>

                <input
                  type="date"
                  required
                  min="2000-01-01"
                  max={localDateKey()}
                  value={form.performedDate}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      performedDate:
                        event.target.value,
                    }))
                  }
                />
              </label>

              <label className="yd2-field">
                <span>ODOMETER AT SERVICE / KM</span>

                <input
                  type="number"
                  min="0"
                  max="3000000"
                  step="1"
                  required
                  placeholder="e.g. 40000"
                  value={form.mileage}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      mileage:
                        event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label className="yd2-field">
              <span>
                OPTIONAL SAMPLE NOTES
              </span>

              <textarea
                rows={4}
                maxLength={200}
                placeholder="e.g. Example routine inspection completed."
                value={form.note}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
              />
            </label>

            {logError && (
              <div
                className="yd2-error"
                role="alert"
              >
                {logError}
              </div>
            )}

            {logMessage && (
              <div
                className="yd2-success"
                role="status"
              >
                <CheckCircle2 size={18} />
                {logMessage}
              </div>
            )}

            <button
              className="yd-button"
              type="submit"
            >
              <Plus size={18} />
              Save Maintenance Entry
            </button>
          </form>
        </section>

        <section className="yd2-recent-records">
          <div className="yd2-section-heading">
            <span className="yd-eyebrow">
              04 / SAVED ENTRIES
            </span>

            <h2>
              THE SERVICE
              <em> JOURNAL.</em>
            </h2>
          </div>

          {ownLogs.length === 0 ? (
            <div className="yd2-empty">
              <Wrench size={33} />

              <h3>NO SERVICE RECORDS YET.</h3>

              <p>
                Add your first fictional
                completed-service entry
                above.
              </p>
            </div>
          ) : (
            <div className="yd2-journal">
              {ownLogs.slice(0, 8).map(
                (log) => (
                  <article
                    key={log.id}
                    className="yd2-journal-row"
                  >
                    <div className="yd2-journal-icon">
                      <Wrench size={22} />
                    </div>

                    <div>
                      <strong>
                        {findService(
                          log.serviceId
                        )?.name ||
                          "Service entry"}
                      </strong>

                      <p>
                        {formatDate(
                          log.performedDate
                        )}
                        {" · "}
                        {log.mileage.toLocaleString(
                          "en-PH"
                        )}{" "}
                        km
                      </p>

                      {log.note && (
                        <small>
                          {log.note}
                        </small>
                      )}
                    </div>

                    <button
                      type="button"
                      aria-label="Delete demo service record"
                      onClick={() =>
                        onDeleteServiceLog(
                          log.id
                        )
                      }
                    >
                      <Trash2 size={19} />
                    </button>
                  </article>
                )
              )}
            </div>
          )}
        </section>

        <Link
          to="/history"
          className="yd2-text-link"
        >
          View Complete Vehicle History
          <ArrowRight size={19} />
        </Link>
      </section>
    </div>
  );
}