import {
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
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import {
  VEHICLE_TYPES,
  APPOINTMENT_TIMES,
  dateAfter,
  firstBookableDate,
  formatDate,
  validAppointmentDate,
} from "../data/autoData.js";

import {
  monthCells,
  startOfMonth,
} from "../data/driveExperience.js";

import "../styles/experience.css";

function monthNumber(key) {
  const date = new Date(
    `${key}T12:00:00`
  );

  return (
    date.getFullYear() * 12 +
    date.getMonth()
  );
}

export default function ServiceCalendarPage({
  vehicles = [],
  requests = [],
}) {
  const [selectedDate, setSelectedDate] =
    useState(firstBookableDate);

  const [visibleMonth, setVisibleMonth] =
    useState(() =>
      startOfMonth(
        firstBookableDate()
      )
    );

  const [selectedTime, setSelectedTime] =
    useState("10:00");

  const [vehicleId, setVehicleId] =
    useState("");

  const [vehicleType, setVehicleType] =
    useState("sedan");

  const selectedVehicle = vehicles.find(
    (item) => item.id === vehicleId
  );

  const resolvedVehicleType =
    selectedVehicle?.vehicleType ||
    vehicleType;

  const minMonth = monthNumber(
    dateAfter(1)
  );

  const maxMonth = monthNumber(
    dateAfter(60)
  );

  const currentMonth = monthNumber(
    visibleMonth
  );

  const cells = useMemo(
    () => monthCells(visibleMonth),
    [visibleMonth]
  );

  const monthLabel = new Date(
    `${visibleMonth}T12:00:00`
  ).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

  const activeRequests = requests.filter(
    (item) =>
      item.status !== "cancelled"
  );

  const dailyCounts = useMemo(() => {
    const map = new Map();

    for (const request of activeRequests) {
      map.set(
        request.date,
        (map.get(request.date) || 0) + 1
      );
    }

    return map;
  }, [requests]);

  const selectedRequests =
    activeRequests.filter(
      (item) =>
        item.date === selectedDate
    );

  const timeCount = selectedRequests.filter(
    (item) => item.time === selectedTime
  ).length;

  const selectedTimeLabel =
    APPOINTMENT_TIMES.find(
      (item) =>
        item.id === selectedTime
    )?.name || selectedTime;

  const query = new URLSearchParams({
    date: selectedDate,
    time: selectedTime,
    vehicleType: resolvedVehicleType,
    ...(selectedVehicle
      ? { vehicleId: selectedVehicle.id }
      : {}),
  }).toString();

  function changeMonth(offset) {
    const date = new Date(
      `${visibleMonth}T12:00:00`
    );

    date.setMonth(
      date.getMonth() + offset
    );

    const next = [
      date.getFullYear(),
      String(
        date.getMonth() + 1
      ).padStart(2, "0"),
      "01",
    ].join("-");

    const target = monthNumber(next);

    if (
      target < minMonth ||
      target > maxMonth
    ) {
      return;
    }

    setVisibleMonth(next);
  }

  function chooseVehicle(id) {
    setVehicleId(id);

    const found = vehicles.find(
      (item) => item.id === id
    );

    if (found) {
      setVehicleType(
        found.vehicleType
      );
    }
  }

  return (
    <div className="yd2-page">
      <section className="yd2-page-hero">
        <div className="yd-container">
          <span className="yd-eyebrow is-lime">
            YOUR DRIVE / SERVICE PLANNING CALENDAR
          </span>

          <h1>
            TIME FOR
            <br />
            <em>BETTER CARE.</em>
          </h1>

          <p>
            Explore proposed service dates,
            choose a preferred visit time,
            and continue building your
            fictional automotive service request.
          </p>
        </div>
      </section>

      <section className="yd2-section yd-container">
        <div className="yd2-calendar-layout">
          <div className="yd2-calendar-main">
            <div className="yd2-section-heading">
              <span className="yd-eyebrow">
                01 / SELECT YOUR VEHICLE
              </span>

              <h2>
                MADE FOR
                <em> YOUR DRIVE.</em>
              </h2>
            </div>

            <div className="yd2-panel">
              {vehicles.length > 0 && (
                <label className="yd2-field">
                  <span>
                    YOUR SAVED GARAGE
                  </span>

                  <select
                    value={vehicleId}
                    onChange={(event) =>
                      chooseVehicle(
                        event.target.value
                      )
                    }
                  >
                    <option value="">
                      Choose a vehicle category manually
                    </option>

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
              )}

              <div
                className="yd2-type-grid"
                role="group"
                aria-label="Vehicle category"
              >
                {VEHICLE_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    aria-pressed={
                      resolvedVehicleType ===
                      type.id
                    }
                    className={
                      resolvedVehicleType === type.id
                        ? "is-selected"
                        : ""
                    }
                    onClick={() => {
                      setVehicleId("");
                      setVehicleType(
                        type.id
                      );
                    }}
                  >
                    <CarFront size={25} />

                    <strong>{type.name}</strong>

                    {resolvedVehicleType ===
                      type.id && (
                      <Check size={18} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="yd2-calendar-panel">
              <div className="yd2-calendar-heading">
                <div>
                  <span className="yd-eyebrow">
                    02 / PREFERRED SERVICE DATE
                  </span>

                  <h2>
                    {monthLabel}
                  </h2>
                </div>

                <div className="yd2-month-arrows">
                  <button
                    type="button"
                    aria-label="Previous month"
                    disabled={
                      currentMonth <= minMonth
                    }
                    onClick={() =>
                      changeMonth(-1)
                    }
                  >
                    <ChevronLeft size={21} />
                  </button>

                  <button
                    type="button"
                    aria-label="Next month"
                    disabled={
                      currentMonth >= maxMonth
                    }
                    onClick={() =>
                      changeMonth(1)
                    }
                  >
                    <ChevronRight size={21} />
                  </button>
                </div>
              </div>

              <div className="yd2-weekdays">
                {[
                  "SUN",
                  "MON",
                  "TUE",
                  "WED",
                  "THU",
                  "FRI",
                  "SAT",
                ].map((day) => (
                  <span key={day}>
                    {day}
                  </span>
                ))}
              </div>

              <div
                className="yd2-calendar-days"
                role="group"
                aria-label="Proposed service dates"
              >
                {cells.map((day) => {
                  const enabled =
                    day.currentMonth &&
                    validAppointmentDate(
                      day.key
                    );

                  const count =
                    dailyCounts.get(
                      day.key
                    ) || 0;

                  const selected =
                    selectedDate === day.key;

                  return (
                    <button
                      type="button"
                      key={day.key}
                      disabled={!enabled}
                      aria-pressed={selected}
                      aria-label={
                        `${formatDate(day.key)}` +
                        (count
                          ? `, ${count} saved demo requests`
                          : "")
                      }
                      className={[
                        "yd2-day",
                        selected
                          ? "is-selected"
                          : "",
                        !day.currentMonth
                          ? "is-outside"
                          : "",
                      ].join(" ")}
                      onClick={() =>
                        setSelectedDate(
                          day.key
                        )
                      }
                    >
                      <strong>
                        {day.number}
                      </strong>

                      {enabled && count > 0 ? (
                        <small>
                          {count} plan
                        </small>
                      ) : enabled ? (
                        <span
                          className="yd2-day-dot"
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="yd2-calendar-legend">
                <span>
                  <i className="is-open" />
                  Selectable
                </span>

                <span>
                  <i className="is-chosen" />
                  Your date
                </span>

                <span>
                  <i className="is-record" />
                  Local demo requests
                </span>
              </div>
            </div>

            <div className="yd2-panel">
              <div className="yd2-section-heading">
                <span className="yd-eyebrow">
                  03 / PREFERRED SERVICE TIME
                </span>

                <h2>
                  MAKE IT
                  <em> COUNT.</em>
                </h2>
              </div>

              <div className="yd2-time-grid">
                {APPOINTMENT_TIMES.map(
                  (item) => {
                    const count =
                      selectedRequests.filter(
                        (request) =>
                          request.time === item.id
                      ).length;

                    return (
                      <button
                        type="button"
                        key={item.id}
                        aria-pressed={
                          selectedTime === item.id
                        }
                        className={
                          selectedTime === item.id
                            ? "is-selected"
                            : ""
                        }
                        onClick={() =>
                          setSelectedTime(item.id)
                        }
                      >
                        <Clock3 size={20} />

                        <strong>
                          {item.name}
                        </strong>

                        <small>
                          {count} saved demo{" "}
                          {count === 1
                            ? "request"
                            : "requests"}
                        </small>
                      </button>
                    );
                  }
                )}
              </div>

              <div className="yd2-information-note">
                <Info size={21} />

                <p>
                  Time choices are planning
                  preferences only. Multiple
                  fictional requests can be
                  saved for the same date and
                  time. No service bay is held
                  or marked available.
                </p>
              </div>
            </div>
          </div>

          <aside className="yd2-sticky">
            <div className="yd2-calendar-summary">
              <div className="yd2-summary-top">
                <CalendarDays size={30} />

                <span className="yd-eyebrow is-lime">
                  YOUR SERVICE PLAN
                </span>

                <h2>
                  THE ROAD
                  <br />
                  <em>AHEAD.</em>
                </h2>
              </div>

              <div className="yd2-summary-body">
                <div>
                  <CarFront size={19} />

                  <span>
                    <small>Selected vehicle</small>
                    <strong>
                      {selectedVehicle?.alias ||
                        VEHICLE_TYPES.find(
                          (item) =>
                            item.id ===
                            resolvedVehicleType
                        )?.name}
                    </strong>
                  </span>
                </div>

                <div>
                  <CalendarDays size={19} />

                  <span>
                    <small>Proposed date</small>
                    <strong>
                      {formatDate(
                        selectedDate
                      )}
                    </strong>
                  </span>
                </div>

                <div>
                  <Clock3 size={19} />

                  <span>
                    <small>Preferred time</small>
                    <strong>
                      {selectedTimeLabel}
                    </strong>
                  </span>
                </div>

                <div>
                  <Wrench size={19} />

                  <span>
                    <small>
                      Existing local demo requests
                    </small>
                    <strong>
                      {timeCount} at this
                      preferred date/time
                    </strong>
                  </span>
                </div>

                <Link
                  className="yd-button is-lime yd-full-button"
                  to={`/book?${query}`}
                >
                  Continue Service Planning
                  <ArrowUpRight size={19} />
                </Link>

                <p>
                  <ShieldCheck size={17} />
                  Fictional planning only.
                  Not a workshop reservation.
                </p>
              </div>
            </div>
          </aside>
        </div>

        <div className="yd2-bottom-navigation">
          <Link
            to="/garage"
            className="yd2-text-link"
          >
            Manage My Demo Garage
            <ArrowRight size={19} />
          </Link>
        </div>
      </section>
    </div>
  );
}