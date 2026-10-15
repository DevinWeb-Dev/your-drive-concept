import {
  SERVICES,
  VEHICLE_TYPES,
  UPGRADES,
  APPOINTMENT_TIMES,
  calculateEstimate,
  dateAfter,
  localDateKey,
} from "./autoData.js";

import {
  WORK_STAGES,
  TECHNICIANS,
  SERVICE_BAYS,
  WORK_TASKS,
} from "./workshopOps.js";

export const INTELLIGENCE_SETTINGS_KEY =
  "your-drive-demo-intelligence-settings-v1";

export const BACKUP_KIND =
  "your-drive-portfolio-demo-backup";

export const BACKUP_VERSION = 1;

export const DEFAULT_STUDIO_SETTINGS = {
  studioLabel: "YOUR DRIVE. STUDIO",
  regionLabel: "PHILIPPINES / CONCEPT WORKSPACE",
  dailyPlanningGoal: 6,
  showDemoNotice: true,
};

function isObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function textValue(value, max, name, min = 0) {
  if (typeof value !== "string") {
    throw new Error(`${name} must be text.`);
  }

  const result = value.trim();

  if (result.length < min || result.length > max) {
    throw new Error(
      `${name} must contain ${min}–${max} characters.`
    );
  }

  return result;
}

function integerValue(value, min, max, name) {
  if (
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new Error(
      `${name} must be a whole number from ${min} to ${max}.`
    );
  }

  return value;
}

function enumValue(value, options, name) {
  if (!options.includes(value)) {
    throw new Error(`Invalid ${name}.`);
  }

  return value;
}

function checkArray(value, max, name) {
  if (!Array.isArray(value) || value.length > max) {
    throw new Error(
      `${name} must be a list with at most ${max} entries.`
    );
  }

  return value;
}

function checkUnique(list, name) {
  if (
    new Set(list.map((item) => item.id)).size !==
    list.length
  ) {
    throw new Error(
      `${name} contains duplicate record IDs.`
    );
  }
}

function validCalendarDate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = new Date(`${value}T12:00:00`);

  return (
    !Number.isNaN(date.getTime()) &&
    localDateKey(date) === value
  );
}

function checkDate(value, name) {
  if (
    !validCalendarDate(value) ||
    value < "2000-01-01" ||
    value > "2100-12-31"
  ) {
    throw new Error(`${name} is not a valid date.`);
  }

  return value;
}

function createdTimestamp(value) {
  return (
    typeof value === "string" &&
    value.length <= 40 &&
    Number.isFinite(Date.parse(value))
  )
    ? new Date(value).toISOString()
    : new Date().toISOString();
}

export function validateStudioSettings(candidate) {
  try {
    if (!isObject(candidate)) {
      throw new Error("Invalid studio settings.");
    }

    const data = {
      studioLabel: textValue(
        candidate.studioLabel,
        55,
        "Studio name",
        3
      ),

      regionLabel: textValue(
        candidate.regionLabel,
        65,
        "Studio description",
        3
      ),

      dailyPlanningGoal: integerValue(
        Number(candidate.dailyPlanningGoal),
        1,
        40,
        "Daily planning target"
      ),

      showDemoNotice:
        typeof candidate.showDemoNotice === "boolean"
          ? candidate.showDemoNotice
          : true,
    };

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
    };
  }
}

export function loadStudioSettings() {
  try {
    const raw = JSON.parse(
      localStorage.getItem(
        INTELLIGENCE_SETTINGS_KEY
      ) || "null"
    );

    const result = validateStudioSettings(raw);

    return result.ok
      ? result.data
      : { ...DEFAULT_STUDIO_SETTINGS };
  } catch {
    return { ...DEFAULT_STUDIO_SETTINGS };
  }
}

