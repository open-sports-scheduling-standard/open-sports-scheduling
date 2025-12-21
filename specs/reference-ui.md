# OSSS Reference UI Specification

**A minimal but powerful web-based interface for OSSS**

Version: 1.0.0
Status: Draft
Last Updated: 2025-01-01

---

## Purpose

Provide a reference implementation of a web-based UI for OSSS that:
- Validates instances and results in-browser
- Visualizes schedules clearly
- Explains violations in human terms
- Enables what-if scenario analysis
- Requires no backend infrastructure

**Goal:** Make OSSS accessible to non-technical stakeholders (league administrators, board members, coaches, parents).

---

## Design Principles

1. **Browser-Only** - No server required, works offline
2. **Privacy-First** - All data stays in browser, no uploads
3. **Progressive Enhancement** - Works without JavaScript (basic features)
4. **Responsive** - Mobile-friendly
5. **Accessible** - WCAG 2.1 AA compliant
6. **Open Source** - MIT licensed reference implementation

---

## Architecture

### Technology Stack

**Core:**
- HTML5
- CSS3 (modern features, no preprocessor needed)
- Vanilla JavaScript (ES6+)
- Web Components (custom elements)

**Libraries (minimal):**
- None required for basic functionality
- Optional: Chart.js for visualizations
- Optional: FullCalendar for calendar views

**Why no framework?**
- Reduces barrier to understanding code
- Easier to embed in existing sites
- Smaller bundle size
- Longer lifespan (no framework churn)

---

### File Structure

```
osss-reference-ui/
├── index.html              # Main entry point
├── styles/
│   ├── osss-core.css       # Core styles
│   ├── osss-calendar.css   # Calendar view styles
│   ├── osss-validation.css # Validation display styles
│   └── osss-charts.css     # Chart/viz styles
├── scripts/
│   ├── osss-validator.js   # Client-side validation
│   ├── osss-calendar.js    # Calendar rendering
│   ├── osss-charts.js      # Visualization components
│   └── osss-what-if.js     # Scenario analysis
├── components/
│   ├── osss-file-loader.js
│   ├── osss-fixture-card.js
│   ├── osss-violation-list.js
│   ├── osss-team-card.js
│   └── osss-objective-display.js
└── README.md
```

---

## Features

### 1. File Loading

**Component:** `<osss-file-loader>`

**Functionality:**
- Drag-and-drop JSON files
- Browse file system
- Load from URL
- Paste JSON directly
- Recent files (localStorage)

**UI:**
```
┌─────────────────────────────────┐
│  Load OSSS Instance             │
│                                 │
│  [Drag & Drop Here]             │
│  or                             │
│  [Browse...] [Load from URL]    │
│                                 │
│  Recent Files:                  │
│  - league-2024.json             │
│  - playoff-schedule.json        │
└─────────────────────────────────┘
```

---

### 2. Instance Validation

**Component:** `<osss-validation-panel>`

**Functionality:**
- Schema validation (JSON Schema)
- Structural validation
- Reference integrity (team IDs, venue IDs)
- Date range validation
- Constraint parameter validation

**Display:**
```
┌─────────────────────────────────┐
│  Validation Results             │
│                                 │
│  ✅ Schema: Valid               │
│  ✅ Structure: Valid            │
│  ✅ References: All valid       │
│  ⚠️  Warnings: 2                │
│                                 │
│  Warnings:                      │
│  • Team "team-005" has no home  │
│    venue specified              │
│  • Fixture "f-042" scheduled    │
│    only 36h after "f-041"       │
└─────────────────────────────────┘
```

---

### 3. Schedule Visualization

**Component:** `<osss-calendar-view>`

**Views:**
- Calendar (month/week/day)
- Timeline (Gantt-style)
- List view
- Team view (per-team schedule)
- Venue view (per-venue schedule)

