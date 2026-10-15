import {
  SERVICES,
  findService,
  findVehicleType,
  formatPeso,
  localDateKey,
} from "./autoData.js";

export const SERVICE_LOGS_KEY =
  "your-drive-demo-service-logs-v1";

export const ODOMETERS_KEY =
  "your-drive-demo-odometers-v1";

export const MAINTENANCE_RULES = [
  {
    id: "engine-maintenance",
    serviceId: "preventive-maintenance",
    title: "Routine Maintenance",
    category: "Engine & Fluids",
    intervalKm: 7000,
    intervalMonths: 6,
    warningKm: 800,
    warningDays: 30,
    description:
      "A fictional routine-care reminder based on sample mileage and calendar intervals.",
  },
  {
    id: "brake-inspection",
    serviceId: "brake-system-care",
    title: "Brake Condition Review",
    category: "Vehicle Inspection",
    intervalKm: 15000,
    intervalMonths: 12,
    warningKm: 1500,
    warningDays: 45,
    description:
      "An illustrative follow-up interval, not a substitute for checking brake condition whenever concerns appear.",
  },
  {
    id: "cabin-comfort",
    serviceId: "aircon-performance",
    title: "Cabin Cooling Review",
    category: "Comfort Systems",
    intervalKm: 12000,
    intervalMonths: 12,
    warningKm: 1200,
    warningDays: 45,
    description:
      "A sample schedule for reviewing cabin cooling and related comfort components.",
  },
  {
    id: "tire-condition",
    serviceId: "tire-wheel-inspection",
    title: "Tire Condition Review",
    category: "Wheels & Tires",
    intervalKm: 10000,
    intervalMonths: 6,
    warningKm: 1000,
    warningDays: 30,
    description:
      "A fictional record-keeping interval. Tire condition and pressure may require more frequent real-world inspection.",
  },
];

export const MAINTENANCE_CATEGORIES = [
  "All",
  "Engine & Fluids",
  "Vehicle Inspection",
  "Comfort Systems",
  "Wheels & Tires",
];

export function loadOdometers() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(ODOMETERS_KEY) || "{}"
    );

    if (
      !saved ||
      typeof saved !== "object" ||
      Array.isArray(saved)
    ) {
      return {};
    }

    const safe = {};

    Object.entries(saved).forEach(([id, reading]) => {
      if (
        typeof id === "string" &&
        typeof reading === "number" &&
        Number.isInteger(reading) &&
        reading >= 0 &&
        reading <= 3000000
      ) {
        safe[id] = reading;
      }
    });

    return safe;
  } catch {
    return {};
  }
}

export function addCalendarDays(dateKey, offset) {
  const date = new Date(`${dateKey}T12:00:00`);

  date.setDate(date.getDate() + offset);

  return localDateKey(date);
}

export function addCalendarMonths(dateKey, count) {
  const original = new Date(
    `${dateKey}T12:00:00`
  );

  if (Number.isNaN(original.getTime())) {
    return null;
  }

  const target = new Date(
    original.getFullYear(),
    original.getMonth() + count,
    1,
    12
  );

  const finalDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0
  ).getDate();

  target.setDate(
    Math.min(
      original.getDate(),
      finalDay
    )
  );

  return localDateKey(target);
}

export function startOfMonth(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);

  date.setDate(1);

  return localDateKey(date);
}

export function monthCells(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);

  date.setDate(1);

  const firstWeekday = date.getDay();

  return Array.from(
    { length: 42 },
    (_, index) => {
      const day = new Date(
        date.getFullYear(),
        date.getMonth(),
        index - firstWeekday + 1,
        12
      );

      return {
        key: localDateKey(day),
        number: day.getDate(),
        currentMonth:
          day.getMonth() === date.getMonth(),
      };
    }
  );
}

export function latestServiceLog(
  logs,
  vehicleId,
  serviceId
) {
  return (
    logs
      .filter(
        (log) =>
          log.vehicleId === vehicleId &&
          log.serviceId === serviceId
      )
      .sort((a, b) => {
        const byDate =
          b.performedDate.localeCompare(
            a.performedDate
          );

        return byDate !== 0
          ? byDate
          : (b.mileage || 0) -
              (a.mileage || 0);
      })[0] || null
  );
}

