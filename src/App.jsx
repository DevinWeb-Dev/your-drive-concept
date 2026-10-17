import { useEffect, useMemo, useState } from "react";

import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Gauge,
  Menu,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import {
  BRAND,
  IMAGES,
  VEHICLE_TYPES,
  SERVICES,
  UPGRADES,
  APPOINTMENT_TIMES,
  SERVICE_CATEGORIES,
  WORKFLOW,
  FAQS,
  findService,
  findVehicleType,
  formatPeso,
  dateAfter,
  formatDate,
  localDateKey,
  validAppointmentDate,
  firstBookableDate,
  calculateEstimate,
} from "./data/autoData.js";

import {
  SERVICE_LOGS_KEY,
  ODOMETERS_KEY,
  loadOdometers,
} from "./data/driveExperience.js";

import {
  WORKSHOP_KEY,
  WORK_STAGES,
  TECHNICIANS,
  SERVICE_BAYS,
  WORK_TASKS,
  loadWorkshop,
  getWork,
} from "./data/workshopOps.js";

import {
  INTELLIGENCE_SETTINGS_KEY,
  BACKUP_KIND,
  BACKUP_VERSION,
  loadStudioSettings,
  validateStudioSettings,
  parseDemoBackup,
} from "./data/workshopIntelligence.js";

import ServiceIntelligence from "./pages/precision/ServiceIntelligence.jsx";
import PartsCommandCenter from "./pages/precision/PartsCommandCenter.jsx";
import OwnerJourneyStudio from "./pages/precision/OwnerJourneyStudio.jsx";
import ServiceCalendarPage from "./pages/ServiceCalendarPage.jsx";
import MaintenanceTrackerPage from "./pages/MaintenanceTrackerPage.jsx";
import VehicleHistoryPage from "./pages/VehicleHistoryPage.jsx";
import ServiceComparePage from "./pages/ServiceComparePage.jsx";

import WorkshopLayout from "./components/WorkshopLayout.jsx";

import {
  CommandCenterPage,
  ServiceDeskPage,
  TechnicianBoardPage,
  ServiceBayPage,
} from "./pages/ops/WorkshopPages.jsx";

import {
  ReportsPage,
  ServiceInsightsPage,
  StudioSettingsPage,
  DataCenterPage,
} from "./pages/ops/IntelligencePages.jsx";

import PrecisionHome from "./pages/precision/PrecisionHome.jsx";
import DiagnosticLab from "./pages/precision/DiagnosticLab.jsx";
import WorkshopAtlas from "./pages/precision/WorkshopAtlas.jsx";
import "./styles/site.css";

// ==================================================
// LOCAL STORAGE
// ==================================================

const VEHICLE_STORAGE = "your-drive-demo-vehicles-v1";
const REQUEST_STORAGE = "your-drive-demo-requests-v1";

function readList(key) {
  try {
    const data = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(data)
      ? data.filter(
          (item) =>
            item &&
            typeof item === "object" &&
            typeof item.id === "string"
        )
      : [];
  } catch {
    return [];
  }
}

function useStoredList(key) {
  const [items, setItems] = useState(
    () => readList(key)
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(items)
      );
    } catch (error) {
      console.warn("Demo storage unavailable:", error);
    }
  }, [key, items]);

  return [items, setItems];
}

