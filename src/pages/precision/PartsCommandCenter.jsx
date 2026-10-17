
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Boxes,
  ChartNoAxesColumnIncreasing,
  CircleAlert,
  ClipboardList,
  Download,
  PackageCheck,
  Plus,
  RotateCcw,
  Search,
  ShoppingCart,
  Truck,
  Wrench,
  X,
} from "lucide-react";

import { formatPeso } from "../../data/autoData.js";
import "../../styles/parts-command.css";

const KEY = "your-drive:parts-command:v1";
const JOB_KEY = "your-drive:service-intelligence:v1";

const TABS = [
  ["stock", "Inventory ledger", Boxes],
  ["vendors", "Supply partners", Truck],
  ["orders", "Purchase orders", ShoppingCart],
  ["costing", "Repair costing", Wrench],
  ["analytics", "Analytics", ChartNoAxesColumnIncreasing],
];

const SAMPLE_PARTS = [
  ["OIL-5W30", "Synthetic engine oil 5W-30", "Fluids", "s1", 9, 5, 1600, 2300],
  ["FLT-010", "Engine oil filter", "Filters", "s1", 4, 6, 210, 420],
  ["BRK-220", "Front brake pad set", "Brakes", "s2", 3, 4, 1450, 2250],
  ["BAT-NS60", "NS60 battery", "Electrical", "s2", 6, 3, 3700, 4750],
  ["CAB-001", "Cabin air filter", "Filters", "s1", 11, 5, 310, 680],
  ["CLT-004", "Premixed coolant 1 L", "Fluids", "s1", 2, 5, 180, 370],
  ["WPR-022", "Wiper blade pair", "Accessories", "s2", 8, 4, 520, 900],
];

const now = () => new Date().toISOString();

const id = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const asNumber = (v, max = 10000000) =>
  Math.min(max, Math.max(0, Number(v) || 0));

const whole = (v) => Math.floor(asNumber(v, 100000));

function initial() {
  return {
    parts: SAMPLE_PARTS.map(
      ([sku, name, category, supplierId, qty, minQty, cost, price]) => ({
        id: sku,
        sku,
        name,
        category,
        supplierId,
        qty,
        minQty,
        cost,
        price,
      })
    ),

    vendors: [
      {
        id: "s1",
        name: "Sample Components Co.",
        leadDays: 3,
        terms: "Demo supplier · local stock",
      },
      {
        id: "s2",
        name: "Demo Auto Supply Hub",
        leadDays: 5,
        terms: "Demo supplier · special orders",
      },
    ],

    movements: [],
    orders: [],
    drafts: {},
  };
}

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));

    if (
      data &&
      Array.isArray(data.parts) &&
      Array.isArray(data.vendors) &&
      Array.isArray(data.orders) &&
      Array.isArray(data.movements) &&
      data.drafts &&
      typeof data.drafts === "object"
    ) {
      return data;
    }
  } catch {
    // No browser store.
  }

  return initial();
}

function getJobs() {
  try {
    const data = JSON.parse(localStorage.getItem(JOB_KEY));
    return Array.isArray(data?.jobs) ? data.jobs : [];
  } catch {
    return [];
  }
}

function download(filename, content, type) {
  const url = URL.createObjectURL(
    new Blob([content], { type })
  );

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csv(rows) {
  return "\uFEFF" + rows
    .map((row) =>
      row.map((v) => {
        let s = String(v ?? "");

        if (/^\s*[=+@-]/.test(s)) {
          s = "'" + s;
        }

        return `"${s.replace(/"/g, '""')}"`;
      }).join(",")
    )
    .join("\r\n");
}

function dateLabel(value) {
  const d = new Date(value);

  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      });
}