export function maintenanceCondition({
  rule,
  lastLog,
  odometer,
}) {
  if (!lastLog) {
    return {
      state: "untracked",
      label: "No history",
      dueDate: null,
      dueKm: null,
      kmLeft: null,
      daysLeft: null,
      progress: 0,
    };
  }

  const dueDate = addCalendarMonths(
    lastLog.performedDate,
    rule.intervalMonths
  );

  const dueKm =
    lastLog.mileage + rule.intervalKm;

  const hasReading =
    typeof odometer === "number" &&
    Number.isFinite(odometer);

  const kmLeft = hasReading
    ? dueKm - odometer
    : null;

  const today = localDateKey();

  const daysLeft = Math.round(
    (
      new Date(`${dueDate}T12:00:00`) -
      new Date(`${today}T12:00:00`)
    ) / 86400000
  );

  const dueByDate = daysLeft <= 0;

  const dueByMileage =
    kmLeft !== null &&
    kmLeft <= 0;

  const nearDate =
    daysLeft <= rule.warningDays;

  const nearMileage =
    kmLeft !== null &&
    kmLeft <= rule.warningKm;

  let state = "on-track";
  let label = "On track";

  if (dueByDate || dueByMileage) {
    state = "due";
    label = "Review due";
  } else if (nearDate || nearMileage) {
    state = "soon";
    label = "Review approaching";
  }

  const elapsedKm = hasReading
    ? Math.max(
        0,
        odometer - lastLog.mileage
      )
    : 0;

  const mileageProgress =
    (elapsedKm / rule.intervalKm) * 100;

  const totalDays = Math.max(
    1,
    Math.round(
      (
        new Date(`${dueDate}T12:00:00`) -
        new Date(
          `${lastLog.performedDate}T12:00:00`
        )
      ) / 86400000
    )
  );

  const elapsedDays =
    totalDays - daysLeft;

  const dateProgress =
    (elapsedDays / totalDays) * 100;

  return {
    state,
    label,
    dueDate,
    dueKm,
    kmLeft,
    daysLeft,

    progress: Math.max(
      0,
      Math.min(
        100,
        Math.round(
          Math.max(
            mileageProgress,
            dateProgress
          )
        )
      )
    ),
  };
}

export function vehicleActivity({
  vehicle,
  logs,
  requests,
}) {
  if (!vehicle) return [];

  const maintenanceEntries = logs
    .filter(
      (log) =>
        log.vehicleId === vehicle.id
    )
    .map((log) => ({
      id: log.id,
      kind: "maintenance",
      date: log.performedDate,
      title:
        findService(log.serviceId)?.name ||
        "Service record",
      subtitle: "Recorded sample maintenance",
      mileage: log.mileage,
      note: log.note,
    }));

  const appointmentEntries = requests
    .filter((request) => {
      return (
        request.savedVehicleId === vehicle.id
      );
    })
    .map((request) => ({
      id: request.id,
      kind: "request",
      date: request.date,
      title: request.requestAlias,
      subtitle:
        request.status === "cancelled"
          ? "Cancelled sample request"
          : "Proposed service visit",
      mileage: null,
      note: request.notes,
      total: request.total,
      status: request.status,
    }));

  return [
    ...maintenanceEntries,
    ...appointmentEntries,
  ].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

function safeCsvValue(value) {
  let text = String(value ?? "");

  if (/^\s*[=+\-@]/.test(text)) {
    text = "'" + text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function downloadVehicleHistory({
  vehicle,
  activity,
}) {
  const headers = [
    "Record Type",
    "Date",
    "Title",
    "Description",
    "Mileage km",
    "Saved Estimate PHP",
    "Notes",
  ];

  const rows = activity.map((item) => [
    item.kind,
    item.date,
    item.title,
    item.subtitle,
    item.mileage ?? "",
    item.total ?? "",
    item.note ?? "",
  ]);

  const csv =
    "\uFEFF" +
    [
      headers.map(safeCsvValue).join(","),
      ...rows.map(
        (row) =>
          row.map(safeCsvValue).join(",")
      ),
    ].join("\r\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  const safeName = vehicle.alias
    .replace(/[^a-z0-9_-]/gi, "-")
    .slice(0, 45);

  anchor.href = url;
  anchor.download =
    `your-drive-${safeName}-demo-history.csv`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );
}

export function serviceComparisonDetails(
  serviceId,
  vehicleType
) {
  const service = findService(serviceId);
  const vehicle = findVehicleType(vehicleType);

  if (!service || !vehicle) {
    return null;
  }

  const adjustedPrice =
    Math.round(
      (service.basePrice *
        vehicle.multiplier) /
        50
    ) * 50;

  return {
    ...service,
    adjustedPrice,
    adjustedPriceText: formatPeso(
      adjustedPrice
    ),
  };
}