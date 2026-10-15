import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarRange,
  ClipboardList,
  Database,
  Gauge,
  LayoutDashboard,
  Menu,
  Settings2,
  ShieldCheck,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";

import "../styles/workshop.css";
import "../styles/intelligence.css";

const NAV = [
  {
    to: "/workshop",
    label: "Command Center",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/workshop/desk",
    label: "Service Desk",
    icon: ClipboardList,
  },
  {
    to: "/workshop/team",
    label: "Technician Board",
    icon: UsersRound,
  },
  {
    to: "/workshop/bays",
    label: "Service Bay Planner",
    icon: CalendarRange,
  },
  {
    to: "/workshop/reports",
    label: "Reports & Trends",
    icon: BarChart3,
  },
  {
    to: "/workshop/insights",
    label: "Service Insights",
    icon: Activity,
  },
  {
    to: "/workshop/settings",
    label: "Studio Settings",
    icon: Settings2,
  },
  {
    to: "/workshop/data",
    label: "Data & Backups",
    icon: Database,
  },
];

const TITLES = {
  "/workshop": "Workshop Command Center",
  "/workshop/desk": "Service Request Desk",
  "/workshop/team": "Technician Planning Board",
  "/workshop/bays": "Service Bay Planner",
  "/workshop/reports": "Reports & Trends",
  "/workshop/insights": "Service Insights",
  "/workshop/settings": "Studio Settings",
  "/workshop/data": "Data & Backups",
};

export default function WorkshopLayout({
  requests,
  operations,
  vehicles,
  serviceLogs,
  odometers,
  settings,
  onUpdateWork,
  onToggleTask,
  onSaveSettings,
  onRestoreBackup,
}) {
  const location = useLocation();

  const [open, setOpen] =
    useState(false);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    function close(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      close
    );

    return () =>
      window.removeEventListener(
        "keydown",
        close
      );
  }, [open]);

  const active = requests.filter(
    (request) =>
      request.status !== "cancelled"
  );

  return (
    <div className="yd3-shell">
      <aside
        id="yd3-sidebar"
        className={`yd3-sidebar ${
          open ? "is-open" : ""
        }`}
        aria-label="Workshop navigation"
      >
        <div>
          <Link
            to="/workshop"
            className="yd3-brand"
          >
            <span>
              <Gauge size={25} />
            </span>

            <div>
              <strong>YOUR DRIVE.</strong>

              <small>
                WORKSHOP OPERATIONS
              </small>
            </div>
          </Link>

          <div className="yd3-sidebar-rule" />

          <p className="yd3-sidebar-label">
            OPERATIONS WORKSPACE
          </p>

          <nav className="yd3-nav">
            {NAV.map(
              ({
                to,
                label,
                icon: Icon,
                end,
              }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    isActive ? "is-active" : ""
                  }
                >
                  <Icon size={19} />

                  <span>{label}</span>

                  <ArrowUpRight size={15} />
                </NavLink>
              )
            )}
          </nav>

          <div className="yd3-side-stats">
            <small>
              ACTIVE SAMPLE REQUESTS
            </small>

            <strong>
              {active.length}
            </strong>

            <span>
              Stored in this browser only
            </span>
          </div>
        </div>

        <div className="yd3-sidebar-bottom">
          <p>
            <ShieldCheck size={21} />
            FICTIONAL OPERATIONS / NO REAL REPAIRS
          </p>

          <Link to="/">
            <ArrowLeft size={17} />
            Back to Public Website
          </Link>
        </div>
      </aside>

      {open && (
        <button
          className="yd3-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setOpen(false)
          }
        />
      )}

      <div className="yd3-workspace">
        <header className="yd3-topbar">
          <div className="yd3-topbar-left">
            <button
              type="button"
              className="yd3-menu"
              aria-label="Toggle workshop menu"
              aria-expanded={open}
              aria-controls="yd3-sidebar"
              onClick={() =>
                setOpen((value) => !value)
              }
            >
              {open ? <X /> : <Menu />}
            </button>

            <div>
              <small>
                {settings.regionLabel}
              </small>

              <strong>
                {TITLES[location.pathname] ||
                  settings.studioLabel}
              </strong>
            </div>
          </div>

          <Link
            to="/book"
            className="yd3-top-action"
          >
            <Wrench size={17} />

            New Demo Request

            <ArrowUpRight size={16} />
          </Link>
        </header>

        <main className="yd3-content">
          <div className="yd3-context">
            <span>
              <ShieldCheck size={16} />

              {settings.studioLabel}
              {" — "}
              Local portfolio concept
            </span>

            <span>
              {requests.length} saved
              {" "}request drafts
            </span>
          </div>

          {settings.showDemoNotice && (
            <div className="yd3-disclaimer">
              <ShieldCheck size={19} />

              <span>
                Demo workspace only.
                All technicians, service bays,
                appointment plans, maintenance
                records, and estimates are
                fictional or browser-local.
              </span>
            </div>
          )}

          <Outlet
            context={{
              requests,
              operations,
              vehicles,
              serviceLogs,
              odometers,
              settings,
              onUpdateWork,
              onToggleTask,
              onSaveSettings,
              onRestoreBackup,
            }}
          />
        </main>

        <footer className="yd3-footer">
          <span>
            © {new Date().getFullYear()}
            {" "}YOUR DRIVE.
          </span>

          <span>
            Website Concept Made by: Web Developer Devin Planas
          </span>
        </footer>
      </div>
    </div>
  );
}