function Metric({ label, value, note, icon: Icon }) {
  return (
    <div className="pc-metric">
      <div>
        <span>{label}</span>
        <Icon size={18} />
      </div>

      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

export default function PartsCommandCenter() {
  const [data, setData] = useState(load);
  const [tab, setTab] = useState("stock");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [jobs, setJobs] = useState(getJobs);
  const [jobId, setJobId] = useState("manual");

  const [partForm, setPartForm] = useState({
    sku: "",
    name: "",
    category: "Filters",
    supplierId: "s1",
    qty: 0,
    minQty: 3,
    cost: 0,
    price: 0,
  });

  const [vendorForm, setVendorForm] = useState({
    name: "",
    leadDays: 3,
    terms: "",
  });

  const [orderPart, setOrderPart] = useState("");
  const [orderQty, setOrderQty] = useState(5);
  const [costPart, setCostPart] = useState("");
  const [costQty, setCostQty] = useState(1);
  const [adjusts, setAdjusts] = useState({});
  const [showAdd, setShowAdd] = useState(false);

  const low = data.parts.filter(
    (p) => p.qty <= p.minQty
  );

  const stockValue = data.parts.reduce(
    (sum, p) => sum + p.qty * p.cost,
    0
  );

  const possibleRetail = data.parts.reduce(
    (sum, p) => sum + p.qty * p.price,
    0
  );

  const categories = [
    "All",
    ...new Set(data.parts.map((p) => p.category)),
  ];

  const visible = data.parts.filter(
    (p) =>
      (filter === "All" || p.category === filter) &&
      [p.name, p.sku, p.category]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const chosenJob = jobs.find((j) => j.id === jobId);
  const draftKey = chosenJob?.id || "manual";

  const draft = data.drafts[draftKey] || {
    lines: [],
    hours: 2,
    rate: 650,
    extra: 0,
  };

  const partCost = draft.lines.reduce(
    (sum, l) => sum + l.qty * l.cost,
    0
  );

  const partSell = draft.lines.reduce(
    (sum, l) => sum + l.qty * l.price,
    0
  );

  const labor =
    asNumber(draft.hours, 10000) *
    asNumber(draft.rate);

  const quoteTotal =
    partSell + labor + asNumber(draft.extra);

  const grossMargin = quoteTotal
    ? Math.round(
        ((quoteTotal - partCost - labor) /
          quoteTotal) * 100
      )
    : 0;

  const month = new Date().toISOString().slice(0, 7);

  const monthMoves = data.movements.filter(
    (m) => m.at.startsWith(month)
  );

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [data]);

  function movement(partId, change, reason) {
    const part = data.parts.find(
      (p) => p.id === partId
    );

    const units = Math.trunc(Number(change));

    if (
      !part ||
      !Number.isFinite(units) ||
      !units ||
      part.qty + units < 0 ||
      Math.abs(units) > 100000
    ) {
      setNotice(
        "Invalid stock movement. Stock cannot go below zero."
      );
      return;
    }

    setData((old) => ({
      ...old,

      parts: old.parts.map((p) =>
        p.id === partId
          ? { ...p, qty: p.qty + units }
          : p
      ),

      movements: [
        {
          id: id(),
          at: now(),
          sku: part.sku,
          units,
          reason,
        },
        ...old.movements,
      ].slice(0, 500),
    }));

    setNotice(
      `${part.sku}: ${units > 0 ? "+" : ""}${units} units recorded (demo).`
    );
  }

  function addPart(e) {
    e.preventDefault();

    const sku = partForm.sku.trim().toUpperCase();

    if (
      !sku ||
      !partForm.name.trim() ||
      data.parts.some((p) => p.sku === sku) ||
      data.parts.length >= 80
    ) {
      setNotice(
        "Enter a unique SKU and name. Maximum 80 parts."
      );
      return;
    }

    const part = {
      ...partForm,
      id: id(),
      sku,
      name: partForm.name.trim(),
      qty: whole(partForm.qty),
      minQty: whole(partForm.minQty),
      cost: asNumber(partForm.cost),
      price: asNumber(partForm.price),
    };

    setData((old) => ({
      ...old,
      parts: [part, ...old.parts],
    }));

    setShowAdd(false);

    setPartForm({
      ...partForm,
      sku: "",
      name: "",
      qty: 0,
      cost: 0,
      price: 0,
    });

    setNotice("New demo inventory part saved.");
  }

  function addVendor(e) {
    e.preventDefault();

    if (
      !vendorForm.name.trim() ||
      data.vendors.length >= 30
    ) {
      return;
    }

    setData((old) => ({
      ...old,

      vendors: [
        ...old.vendors,
        {
          id: id(),
          name: vendorForm.name.trim(),
          leadDays: whole(vendorForm.leadDays),
          terms: vendorForm.terms.trim(),
        },
      ],
    }));

    setVendorForm({
      name: "",
      leadDays: 3,
      terms: "",
    });
  }

  function createOrder(e) {
    e.preventDefault();

    const part = data.parts.find(
      (p) => p.id === orderPart
    );

    const qty = whole(orderQty);

    if (
      !part ||
      !qty ||
      data.orders.length >= 100
    ) {
      setNotice(
        "Select a part and quantity."
      );
      return;
    }

    setData((old) => ({
      ...old,

      orders: [
        {
          id: id(),
          at: now(),
          partId: part.id,
          sku: part.sku,
          supplierId: part.supplierId,
          qty,
          unitCost: part.cost,
          status: "Draft",
        },
        ...old.orders,
      ],
    }));

    setNotice(
      "Draft purchase order created. No supplier was contacted."
    );
  }

  function receiveOrder(po) {
    const part = data.parts.find(
      (p) => p.id === po.partId
    );

    if (po.status !== "Draft" || !part) {
      return;
    }

    if (
      !window.confirm(
        `Simulate receiving ${po.qty} units of ${po.sku}? This increases local demo stock.`
      )
    ) {
      return;
    }

    setData((old) => ({
      ...old,

      parts: old.parts.map((p) =>
        p.id === po.partId
          ? { ...p, qty: p.qty + po.qty }
          : p
      ),

      orders: old.orders.map((o) =>
        o.id === po.id
          ? {
              ...o,
              status: "Received",
              receivedAt: now(),
            }
          : o
      ),

      movements: [
        {
          id: id(),
          at: now(),
          sku: po.sku,
          units: po.qty,
          reason: "PO receipt (demo)",
        },
        ...old.movements,
      ].slice(0, 500),
    }));
  }

  function changeDraft(patch) {
    setData((old) => ({
      ...old,

      drafts: {
        ...old.drafts,
        [draftKey]: {
          ...draft,
          ...patch,
        },
      },
    }));
  }

  function addCostPart() {
    const part = data.parts.find(
      (p) => p.id === costPart
    );

    const qty = whole(costQty);

    if (!part || !qty) {
      return;
    }

    changeDraft({
      lines: [
        ...draft.lines,
        {
          id: id(),
          sku: part.sku,
          name: part.name,
          qty,
          cost: part.cost,
          price: part.price,
        },
      ],
    });

    setNotice(
      "Added to costing scenario only. Inventory stock was not deducted."
    );
  }

  function exportStock() {
    download(
      "your-drive-inventory.csv",

      csv([
        [
          "SKU",
          "Part",
          "Category",
          "Supplier",
          "Stock",
          "Reorder at",
          "Unit cost PHP",
          "Sell price PHP",
        ],

        ...data.parts.map((p) => [
          p.sku,
          p.name,
          p.category,
          data.vendors.find(
            (v) => v.id === p.supplierId
          )?.name || "Unassigned",
          p.qty,
          p.minQty,
          p.cost,
          p.price,
        ]),
      ]),

      "text/csv;charset=utf-8"
    );
  }

  function backup() {
    download(
      "your-drive-parts-v4-backup.json",

      JSON.stringify(
        {
          schema: "your-drive-parts-v4",
          savedAt: now(),
          data,
        },
        null,
        2
      ),

      "application/json"
    );
  }

  return (
    <div className="pc-root">
      <section className="pc-banner">
        <div className="pc-banner-copy">
          <span className="pc-over">
            YOUR DRIVE / COMPONENTS OPERATIONS / V4
          </span>

          <h1>
            CONTROL THE <em>COMPONENT.</em>
          </h1>

          <p>
            Every part has a cost. Every order has a
            history. Explore an interconnected demo
            for stock, supply planning and repair margins.
          </p>

          <span className="pc-demo-label">
            <span />
            FICTIONAL INVENTORY · BROWSER-LOCAL
          </span>
        </div>

        <div
          className="pc-banner-mark"
          aria-hidden="true"
        >
          <span>YD</span>
          <small>
            PARTS
            <br />
            CONTROL
          </small>
        </div>
      </section>

      <div className="pc-body">
        <div className="pc-notice">
          <CircleAlert size={19} />

          <p>
            <strong>Operations simulation.</strong>{" "}
            Sample inventory, suppliers, purchase orders
            and cost figures are not real business records.
            No online purchasing, stock sync, real invoices
            or payment processing. V3 repair jobs are only
            read, never edited here.
          </p>
        </div>

        {storageError && (
          <div className="pc-feedback" role="alert">
            Local storage blocked or full; changes
            may not persist.
          </div>
        )}

        {notice && (
          <div className="pc-feedback" role="status">
            {notice}

            <button
              onClick={() => setNotice("")}
              aria-label="Close notice"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="pc-metrics">
          <Metric
            label="PARTS ON FILE"
            value={data.parts.length}
            note="Demo SKUs in stock ledger"
            icon={Boxes}
          />

          <Metric
            label="REORDER ALERTS"
            value={low.length}
            note="At or below stock threshold"
            icon={CircleAlert}
          />

          <Metric
            label="INVENTORY AT COST"
            value={formatPeso(stockValue)}
            note="Quantity × sample unit cost"
            icon={PackageCheck}
          />

          <Metric
            label="STOCK RETAIL VALUE"
            value={formatPeso(possibleRetail)}
            note="Illustrative, not sales revenue"
            icon={ChartNoAxesColumnIncreasing}
          />
        </div>

        <div className="pc-layout">
          <aside className="pc-rail">
            <span className="pc-over">
              OPERATIONS DIRECTORY
            </span>

            <div className="pc-rail-nav">
              {TABS.map(([key, label, Icon], i) => (
                <button
                  key={key}
                  className={tab === key ? "active" : ""}
                  onClick={() => setTab(key)}
                >
                  <span>
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <Icon size={16} />

                  {label}

                  <ArrowUpRight size={14} />
                </button>
              ))}
            </div>

            <div className="pc-rail-foot">
              <small>
                LOCAL MODEL / SYSTEM 004
              </small>

              <p>
                Supply visibility. Better decisions.
              </p>

              <button onClick={backup}>
                <Download size={15} />
                Export V4 backup
              </button>
            </div>
          </aside>

          <main className="pc-workspace">
            {tab === "stock" && (
              <section className="pc-section">
                <header className="pc-heading">
                  <div>
                    <span className="pc-over">
                      01 / COMPONENT LEDGER
                    </span>

                    <h2>
                      Every part.{" "}
                      <em>Accounted for.</em>
                    </h2>

                    <p>
                      Search parts, adjust demo stock,
                      and flag what needs reordering.
                    </p>
                  </div>

                  <button
                    className="pc-primary"
                    onClick={() => setShowAdd(!showAdd)}
                  >
                    <Plus size={17} />
                    Add part
                  </button>
                </header>

                {showAdd && (
                  <form
                    className="pc-form pc-form-grid"
                    onSubmit={addPart}
                  >
                    <label>
                      SKU
                      <input
                        required
                        maxLength={22}
                        value={partForm.sku}
                        onChange={(e) =>
                          setPartForm({
                            ...partForm,
                            sku: e.target.value,
                          })
                        }
                        placeholder="FLT-020"
                      />
                    </label>

                    <label>
                      Part name
                      <input
                        required
                        maxLength={80}
                        value={partForm.name}
                        onChange={(e) =>
                          setPartForm({
                            ...partForm,
                            name: e.target.value,
                          })
                        }
                      />
                    </label>

                    <label>
                      Category
                      <select
                        value={partForm.category}
                        onChange={(e) =>
                          setPartForm({
                            ...partForm,
                            category: e.target.value,
                          })
                        }
                      >
                        {[
                          "Filters",
                          "Fluids",
                          "Brakes",
                          "Electrical",
                          "Accessories",
                          "Others",
                        ].map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Supplier
                      <select
                        value={partForm.supplierId}
                        onChange={(e) =>
                          setPartForm({
                            ...partForm,
                            supplierId: e.target.value,
                          })
                        }
                      >
                        {data.vendors.map((v) => (
                          <option
                            key={v.id}
                            value={v.id}
                          >
                            {v.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    {[
                      ["qty", "Initial stock"],
                      ["minQty", "Reorder threshold"],
                      ["cost", "Unit cost PHP"],
                      ["price", "Retail PHP"],
                    ].map(([key, label]) => (
                      <label key={key}>
                        {label}

                        <input
                          type="number"
                          min="0"
                          max="9999999"
                          step={
                            key === "qty" ||
                            key === "minQty"
                              ? "1"
                              : "0.01"
                          }
                          value={partForm[key]}
                          onChange={(e) =>
                            setPartForm({
                              ...partForm,
                              [key]: e.target.value,
                            })
                          }
                        />
                      </label>
                    ))}

                    <button
                      className="pc-primary"
                      type="submit"
                    >
                      Save demo part
                      <ArrowUpRight size={17} />
                    </button>
                  </form>
                )}

                <div className="pc-filters">
                  <label>
                    <Search size={16} />

                    <input
                      placeholder="Search part name, SKU, category..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                    />
                  </label>

                  <select
                    value={filter}
                    onChange={(e) =>
                      setFilter(e.target.value)
                    }
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>

                  <button onClick={exportStock}>
                    <Download size={15} />
                    CSV
                  </button>
                </div>

                <div className="pc-table-wrap">
                  <table className="pc-table">
                    <thead>
                      <tr>
                        <th>PART / SKU</th>
                        <th>SUPPLIER</th>
                        <th>STOCK</th>
                        <th>UNIT COST</th>
                        <th>RETAIL</th>
                        <th>STOCK MOVEMENT</th>
                      </tr>
                    </thead>

                    <tbody>
                      {visible.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <strong>
                              {p.name}
                            </strong>

                            <small>
                              {p.sku} / {p.category}
                            </small>
                          </td>

                          <td>
                            {data.vendors.find(
                              (v) =>
                                v.id === p.supplierId
                            )?.name || "Unassigned"}
                          </td>

                          <td>
                            <span
                              className={
                                `pc-stock ${
                                  p.qty <= p.minQty
                                    ? "low"
                                    : ""
                                }`
                              }
                            >
                              {p.qty} units
                            </span>

                            <small>
                              Alert at {p.minQty}
                            </small>
                          </td>

                          <td>
                            {formatPeso(p.cost)}
                          </td>

                          <td>
                            {formatPeso(p.price)}
                          </td>

                          <td>
                            <div className="pc-adjust">
                              <input
                                type="number"
                                aria-label={
                                  `Quantity to move for ${p.sku}`
                                }
                                min="1"
                                max="9999"
                                value={
                                  adjusts[p.id] ?? 1
                                }
                                onChange={(e) =>
                                  setAdjusts({
                                    ...adjusts,
                                    [p.id]:
                                      e.target.value,
                                  })
                                }
                              />

                              <button
                                title="Receive stock"
                                onClick={() =>
                                  movement(
                                    p.id,
                                    whole(
                                      adjusts[p.id] ?? 1
                                    ),
                                    "Manual receipt"
                                  )
                                }
                              >
                                + IN
                              </button>

                              <button
                                title="Issue stock"
                                onClick={() =>
                                  movement(
                                    p.id,
                                    -whole(
                                      adjusts[p.id] ?? 1
                                    ),
                                    "Manual issue"
                                  )
                                }
                              >
                                − OUT
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {!visible.length && (
                    <p className="pc-empty">
                      No matching parts found.
                    </p>
                  )}
                </div>
              </section>
            )}

            {tab === "vendors" && (
              <section className="pc-section">
                <header className="pc-heading">
                  <div>
                    <span className="pc-over">
                      02 / PROCUREMENT NETWORK
                    </span>

                    <h2>
                      Supply <em>partners.</em>
                    </h2>

                    <p>
                      Directory of fictional suppliers
                      and illustrative lead times.
                    </p>
                  </div>
                </header>

                <div className="pc-vendors">
                  {data.vendors.map((v, i) => (
                    <article key={v.id}>
                      <span>
                        PARTNER /{" "}
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <Truck size={27} />

                      <h3>{v.name}</h3>
                      <p>
                        {v.terms ||
                          "Demo partner profile"}
                      </p>

                      <div>
                        <strong>
                          {v.leadDays} days
                        </strong>

                        <small>
                          Illustrative lead time
                        </small>
                      </div>

                      <small>
                        {data.parts.filter(
                          (p) =>
                            p.supplierId === v.id
                        ).length}{" "}
                        catalog parts assigned
                      </small>
                    </article>
                  ))}
                </div>

                <form
                  className="pc-form pc-vendor-form"
                  onSubmit={addVendor}
                >
                  <h3>
                    Add a sample supplier
                  </h3>

                  <label>
                    Supplier name
                    <input
                      required
                      maxLength={75}
                      value={vendorForm.name}
                      onChange={(e) =>
                        setVendorForm({
                          ...vendorForm,
                          name: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Estimated lead days
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={vendorForm.leadDays}
                      onChange={(e) =>
                        setVendorForm({
                          ...vendorForm,
                          leadDays: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    Notes
                    <input
                      maxLength={130}
                      value={vendorForm.terms}
                      onChange={(e) =>
                        setVendorForm({
                          ...vendorForm,
                          terms: e.target.value,
                        })
                      }
                    />
                  </label>

                  <button
                    className="pc-primary"
                    type="submit"
                  >
                    <Plus size={15} />
                    Add supplier
                  </button>
                </form>
              </section>
            )}

            {tab === "orders" && (
              <section className="pc-section">
                <header className="pc-heading">
                  <div>
                    <span className="pc-over">
                      03 / PURCHASE ORDER PLANNING
                    </span>

                    <h2>
                      Replenish{" "}
                      <em>deliberately.</em>
                    </h2>

                    <p>
                      Create draft orders and
                      simulate receipt into the
                      inventory ledger.
                    </p>
                  </div>
                </header>

                {low.length > 0 && (
                  <div className="pc-low-callout">
                    <CircleAlert size={19} />

                    <span>
                      {low.length} parts are at/below
                      their reorder threshold.
                    </span>

                    <button
                      onClick={() => {
                        setOrderPart(low[0].id);

                        setOrderQty(
                          Math.max(
                            1,
                            low[0].minQty * 2 -
                              low[0].qty
                          )
                        );
                      }}
                    >
                      Prepare first alert ↗
                    </button>
                  </div>
                )}

                <form
                  className="pc-form pc-order-form"
                  onSubmit={createOrder}
                >
                  <label>
                    Order component

                    <select
                      value={orderPart}
                      onChange={(e) =>
                        setOrderPart(e.target.value)
                      }
                      required
                    >
                      <option value="">
                        Select component...
                      </option>

                      {data.parts.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                        >
                          {p.sku} — {p.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Units to order

                    <input
                      type="number"
                      min="1"
                      max="100000"
                      step="1"
                      value={orderQty}
                      onChange={(e) =>
                        setOrderQty(e.target.value)
                      }
                    />
                  </label>

                  <button
                    className="pc-primary"
                    type="submit"
                  >
                    <Plus size={16} />
                    Create draft PO
                  </button>
                </form>

                <div className="pc-order-list">
                  {data.orders.map((o) => (
                    <article key={o.id}>
                      <span className="pc-po-number">
                        PO /{" "}
                        {o.id.slice(0, 8).toUpperCase()}
                      </span>

                      <div>
                        <strong>
                          {o.sku}{" "}
                          <small>× {o.qty}</small>
                        </strong>

                        <p>
                          Supplier:{" "}
                          {data.vendors.find(
                            (v) =>
                              v.id === o.supplierId
                          )?.name || "Unknown"}

                          <span>
                            {" "}· {dateLabel(o.at)}
                          </span>
                        </p>
                      </div>

                      <div>
                        <b>
                          {formatPeso(
                            o.qty * o.unitCost
                          )}
                        </b>

                        <small>
                          Estimated purchasing cost
                        </small>
                      </div>

                      <span
                        className={
                          `pc-po-status ${
                            o.status === "Received"
                              ? "received"
                              : ""
                          }`
                        }
                      >
                        {o.status}
                      </span>

                      {o.status === "Draft" && (
                        <button
                          className="pc-small-action"
                          onClick={() =>
                            receiveOrder(o)
                          }
                        >
                          <PackageCheck size={15} />
                          Simulate receipt
                        </button>
                      )}
                    </article>
                  ))}

                  {!data.orders.length && (
                    <div className="pc-empty">
                      No purchase orders yet.
                      These orders are local drafts only.
                    </div>
                  )}
                </div>
              </section>
            )}

            {tab === "costing" && (
              <section className="pc-section">
                <header className="pc-heading">
                  <div>
                    <span className="pc-over">
                      04 / REPAIR ECONOMICS
                    </span>

                    <h2>
                      Know the <em>margin.</em>
                    </h2>

                    <p>
                      Cost a job using parts and labor.
                      Stock is never automatically
                      deducted.
                    </p>
                  </div>

                  <button
                    className="pc-secondary"
                    onClick={() => {
                      setJobs(getJobs());

                      setNotice(
                        "Refreshed read-only V3 job references."
                      );
                    }}
                  >
                    <RotateCcw size={15} />
                    Refresh V3 jobs
                  </button>
                </header>

                <div className="pc-form pc-cost-toolbar">
                  <label>
                    Costing scenario

                    <select
                      value={jobId}
                      onChange={(e) =>
                        setJobId(e.target.value)
                      }
                    >
                      <option value="manual">
                        Independent scenario
                      </option>

                      {jobs.map((j) => (
                        <option
                          value={j.id}
                          key={j.id}
                        >
                          {j.reference} / {j.vehicle}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Add catalog part

                    <select
                      value={costPart}
                      onChange={(e) =>
                        setCostPart(e.target.value)
                      }
                    >
                      <option value="">
                        Choose component...
                      </option>

                      {data.parts.map((p) => (
                        <option
                          key={p.id}
                          value={p.id}
                        >
                          {p.sku} — {p.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Quantity

                    <input
                      type="number"
                      min="1"
                      max="10000"
                      step="1"
                      value={costQty}
                      onChange={(e) =>
                        setCostQty(e.target.value)
                      }
                    />
                  </label>

                  <button
                    className="pc-primary"
                    onClick={addCostPart}
                    type="button"
                  >
                    <Plus size={15} />
                    Add to cost
                  </button>
                </div>

                {chosenJob && (
                  <div className="pc-linked">
                    <ClipboardList size={17} />

                    Read-only V3 link:{" "}
                    {chosenJob.reference} ·{" "}
                    {chosenJob.vehicle}.
                    Existing work order is unchanged.
                  </div>
                )}

                <div className="pc-cost-lines">
                  {draft.lines.map((l) => (
                    <div key={l.id}>
                      <div>
                        <strong>
                          {l.name}
                        </strong>

                        <small>
                          {l.sku} · {l.qty} unit(s)
                        </small>
                      </div>

                      <span>
                        Cost{" "}
                        {formatPeso(
                          l.qty * l.cost
                        )}
                      </span>

                      <b>
                        Quote{" "}
                        {formatPeso(
                          l.qty * l.price
                        )}
                      </b>

                      <button
                        onClick={() =>
                          changeDraft({
                            lines:
                              draft.lines.filter(
                                (x) =>
                                  x.id !== l.id
                              ),
                          })
                        }
                        aria-label={
                          `Remove ${l.name}`
                        }
                      >
                        <X size={17} />
                      </button>
                    </div>
                  ))}

                  {!draft.lines.length && (
                    <p className="pc-empty">
                      No parts in this costing
                      scenario.
                    </p>
                  )}
                </div>

                <div className="pc-cost-bottom">
                  <div className="pc-form">
                    <label>
                      Labor hours

                      <input
                        type="number"
                        min="0"
                        max="10000"
                        step="0.5"
                        value={draft.hours}
                        onChange={(e) =>
                          changeDraft({
                            hours: asNumber(
                              e.target.value,
                              10000
                            ),
                          })
                        }
                      />
                    </label>

                    <label>
                      Labor rate / hour (PHP)

                      <input
                        type="number"
                        min="0"
                        max="999999"
                        step="50"
                        value={draft.rate}
                        onChange={(e) =>
                          changeDraft({
                            rate: asNumber(
                              e.target.value
                            ),
                          })
                        }
                      />
                    </label>

                    <label>
                      Other charges (PHP)

                      <input
                        type="number"
                        min="0"
                        max="999999"
                        step="50"
                        value={draft.extra}
                        onChange={(e) =>
                          changeDraft({
                            extra: asNumber(
                              e.target.value
                            ),
                          })
                        }
                      />
                    </label>
                  </div>

                  <div className="pc-cost-receipt">
                    <span>
                      REPAIR COSTING / ILLUSTRATIVE
                    </span>

                    <div>
                      <small>
                        Parts purchase cost
                      </small>
                      <strong>
                        {formatPeso(partCost)}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Parts selling price
                      </small>
                      <strong>
                        {formatPeso(partSell)}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Labor & other
                      </small>
                      <strong>
                        {formatPeso(
                          labor + asNumber(draft.extra)
                        )}
                      </strong>
                    </div>

                    <div className="pc-grand">
                      <small>
                        Draft quote
                      </small>
                      <strong>
                        {formatPeso(quoteTotal)}
                      </strong>
                    </div>

                    <p>
                      Illustrative gross margin:{" "}
                      {grossMargin}%.
                      Excludes overhead, taxes and
                      many operating expenses; not
                      actual profit.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {tab === "analytics" && (
              <section className="pc-section">
                <header className="pc-heading">
                  <div>
                    <span className="pc-over">
                      05 / INVENTORY ANALYTICS
                    </span>

                    <h2>
                      The stock <em>picture.</em>
                    </h2>

                    <p>
                      Calculated from this browser's
                      demo inventory and transaction log.
                    </p>
                  </div>

                  <button
                    className="pc-secondary"
                    onClick={exportStock}
                  >
                    <Download size={15} />
                    Export ledger
                  </button>
                </header>

                <div className="pc-analytics-grid">
                  <article>
                    <span className="pc-over">
                      CAPITAL BY CATEGORY / COST
                    </span>

                    <h3>
                      Inventory composition
                    </h3>

                    {[
                      ...new Set(
                        data.parts.map(
                          (p) => p.category
                        )
                      ),
                    ].map((category) => {
                      const amount = data.parts
                        .filter(
                          (p) =>
                            p.category === category
                        )
                        .reduce(
                          (s, p) =>
                            s + p.qty * p.cost,
                          0
                        );

                      return (
                        <div
                          className="pc-bar"
                          key={category}
                        >
                          <div>
                            <span>
                              {category}
                            </span>

                            <strong>
                              {formatPeso(amount)}
                            </strong>
                          </div>

                          <div>
                            <span
                              style={{
                                width:
                                  `${stockValue
                                    ? (amount /
                                        stockValue) *
                                      100
                                    : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </article>

                  <article>
                    <span className="pc-over">
                      RECENT TRANSACTIONS
                    </span>

                    <h3>
                      Movement journal
                    </h3>

                    {data.movements
                      .slice(0, 8)
                      .map((m) => (
                        <div
                          className="pc-movement"
                          key={m.id}
                        >
                          <span>
                            {dateLabel(m.at)}
                          </span>

                          <strong>
                            {m.sku}
                          </strong>

                          <small>
                            {m.reason}
                          </small>

                          <b
                            className={
                              m.units > 0
                                ? "positive"
                                : ""
                            }
                          >
                            {m.units > 0
                              ? "+"
                              : ""}
                            {m.units}
                          </b>
                        </div>
                      ))}

                    {!data.movements.length && (
                      <p className="pc-empty">
                        No demo transactions yet.
                        Use stock movement controls
                        or receive an order.
                      </p>
                    )}
                  </article>
                </div>

                <div className="pc-analytics-footer">
                  <span>THIS MONTH</span>

                  <strong>
                    {monthMoves.length} movements
                    recorded
                  </strong>

                  <span>
                    {data.orders.filter(
                      (o) =>
                        o.status === "Draft"
                    ).length}{" "}
                    open PO drafts
                  </span>

                  <span>
                    {data.orders.filter(
                      (o) =>
                        o.status === "Received"
                    ).length}{" "}
                    simulated receipts
                  </span>
                </div>
              </section>
            )}
          </main>
        </div>

        <footer className="pc-footer">
          YOUR DRIVE. / PRECISION COMPONENT OPERATIONS

          <span>
            V4 / FICTIONAL DEMONSTRATION /
            LOCAL DATA ONLY
          </span>
        </footer>
      </div>
    </div>
  );
}