**Calendar View:**
```
┌──────────────────────────────────────────┐
│  March 2025              [< Today >]     │
├──────────────────────────────────────────┤
│ Sun   Mon   Tue   Wed   Thu   Fri   Sat │
│                                          │
│  8     9     10    11    12    13    14  │
│            [Team A   [Team C            │
│             vs       vs              │
│             Team B]  Team D]         │
│                                          │
│ 15    16    17    18    19    20    21  │
│ [Team E            [Team A              │
│  vs                 vs                  │
│  Team F]            Team C]             │
└──────────────────────────────────────────┘
```

**Timeline View:**
```
Team A  |===|     |===|         |===|
Team B      |===|     |===|   |===|
Team C  |===|   |===|     |===|
        ─────────────────────────────→
        Mar 8  Mar 15  Mar 22  Mar 29
```

---

### 4. Violation Reporting

**Component:** `<osss-violation-list>`

**Functionality:**
- Group violations by severity (hard/soft)
- Filter by constraint type
- Search violations
- Click to highlight in calendar

**Display:**
```
┌─────────────────────────────────────┐
│  Violations (8 total)               │
│                                     │
│  🔴 Hard Violations (2)             │
│                                     │
│  • min_rest_time                    │
│    Team A has only 36h rest         │
│    between fixtures f-041 and f-042 │
│    Required: 48h                    │
│    → View in calendar               │
│                                     │
│  • no_overlap_venue_resource        │
│    Venue "Main Field" double-booked │
│    at 2025-03-15T19:00              │
│    Fixtures: f-023, f-024           │
│    → View in calendar               │
│                                     │
│  🟡 Soft Violations (6)             │
│                                     │
│  • home_away_balance                │
│    Team C has 3 more home games     │
│    than away (8 home, 5 away)       │
│    Penalty: 45 points               │
│    → View details                   │
└─────────────────────────────────────┘
```

---

### 5. Objective Dashboard

**Component:** `<osss-objective-dashboard>`

**Functionality:**
- Display all objectives with values
- Compare to target ranges
- Visualize with charts
- Show per-team breakdowns

**Display:**
```
┌──────────────────────────────────────┐
│  Objectives                          │
│                                      │
│  Total Travel Distance               │
│  ████████░░░░░░░ 18,500 km           │
│  Target: ≤ 30,000 km | Ideal: 15,000│
│  Status: ✅ Within target            │
│                                      │
│  Home/Away Balance                   │
│  ████████████░░░ Max diff: 2 games   │
│  Target: ≤ 2 | Ideal: 0              │
│  Status: ✅ Met target               │
│                                      │
│  Rest Time Average                   │
│  ████████████░░░ 68 hours            │
│  Target: ≥ 60h | Ideal: 84h          │
│  Status: ⚠️  Below ideal             │
│                                      │
│  [View Detailed Breakdown]           │
└──────────────────────────────────────┘
```

---

### 6. What-If Analysis

**Component:** `<osss-what-if-editor>`

**Functionality:**
- Modify fixture dates/times
- Swap home/away teams
- Change venues
- Add/remove constraints
- See immediate impact on violations/objectives

**Workflow:**
```
1. Select fixture to modify
   ┌────────────────────┐
   │ Fixture #042       │
   │ Team A vs Team B   │
   │ 2025-03-15 19:00   │
   │ @ Main Field       │
   └────────────────────┘

2. Make changes
   Date: [2025-03-15] → [2025-03-16]
   Time: [19:00] → [15:00]
   Venue: [Main Field ▼]

3. Preview impact
   ✅ Violations reduced: 2 → 0
   ⚠️  Objectives affected:
      - schedule_compactness: +1 day
      - venue_balance: +2 std dev

4. [Apply] [Cancel] [Reset]
```

---

### 7. Export Features

**Component:** `<osss-export-panel>`

**Formats:**
- JSON (modified instance)
- CSV (see import-export spec)
- iCalendar (.ics)
- PDF (schedule printout)
- PNG/SVG (calendar visualization)