export function buildWorkshopIntelligence({
  requests = [],
  workshop = {},
  vehicles = [],
  serviceLogs = [],
}) {
  const validRequests = requests.filter(
    (request) =>
      request &&
      typeof request === "object"
  );

  const active = validRequests.filter(
    (request) => request.status !== "cancelled"
  );

  const cancelled = validRequests.filter(
    (request) => request.status === "cancelled"
  );

  const workFor = (request) =>
    workshop?.[request.id] || {};

  const plannedValue = active.reduce(
    (total, request) =>
      total +
      (Number.isFinite(Number(request.total))
        ? Math.max(0, Number(request.total))
        : 0),
    0
  );

  const assignedTechnicians = active.filter(
    (request) => Boolean(workFor(request).technicianId)
  ).length;

  const assignedBays = active.filter(
    (request) => Boolean(workFor(request).bayId)
  ).length;

  const stageTotals = WORK_STAGES.map((stage) => ({
    ...stage,
    count: active.filter(
      (request) =>
        (workFor(request).stage || "intake") === stage.id
    ).length,
  }));

  const serviceTotals = SERVICES.map((service) => ({
    id: service.id,
    name: service.name,
    category: service.category,
    count: active.filter(
      (request) =>
        Array.isArray(request.serviceIds) &&
        request.serviceIds.includes(service.id)
    ).length,
  })).sort(
    (a, b) => b.count - a.count
  );

  const vehicleTotals = VEHICLE_TYPES.map((type) => ({
    id: type.id,
    name: type.name,
    count: active.filter(
      (request) => request.vehicleType === type.id
    ).length,
  })).sort(
    (a, b) => b.count - a.count
  );

  const technicianTotals = TECHNICIANS.map((tech) => ({
    id: tech.id,
    name: tech.name,
    count: active.filter(
      (request) =>
        workFor(request).technicianId === tech.id
    ).length,
  }));

  const bayTotals = SERVICE_BAYS.map((bay) => ({
    id: bay.id,
    name: bay.name,
    count: active.filter(
      (request) => workFor(request).bayId === bay.id
    ).length,
  }));

  const today = localDateKey();

  const start = new Date(`${today}T12:00:00`);

  start.setDate(1);

  const monthlyPlans = Array.from(
    { length: 6 },
    (_, index) => {
      const date = new Date(
        start.getFullYear(),
        start.getMonth() + index,
        1,
        12
      );

      const key =
        `${date.getFullYear()}-` +
        String(date.getMonth() + 1).padStart(2, "0");

      return {
        key,

        label: date.toLocaleDateString("en-PH", {
          month: "short",
          year: "numeric",
        }),

        count: active.filter(
          (request) =>
            typeof request.date === "string" &&
            request.date.startsWith(key)
        ).length,
      };
    }
  );

  const nextSevenDays = Array.from(
    { length: 7 },
    (_, index) => {
      const date = dateAfter(index);

      return {
        date,
        label: new Date(
          `${date}T12:00:00`
        ).toLocaleDateString("en-PH", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),

        count: active.filter(
          (request) => request.date === date
        ).length,
      };
    }
  );

  return {
    totalRequests: validRequests.length,
    activeRequests: active.length,
    cancelledRequests: cancelled.length,
    savedVehicles: vehicles.length,
    serviceRecords: serviceLogs.length,
    assignedTechnicians,
    assignedBays,
    unassignedTechnicians:
      active.length - assignedTechnicians,
    plannedValue,
    averageEstimate:
      active.length > 0
        ? plannedValue / active.length
        : 0,
    stageTotals,
    serviceTotals,
    vehicleTotals,
    technicianTotals,
    bayTotals,
    monthlyPlans,
    nextSevenDays,
  };
}

export function makeDemoBackup(data) {
  const payload = {
    kind: BACKUP_KIND,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),

    data: {
      vehicles: data.vehicles,
      requests: data.requests,
      serviceLogs: data.serviceLogs,
      odometers: data.odometers,
      workshop: data.workshop,
      settings: data.settings,
    },
  };

  const json = JSON.stringify(payload, null, 2);

  const blob = new Blob([json], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download =
    `your-drive-demo-backup-${localDateKey()}.json`;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );

  return payload;
}