function makeId(prefix) {
  const random =
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}-${Date.now().toString(36)}-${random}`.toUpperCase();
}

// ==================================================
// PAGE TITLES
// ==================================================

const PAGE_TITLES = {
  "/": "Home",
  "/diagnostics": "Diagnostic Lab",
  "/facility": "Workshop Atlas",
  "/services": "Automotive Services",
  "/compare": "Service Comparison",
  "/schedule": "Service Calendar",
  "/maintenance": "Maintenance Tracker",
  "/history": "Vehicle History",
  "/estimate": "Service Estimator",
  "/book": "Appointment Planner",
  "/garage": "My Garage",
  "/about": "Our Approach",

  "/workshop": "Workshop Command Center",
  "/workshop/desk": "Service Desk",
  "/workshop/team": "Technician Board",
  "/workshop/bays": "Service Bay Planner",

  "/workshop/reports": "Reports & Trends",
  "/workshop/insights": "Service Insights",
  "/workshop/settings": "Studio Settings",
  "/workshop/data": "Data & Backups",
};

function ScrollReset() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    const pageName =
      pathname.startsWith("/services/")
        ? "Service Details"
        : PAGE_TITLES[pathname] || "Page";

    document.title = `${pageName} | YOUR DRIVE.`;
  }, [pathname]);

  return null;
}

// ==================================================
// PUBLIC HEADER
// ==================================================

const NAV_ITEMS = [
    ["Home", "/"],
    ["Services", "/services"],
    ["Diagnostic Lab", "/diagnostics"],
    ["Workshop Atlas", "/facility"],
    ["Compare", "/compare"],
    ["Calendar", "/schedule"],
    ["My Garage", "/garage"],
    ["Service Intelligence", "/service-intelligence"],
  ["About", "/about"],
  ];

function BrandLogo() {
  return (
    <span className="yd-logo">
      <span className="yd-logo-symbol">
        <Gauge size={23} />
      </span>

      <span>
        YOUR DRIVE<span>.</span>
      </span>
    </span>
  );
}

function Header() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!open) return;

    function close(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", close);

    return () =>
      window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <>
      <div className="yd-top-strip">
        <span>PRECISION CARE FOR EVERY DRIVE</span>
        <span>PREMIUM AUTOMOTIVE WEBSITE CONCEPT</span>
      </div>

      <header className="yd-header">
        <div className="yd-container yd-header-inner">
          <Link to="/" aria-label="YOUR DRIVE homepage">
            <BrandLogo />
          </Link>

          <nav
            id="yd-main-nav"
            className={`yd-nav ${open ? "is-open" : ""}`}
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map(([label, to]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  isActive ? "is-active" : ""
                }
              >
                {label}
              </NavLink>
            ))}

            <Link
              to="/book"
              className="yd-mobile-book"
            >
              Plan a Visit
              <ArrowUpRight size={18} />
            </Link>
          </nav>

          <div className="yd-header-actions">
            <Link
              to="/book"
              className="yd-header-button"
            >
              Plan a Visit
              <ArrowUpRight size={18} />
            </Link>

            <button
              type="button"
              className="yd-menu-toggle"
              aria-label={
                open ? "Close menu" : "Open menu"
              }
              aria-expanded={open}
              aria-controls="yd-main-nav"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

// ==================================================
// PUBLIC FOOTER
// ==================================================

function Footer() {
  return (
    <footer className="yd-footer">
      <div className="yd-container">
        <div className="yd-footer-main">
          <div className="yd-footer-cta">
            <span className="yd-eyebrow is-lime">
              READY FOR THE ROAD AHEAD?
            </span>

            <h2>
              Your vehicle.
              <br />
              <em>Our inspiration.</em>
            </h2>

            <Link
              to="/estimate"
              className="yd-button is-lime"
            >
              Build Your Estimate
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="yd-footer-links">
            <strong>EXPLORE</strong>

            {[
              ...NAV_ITEMS,
              ["Estimator", "/estimate"],
              ["Plan a Visit", "/book"],
              ["Vehicle History", "/history"],
              ["Operations Portal", "/workshop"],
            ].map(([label, to]) => (
              <Link to={to} key={to}>
                {label}
              </Link>
            ))}
          </div>

          <div className="yd-footer-links">
            <strong>THE CONCEPT</strong>

            <Link to="/about">
              About the Studio
            </Link>

            <p>
              Fictional automotive workshop
              presentation for a web development
              portfolio.
            </p>

            <p>
              No real vehicle servicing,
              appointment confirmation,
              or payment processing.
            </p>
          </div>
        </div>

        <div className="yd-footer-bottom">
          <span>
            © {new Date().getFullYear()} YOUR DRIVE.
          </span>

          <span>{BRAND.developer}</span>
        </div>
      </div>
    </footer>
  );
}

// ==================================================
// SHARED PUBLIC COMPONENTS
// ==================================================

function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
}) {
  return (
    <div className="yd-section-heading">
      <div>
        <span className="yd-eyebrow">
          {eyebrow}
        </span>

        <h2>
          {title}
          <br />
          <em>{accent}</em>
        </h2>
      </div>

      {description && <p>{description}</p>}
    </div>
  );
}

function PageHero({
  eyebrow,
  title,
  accent,
  description,
}) {
  return (
    <section className="yd-page-hero">
      <div className="yd-container">
        <span className="yd-eyebrow is-lime">
          {eyebrow}
        </span>

        <h1>
          {title}
          <br />
          <em>{accent}</em>
        </h1>

        <p>{description}</p>
      </div>
    </section>
  );
}

function ServiceCard({ service }) {
  return (
    <article className="yd-service-card">
      <Link
        to={`/services/${service.id}`}
        className="yd-service-image"
        aria-label={`Learn about ${service.name}`}
      >
        <img
          src={service.image}
          loading="lazy"
          alt={`Automotive inspiration for ${service.name}`}
        />

        <span className="yd-service-number">
          {service.number}
        </span>

        <span className="yd-service-image-action">
          <ArrowUpRight size={21} />
        </span>
      </Link>

      <div className="yd-service-content">
        <span className="yd-eyebrow">
          {service.category.toUpperCase()}
        </span>

        <h3>{service.name}</h3>
        <p>{service.subtitle}</p>

        <div className="yd-service-bottom">
          <div>
            <small>Indicative from</small>
            <strong>
              {formatPeso(service.basePrice)}
            </strong>
          </div>

          <Link
            to={`/services/${service.id}`}
            aria-label={`View ${service.name}`}
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </article>
  );
}

// ==================================================
// PUBLIC HOME PAGE
// ==================================================

function HomePage() { return <PrecisionHome />; }

// ==================================================
// PUBLIC SERVICE CATALOG
// ==================================================

function ServicesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return SERVICES.filter((service) => {
      const matchesCategory =
        category === "All" ||
        service.category === category;

      const matchesSearch = [
        service.name,
        service.category,
        service.subtitle,
        service.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className="yd-page">
      <PageHero
        eyebrow="THE YOUR DRIVE SERVICE COLLECTION"
        title="PERFORMANCE"
        accent="STARTS HERE."
        description="Browse maintenance, diagnostics, repair, and detailing concepts designed around your vehicle."
      />

      <section className="yd-section yd-container">
        <div className="yd-catalog-head">
          <div>
            <span className="yd-eyebrow">
              ALL SIX SERVICE CONCEPTS
            </span>

            <h2>
              THE SERVICE <em>EDIT.</em>
            </h2>
          </div>

          <label className="yd-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Search services..."
              aria-label="Search services"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </label>
        </div>

        <div
          className="yd-filter-bar"
          role="group"
          aria-label="Service categories"
        >
          {SERVICE_CATEGORIES.map((item) => (
            <button
              type="button"
              key={item}
              aria-pressed={category === item}
              className={
                category === item ? "is-active" : ""
              }
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="yd-results-count">
          {filtered.length} sample services found
        </p>

        {filtered.length > 0 ? (
          <div className="yd-service-grid">
            {filtered.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
              />
            ))}
          </div>
        ) : (
          <div className="yd-empty">
            <Search size={32} />

            <h3>No matching services.</h3>

            <button
              type="button"
              className="yd-button"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Clear Filters
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

// ==================================================
// SERVICE DETAILS
// ==================================================

function ServiceDetailsPage() {
  const { serviceId } = useParams();
  const service = findService(serviceId);

  if (!service) {
    return <NotFoundPage />;
  }

  const related = SERVICES.filter(
    (item) => item.id !== service.id
  ).slice(0, 2);

  return (
    <div className="yd-page">
      <section className="yd-details-hero">
        <div className="yd-container">
          <div className="yd-breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={15} />

            <Link to="/services">Services</Link>
            <ChevronRight size={15} />

            <span>{service.name}</span>
          </div>

          <div className="yd-details-grid">
            <div className="yd-details-copy">
              <span className="yd-eyebrow is-lime">
                {service.eyebrow}
              </span>

              <h1>
                {service.name}<em>.</em>
              </h1>

              <p>{service.description}</p>

              <div className="yd-details-facts">
                <div>
                  <Clock3 size={20} />

                  <span>
                    <small>
                      Illustrative duration
                    </small>

                    <strong>
                      {service.duration}
                    </strong>
                  </span>
                </div>

                <div>
                  <Gauge size={20} />

                  <span>
                    <small>
                      Sample base price
                    </small>

                    <strong>
                      {formatPeso(service.basePrice)}
                    </strong>
                  </span>
                </div>
              </div>

              <Link
                to={`/estimate?service=${service.id}`}
                className="yd-button is-lime"
              >
                Estimate This Service
                <ArrowUpRight size={18} />
              </Link>
            </div>

            <div className="yd-details-image">
              <img
                src={service.image}
                alt={`${service.name} automotive inspiration`}
              />

              <span>
                SERVICE / {service.number}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="yd-section yd-container">
        <div className="yd-details-info">
          <div>
            <SectionHeading
              eyebrow="SERVICE OVERVIEW"
              title="THE DETAILS"
              accent="MATTER."
            />

            <p className="yd-muted-copy">
              {service.description}
            </p>

            <h3>
              Illustrative process
            </h3>

            <div className="yd-process-list">
              {service.process.map((step, index) => (
                <div key={step}>
                  <span>
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <strong>{step}</strong>
                </div>
              ))}
            </div>
          </div>

          <aside className="yd-inclusion-card">
            <span className="yd-eyebrow">
              WHAT THE CONCEPT INCLUDES
            </span>

            <h3>
              SERVICE
              <br />
              <em>OVERVIEW.</em>
            </h3>

            {service.inclusions.map((item) => (
              <div
                className="yd-inclusion"
                key={item}
              >
                <Check size={18} />
                {item}
              </div>
            ))}

            <p>
              Sample descriptions, not confirmed
              repairs or guaranteed results.
            </p>
          </aside>
        </div>
      </section>

      <section className="yd-section yd-container yd-related">
        <SectionHeading
          eyebrow="EXPLORE MORE"
          title="MORE WAYS"
          accent="TO CARE."
        />

        <div className="yd-service-grid is-related">
          {related.map((item) => (
            <ServiceCard
              key={item.id}
              service={item}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// ==================================================
// COST ESTIMATOR
// ==================================================

function EstimatorPage() {
  const [params] = useSearchParams();

  const [vehicleType, setVehicleType] =
    useState(() =>
      findVehicleType(
        params.get("vehicleType")
      )?.id || "sedan"
    );

  const [serviceIds, setServiceIds] =
    useState(() => {
      const incoming = (
        params.get("services") || ""
      )
        .split(",")
        .filter((id) => findService(id));

      return incoming.length > 0
        ? [...new Set(incoming)]
        : [
            findService(
              params.get("service")
            )?.id || SERVICES[0].id,
          ];
    });

  const [upgradeIds, setUpgradeIds] = useState([]);

  const estimate = useMemo(
    () =>
      calculateEstimate({
        vehicleType,
        serviceIds,
        upgradeIds,
      }),
    [vehicleType, serviceIds, upgradeIds]
  );

  function toggle(setter, id) {
    setter((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  const query = new URLSearchParams({
    vehicleType,
    services: serviceIds.join(","),
    upgrades: upgradeIds.join(","),
  }).toString();

  return (
    <div className="yd-page">
      <PageHero
        eyebrow="YOUR DRIVE / INTERACTIVE ESTIMATOR"
        title="KNOW THE"
        accent="NUMBERS."
        description="Select your vehicle, combine services, and preview an indicative Philippine peso estimate in real time."
      />

      <section className="yd-section yd-container">
        <div className="yd-planner-layout">
          <div className="yd-planner-main">
            <section className="yd-form-panel">
              <div className="yd-step-title">
                <span>01</span>

                <div>
                  <span className="yd-eyebrow">
                    YOUR VEHICLE
                  </span>

                  <h2>
                    CHOOSE YOUR
                    <br />
                    <em>VEHICLE TYPE.</em>
                  </h2>
                </div>
              </div>

              <div className="yd-vehicle-grid">
                {VEHICLE_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    aria-pressed={
                      vehicleType === type.id
                    }
                    className={`yd-vehicle-choice ${
                      vehicleType === type.id
                        ? "is-selected"
                        : ""
                    }`}
                    onClick={() =>
                      setVehicleType(type.id)
                    }
                  >
                    <CarFront size={28} />
                    <strong>{type.name}</strong>
                    <small>{type.description}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="yd-form-panel">
              <div className="yd-step-title">
                <span>02</span>

                <div>
                  <span className="yd-eyebrow">
                    SERVICE BUILDER
                  </span>

                  <h2>
                    CHOOSE YOUR
                    <br />
                    <em>SERVICES.</em>
                  </h2>
                </div>
              </div>

              <div className="yd-select-list">
                {SERVICES.map((service) => {
                  const checked = serviceIds.includes(
                    service.id
                  );

                  return (
                    <label
                      key={service.id}
                      className={`yd-select-row ${
                        checked ? "is-selected" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          toggle(
                            setServiceIds,
                            service.id
                          )
                        }
                      />

                      <span className="yd-select-mark">
                        {checked && <Check size={17} />}
                      </span>

                      <span className="yd-select-copy">
                        <strong>
                          {service.name}
                        </strong>

                        <small>
                          {service.category}
                          {" · "}
                          {service.duration}
                        </small>
                      </span>

                      <b>
                        FROM{" "}
                        {formatPeso(service.basePrice)}
                      </b>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="yd-form-panel">
              <div className="yd-step-title">
                <span>03</span>

                <div>
                  <span className="yd-eyebrow">
                    OPTIONAL ENHANCEMENTS
                  </span>

                  <h2>
                    ADD THE
                    <br />
                    <em>FINISHING TOUCHES.</em>
                  </h2>
                </div>
              </div>

              <div className="yd-select-list">
                {UPGRADES.map((upgrade) => {
                  const checked = upgradeIds.includes(
                    upgrade.id
                  );

                  return (
                    <label
                      key={upgrade.id}
                      className={`yd-select-row ${
                        checked ? "is-selected" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          toggle(
                            setUpgradeIds,
                            upgrade.id
                          )
                        }
                      />

                      <span className="yd-select-mark">
                        {checked && <Check size={17} />}
                      </span>

                      <span className="yd-select-copy">
                        <strong>{upgrade.name}</strong>
                        <small>{upgrade.description}</small>
                      </span>

                      <b>
                        +{formatPeso(upgrade.price)}
                      </b>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="yd-planner-sidebar">
            <div className="yd-estimate-panel">
              <div className="yd-estimate-panel-top">
                <Gauge size={28} />

                <span className="yd-eyebrow is-lime">
                  LIVE SAMPLE ESTIMATE
                </span>

                <h2>
                  YOUR DRIVE.
                  <br />
                  <em>YOUR NUMBERS.</em>
                </h2>
              </div>

              <div className="yd-estimate-content">
                <div className="yd-estimate-line">
                  <span>Vehicle</span>
                  <strong>
                    {findVehicleType(vehicleType)?.name}
                  </strong>
                </div>

                <div className="yd-estimate-divider" />

                {estimate ? (
                  <>
                    {estimate.services.map((service) => (
                      <div
                        key={service.id}
                        className="yd-estimate-line"
                      >
                        <span>{service.shortName}</span>

                        <strong>
                          {formatPeso(service.total)}
                        </strong>
                      </div>
                    ))}

                    {estimate.upgrades.map((upgrade) => (
                      <div
                        key={upgrade.id}
                        className="yd-estimate-line"
                      >
                        <span>{upgrade.name}</span>

                        <strong>
                          {formatPeso(upgrade.total)}
                        </strong>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="yd-estimate-warning">
                    Select at least one service.
                  </p>
                )}

                <div className="yd-estimate-divider" />

                <div className="yd-estimate-line">
                  <span>Service subtotal</span>
                  <strong>
                    {formatPeso(
                      estimate?.serviceTotal
                    )}
                  </strong>
                </div>

                <div className="yd-estimate-line">
                  <span>Add-ons</span>
                  <strong>
                    {formatPeso(
                      estimate?.upgradeTotal
                    )}
                  </strong>
                </div>

                <div className="yd-estimate-total">
                  <span>
                    ESTIMATED SAMPLE TOTAL
                  </span>

                  <strong>
                    {estimate
                      ? formatPeso(estimate.total)
                      : "—"}
                  </strong>
                </div>

                <Link
                  to={
                    estimate
                      ? `/book?${query}`
                      : "/estimate"
                  }
                  className={`yd-button is-lime yd-full-button ${
                    !estimate ? "is-disabled" : ""
                  }`}
                  aria-disabled={!estimate}
                  onClick={(event) => {
                    if (!estimate) {
                      event.preventDefault();
                    }
                  }}
                >
                  Continue to Appointment Planner
                  <ArrowUpRight size={18} />
                </Link>

                <p className="yd-estimate-notice">
                  <ShieldCheck size={18} />
                  Demo costs only. Actual pricing
                  requires vehicle inspection
                  and professional assessment.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

// ==================================================
// APPOINTMENT PLANNER
// ==================================================

function BookingPage({
  vehicles,
  onCreateRequest,
}) {
  const [params] = useSearchParams();

  const [form, setForm] = useState(() => {
    const savedVehicle = vehicles.find(
      (item) =>
        item.id === params.get("vehicleId")
    );

    const incomingServices = (
      params.get("services") || ""
    )
      .split(",")
      .filter((id) => findService(id));

    const incomingUpgrades = (
      params.get("upgrades") || ""
    )
      .split(",")
      .filter((id) =>
        UPGRADES.some((item) => item.id === id)
      );

    return {
      requestAlias: "",
      vehicleAlias: savedVehicle?.alias || "",
      savedVehicleId: savedVehicle?.id || "",

      vehicleType:
        savedVehicle?.vehicleType ||
        findVehicleType(
          params.get("vehicleType")
        )?.id ||
        "sedan",

      serviceIds:
        incomingServices.length > 0
          ? [...new Set(incomingServices)]
          : [SERVICES[0].id],

      upgradeIds: [...new Set(incomingUpgrades)],

      date: validAppointmentDate(
        params.get("date")
      )
        ? params.get("date")
        : firstBookableDate(),

      time: APPOINTMENT_TIMES.some(
        (item) => item.id === params.get("time")
      )
        ? params.get("time")
        : "10:00",

      notes: "",
    };
  });

  const [error, setError] = useState("");
  const [confirmation, setConfirmation] =
    useState(null);

  const estimate = useMemo(
    () =>
      calculateEstimate({
        vehicleType: form.vehicleType,
        serviceIds: form.serviceIds,
        upgradeIds: form.upgradeIds,
      }),
    [
      form.vehicleType,
      form.serviceIds,
      form.upgradeIds,
    ]
  );

  function update(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setError("");
    setConfirmation(null);
  }

  function toggle(key, id) {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(id)
        ? current[key].filter((item) => item !== id)
        : [...current[key], id],
    }));

    setError("");
    setConfirmation(null);
  }

  function chooseVehicle(id) {
    const vehicle = vehicles.find(
      (item) => item.id === id
    );

    setForm((current) => ({
      ...current,
      savedVehicleId: vehicle?.id || "",
      vehicleType:
        vehicle?.vehicleType || current.vehicleType,
      vehicleAlias:
        vehicle?.alias || current.vehicleAlias,
    }));

    setError("");
    setConfirmation(null);
  }

  function submit(event) {
    event.preventDefault();

    const result = onCreateRequest(form);

    if (!result.ok) {
      setError(result.error);
      setConfirmation(null);
      return;
    }

    setConfirmation(result);
    setError("");

    setForm((current) => ({
      ...current,
      requestAlias: "",
      notes: "",
    }));
  }

  return (
    <div className="yd-page">
      <PageHero
        eyebrow="YOUR DRIVE / SERVICE PLANNER"
        title="PLAN YOUR"
        accent="NEXT VISIT."
        description="Build a fictional automotive service request with your preferred vehicle, services, date, and time."
      />

      <section className="yd-section yd-container">
        <form
          className="yd-planner-layout"
          onSubmit={submit}
        >
          <div className="yd-planner-main">
            <section className="yd-form-panel">
              <div className="yd-step-title">
                <span>01</span>

                <div>
                  <span className="yd-eyebrow">
                    VEHICLE INFORMATION
                  </span>

                  <h2>
                    YOUR <em>MACHINE.</em>
                  </h2>
                </div>
              </div>

              {vehicles.length > 0 && (
                <label className="yd-field">
                  <span>
                    USE A SAVED DEMO VEHICLE
                  </span>

                  <select
                    value={form.savedVehicleId}
                    onChange={(event) =>
                      chooseVehicle(event.target.value)
                    }
                  >
                    <option value="">
                      Enter vehicle manually
                    </option>

                    {vehicles.map((vehicle) => (
                      <option
                        key={vehicle.id}
                        value={vehicle.id}
                      >
                        {vehicle.alias}
                        {" — "}
                        {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="yd-fields-grid">
                <label className="yd-field">
                  <span>
                    FICTIONAL VEHICLE ALIAS
                  </span>

                  <input
                    required
                    minLength={2}
                    maxLength={55}
                    value={form.vehicleAlias}
                    onChange={(event) =>
                      update(
                        "vehicleAlias",
                        event.target.value
                      )
                    }
                    placeholder="Weekend Cruiser"
                  />
                </label>

                <label className="yd-field">
                  <span>
                    VEHICLE CATEGORY
                  </span>

                  <select
                    value={form.vehicleType}
                    onChange={(event) => {
                      setForm((current) => ({
                        ...current,
                        savedVehicleId: "",
                        vehicleType: event.target.value,
                      }));

                      setError("");
                      setConfirmation(null);
                    }}
                  >
                    {VEHICLE_TYPES.map((type) => (
                      <option
                        key={type.id}
                        value={type.id}
                      >
                        {type.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="yd-field-note">
                Use fictional labels.
                No actual plate numbers,
                registration details,
                or personal information.
              </p>
            </section>

            <section className="yd-form-panel">
              <div className="yd-step-title">
                <span>02</span>

                <div>
                  <span className="yd-eyebrow">
                    SELECT SERVICES
                  </span>

                  <h2>
                    THE CARE
                    <br />
                    <em>YOU CHOOSE.</em>
                  </h2>
                </div>
              </div>

              <div className="yd-check-grid">
                {SERVICES.map((service) => (
                  <label
                    className="yd-check-option"
                    key={service.id}
                  >
                    <input
                      type="checkbox"
                      checked={form.serviceIds.includes(
                        service.id
                      )}
                      onChange={() =>
                        toggle(
                          "serviceIds",
                          service.id
                        )
                      }
                    />

                    <span>
                      <strong>{service.name}</strong>
                      <small>{service.duration}</small>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="yd-form-panel">
              <div className="yd-step-title">
                <span>03</span>

                <div>
                  <span className="yd-eyebrow">
                    OPTIONAL ADD-ONS
                  </span>

                  <h2>
                    EXTRA <em>ATTENTION.</em>
                  </h2>
                </div>
              </div>

              <div className="yd-check-grid">
                {UPGRADES.map((upgrade) => (
                  <label
                    className="yd-check-option"
                    key={upgrade.id}
                  >
                    <input
                      type="checkbox"
                      checked={form.upgradeIds.includes(
                        upgrade.id
                      )}
                      onChange={() =>
                        toggle(
                          "upgradeIds",
                          upgrade.id
                        )
                      }
                    />

                    <span>
                      <strong>{upgrade.name}</strong>

                      <small>
                        +{formatPeso(upgrade.price)}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="yd-form-panel">
              <div className="yd-step-title">
                <span>04</span>

                <div>
                  <span className="yd-eyebrow">
                    PREFERRED SCHEDULE
                  </span>

                  <h2>
                    CHOOSE A
                    <br />
                    <em>DAY & TIME.</em>
                  </h2>
                </div>
              </div>

              <div className="yd-fields-grid">
                <label className="yd-field">
                  <span>
                    PROPOSED DATE
                  </span>

                  <input
                    type="date"
                    required
                    min={dateAfter(1)}
                    max={dateAfter(60)}
                    value={form.date}
                    onChange={(event) =>
                      update("date", event.target.value)
                    }
                  />
                </label>

                <label className="yd-field">
                  <span>
                    PROPOSED TIME
                  </span>

                  <select
                    value={form.time}
                    onChange={(event) =>
                      update("time", event.target.value)
                    }
                  >
                    {APPOINTMENT_TIMES.map((time) => (
                      <option
                        key={time.id}
                        value={time.id}
                      >
                        {time.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="yd-field-note">
                Monday–Saturday only.
                The demo does not check actual
                workshop availability.
              </p>
            </section>

            <section className="yd-form-panel">
              <div className="yd-step-title">
                <span>05</span>

                <div>
                  <span className="yd-eyebrow">
                    COMPLETE YOUR DEMO PLAN
                  </span>

                  <h2>
                    GIVE IT <em>A NAME.</em>
                  </h2>
                </div>
              </div>

              <label className="yd-field">
                <span>
                  FICTIONAL REQUEST ALIAS
                </span>

                <input
                  required
                  minLength={2}
                  maxLength={55}
                  value={form.requestAlias}
                  onChange={(event) =>
                    update(
                      "requestAlias",
                      event.target.value
                    )
                  }
                  placeholder="Saturday Maintenance Plan"
                />
              </label>

              <label className="yd-field">
                <span>
                  OPTIONAL DEMO NOTES
                </span>

                <textarea
                  rows={4}
                  maxLength={180}
                  value={form.notes}
                  onChange={(event) =>
                    update("notes", event.target.value)
                  }
                />
              </label>

              <p className="yd-field-note">
                Browser-local demonstration only.
              </p>
            </section>
          </div>

          <aside className="yd-planner-sidebar">
            <div className="yd-estimate-panel">
              <div className="yd-estimate-panel-top">
                <CalendarDays size={28} />

                <span className="yd-eyebrow is-lime">
                  YOUR SERVICE PREVIEW
                </span>

                <h2>
                  BUILT FOR
                  <br />
                  <em>YOUR DRIVE.</em>
                </h2>
              </div>

              <div className="yd-estimate-content">
                <div className="yd-estimate-line">
                  <span>Vehicle</span>
                  <strong>
                    {findVehicleType(
                      form.vehicleType
                    )?.name}
                  </strong>
                </div>

                <div className="yd-estimate-line">
                  <span>Services</span>
                  <strong>
                    {form.serviceIds.length}
                  </strong>
                </div>

                <div className="yd-estimate-line">
                  <span>Proposed date</span>
                  <strong>
                    {formatDate(form.date)}
                  </strong>
                </div>

                <div className="yd-estimate-line">
                  <span>Service subtotal</span>
                  <strong>
                    {formatPeso(
                      estimate?.serviceTotal
                    )}
                  </strong>
                </div>

                <div className="yd-estimate-line">
                  <span>Add-ons</span>
                  <strong>
                    {formatPeso(
                      estimate?.upgradeTotal
                    )}
                  </strong>
                </div>

                <div className="yd-estimate-total">
                  <span>
                    ESTIMATED SAMPLE TOTAL
                  </span>

                  <strong>
                    {estimate
                      ? formatPeso(estimate.total)
                      : "—"}
                  </strong>
                </div>

                {error && (
                  <p
                    className="yd-form-error"
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!estimate}
                  className="yd-button is-lime yd-full-button"
                >
                  Save Demo Service Request
                  <ArrowUpRight size={18} />
                </button>

                <p className="yd-estimate-notice">
                  <ShieldCheck size={18} />
                  No actual appointment is
                  submitted or confirmed.
                </p>
              </div>
            </div>
          </aside>
        </form>

        {confirmation && (
          <div
            className="yd-confirmation"
            role="status"
          >
            <CheckCircle2 size={35} />

            <span className="yd-eyebrow">
              BROWSER-LOCAL REQUEST SAVED
            </span>

            <h2>
              PLAN <em>RECORDED.</em>
            </h2>

            <p>
              Reference:{" "}
              <strong>{confirmation.id}</strong>
            </p>

            <p>
              Illustrative estimate:{" "}
              <strong>
                {formatPeso(confirmation.total)}
              </strong>
            </p>

            <p>
              Not a confirmed booking.
            </p>

            <Link
              to="/garage"
              className="yd-button"
            >
              View My Garage
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

// ==================================================
// MY GARAGE
// ==================================================

function GaragePage({
  vehicles,
  requests,
  onAddVehicle,
  onDeleteVehicle,
  onCancelRequest,
}) {
  const emptyVehicle = () => ({
    alias: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vehicleType: "sedan",
  });

  const [form, setForm] =
    useState(emptyVehicle);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  function update(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setError("");
    setSuccess("");
  }

  function save(event) {
    event.preventDefault();

    const result = onAddVehicle(form);

    if (!result.ok) {
      setError(result.error);
      setSuccess("");
      return;
    }

    setForm(emptyVehicle());
    setError("");

    setSuccess(
      "Fictional vehicle added to My Garage."
    );
  }

  const activeCount = requests.filter(
    (request) =>
      request.status !== "cancelled"
  ).length;

  return (
    <div className="yd-page">
      <PageHero
        eyebrow="YOUR DRIVE / PERSONAL GARAGE"
        title="YOUR CARS."
        accent="YOUR SPACE."
        description="Save fictional vehicle profiles, review proposed service visits, and access sample maintenance history."
      />

      <section className="yd-section yd-container">
        <div className="yd-garage-stats">
          <article>
            <CarFront size={24} />
            <strong>{vehicles.length}</strong>
            <span>Saved demo vehicles</span>
          </article>

          <article>
            <CalendarDays size={24} />
            <strong>{requests.length}</strong>
            <span>Total service requests</span>
          </article>

          <article>
            <Settings2 size={24} />
            <strong>{activeCount}</strong>
            <span>Active planning drafts</span>
          </article>
        </div>

        <div className="yd-garage-layout">
          <section className="yd-form-panel">
            <div className="yd-step-title">
              <span>01</span>

              <div>
                <span className="yd-eyebrow">
                  VEHICLE MANAGEMENT
                </span>

                <h2>
                  ADD TO <em>YOUR GARAGE.</em>
                </h2>
              </div>
            </div>

            <form
              className="yd-garage-form"
              onSubmit={save}
            >
              <label className="yd-field">
                <span>
                  FICTIONAL VEHICLE ALIAS
                </span>

                <input
                  required
                  minLength={2}
                  maxLength={55}
                  placeholder="Weekend Cruiser"
                  value={form.alias}
                  onChange={(event) =>
                    update("alias", event.target.value)
                  }
                />
              </label>

              <div className="yd-fields-grid">
                <label className="yd-field">
                  <span>MAKE</span>

                  <input
                    required
                    minLength={2}
                    maxLength={40}
                    placeholder="Toyota"
                    value={form.make}
                    onChange={(event) =>
                      update("make", event.target.value)
                    }
                  />
                </label>

                <label className="yd-field">
                  <span>MODEL</span>

                  <input
                    required
                    minLength={2}
                    maxLength={40}
                    placeholder="Corolla"
                    value={form.model}
                    onChange={(event) =>
                      update("model", event.target.value)
                    }
                  />
                </label>

                <label className="yd-field">
                  <span>MODEL YEAR</span>

                  <input
                    type="number"
                    required
                    min={1980}
                    max={new Date().getFullYear() + 1}
                    value={form.year}
                    onChange={(event) =>
                      update("year", event.target.value)
                    }
                  />
                </label>

                <label className="yd-field">
                  <span>VEHICLE CATEGORY</span>

                  <select
                    value={form.vehicleType}
                    onChange={(event) =>
                      update(
                        "vehicleType",
                        event.target.value
                      )
                    }
                  >
                    {VEHICLE_TYPES.map((type) => (
                      <option
                        key={type.id}
                        value={type.id}
                      >
                        {type.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {error && (
                <p className="yd-form-error" role="alert">
                  {error}
                </p>
              )}

              {success && (
                <p
                  className="yd-form-success"
                  role="status"
                >
                  <CheckCircle2 size={18} />
                  {success}
                </p>
              )}

              <button
                type="submit"
                className="yd-button"
              >
                <Plus size={18} />
                Save Demo Vehicle
              </button>

              <p className="yd-field-note">
                Maximum six fictional vehicles.
                Do not enter real registration
                or identifying information.
              </p>
            </form>
          </section>

          <section className="yd-form-panel">
            <div className="yd-step-title">
              <span>02</span>

              <div>
                <span className="yd-eyebrow">
                  SAVED DEMO VEHICLES
                </span>

                <h2>
                  YOUR <em>COLLECTION.</em>
                </h2>
              </div>
            </div>

            {vehicles.length > 0 ? (
              <div className="yd-garage-vehicle-list">
                {vehicles.map((vehicle) => (
                  <article
                    key={vehicle.id}
                    className="yd-garage-vehicle"
                  >
                    <span className="yd-garage-car-icon">
                      <CarFront size={27} />
                    </span>

                    <div>
                      <span className="yd-eyebrow">
                        {vehicle.year}
                        {" / "}
                        {findVehicleType(
                          vehicle.vehicleType
                        )?.name}
                      </span>

                      <h3>{vehicle.alias}</h3>

                      <p>
                        {vehicle.make} {vehicle.model}
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label={`Remove ${vehicle.alias}`}
                      onClick={() =>
                        onDeleteVehicle(vehicle.id)
                      }
                    >
                      <Trash2 size={18} />
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="yd-empty">
                <CarFront size={33} />
                <h3>No vehicles saved.</h3>
                <p>Add a fictional vehicle first.</p>
              </div>
            )}

            <div className="yd-center-action">
              <Link
                to="/maintenance"
                className="yd-text-link"
              >
                Maintenance Tracker
                <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        </div>

        <section className="yd-requests-section">
          <div className="yd-requests-heading">
            <div>
              <span className="yd-eyebrow">
                BROWSER-LOCAL PLANNING
              </span>

              <h2>
                SERVICE <em>REQUESTS.</em>
              </h2>
            </div>

            <Link
              to="/book"
              className="yd-button"
            >
              New Demo Request
              <ArrowUpRight size={18} />
            </Link>
          </div>

          {requests.length > 0 ? (
            <div className="yd-request-list">
              {requests.map((request) => (
                <article
                  key={request.id}
                  className="yd-request-card"
                >
                  <div className="yd-request-top">
                    <span className="yd-eyebrow">
                      DEMO SERVICE REQUEST
                    </span>

                    <span
                      className={`yd-status ${
                        request.status === "cancelled"
                          ? "is-cancelled"
                          : ""
                      }`}
                    >
                      {request.status === "cancelled"
                        ? "Cancelled draft"
                        : "Request draft"}
                    </span>
                  </div>

                  <h3>{request.requestAlias}</h3>

                  <p>
                    {request.vehicleAlias}
                    {" · "}
                    {findVehicleType(
                      request.vehicleType
                    )?.name || "Vehicle"}
                  </p>

                  <div className="yd-request-facts">
                    <span>
                      <CalendarDays size={17} />
                      {formatDate(request.date)}
                    </span>

                    <span>
                      <Clock3 size={17} />

                      {APPOINTMENT_TIMES.find(
                        (item) =>
                          item.id === request.time
                      )?.name}
                    </span>

                    <span>
                      <Wrench size={17} />
                      {request.serviceIds?.length || 0}
                      {" "}services
                    </span>
                  </div>

                  <div className="yd-request-footer">
                    <div>
                      <small>
                        SAVED SAMPLE ESTIMATE
                      </small>

                      <strong>
                        {formatPeso(request.total)}
                      </strong>
                    </div>

                    {request.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() =>
                          onCancelRequest(request.id)
                        }
                      >
                        Cancel Demo Request
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="yd-empty">
              <CalendarDays size={33} />

              <h3>No service plans yet.</h3>

              <p>
                Plan a fictional service visit
                to begin.
              </p>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}

// ==================================================
// ABOUT
// ==================================================

function AboutPage() {
  return (
    <div className="yd-page">
      <PageHero
        eyebrow="ABOUT / THE YOUR DRIVE STANDARD"
        title="CARE IS"
        accent="A CRAFT."
        description="Reimagining automotive websites around exceptional clarity, confident design, and modern convenience."
      />

      <section className="yd-section yd-container">
        <div className="yd-about-grid">
          <div className="yd-about-image">
            <img
              src={IMAGES.showroom}
              loading="lazy"
              alt="Automotive showroom inspiration"
            />
          </div>

          <div className="yd-about-copy">
            <span className="yd-eyebrow">
              THE PHILOSOPHY
            </span>

            <h2>
              MORE THAN
              <br />
              JUST <em>MAINTENANCE.</em>
            </h2>

            <p>
              YOUR DRIVE. is a fictional
              automotive portfolio concept
              showing how a modern workshop
              could simplify service discovery,
              estimates, and service-visit planning.
            </p>

            <p>
              Thoughtful visual storytelling meets
              practical, browser-local interactive
              features.
            </p>

            <Link
              to="/estimate"
              className="yd-button"
            >
              Explore the Estimator
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ==================================================
// NOT FOUND
// ==================================================

function NotFoundPage() {
  return (
    <section className="yd-container yd-not-found">
      <span className="yd-eyebrow">
        404 / PAGE NOT FOUND
      </span>

      <h1>
        WRONG
        <br />
        <em>TURN.</em>
      </h1>

      <p>This page isn't on the map.</p>

      <Link to="/" className="yd-button">
        <ArrowLeft size={18} />
        Return Home
      </Link>
    </section>
  );
}

// ==================================================
// MAIN APP — BATCHES 1, 2, 3, AND 4
// ==================================================

export default function App() {
  const [vehicles, setVehicles] =
    useStoredList(VEHICLE_STORAGE);

  const [requests, setRequests] =
    useStoredList(REQUEST_STORAGE);

  const [serviceLogs, setServiceLogs] =
    useStoredList(SERVICE_LOGS_KEY);

  const [odometers, setOdometers] =
    useState(loadOdometers);

  const [workshop, setWorkshop] =
    useState(loadWorkshop);

  const [studioSettings, setStudioSettings] =
    useState(loadStudioSettings);

  const location = useLocation();

  const isWorkshop =
    location.pathname === "/workshop" ||
    location.pathname.startsWith("/workshop/");

  // ========================================
  // PERSISTENCE
  // ========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        ODOMETERS_KEY,
        JSON.stringify(odometers)
      );
    } catch (error) {
      console.warn(
        "Odometer storage unavailable:",
        error
      );
    }
  }, [odometers]);

  useEffect(() => {
    try {
      localStorage.setItem(
        WORKSHOP_KEY,
        JSON.stringify(workshop)
      );
    } catch (error) {
      console.warn(
        "Workshop storage unavailable:",
        error
      );
    }
  }, [workshop]);

  useEffect(() => {
    try {
      localStorage.setItem(
        INTELLIGENCE_SETTINGS_KEY,
        JSON.stringify(studioSettings)
      );
    } catch (error) {
      console.warn(
        "Studio settings storage unavailable:",
        error
      );
    }
  }, [studioSettings]);

  // ========================================
  // GARAGE — ADD VEHICLE
  // ========================================

  function addVehicle(form) {
    if (vehicles.length >= 6) {
      return {
        ok: false,
        error:
          "The demo Garage allows up to six vehicles.",
      };
    }

    const alias = String(
      form.alias || ""
    ).trim();

    const make = String(
      form.make || ""
    ).trim();

    const model = String(
      form.model || ""
    ).trim();

    const year = Number(form.year);

    if (
      alias.length < 2 ||
      alias.length > 55 ||
      make.length < 2 ||
      make.length > 40 ||
      model.length < 2 ||
      model.length > 40
    ) {
      return {
        ok: false,
        error:
          "Enter a valid fictional vehicle alias, make, and model.",
      };
    }

    if (
      !Number.isInteger(year) ||
      year < 1980 ||
      year > new Date().getFullYear() + 1
    ) {
      return {
        ok: false,
        error: "Choose a valid model year.",
      };
    }

    if (!findVehicleType(form.vehicleType)) {
      return {
        ok: false,
        error: "Choose a valid vehicle category.",
      };
    }

    const vehicle = {
      id: makeId("YDV"),
      alias,
      make,
      model,
      year,
      vehicleType: form.vehicleType,
      createdAt: new Date().toISOString(),
    };

    setVehicles((current) => [
      vehicle,
      ...current,
    ]);

    return {
      ok: true,
      id: vehicle.id,
    };
  }

  // ========================================
  // GARAGE — DELETE VEHICLE
  // ========================================

  function deleteVehicle(id) {
    if (
      !window.confirm(
        "Remove this fictional vehicle and its saved maintenance history? Existing demo appointment drafts will remain."
      )
    ) {
      return;
    }

    setVehicles((current) =>
      current.filter(
        (vehicle) => vehicle.id !== id
      )
    );

    setServiceLogs((current) =>
      current.filter(
        (log) => log.vehicleId !== id
      )
    );

    setOdometers((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  // ========================================
  // APPOINTMENTS — CREATE DEMO REQUEST
  // ========================================

  function createRequest(form) {
    if (
      !Array.isArray(form.serviceIds) ||
      !form.serviceIds.length ||
      form.serviceIds.some(
        (id) => !findService(id)
      ) ||
      !Array.isArray(form.upgradeIds) ||
      form.upgradeIds.some(
        (id) =>
          !UPGRADES.some(
            (upgrade) => upgrade.id === id
          )
      )
    ) {
      return {
        ok: false,
        error:
          "Choose valid services and optional add-ons.",
      };
    }

    const estimate = calculateEstimate({
      vehicleType: form.vehicleType,
      serviceIds: form.serviceIds,
      upgradeIds: form.upgradeIds,
    });

    if (!estimate) {
      return {
        ok: false,
        error:
          "Choose a valid vehicle category and at least one service.",
      };
    }

    const requestAlias = String(
      form.requestAlias || ""
    ).trim();

    const vehicleAlias = String(
      form.vehicleAlias || ""
    ).trim();

    const notes = String(
      form.notes || ""
    ).trim();

    if (
      requestAlias.length < 2 ||
      requestAlias.length > 55 ||
      vehicleAlias.length < 2 ||
      vehicleAlias.length > 55
    ) {
      return {
        ok: false,
        error:
          "Use fictional request and vehicle aliases between 2 and 55 characters.",
      };
    }

    if (notes.length > 180) {
      return {
        ok: false,
        error:
          "Planning notes must be 180 characters or fewer.",
      };
    }

    if (!validAppointmentDate(form.date)) {
      return {
        ok: false,
        error:
          "Choose a future date within 60 days, excluding Sundays.",
      };
    }

    if (
      !APPOINTMENT_TIMES.some(
        (time) => time.id === form.time
      )
    ) {
      return {
        ok: false,
        error:
          "Choose a valid preferred time.",
      };
    }

    if (requests.length >= 40) {
      return {
        ok: false,
        error:
          "The demo can store up to 40 requests.",
      };
    }

    const linkedVehicle = vehicles.find(
      (vehicle) =>
        vehicle.id === form.savedVehicleId
    );

    const request = {
      id: makeId("YDR"),
      requestAlias,
      vehicleAlias,

      savedVehicleId: linkedVehicle?.id || "",
      vehicleType: form.vehicleType,

      serviceIds: [...new Set(form.serviceIds)],
      upgradeIds: [...new Set(form.upgradeIds)],

      date: form.date,
      time: form.time,
      notes,
      total: estimate.total,
      status: "requested",
      createdAt: new Date().toISOString(),
    };

    setRequests((current) => [
      request,
      ...current,
    ]);

    return {
      ok: true,
      id: request.id,
      total: request.total,
    };
  }

  // ========================================
  // APPOINTMENTS — CANCEL DEMO REQUEST
  // ========================================

  function cancelRequest(id) {
    if (
      !window.confirm(
        "Cancel this browser-local demo service request?"
      )
    ) {
      return;
    }

    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "cancelled",
            }
          : request
      )
    );
  }

  // ========================================
  // MAINTENANCE — SAVE ODOMETER
  // ========================================

  function saveOdometer(vehicleId, rawReading) {
    if (
      !vehicles.some(
        (vehicle) => vehicle.id === vehicleId
      )
    ) {
      return {
        ok: false,
        error: "Demo vehicle not found.",
      };
    }

    if (
      typeof rawReading !== "string" ||
      !rawReading.trim()
    ) {
      return {
        ok: false,
        error:
          "Enter a sample odometer reading.",
      };
    }

    const reading = Number(rawReading);

    if (
      !Number.isInteger(reading) ||
      reading < 0 ||
      reading > 3_000_000
    ) {
      return {
        ok: false,
        error:
          "Enter whole-number mileage between 0 and 3,000,000.",
      };
    }

    if (
      typeof odometers[vehicleId] === "number" &&
      reading < odometers[vehicleId]
    ) {
      return {
        ok: false,
        error:
          "Odometer cannot be lower than the existing reading.",
      };
    }

    const highestLogged = serviceLogs
      .filter(
        (log) => log.vehicleId === vehicleId
      )
      .reduce(
        (maximum, log) =>
          Math.max(
            maximum,
            Number(log.mileage) || 0
          ),
        0
      );

    if (reading < highestLogged) {
      return {
        ok: false,
        error:
          "Reading cannot be below saved maintenance mileage.",
      };
    }

    setOdometers((current) => ({
      ...current,
      [vehicleId]: reading,
    }));

    return { ok: true };
  }

  // ========================================
  // MAINTENANCE — ADD SERVICE LOG
  // ========================================

  function addServiceLog(form) {
    if (
      !vehicles.some(
        (vehicle) =>
          vehicle.id === form.vehicleId
      )
    ) {
      return {
        ok: false,
        error:
          "Choose a saved demo vehicle.",
      };
    }

    if (!findService(form.serviceId)) {
      return {
        ok: false,
        error:
          "Choose a valid automotive service.",
      };
    }

    const date = String(
      form.performedDate || ""
    );

    const parsedDate = new Date(
      `${date}T12:00:00`
    );

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsedDate.getTime()) ||
      localDateKey(parsedDate) !== date ||
      date < "2000-01-01" ||
      date > localDateKey()
    ) {
      return {
        ok: false,
        error:
          "Choose a valid sample service date between 2000 and today.",
      };
    }

    if (
      String(form.mileage).trim() === ""
    ) {
      return {
        ok: false,
        error:
          "Enter sample mileage at service.",
      };
    }

    const mileage = Number(form.mileage);

    if (
      !Number.isInteger(mileage) ||
      mileage < 0 ||
      mileage > 3_000_000
    ) {
      return {
        ok: false,
        error:
          "Mileage must be a whole number between 0 and 3,000,000.",
      };
    }

    const note = String(
      form.note || ""
    ).trim();

    if (note.length > 200) {
      return {
        ok: false,
        error:
          "Service notes must be 200 characters or fewer.",
      };
    }

    if (serviceLogs.length >= 100) {
      return {
        ok: false,
        error:
          "The demo supports up to 100 maintenance entries.",
      };
    }

    const entry = {
      id: makeId("YDL"),
      vehicleId: form.vehicleId,
      serviceId: form.serviceId,
      performedDate: date,
      mileage,
      note,
      createdAt: new Date().toISOString(),
    };

    setServiceLogs((current) => [
      entry,
      ...current,
    ]);

    setOdometers((current) => ({
      ...current,

      [form.vehicleId]: Math.max(
        Number(current[form.vehicleId]) || 0,
        mileage
      ),
    }));

    return {
      ok: true,
      id: entry.id,
    };
  }

  // ========================================
  // MAINTENANCE — DELETE SERVICE LOG
  // ========================================

  function deleteServiceLog(id) {
    if (
      !window.confirm(
        "Delete this fictional maintenance entry?"
      )
    ) {
      return;
    }

    setServiceLogs((current) =>
      current.filter(
        (entry) => entry.id !== id
      )
    );
  }

  // ========================================
  // WORKSHOP — UPDATE PLAN
  // ========================================

  function updateWorkshop(requestId, patch) {
    const request = requests.find(
      (item) => item.id === requestId
    );

    if (
      !request ||
      request.status === "cancelled" ||
      !patch ||
      typeof patch !== "object"
    ) {
      return;
    }

    const safePatch = {};

    if (
      Object.hasOwn(patch, "stage") &&
      WORK_STAGES.some(
        (stage) => stage.id === patch.stage
      )
    ) {
      safePatch.stage = patch.stage;
    }

    if (
      Object.hasOwn(patch, "technicianId") &&
      (
        patch.technicianId === "" ||
        TECHNICIANS.some(
          (tech) => tech.id === patch.technicianId
        )
      )
    ) {
      safePatch.technicianId =
        patch.technicianId;
    }

    if (
      Object.hasOwn(patch, "bayId") &&
      (
        patch.bayId === "" ||
        SERVICE_BAYS.some(
          (bay) => bay.id === patch.bayId
        )
      )
    ) {
      safePatch.bayId = patch.bayId;
    }

    if (
      Object.hasOwn(patch, "note") &&
      typeof patch.note === "string" &&
      patch.note.length <= 400
    ) {
      safePatch.note = patch.note;
    }

    if (!Object.keys(safePatch).length) {
      return;
    }

    setWorkshop((current) => ({
      ...current,

      [requestId]: {
        ...getWork(current, requestId),
        ...safePatch,
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  // ========================================
  // WORKSHOP — CHECKLIST
  // ========================================

  function toggleWorkshopTask(requestId, taskId) {
    const request = requests.find(
      (item) => item.id === requestId
    );

    if (
      !request ||
      request.status === "cancelled" ||
      !WORK_TASKS.some(
        (task) => task.id === taskId
      )
    ) {
      return;
    }

    setWorkshop((current) => {
      const record = getWork(
        current,
        requestId
      );

      const tasks = record.tasks.includes(taskId)
        ? record.tasks.filter(
            (id) => id !== taskId
          )
        : [...record.tasks, taskId];

      return {
        ...current,

        [requestId]: {
          ...record,
          tasks,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }

  // ========================================
  // BATCH 4 — SAVE STUDIO SETTINGS
  // ========================================

  function saveStudioSettings(candidate) {
    const result = validateStudioSettings(
      candidate
    );

    if (!result.ok) {
      return result;
    }

    setStudioSettings(result.data);

    return { ok: true };
  }

  // ========================================
  // BATCH 4 — RESTORE COMPLETE DEMO BACKUP
  // ========================================

  function restoreDemoBackup(candidate) {
    // Validate again before changing state.
    // All six data collections are replaced
    // only when the full payload passes.

    const result = parseDemoBackup(
      JSON.stringify({
        kind: BACKUP_KIND,
        version: BACKUP_VERSION,
        data: candidate,
      })
    );

    if (!result.ok) {
      return {
        ok: false,
        error: result.error,
      };
    }

    const data = result.data;

    setVehicles(data.vehicles);
    setRequests(data.requests);
    setServiceLogs(data.serviceLogs);
    setOdometers(data.odometers);
    setWorkshop(data.workshop);
    setStudioSettings(data.settings);

    return { ok: true };
  }

  // ========================================
  // ROUTES — COMPLETE APPLICATION
  // ========================================

  return (
    <div className="yd-app">
      <ScrollReset />

      {!isWorkshop && <Header />}

      <div id="main-content">
        <Routes>
          {/* PUBLIC WEBSITE */}

          <Route
            index
            element={<HomePage />}
          />

          <Route
            path="services"
            element={<ServicesPage />}
          />
          <Route path="diagnostics" element={<DiagnosticLab />} />
          <Route path="facility" element={<WorkshopAtlas />} />

          <Route
            path="services/:serviceId"
            element={<ServiceDetailsPage />}
          />

          <Route
            path="compare"
            element={<ServiceComparePage />}
          />

          <Route
            path="estimate"
            element={
              <EstimatorPage
                key={location.search}
              />
            }
          />

          <Route
            path="schedule"
            element={
              <ServiceCalendarPage
                vehicles={vehicles}
                requests={requests}
              />
            }
          />

          <Route
            path="book"
            element={
              <BookingPage
                key={location.search}
                vehicles={vehicles}
                onCreateRequest={createRequest}
              />
            }
          />

          <Route
            path="service-intelligence"
            element={
              <ServiceIntelligence
                vehicles={vehicles}
                requests={requests}
              />
            }
          />

          <Route
            path="garage"
            element={
              <GaragePage
                vehicles={vehicles}
                requests={requests}
                onAddVehicle={addVehicle}
                onDeleteVehicle={deleteVehicle}
                onCancelRequest={cancelRequest}
              />
            }
          />

          <Route
            path="maintenance"
            element={
              <MaintenanceTrackerPage
                vehicles={vehicles}
                serviceLogs={serviceLogs}
                odometers={odometers}
                onSaveOdometer={saveOdometer}
                onAddServiceLog={addServiceLog}
                onDeleteServiceLog={deleteServiceLog}
              />
            }
          />

          <Route
            path="history"
            element={
              <VehicleHistoryPage
                vehicles={vehicles}
                serviceLogs={serviceLogs}
                requests={requests}
                odometers={odometers}
              />
            }
          />

          <Route
            path="about"
            element={<AboutPage />}
          />

          {/* WORKSHOP PORTAL */}

          <Route
            path="workshop"
            element={
              <WorkshopLayout
                requests={requests}
                operations={workshop}
                vehicles={vehicles}
                serviceLogs={serviceLogs}
                odometers={odometers}
                settings={studioSettings}
                onUpdateWork={updateWorkshop}
                onToggleTask={toggleWorkshopTask}
                onSaveSettings={saveStudioSettings}
                onRestoreBackup={restoreDemoBackup}
              />
            }
          >
            {/* BATCH 3 */}

            <Route
              index
              element={<CommandCenterPage />}
            />

            <Route
              path="desk"
              element={<ServiceDeskPage />}
            />

            <Route
              path="team"
              element={<TechnicianBoardPage />}
            />

            <Route
              path="bays"
              element={<ServiceBayPage />}
            />

              <Route path="parts" element={<PartsCommandCenter />} />
              <Route path="owners" element={<OwnerJourneyStudio />} />

          {/* BATCH 4 */}

            <Route
              path="reports"
              element={<ReportsPage />}
            />

            <Route
              path="insights"
              element={<ServiceInsightsPage />}
            />

            <Route
              path="settings"
              element={<StudioSettingsPage />}
            />

            <Route
              path="data"
              element={<DataCenterPage />}
            />
          </Route>

          {/* FALLBACK */}

          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </div>

      {!isWorkshop && <Footer />}
    </div>
  );
}