**UI:**
```
┌─────────────────────────────────┐
│  Export Schedule                │
│                                 │
│  Format:                        │
│  ○ OSSS JSON                    │
│  ○ CSV Files                    │
│  ○ iCalendar (.ics)             │
│  ● PDF Calendar                 │
│  ○ PNG Image                    │
│                                 │
│  Options:                       │
│  ☑ Include violations           │
│  ☑ Include objectives           │
│  ☐ Anonymize team/venue names   │
│                                 │
│  [Download]                     │
└─────────────────────────────────┘
```

---

### 8. Team View

**Component:** `<osss-team-schedule>`

**Functionality:**
- View schedule for single team
- Show rest periods between games
- Highlight home vs away
- Display travel distances
- Compare to other teams

**Display:**
```
┌─────────────────────────────────────────┐
│  Team A Schedule                        │
│                                         │
│  Mar 8  | vs Team B (A) | Main Field   │
│         | Rest: 96h ✅                  │
│  Mar 12 | @ Team C (H) | North Field   │
│         | Travel: 45km                  │
│         | Rest: 72h ✅                  │
│  Mar 15 | vs Team D (A) | Main Field   │
│         | Travel: 45km (return)         │
│         | Rest: 168h ✅                 │
│  Mar 22 | @ Team E (H) | South Field   │
│         | Travel: 120km ⚠️              │
│                                         │
│  Summary:                               │
│  Total Games: 13 (7H, 6A) ✅            │
│  Total Travel: 1,240 km                 │
│  Avg Rest: 84h ✅                       │
│  Min Rest: 72h ✅                       │
└─────────────────────────────────────────┘
```

---

## Technical Specifications

### Client-Side Validation

**Requirements:**
- Load JSON Schema definitions
- Validate instance against schema
- Check reference integrity
- Report violations clearly

**Implementation:**
```javascript
class OsssClientValidator {
  constructor() {
    this.schemas = null;
    this.registry = null;
  }

  async initialize() {
    // Load schemas and registry from CDN or bundled
    this.schemas = await this.loadSchemas();
    this.registry = await this.loadRegistry();
  }

  async validateInstance(instance) {
    const results = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Schema validation
    const schemaErrors = this.validateSchema(instance);
    results.errors.push(...schemaErrors);

    // Reference validation
    const refErrors = this.validateReferences(instance);
    results.errors.push(...refErrors);

    // Constraint validation
    const constraintWarnings = this.validateConstraints(instance);
    results.warnings.push(...constraintWarnings);

    results.valid = results.errors.length === 0;
    return results;
  }

  validateSchema(instance) {
    // JSON Schema validation
    // Return list of validation errors
  }

  validateReferences(instance) {
    const errors = [];

    // Check all team IDs exist
    const teamIds = new Set(instance.instance.teams.map(t => t.teamId));

    for (const fixture of instance.instance.fixtures) {
      if (!teamIds.has(fixture.homeTeamId)) {
        errors.push({
          type: 'reference',
          message: `Fixture ${fixture.fixtureId} references unknown team: ${fixture.homeTeamId}`
        });
      }
      if (!teamIds.has(fixture.awayTeamId)) {
        errors.push({
          type: 'reference',
          message: `Fixture ${fixture.fixtureId} references unknown team: ${fixture.awayTeamId}`
        });
      }
    }

    // Check all venue IDs exist
    const venueIds = new Set(instance.instance.venues.map(v => v.venueId));

    for (const fixture of instance.instance.fixtures) {
      if (fixture.venueId && !venueIds.has(fixture.venueId)) {
        errors.push({
          type: 'reference',
          message: `Fixture ${fixture.fixtureId} references unknown venue: ${fixture.venueId}`
        });
      }
    }

    return errors;
  }
}
```

---

### Calendar Rendering