export function parseDemoBackup(text) {
  try {
    if (
      typeof text !== "string" ||
      text.length > 2_000_000
    ) {
      throw new Error(
        "Backup exceeds the 2 MB demo limit."
      );
    }

    const payload = JSON.parse(text);

    if (
      !isObject(payload) ||
      payload.kind !== BACKUP_KIND ||
      payload.version !== BACKUP_VERSION ||
      !isObject(payload.data)
    ) {
      throw new Error(
        "Not a supported YOUR DRIVE. backup."
      );
    }

    const raw = payload.data;

    const vehicleTypes = VEHICLE_TYPES.map(
      (type) => type.id
    );

    const serviceIds = SERVICES.map(
      (service) => service.id
    );

    const upgradeIds = UPGRADES.map(
      (upgrade) => upgrade.id
    );

    const times = APPOINTMENT_TIMES.map(
      (time) => time.id
    );

    const vehicles = checkArray(
      raw.vehicles,
      6,
      "Vehicle profiles"
    ).map((item) => {
      if (!isObject(item)) {
        throw new Error("Invalid vehicle record.");
      }

      return {
        id: textValue(item.id, 65, "Vehicle ID", 4),
        alias: textValue(
          item.alias,
          55,
          "Vehicle alias",
          2
        ),
        make: textValue(
          item.make,
          40,
          "Vehicle make",
          2
        ),
        model: textValue(
          item.model,
          40,
          "Vehicle model",
          2
        ),
        year: integerValue(
          item.year,
          1980,
          new Date().getFullYear() + 1,
          "Model year"
        ),
        vehicleType: enumValue(
          item.vehicleType,
          vehicleTypes,
          "vehicle type"
        ),
        createdAt: createdTimestamp(item.createdAt),
      };
    });

    checkUnique(vehicles, "Vehicles");

    const vehicleIds = new Set(
      vehicles.map((vehicle) => vehicle.id)
    );

    const requests = checkArray(
      raw.requests,
      40,
      "Service requests"
    ).map((item) => {
      if (!isObject(item)) {
        throw new Error("Invalid request record.");
      }

      const vehicleType = enumValue(
        item.vehicleType,
        vehicleTypes,
        "request vehicle type"
      );

      const selectedServices = [
        ...new Set(
          checkArray(
            item.serviceIds,
            6,
            "Request services"
          ).map((id) =>
            enumValue(id, serviceIds, "service")
          )
        ),
      ];

      if (!selectedServices.length) {
        throw new Error(
          "A request has no selected services."
        );
      }

      const selectedUpgrades = [
        ...new Set(
          checkArray(
            item.upgradeIds,
            4,
            "Request add-ons"
          ).map((id) =>
            enumValue(id, upgradeIds, "add-on")
          )
        ),
      ];

      const estimate = calculateEstimate({
        vehicleType,
        serviceIds: selectedServices,
        upgradeIds: selectedUpgrades,
      });

      if (!estimate) {
        throw new Error(
          "Could not recalculate a request estimate."
        );
      }

      const savedVehicleId =
        typeof item.savedVehicleId === "string" &&
        vehicleIds.has(item.savedVehicleId)
          ? item.savedVehicleId
          : "";

      return {
        id: textValue(
          item.id,
          70,
          "Request ID",
          4
        ),
        requestAlias: textValue(
          item.requestAlias,
          55,
          "Request alias",
          2
        ),
        vehicleAlias: textValue(
          item.vehicleAlias,
          55,
          "Vehicle alias",
          2
        ),
        savedVehicleId,
        vehicleType,
        serviceIds: selectedServices,
        upgradeIds: selectedUpgrades,
        date: checkDate(item.date, "Request date"),
        time: enumValue(
          item.time,
          times,
          "request time"
        ),
        notes:
          typeof item.notes === "string"
            ? textValue(
                item.notes,
                180,
                "Request notes"
              )
            : "",
        total: estimate.total,
        status: enumValue(
          item.status,
          ["requested", "cancelled"],
          "request status"
        ),
        createdAt: createdTimestamp(item.createdAt),
      };
    });

    checkUnique(requests, "Requests");

    const requestIds = new Set(
      requests.map((request) => request.id)
    );

    const serviceLogs = checkArray(
      raw.serviceLogs,
      100,
      "Maintenance records"
    ).map((item) => {
      if (!isObject(item)) {
        throw new Error(
          "Invalid maintenance record."
        );
      }

      const vehicleId = textValue(
        item.vehicleId,
        65,
        "Maintenance vehicle ID",
        4
      );

      if (!vehicleIds.has(vehicleId)) {
        throw new Error(
          "Maintenance refers to a missing vehicle."
        );
      }

      const performedDate = checkDate(
        item.performedDate,
        "Maintenance date"
      );

      if (performedDate > localDateKey()) {
        throw new Error(
          "Maintenance cannot be dated in the future."
        );
      }

      return {
        id: textValue(
          item.id,
          70,
          "Maintenance ID",
          4
        ),
        vehicleId,
        serviceId: enumValue(
          item.serviceId,
          serviceIds,
          "maintenance service"
        ),
        performedDate,
        mileage: integerValue(
          item.mileage,
          0,
          3_000_000,
          "Maintenance mileage"
        ),
        note:
          typeof item.note === "string"
            ? textValue(
                item.note,
                200,
                "Maintenance note"
              )
            : "",
        createdAt: createdTimestamp(item.createdAt),
      };
    });

    checkUnique(serviceLogs, "Maintenance records");

    if (!isObject(raw.odometers)) {
      throw new Error("Invalid odometer collection.");
    }

    const odometers = {};

    for (const [id, value] of Object.entries(
      raw.odometers
    )) {
      if (!vehicleIds.has(id)) {
        continue;
      }

      odometers[id] = integerValue(
        value,
        0,
        3_000_000,
        "Odometer reading"
      );
    }

    for (const log of serviceLogs) {
      odometers[log.vehicleId] = Math.max(
        odometers[log.vehicleId] || 0,
        log.mileage
      );
    }

    if (!isObject(raw.workshop)) {
      throw new Error(
        "Invalid workshop operations collection."
      );
    }

    const workshop = {};

    for (const [id, record] of Object.entries(
      raw.workshop
    )) {
      if (!requestIds.has(id)) continue;

      if (!isObject(record)) {
        throw new Error(
          "Invalid workshop planning record."
        );
      }

      const tasks = [
        ...new Set(
          checkArray(
            record.tasks || [],
            WORK_TASKS.length,
            "Workshop checklist"
          ).map((id) =>
            enumValue(
              id,
              WORK_TASKS.map((task) => task.id),
              "checklist item"
            )
          )
        ),
      ];

      workshop[id] = {
        stage: enumValue(
          record.stage || "intake",
          WORK_STAGES.map((stage) => stage.id),
          "workshop stage"
        ),

        technicianId: enumValue(
          record.technicianId || "",
          [
            "",
            ...TECHNICIANS.map(
              (tech) => tech.id
            ),
          ],
          "technician"
        ),

        bayId: enumValue(
          record.bayId || "",
          [
            "",
            ...SERVICE_BAYS.map(
              (bay) => bay.id
            ),
          ],
          "service bay"
        ),

        tasks,

        note:
          typeof record.note === "string"
            ? textValue(
                record.note,
                400,
                "Workshop note"
              )
            : "",

        updatedAt: createdTimestamp(
          record.updatedAt
        ),
      };
    }

    const result = validateStudioSettings(
      raw.settings
    );

    if (!result.ok) {
      throw new Error(result.error);
    }

    return {
      ok: true,

      data: {
        vehicles,
        requests,
        serviceLogs,
        odometers,
        workshop,
        settings: result.data,
      },

      summary: {
        vehicles: vehicles.length,
        requests: requests.length,
        serviceLogs: serviceLogs.length,
        workshopRecords: Object.keys(workshop).length,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "The backup could not be read.",
    };
  }
}