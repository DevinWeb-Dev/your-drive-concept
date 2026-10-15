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
  CalendarDays,
  CarFront,
  ClipboardList,
  Download,
  Gauge,
  History,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import {
  formatDate,
  formatPeso,
} from "../data/autoData.js";

import {
  vehicleActivity,
  downloadVehicleHistory,
} from "../data/driveExperience.js";

import "../styles/experience.css";

const FILTERS = [
  {
    id: "all",
    name: "All Activity",
  },
  {
    id: "maintenance",
    name: "Maintenance Entries",
  },
  {
    id: "request",
    name: "Appointment Drafts",
  },
];

export default function VehicleHistoryPage({
  vehicles = [],
  serviceLogs = [],
  requests = [],
  odometers = {},
}) {
  const [selectedId, setSelectedId] =
    useState(
      vehicles[0]?.id || ""
    );

  const [filter, setFilter] =
    useState("all");

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

  const activity = useMemo(
    () =>
      vehicleActivity({
        vehicle,
        logs: serviceLogs,
        requests,
      }),
    [vehicle, serviceLogs, requests]
  );

  const filtered = activity.filter(
    (item) =>
      filter === "all" ||
      item.kind === filter
  );

  const maintenanceCount = activity.filter(
    (item) =>
      item.kind === "maintenance"
  ).length;

  const requestCount = activity.filter(
    (item) =>
      item.kind === "request"
  ).length;

  const combinedEstimates =
    activity
      .filter(
        (item) => item.kind === "request"
      )
      .reduce(
        (sum, item) =>
          sum + (Number(item.total) || 0),
        0
      );

  return (
    <div className="yd2-page">
      <section className="yd2-page-hero">
        <div className="yd-container">
          <span className="yd-eyebrow is-lime">
            YOUR DRIVE / VEHICLE HISTORY
          </span>

          <h1>
            EVERY MILE
            <br />
            <em>HAS A STORY.</em>
          </h1>

          <p>
            Explore your fictional vehicle's
            sample maintenance records and
            planned service requests in
            a unified timeline.
          </p>
        </div>
      </section>

      <section className="yd2-section yd-container">
        {!vehicle ? (
          <div className="yd2-empty">
            <CarFront size={36} />

            <h2>
              NO VEHICLE HISTORY YET.
            </h2>

            <p>
              Add a fictional vehicle first
              so you can link sample service
              records and future appointment
              preferences.
            </p>

            <Link
              to="/garage"
              className="yd-button"
            >
              Go to My Garage
              <ArrowUpRight size={18} />
            </Link>
          </div>
        ) : (
          <>
            <div className="yd2-history-selector">
              <div>
                <span className="yd-eyebrow">
                  PERSONAL VEHICLE JOURNAL
                </span>

                <h2>
                  YOUR VEHICLE.
                  <br />
                  <em>ITS JOURNEY.</em>
                </h2>
              </div>

              <label className="yd2-field">
                <span>SELECT SAVED VEHICLE</span>

                <select
                  value={selectedId}
                  onChange={(event) => {
                    setSelectedId(
                      event.target.value
                    );

                    setFilter("all");
                  }}
                >
                  {vehicles.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.alias} — {item.make}{" "}
                      {item.model}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="yd2-history-profile">
              <div>
                <CarFront size={34} />

                <span className="yd-eyebrow is-lime">
                  SAVED DEMO VEHICLE
                </span>

                <h3>{vehicle.alias}</h3>

                <p>
                  {vehicle.year} {vehicle.make}{" "}
                  {vehicle.model}
                </p>
              </div>

              <div>
                <span>
                  SAVED SAMPLE ODOMETER
                </span>

                <strong>
                  {typeof odometers[vehicle.id] ===
                  "number"
                    ? odometers[
                        vehicle.id
                      ].toLocaleString("en-PH")
                    : "—"}
                </strong>

                <small>KILOMETERS</small>
              </div>
            </div>

            <div className="yd2-history-metrics">
              <article>
                <History size={23} />

                <strong>
                  {activity.length}
                </strong>

                <span>Timeline entries</span>
              </article>

              <article>
                <Wrench size={23} />

                <strong>
                  {maintenanceCount}
                </strong>

                <span>
                  Completed demo service entries
                </span>
              </article>

              <article>
                <CalendarDays size={23} />

                <strong>
                  {requestCount}
                </strong>

                <span>
                  Linked appointment drafts
                </span>
              </article>

              <article>
                <Gauge size={23} />

                <strong>
                  {formatPeso(
                    combinedEstimates
                  )}
                </strong>

                <span>
                  Combined illustrative estimates
                </span>
              </article>
            </div>

            <div className="yd2-history-panel">
              <div className="yd2-history-toolbar">
                <div>
                  <span className="yd-eyebrow">
                    TIMELINE OF ACTIVITY
                  </span>

                  <h2>
                    THE SERVICE
                    <em> CHRONICLE.</em>
                  </h2>
                </div>

                <button
                  type="button"
                  className="yd2-export"
                  onClick={() =>
                    downloadVehicleHistory({
                      vehicle,
                      activity: filtered,
                    })
                  }
                >
                  <Download size={18} />
                  Export Filtered CSV
                </button>
              </div>

              <div
                className="yd2-filters"
                role="group"
                aria-label="Vehicle history filter"
              >
                {FILTERS.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    aria-pressed={
                      filter === item.id
                    }
                    className={
                      filter === item.id
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      setFilter(item.id)
                    }
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="yd2-empty">
                  <ClipboardList size={34} />

                  <h3>
                    NO MATCHING ACTIVITY.
                  </h3>

                  <p>
                    Add a demo maintenance
                    entry or save an appointment
                    using a linked Garage vehicle.
                  </p>

                  <Link
                    to="/maintenance"
                    className="yd-button"
                  >
                    Open Maintenance Tracker
                    <ArrowRight size={18} />
                  </Link>
                </div>
              ) : (
                <div className="yd2-timeline">
                  {filtered.map(
                    (item, index) => (
                      <article
                        key={`${item.kind}-${item.id}`}
                        className="yd2-timeline-item"
                      >
                        <div className="yd2-timeline-marker">
                          {item.kind ===
                          "maintenance" ? (
                            <Wrench size={18} />
                          ) : (
                            <CalendarDays size={18} />
                          )}
                        </div>

                        <div className="yd2-timeline-card">
                          <div className="yd2-timeline-top">
                            <span className="yd-eyebrow">
                              {item.kind ===
                              "maintenance"
                                ? "COMPLETED SAMPLE SERVICE"
                                : "PLANNED VISIT / NOT CONFIRMED"}
                            </span>

                            <small>
                              ENTRY{" "}
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </small>
                          </div>

                          <h3>{item.title}</h3>

                          <p>
                            {item.subtitle}
                          </p>

                          <div className="yd2-timeline-facts">
                            <span>
                              <CalendarDays size={17} />
                              {formatDate(
                                item.date
                              )}
                            </span>

                            {item.mileage !==
                              null && (
                              <span>
                                <Gauge size={17} />
                                {item.mileage.toLocaleString(
                                  "en-PH"
                                )}{" "}
                                km
                              </span>
                            )}

                            {typeof item.total ===
                              "number" && (
                              <span>
                                {formatPeso(
                                  item.total
                                )}{" "}
                                sample estimate
                              </span>
                            )}
                          </div>

                          {item.note && (
                            <div className="yd2-timeline-note">
                              {item.note}
                            </div>
                          )}
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="yd2-information-note">
              <ShieldCheck size={22} />

              <p>
                Maintenance entries are manually
                entered fictional records. Service
                appointment drafts are not proof
                that maintenance was performed.
                Only requests saved using a
                specific Garage vehicle appear
                in that vehicle's history.
              </p>
            </div>

            <div className="yd2-bottom-navigation">
              <Link
                className="yd2-text-link"
                to="/maintenance"
              >
                Open Maintenance Tracker
                <ArrowRight size={19} />
              </Link>

              <Link
                className="yd2-text-link"
                to="/schedule"
              >
                Explore Service Calendar
                <ArrowRight size={19} />
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}