**Requirements:**
- Render fixtures on calendar grid
- Handle timezone display
- Support multiple views
- Interactive (click to edit)

**Implementation approach:**
```javascript
class OsssCalendar extends HTMLElement {
  constructor() {
    super();
    this.fixtures = [];
    this.view = 'month'; // month, week, day, timeline
  }

  render() {
    const container = this.shadowRoot || this;

    if (this.view === 'month') {
      container.innerHTML = this.renderMonthView();
    } else if (this.view === 'timeline') {
      container.innerHTML = this.renderTimelineView();
    }

    this.attachEventListeners();
  }

  renderMonthView() {
    // Generate calendar grid
    // Place fixtures in appropriate cells
    // Return HTML string
  }

  renderTimelineView() {
    // Generate Gantt-style timeline
    // One row per team
    // Fixtures as blocks on timeline
  }
}

customElements.define('osss-calendar', OsssCalendar);
```

---

### Visualization Components

**Charts to implement:**

1. **Travel Distribution**
   - Bar chart: Travel distance per team
   - Shows fairness of travel burden

2. **Rest Time Distribution**
   - Histogram: Distribution of rest periods
   - Highlights teams with insufficient rest

3. **Home/Away Balance**
   - Stacked bar: Home vs away games per team
   - Visual fairness check

4. **Venue Utilization**
   - Pie chart or bar: Fixtures per venue
   - Shows balanced usage

5. **Objective Radar**
   - Radar chart: All objectives normalized 0-100
   - Overall schedule quality snapshot

---

## Accessibility Features

### WCAG 2.1 AA Compliance

**Requirements:**

1. **Keyboard Navigation**
   - All interactive elements accessible via Tab
   - Calendar navigation with arrow keys
   - Enter/Space to activate

2. **Screen Reader Support**
   - Semantic HTML (proper headings, lists, etc.)
   - ARIA labels for custom components
   - Announce validation results

3. **Visual Design**
   - Minimum 4.5:1 contrast ratio (text)
   - Minimum 3:1 contrast ratio (UI elements)
   - No color-only information
   - Resizable text (200% zoom)

4. **Error Handling**
   - Clear error messages
   - Associate errors with fields
   - Suggest corrections

**Example:**
```html
<div role="region" aria-label="Validation Results">
  <h2 id="validation-heading">Validation Results</h2>
  <div role="alert" aria-live="polite">
    <ul aria-describedby="validation-heading">
      <li role="alert">
        <strong>Error:</strong> Team ID "team-999" in fixture "f-042"
        does not exist. <a href="#team-list">View team list</a>
      </li>
    </ul>
  </div>
</div>
```

---

## Embedding & Integration

### Standalone Mode

**Usage:**
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="osss-ui/osss-core.css">
</head>
<body>
  <osss-file-loader></osss-file-loader>
  <osss-calendar-view></osss-calendar-view>

  <script type="module" src="osss-ui/osss-components.js"></script>
</body>
</html>
```

---

### Embedded Mode

**In existing league website:**
```html
<!-- Minimal integration -->
<div id="osss-container"
     data-osss-instance="./league-2025.json">
</div>

<script src="https://cdn.osss.org/ui/v1/osss-embed.js"></script>
<script>
  OSSS.init('#osss-container', {
    features: ['calendar', 'violations'],
    theme: 'light',
    locale: 'en-US'
  });
</script>
```

---

### Widget Mode

**Single-purpose widgets:**
```html
<!-- Just the calendar -->
<osss-calendar
  src="./league-2025.json"
  view="month"
  theme="dark">
</osss-calendar>

<!-- Just violations -->
<osss-violations
  src="./league-2025.json"
  severity="hard">
