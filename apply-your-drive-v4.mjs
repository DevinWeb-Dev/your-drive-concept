
// YOUR DRIVE V4 — SAFE LOCAL INSTALLER
// Run from your-drive-concept root:
//
// node apply-your-drive-v4.mjs

import {
  existsSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from "node:fs";

import { join } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();

const appFile = join(root, "src/App.jsx");

const layoutFile = join(
  root,
  "src/components/WorkshopLayout.jsx"
);

// Verify source files.

for (const file of [
  "src/App.jsx",
  "src/components/WorkshopLayout.jsx",
  "src/pages/precision/PartsCommandCenter.jsx",
  "src/styles/parts-command.css",
]) {
  if (!existsSync(join(root, file))) {
    throw Error(
      `Missing ${file}. No changes made.`
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

const newImport =
  'import PartsCommandCenter from "./pages/precision/PartsCommandCenter.jsx";';

const newRoute =
  '            <Route path="parts" element={<PartsCommandCenter />} />';

// Prevent duplicate installs.

if (
  app.includes(newImport) ||
  app.includes(newRoute)
) {
  if (
    app.includes(newImport) &&
    app.includes(newRoute) &&
    layout.includes('to: "/workshop/parts"')
  ) {
    console.log(
      "V4 already installed. No changes made."
    );

    process.exit(0);
  }

  throw Error(
    "Partial V4 integration detected. No changes made."
  );
}

// Make sure each anchor is unique.

function once(code, before, after, name) {
  if (code.split(before).length !== 2) {
    throw Error(
      `Non-unique ${name} anchor. No changes made.`
    );
  }

  return code.replace(before, after);
}

// 1. Add component import.

app = once(
  app,

  'import ServiceCalendarPage from "./pages/ServiceCalendarPage.jsx";',

  `${newImport}
import ServiceCalendarPage from "./pages/ServiceCalendarPage.jsx";`,

  "page import"
);

// 2. Install nested workshop route.

app = once(
  app,

  '          {/* BATCH 4 */}',

  `${newRoute}

          {/* BATCH 4 */}`,

  "nested workshop routes"
);

// 3. Add icon to WorkshopLayout.

layout = once(
  layout,

  "  BarChart3,",

  `  BarChart3,
  Boxes,`,

  "layout icons"
);

// 4. Add sidebar link.

layout = once(
  layout,

  `  {
    to: "/workshop/reports",`,

  `  {
    to: "/workshop/parts",
    label: "Parts & Costing",
    icon: Boxes,
  },
  {
    to: "/workshop/reports",`,

  "workshop navigation"
);

// 5. Add route title.

layout = once(
  layout,

  '  "/workshop/reports": "Reports & Trends",',

  `  "/workshop/parts": "Parts & Costing",
  "/workshop/reports": "Reports & Trends",`,

  "workshop title"
);

// 6. Back up and apply changes.

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

for (const [file, content] of [
  [appFile, app],
  [layoutFile, layout],
]) {
  const backup = join(
    tmpdir(),

    `yd-v4-before-${stamp}-${
      file === appFile
        ? "App"
        : "WorkshopLayout"
    }.jsx`
  );

  copyFileSync(file, backup);

  console.log(
    "Backup:",
    backup
  );

  writeFileSync(
    file,
    content,
    "utf8"
  );
}

console.log(
  "YOUR DRIVE V4 installed. Open /#/workshop/parts"
);

console.log(
  "Existing V3 jobs, booking records, estimator and Garage were NOT changed."
);

console.log(
  "No GitHub operations performed. Next: npm run build"
);
