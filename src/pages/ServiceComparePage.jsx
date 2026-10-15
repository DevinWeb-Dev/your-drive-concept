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
  CarFront,
  Check,
  CheckCircle2,
  Info,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
} from "lucide-react";

import {
  SERVICES,
  VEHICLE_TYPES,
  calculateEstimate,
  formatPeso,
} from "../data/autoData.js";

import {
  serviceComparisonDetails,
} from "../data/driveExperience.js";

import "../styles/experience.css";

export default function ServiceComparePage() {
  const [selectedIds, setSelectedIds] =
    useState([
      "preventive-maintenance",
      "computer-diagnostics",
    ]);

  const [vehicleType, setVehicleType] =
    useState("sedan");

  const [notice, setNotice] = useState("");

  const selected = useMemo(
    () =>
      SERVICES.filter(
        (item) =>
          selectedIds.includes(
            item.id
          )
      ),
    [selectedIds]
  );

  const details = selected
    .map((item) =>
      serviceComparisonDetails(
        item.id,
        vehicleType
      )
    )
    .filter(Boolean);

  const estimate = calculateEstimate({
    vehicleType,
    serviceIds: selectedIds,
    upgradeIds: [],
  });

  const combinedFeatures = [
    ...new Set(
      selected.flatMap(
        (item) => item.inclusions
      )
    ),
  ];

  const estimateQuery = new URLSearchParams({
    vehicleType,
    services: selectedIds.join(","),
  }).toString();

  function toggleService(id) {
    setNotice("");

    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter(
          (item) => item !== id
        );
      }

      if (current.length >= 3) {
        setNotice(
          "Select up to three services for the comparison."
        );

        return current;
      }

      return [...current, id];
    });
  }

  return (
    <div className="yd2-page">
      <section className="yd2-page-hero">
        <div className="yd-container">
          <span className="yd-eyebrow is-lime">
            YOUR DRIVE / SERVICE COMPARISON
          </span>

          <h1>
            CHOOSE WITH
            <br />
            <em>CLARITY.</em>
          </h1>

          <p>
            Explore and compare automotive
            service concepts, illustrative
            inclusions, service durations,
            and vehicle-specific estimates.
          </p>
        </div>
      </section>

      <section className="yd2-section yd-container">
        <div className="yd2-section-heading">
          <span className="yd-eyebrow">
            01 / SELECT VEHICLE CATEGORY
          </span>

          <h2>
            YOUR VEHICLE
            <em> MATTERS.</em>
          </h2>
        </div>

        <div className="yd2-compare-types">
          {VEHICLE_TYPES.map((type) => (
            <button
              type="button"
              key={type.id}
              aria-pressed={
                vehicleType === type.id
              }
              className={
                vehicleType === type.id
                  ? "is-selected"
                  : ""
              }
              onClick={() =>
                setVehicleType(type.id)
              }
            >
              <CarFront size={25} />

              <span>
                <strong>
                  {type.name}
                </strong>

                <small>
                  {type.description}
                </small>
              </span>

              {vehicleType === type.id && (
                <Check size={19} />
              )}
            </button>
          ))}
        </div>

        <div className="yd2-section-heading yd2-compare-heading">
          <span className="yd-eyebrow">
            02 / COMPARE UP TO THREE SERVICES
          </span>

          <h2>
            EXPLORE THE
            <em> OPTIONS.</em>
          </h2>
        </div>

        <div className="yd2-compare-selector">
          {SERVICES.map((item) => {
            const checked =
              selectedIds.includes(item.id);

            return (
              <button
                type="button"
                key={item.id}
                aria-pressed={checked}
                className={
                  checked ? "is-selected" : ""
                }
                onClick={() =>
                  toggleService(item.id)
                }
              >
                {checked ? (
                  <Check size={17} />
                ) : (
                  <Plus size={17} />
                )}

                <span>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>

        {notice && (
          <div
            className="yd2-information-note"
            role="status"
          >
            <Info size={20} />
            <p>{notice}</p>
          </div>
        )}

        {details.length === 0 ? (
          <div className="yd2-empty">
            <SlidersHorizontal size={34} />

            <h3>
              CHOOSE A SERVICE TO BEGIN.
            </h3>

            <p>
              Select up to three service
              concepts above to see the
              comparison.
            </p>
          </div>
        ) : (
          <>
            <div
              className="yd2-compare-cards"
              style={{
                "--yd2-compare-count":
                  details.length,
              }}
            >
              {details.map(
                (service) => (
                  <article
                    className="yd2-compare-card"
                    key={service.id}
                  >
                    <div className="yd2-compare-image">
                      <img
                        src={service.image}
                        alt=""
                        loading="lazy"
                      />

                      <span>
                        SERVICE /{" "}
                        {service.number}
                      </span>
                    </div>

                    <div className="yd2-compare-card-body">
                      <span className="yd-eyebrow">
                        {service.category.toUpperCase()}
                      </span>

                      <h3>
                        {service.name}
                      </h3>

                      <p>
                        {service.description}
                      </p>

                      <div className="yd2-compare-price">
                        <span>
                          SAMPLE VEHICLE-ADJUSTED ESTIMATE
                        </span>

                        <strong>
                          {
                            service.adjustedPriceText
                          }
                        </strong>
                      </div>

                      <div className="yd2-compare-facts">
                        <div>
                          <span>
                            Service duration
                          </span>

                          <strong>
                            {service.duration}
                          </strong>
                        </div>

                        <div>
                          <span>Inclusion entries</span>

                          <strong>
                            {service.inclusions.length}
                          </strong>
                        </div>
                      </div>

                      <Link
                        to={`/services/${service.id}`}
                        className="yd2-card-action"
                      >
                        Explore This Service
                        <ArrowUpRight size={18} />
                      </Link>
                    </div>
                  </article>
                )
              )}
            </div>

            <section className="yd2-compare-table-panel">
              <div className="yd2-section-heading">
                <span className="yd-eyebrow">
                  03 / SIDE-BY-SIDE COMPARISON
                </span>

                <h2>
                  LOOK CLOSER
                  <em> AT THE DETAILS.</em>
                </h2>
              </div>

              <div
                className="yd2-table-scroll"
                role="region"
                aria-label="Service comparison table"
                tabIndex={0}
              >
                <table className="yd2-compare-table">
                  <thead>
                    <tr>
                      <th scope="col">
                        COMPARISON
                      </th>

                      {details.map(
                        (service) => (
                          <th
                            key={service.id}
                            scope="col"
                          >
                            {service.shortName}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <th scope="row">
                        Category
                      </th>

                      {details.map(
                        (service) => (
                          <td key={service.id}>
                            {service.category}
                          </td>
                        )
                      )}
                    </tr>

                    <tr>
                      <th scope="row">
                        Illustrative duration
                      </th>

                      {details.map(
                        (service) => (
                          <td key={service.id}>
                            {service.duration}
                          </td>
                        )
                      )}
                    </tr>

                    <tr>
                      <th scope="row">
                        Sample cost
                      </th>

                      {details.map(
                        (service) => (
                          <td key={service.id}>
                            {formatPeso(
                              service.adjustedPrice
                            )}
                          </td>
                        )
                      )}
                    </tr>

                    {combinedFeatures.map(
                      (feature) => (
                        <tr key={feature}>
                          <th scope="row">
                            {feature}
                          </th>

                          {details.map(
                            (service) => {
                              const included =
                                service.inclusions.includes(
                                  feature
                                );

                              return (
                                <td
                                  key={service.id}
                                >
                                  {included ? (
                                    <CheckCircle2
                                      size={21}
                                      className="yd2-yes"
                                    />
                                  ) : (
                                    <span className="yd2-no">
                                      —
                                    </span>
                                  )}
                                </td>
                              );
                            }
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <p className="yd2-table-note">
                <Info size={18} />
                These inclusions are fictional
                descriptions. Different
                services are not necessarily
                direct substitutes for one another.
              </p>
            </section>

            <div className="yd2-comparison-total">
              <div>
                <span className="yd-eyebrow is-lime">
                  COMBINED DEMO ESTIMATE
                </span>

                <h2>
                  YOUR SERVICE
                  <br />
                  <em>COMBINATION.</em>
                </h2>

                <p>
                  {selectedIds.length} selected{" "}
                  {selectedIds.length === 1
                    ? "service"
                    : "services"}
                </p>
              </div>

              <div>
                <span>
                  ESTIMATED SAMPLE TOTAL
                </span>

                <strong>
                  {formatPeso(
                    estimate?.total
                  )}
                </strong>

                <Link
                  to={`/estimate?${estimateQuery}`}
                  className="yd-button is-lime"
                >
                  Build This Combination
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </>
        )}

        <div className="yd2-information-note">
          <ShieldCheck size={22} />

          <p>
            This tool compares website
            presentation and invented prices.
            It does not determine which
            repairs your vehicle needs.
            Actual diagnosis and recommendations
            require qualified inspection.
          </p>
        </div>
      </section>
    </div>
  );
}