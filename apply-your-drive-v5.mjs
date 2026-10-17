// YOUR DRIVE V5 — OWNER JOURNEY STUDIO
//
// Place beside package.json and run:
//
// node apply-your-drive-v5.mjs
//
// Changes:
// - src/App.jsx
// - src/components/WorkshopLayout.jsx
//
// Backups are created before modifications.
// No GitHub commands are executed.

import {
  existsSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from "node:fs";

import { join } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();

const appFile = join(
  root,
  "src/App.jsx"
);

const layoutFile = join(
  root,
  "src/components/WorkshopLayout.jsx"
);

// STEP 1 — Verify required files.

for (const path of [
  "src/App.jsx",
  "src/components/WorkshopLayout.jsx",
  "src/pages/precision/OwnerJourneyStudio.jsx",
  "src/styles/owner-journey.css",
]) {
  if (
    !existsSync(join(root, path))
  ) {
    throw Error(
      `Missing ${path}. No changes made.`
    );
  }
}

let app = readFileSync(
  appFile,
  "utf8"
).replace(/\r\n/g, "\n");

let layout = readFileSync(
  layoutFile,
  "utf8"
).replace(/\r\n/g, "\n");

const v5Import =
  'import OwnerJourneyStudio from "./pages/precision/OwnerJourneyStudio.jsx";';

const v5Route =
  '<Route path="owners" element={<OwnerJourneyStudio />} />';

const v5Nav =
  'to: "/workshop/owners"';

// STEP 2 — Prevent duplicate installation.

if (
  app.includes(v5Import) ||
  app.includes(v5Route) ||
  layout.includes(v5Nav)
) {
  if (
    app.includes(v5Import) &&
    app.includes(v5Route) &&
    layout.includes(v5Nav)
  ) {
    console.log(
      "YOUR DRIVE V5 already installed. No changes made."
    );

    process.exit(0);
  }

  throw Error(
    "Partial V5 integration found. No changes made."
  );
}

// STEP 3 — Unique anchor replacement.

function replaceOnce(
  source,
  before,
  after,
  label
) {
  if (
    source.split(before).length !== 2
  ) {
    throw Error(
      `Cannot safely find unique ${label} anchor. No changes made.`
    );
  }

  return source.replace(
    before,
    after
  );
}

// STEP 4 — Import V5 component.

const importAnchor =
  'import ServiceCalendarPage from "./pages/ServiceCalendarPage.jsx";';

app = replaceOnce(
  app,
  importAnchor,

  `${v5Import}
${importAnchor}`,

  "App imports"
);

// STEP 5 — Add nested Workshop route.

const routeAnchor =
  '<Route path="parts" element={<PartsCommandCenter />} />';

app = replaceOnce(
  app,
  routeAnchor,

  `${routeAnchor}
              ${v5Route}`,

  "V4 workshop route"
);

// STEP 6 — Add Workshop sidebar icon.

layout = replaceOnce(
  layout,

  '  BarChart3,',

  `  BarChart3,
  HeartHandshake,`,

  "Workshop icon imports"
);

// STEP 7 — Add sidebar link.

const navAnchor =
  `  {
    to: "/workshop/reports",`;

layout = replaceOnce(
  layout,
  navAnchor,

  `  {
    to: "/workshop/owners",
    label: "Owner Journey",
    icon: HeartHandshake,
  },
${navAnchor}`,

  "Workshop sidebar"
);

// STEP 8 — Add page title.

const titleAnchor =
  '  "/workshop/reports": "Reports & Trends",';

layout = replaceOnce(
  layout,
  titleAnchor,

  `  "/workshop/owners": "Owner Journey Studio",
${titleAnchor}`,

  "Workshop title"
);

// STEP 9 — Validate integration.

if (
  !app.includes(v5Route) ||
  !layout.includes(v5Nav)
) {
  throw Error(
    "Integration verification failed. No changes made."
  );
}

// STEP 10 — Create backups.

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const paths = [
  [appFile, "App"],
  [layoutFile, "WorkshopLayout"],
];

for (const [path, label] of paths) {
  const backup = join(
    tmpdir(),

    `your-drive-before-v5-${label}-${stamp}.jsx`
  );

  copyFileSync(
    path,
    backup
  );

  console.log(
    "Backup created:",
    backup
  );
}

// STEP 11 — Install.

writeFileSync(
  appFile,
  app,
  "utf8"
);

writeFileSync(
  layoutFile,
  layout,
  "utf8"
);

console.log(
  "\nYOUR DRIVE V5 INSTALLED."
);

console.log(
  "Open /#/workshop/owners"
);

console.log(
  "Original V3 job cards and V4 inventory are not modified."
);

console.log(
  "No Git commands run."
);

console.log(
  "Verify with: npm run build\n"
);