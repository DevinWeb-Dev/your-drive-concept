
// YOUR DRIVE — SERVICE INTELLIGENCE V3
// Run from original YOUR DRIVE project root:
// node apply-your-drive-v3.mjs
//
// Changes only src/App.jsx.
// No Git commands or changes to existing bookings.

import {
  existsSync,
  readFileSync,
  copyFileSync,
  writeFileSync,
} from "node:fs";

import { join } from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();
const appPath = join(root, "src", "App.jsx");

for (const file of [
  "src/App.jsx",
  "src/data/autoData.js",
  "src/pages/precision/ServiceIntelligence.jsx",
  "src/styles/service-intelligence.css",
]) {
  if (!existsSync(join(root, file))) {
    throw Error(
      `Missing ${file}. No changes made.`
    );
  }
}

let app = readFileSync(
  appPath,
  "utf8"
);

const signature =
  'import ServiceIntelligence from "./pages/precision/ServiceIntelligence.jsx";';

// Prevent duplicate installs.

if (app.includes(signature)) {
  if (!app.includes(
    'path="service-intelligence"'
  )) {
    throw Error(
      "Partial V3 integration. No changes made."
    );
  }

  console.log(
    "YOUR DRIVE V3 already integrated. No changes made."
  );

  process.exit(0);
}

// Replace exactly one occurrence.

function once(before, after, label) {
  if (app.split(before).length !== 2) {
    throw Error(
      `Missing or duplicate ${label} anchor. No changes made.`
    );
  }

  app = app.replace(before, after);
}

// Add import.

const importAnchor =
  'import ServiceCalendarPage from "./pages/ServiceCalendarPage.jsx";';

once(
  importAnchor,

  `${signature}
${importAnchor}`,

  "existing page import"
);

// Add new route before /garage.

const routeAnchor =
  '          <Route\n' +
  '            path="garage"';

once(
  routeAnchor,

  `          <Route
            path="service-intelligence"
            element={
              <ServiceIntelligence
                vehicles={vehicles}
                requests={requests}
              />
            }
          />

${routeAnchor}`,

  "garage route"
);

// Add navigation tab if the expected
// navigation layout is found.

const navStart = app.indexOf(
  "const NAV_ITEMS = ["
);

if (navStart !== -1) {
  const navEnd = app.indexOf(
    "];",
    navStart
  );

  if (navEnd !== -1) {
    const nav = app.slice(
      navStart,
      navEnd
    );

    const about =
      '["About", "/about"],';

    if (
      !nav.includes(
        '"/service-intelligence"'
      ) &&
      nav.includes(about)
    ) {
      const changedNav = nav.replace(
        about,

        '["Service Intelligence", "/service-intelligence"],\n  ' +
          about
      );

      app =
        app.slice(0, navStart) +
        changedNav +
        app.slice(navEnd);

    } else if (
      !nav.includes(
        '"/service-intelligence"'
      )
    ) {
      console.log(
        "Navigation variant not recognized; use /#/service-intelligence directly."
      );
    }
  }
}

// Validate changes.

if (
  !app.includes(
    'path="service-intelligence"'
  ) ||
  !app.includes(signature)
) {
  throw Error(
    "Integration verification failed. No changes made."
  );
}

// Backup original App.jsx.

const stamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const backup = join(
  tmpdir(),
  `your-drive-App-before-v3-${stamp}.jsx`
);

copyFileSync(
  appPath,
  backup
);

// Apply integration.

writeFileSync(
  appPath,
  app,
  "utf8"
);

console.log("");
console.log(
  "YOUR DRIVE V3 — SERVICE INTELLIGENCE INSTALLED"
);

console.log(
  "Page: /#/service-intelligence"
);

console.log(
  "Original estimates, Garage, workshop and bookings untouched."
);

console.log(
  `App.jsx backup: ${backup}`
);

console.log(
  "No GitHub push performed."
);

console.log("");
