// YOUR DRIVE. — BATCH 3
// FICTIONAL WORKSHOP OPERATIONS

export const WORKSHOP_KEY =
  "your-drive-demo-workshop-v1";

export const WORK_STAGES = [
  {
    id: "intake",
    label: "New Intake",
    description: "Awaiting demo review",
  },
  {
    id: "inspection",
    label: "Inspection Plan",
    description: "Preparing a sample checklist",
  },
  {
    id: "work-plan",
    label: "Work Planning",
    description: "Illustrative task preparation",
  },
  {
    id: "simulation",
    label: "Service Simulation",
    description: "Concept-only workflow",
  },
  {
    id: "review",
    label: "Final Review",
    description: "Checking the sample plan",
  },
  {
    id: "archived",
    label: "Archived",
    description: "Closed in this demo only",
  },
];

export const TECHNICIANS = [
  {
    id: "tech-a",
    name: "Technician A",
    focus: "General maintenance",
    initials: "TA",
  },
  {
    id: "tech-b",
    name: "Technician B",
    focus: "Diagnostics concepts",
    initials: "TB",
  },
  {
    id: "tech-c",
    name: "Technician C",
    focus: "Appearance care",
    initials: "TC",
  },
];

export const SERVICE_BAYS = [
  {
    id: "bay-1",
    name: "BAY 01",
    focus: "General care",
  },
  {
    id: "bay-2",
    name: "BAY 02",
    focus: "Diagnostics",
  },
  {
    id: "bay-3",
    name: "BAY 03",
    focus: "Detailing",
  },
  {
    id: "bay-4",
    name: "BAY 04",
    focus: "Flexible planning",
  },
];

export const WORK_TASKS = [
  {
    id: "brief",
    name: "Review fictional request details",
  },
  {
    id: "vehicle",
    name: "Check example vehicle information",
  },
  {
    id: "scope",
    name: "Review proposed service scope",
  },
  {
    id: "estimate",
    name: "Review illustrative cost estimate",
  },
  {
    id: "timeline",
    name: "Draft the workflow timeline",
  },
  {
    id: "final",
    name: "Complete demonstration checklist review",
  },
];

export const defaultWork = () => ({
  stage: "intake",
  technicianId: "",
  bayId: "",
  tasks: [],
  note: "",
  updatedAt: "",
});

export function getWork(operations, requestId) {
  return {
    ...defaultWork(),
    ...(operations?.[requestId] || {}),
  };
}

export function loadWorkshop() {
  try {
    const raw = JSON.parse(
      localStorage.getItem(WORKSHOP_KEY) || "{}"
    );

    if (
      !raw ||
      typeof raw !== "object" ||
      Array.isArray(raw)
    ) {
      return {};
    }

    const safe = {};

    for (const [id, item] of Object.entries(raw).slice(0, 80)) {
      if (
        !id.startsWith("YDR-") ||
        !item ||
        typeof item !== "object"
      ) {
        continue;
      }

      safe[id] = {
        stage: WORK_STAGES.some(
          (s) => s.id === item.stage
        )
          ? item.stage
          : "intake",

        technicianId: TECHNICIANS.some(
          (t) => t.id === item.technicianId
        )
          ? item.technicianId
          : "",

        bayId: SERVICE_BAYS.some(
          (b) => b.id === item.bayId
        )
          ? item.bayId
          : "",

        tasks: Array.isArray(item.tasks)
          ? [
              ...new Set(
                item.tasks.filter((x) =>
                  WORK_TASKS.some((t) => t.id === x)
                )
              ),
            ].slice(0, WORK_TASKS.length)
          : [],

        note:
          typeof item.note === "string"
            ? item.note.slice(0, 400)
            : "",

        updatedAt:
          typeof item.updatedAt === "string"
            ? item.updatedAt.slice(0, 40)
            : "",
      };
    }

    return safe;
  } catch {
    return {};
  }
}

export function shortRequest(request) {
  return request.id.length > 15
    ? request.id.slice(-10)
    : request.id;
}

export function stageName(stageId) {
  return (
    WORK_STAGES.find(
      (stage) => stage.id === stageId
    )?.label || "New Intake"
  );
}

export function technicianName(id) {
  return (
    TECHNICIANS.find(
      (tech) => tech.id === id
    )?.name || "Unassigned"
  );
}

export function bayName(id) {
  return (
    SERVICE_BAYS.find(
      (bay) => bay.id === id
    )?.name || "Unassigned"
  );
}

export function daySummary(requests, ops, date) {
  const day = requests.filter(
    (request) =>
      request.date === date &&
      request.status !== "cancelled"
  );

  return {
    total: day.length,

    unassigned: day.filter(
      (r) => !getWork(ops, r.id).technicianId
    ).length,
  };
}