</osss-violations>
```

---

## Theming & Customization

### CSS Custom Properties

```css
:root {
  /* Colors */
  --osss-primary: #2563eb;
  --osss-success: #10b981;
  --osss-warning: #f59e0b;
  --osss-error: #ef4444;

  /* Typography */
  --osss-font-family: system-ui, sans-serif;
  --osss-font-size-base: 16px;

  /* Spacing */
  --osss-spacing-sm: 0.5rem;
  --osss-spacing-md: 1rem;
  --osss-spacing-lg: 2rem;

  /* Layout */
  --osss-border-radius: 0.375rem;
  --osss-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

**Custom theme:**
```css
/* League branding */
.osss-container {
  --osss-primary: #c41e3a; /* Team color */
  --osss-font-family: 'League Gothic', sans-serif;
}
```

---

## Performance Considerations

### Large Schedules

**Optimizations:**
- Virtual scrolling for long lists (500+ fixtures)
- Lazy-load calendar views
- Web Workers for validation
- IndexedDB for offline caching

**Example:**
```javascript
class OsssFixtureList extends HTMLElement {
  constructor() {
    super();
    this.visibleRange = { start: 0, end: 50 };
  }

  render() {
    // Only render visible fixtures
    const visible = this.fixtures.slice(
      this.visibleRange.start,
      this.visibleRange.end
    );

    // Render with spacers for hidden items
    this.innerHTML = `
      <div style="height: ${this.visibleRange.start * 60}px"></div>
      ${visible.map(f => this.renderFixture(f)).join('')}
      <div style="height: ${(this.fixtures.length - this.visibleRange.end) * 60}px"></div>
    `;
  }

  onScroll() {
    // Update visible range based on scroll position
    // Re-render
  }
}
```

---

## Distribution

### CDN Hosting

```html
<!-- Latest version -->
<link href="https://cdn.osss.org/ui/latest/osss-ui.css" rel="stylesheet">
<script src="https://cdn.osss.org/ui/latest/osss-ui.js"></script>

<!-- Specific version (recommended) -->
<link href="https://cdn.osss.org/ui/v1.0.0/osss-ui.css" rel="stylesheet">
<script src="https://cdn.osss.org/ui/v1.0.0/osss-ui.js"></script>
```

### NPM Package

```bash
npm install @osss/reference-ui
```

```javascript
import { OsssCalendar, OsssValidator } from '@osss/reference-ui';
import '@osss/reference-ui/styles/osss-core.css';

const calendar = new OsssCalendar('#calendar', {
  instance: myInstance
});
```

### Self-Hosted

```bash
# Download latest release
curl -O https://cdn.osss.org/ui/v1.0.0/osss-ui.zip
unzip osss-ui.zip -d public/osss-ui/

# Reference in HTML
<link href="/osss-ui/osss-ui.css" rel="stylesheet">
<script src="/osss-ui/osss-ui.js"></script>
```

---

## Development Roadmap

### v1.0 (Core Features)
- File loading
- Basic validation
- Calendar view
- Violation display
- Export to iCal/PDF

### v1.1 (Enhanced Visualization)
- Timeline view
- Team/venue views
- Objective charts
- Responsive mobile UI

### v1.2 (What-If Analysis)
- Interactive editing
- Impact preview
- Scenario comparison

### v2.0 (Advanced Features)
- Real-time collaboration (WebRTC)
- Offline-first (PWA)
- Advanced filtering/search
- Custom constraint visualization

---

## Examples

### Complete Minimal Implementation

See: `/examples/reference-ui-minimal.html`

**Features:**
- ~500 lines total
- No build step required
- Works in IE11+ (with polyfills)
- Demonstrates core concepts

---

## License

MIT - Reference implementation may be used, modified, and distributed freely

---

## Resources

- **Demo:** https://demo.osss.org/ui
- **GitHub:** https://github.com/osss/reference-ui
- **Documentation:** https://docs.osss.org/ui
- **Issue Tracker:** https://github.com/osss/reference-ui/issues

---

**Making OSSS accessible means making it visible. A good UI removes barriers to understanding and adoption.**
