# OSSS Import/Export & Adapters Specification

**Making OSSS interoperable with existing systems and formats**

Version: 1.0.0
Status: Draft
Last Updated: 2025-01-01

---

## Purpose

This specification defines:
- Import/export formats for OSSS data
- Adapter patterns for integrating with existing systems
- Data transformation guidelines
- Quality and fidelity requirements

**Goal:** Enable leagues to adopt OSSS without full migration, and vendors to integrate OSSS incrementally.

---

## Supported Formats

### 1. JSON (Native)

**Format:** OSSS native JSON format
**Direction:** Import ✅ Export ✅
**Fidelity:** 100%
**Use case:** Primary format for OSSS-compliant systems

**Example:**
```json
{
  "osssVersion": "0.1.0",
  "instance": {
    "teams": [...],
    "venues": [...],
    "fixtures": [...]
  }
}
```

---

### 2. CSV (Simplified)

**Format:** Comma-separated values
**Direction:** Import ✅ Export ✅
**Fidelity:** ~80% (loses nested structures, complex constraints)
**Use case:** Excel-based workflows, data entry, simple leagues

**Supported entities:**
- Teams (CSV)
- Venues (CSV)
- Fixtures (CSV)
- Simple constraints (CSV)
- Results (CSV)

**Limitations:**
- No nested objects (e.g., venue resources require multiple CSVs)
- No complex selectors
- Limited constraint types
- No custom fields

**See:** [CSV Format Specification](#csv-format-specification)

---

### 3. iCalendar (.ics)

**Format:** iCalendar RFC 5545
**Direction:** Export ✅
**Fidelity:** Schedule only (no constraints/objectives)
**Use case:** Calendar integration, team/venue scheduling tools

**Example:**
```ical
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OSSS//OSSS Validator//EN
BEGIN:VEVENT
UID:fixture-001@osss.org
DTSTART:20250315T190000Z
DTEND:20250315T210000Z
SUMMARY:Team A vs Team B
LOCATION:Main Stadium
DESCRIPTION:OSSS Fixture ID: fixture-001
END:VEVENT
END:VCALENDAR
```

**Mapping:**
- fixture.fixtureId → UID
- fixture.dateTime → DTSTART
- fixture.dateTime + estimatedDuration → DTEND
- homeTeam vs awayTeam → SUMMARY
- venue.name → LOCATION

---

### 4. Excel (.xlsx)

**Format:** Microsoft Excel workbook
**Direction:** Import ✅ Export ✅
**Fidelity:** ~85% (better than CSV with multiple sheets)
**Use case:** League administrators, data entry, reporting

**Workbook structure:**
- Sheet 1: Teams
- Sheet 2: Venues
- Sheet 3: Fixtures
- Sheet 4: Constraints
- Sheet 5: Results (if applicable)
- Sheet 6: Metadata

**Advantages over CSV:**
- Multiple related tables in one file
- Data validation
- Formatting for readability
- Formulas for computed fields

---

### 5. Google Sheets

**Format:** Google Sheets via API
**Direction:** Import ✅ Export ✅
**Fidelity:** ~85% (same as Excel)
**Use case:** Collaborative editing, cloud-based workflows

**Authentication:** OAuth 2.0
**API:** Google Sheets API v4

---

## CSV Format Specification

### Teams CSV

**Filename:** `teams.csv`

**Columns:**
```csv
teamId,name,division,ageGroup,homeVenueId,locationLat,locationLon
team-001,Thunder FC,Division 1,U-16,venue-001,40.7128,-74.0060
team-002,Lightning SC,Division 1,U-16,venue-002,40.7589,-73.9851
```

**Required columns:** `teamId`, `name`
**Optional columns:** `division`, `ageGroup`, `homeVenueId`, `locationLat`, `locationLon`

---

### Venues CSV

**Filename:** `venues.csv`

**Columns:**
```csv
venueId,name,locationLat,locationLon,capacity,surfaceType,venueType
venue-001,Main Stadium,40.7128,-74.0060,5000,grass,field
venue-002,North Field,40.7589,-73.9851,2000,artificial_turf,field
```

**Required columns:** `venueId`, `name`, `locationLat`, `locationLon`
**Optional columns:** `capacity`, `surfaceType`, `venueType`

**Multi-resource venues:**
For venues with multiple resources, use `venue-resources.csv`:

```csv
venueId,resourceId,resourceType,surfaceType,capacity
venue-003,resource-001,field,grass,1000
venue-003,resource-002,field,artificial_turf,800
```

---

### Fixtures CSV

**Filename:** `fixtures.csv`

**Columns:**
```csv
fixtureId,homeTeamId,awayTeamId,venueId,dateTime,estimatedDuration,status
fixture-001,team-001,team-002,venue-001,2025-03-15T19:00:00-04:00,120,scheduled
fixture-002,team-003,team-004,venue-002,2025-03-16T15:00:00-04:00,120,scheduled
```

**Required columns:** `fixtureId`, `homeTeamId`, `awayTeamId`, `dateTime`
**Optional columns:** `venueId`, `estimatedDuration`, `status`, `resourceId`

**Date format:** ISO 8601 with timezone (YYYY-MM-DDTHH:MM:SS±HH:MM)

---

### Constraints CSV

**Filename:** `constraints.csv`

**Columns:**
```csv
constraintId,type,params
min_rest_time,hard,"min_hours=48"
home_away_balance,soft,"max_delta=2;weight=10"
max_travel_distance,soft,"max_km=200;weight=5"
```

**Limitations:**
- Simple key=value parameter format only
- Complex selectors not supported (requires JSON)
- Arrays/objects must be in JSON sub-format

**For complex constraints:** Use JSON format

---

### Results CSV

**Filename:** `results.csv`

**Columns:**
```csv
fixtureId,homeTeamId,awayTeamId,venueId,dateTime,status,violations,score
fixture-001,team-001,team-002,venue-001,2025-03-15T19:00:00-04:00,scheduled,"",100
fixture-002,team-003,team-004,venue-002,2025-03-16T15:00:00-04:00,scheduled,"min_rest_time",85
```

**Required columns:** `fixtureId`, `dateTime`
**Optional columns:** `status`, `violations`, `score`

---

## Adapter Specification

### Adapter Pattern

An **adapter** is a transformation layer that converts between OSSS format and external system format.

**Components:**
1. **Source Schema** - External system data model
2. **Mapping Rules** - Field-to-field transformations
3. **Transformation Logic** - Data conversion, enrichment, validation
4. **Target Schema** - OSSS data model

---

### Adapter Template

```javascript
class OsssAdapter {
  constructor(config) {
    this.config = config;
    this.mappings = this.defineMappings();
  }

  /**
   * Define field mappings from source to OSSS
   */
  defineMappings() {
    return {
      teams: {
        'id': 'teamId',
        'team_name': 'name',
        'div': 'division',
        'home_field': 'homeVenueId',
        'lat': 'location.lat',
        'lng': 'location.lon'
      },
      venues: {
        'field_id': 'venueId',
        'field_name': 'name',
        'latitude': 'location.lat',
        'longitude': 'location.lon'
      },
      fixtures: {
        'match_id': 'fixtureId',
        'home_team': 'homeTeamId',
        'away_team': 'awayTeamId',
        'field': 'venueId',
        'start_time': 'dateTime'
      }
    };
  }

  /**
   * Import from external format to OSSS
   */
  async import(externalData) {
    const osssInstance = {
      osssVersion: "0.1.0",
      instance: {
        teams: this.transformTeams(externalData.teams),
        venues: this.transformVenues(externalData.fields),
        fixtures: this.transformFixtures(externalData.matches)
      }
    };

    // Validate
    await this.validate(osssInstance);

    return osssInstance;
  }

  /**
   * Export from OSSS to external format
   */
  async export(osssInstance) {
    const externalData = {
      teams: this.reverseTransformTeams(osssInstance.instance.teams),
      fields: this.reverseTransformVenues(osssInstance.instance.venues),
      matches: this.reverseTransformFixtures(osssInstance.instance.fixtures)
    };

    return externalData;
  }

  transformTeams(externalTeams) {
    return externalTeams.map(team => ({
      teamId: team.id,
      name: team.team_name,
      division: team.div,
      homeVenue: team.home_field,
      location: {
        lat: team.lat,
        lon: team.lng
      }
    }));
  }

  transformVenues(externalFields) {
    return externalFields.map(field => ({
      venueId: field.field_id,
      name: field.field_name,
      location: {
        lat: field.latitude,
        lon: field.longitude
      }
    }));
  }

  transformFixtures(externalMatches) {
    return externalMatches.map(match => ({
      fixtureId: match.match_id,
      homeTeamId: match.home_team,
      awayTeamId: match.away_team,
      venueId: match.field,
      dateTime: this.convertDateTime(match.start_time)
    }));
  }

  convertDateTime(externalDateTime) {
    // Convert from external format to ISO 8601
    // Example: "2025-03-15 7:00 PM EST" -> "2025-03-15T19:00:00-05:00"
    return new Date(externalDateTime).toISOString();
  }

  async validate(osssInstance) {
    // Use OSSS validator
    // Throw error if validation fails
  }
}
```

---

### Common Adapter Scenarios

#### 1. Legacy CSV Import

**Source:** Excel spreadsheet with custom column names
**Target:** OSSS JSON

**Challenges:**
- Inconsistent date formats
- Missing timezone information
- Team names instead of IDs
- Venue names instead of coordinates

**Solution:**
```javascript
class LegacyCsvAdapter extends OsssAdapter {
  transformFixtures(csvRows) {
    return csvRows.map(row => {
      const homeTeamId = this.lookupTeamId(row.home_team_name);
      const awayTeamId = this.lookupTeamId(row.away_team_name);
      const venueId = this.lookupVenueId(row.field_name);
      const dateTime = this.parseDateTime(row.date, row.time, this.config.timezone);

      return {
        fixtureId: this.generateFixtureId(),
        homeTeamId,
        awayTeamId,
        venueId,
        dateTime
      };
    });
  }

  parseDateTime(date, time, timezone) {
    // Parse "03/15/2025" and "7:00 PM" with timezone
    const dt = new Date(`${date} ${time} ${timezone}`);
    return dt.toISOString();
  }

  lookupTeamId(teamName) {
    // Look up team ID from name mapping
    return this.teamNameToIdMap[teamName];
  }
}
```

---

#### 2. SaaS Platform Integration

**Source:** Scheduling SaaS API (REST/GraphQL)
**Target:** OSSS JSON

**Challenges:**
- Nested API responses
- Pagination
- Rate limiting
- Incremental updates

**Solution:**
```javascript
class SaasApiAdapter extends OsssAdapter {
  async fetchAll(endpoint) {
    let allData = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.apiClient.get(endpoint, { page });
      allData = allData.concat(response.data);
      hasMore = response.has_more;
      page++;

      // Rate limiting
      await this.sleep(1000);
    }

    return allData;
  }

  async import() {
    const [teams, venues, fixtures] = await Promise.all([
      this.fetchAll('/teams'),
      this.fetchAll('/venues'),
      this.fetchAll('/fixtures')
    ]);

    return super.import({ teams, venues, fixtures });
  }
}
```

---

#### 3. iCalendar Round-Trip

**Source:** OSSS JSON
**Target:** .ics file
**Return:** OSSS JSON (with updates)

**Use case:** Export to calendar for manual adjustments, then re-import

**Challenges:**
- iCal loses OSSS metadata
- Can't represent constraints in iCal
- Changes must be detected and merged

**Solution:**
```javascript
class ICalAdapter extends OsssAdapter {
  export(osssInstance) {
    let ical = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OSSS//OSSS Validator//EN
`;

    osssInstance.instance.fixtures.forEach(fixture => {
      const event = this.createEvent(fixture, osssInstance.instance);
      ical += event;
    });

    ical += `END:VCALENDAR`;
    return ical;
  }

  createEvent(fixture, instance) {
    const homeTeam = instance.teams.find(t => t.teamId === fixture.homeTeamId);
    const awayTeam = instance.teams.find(t => t.teamId === fixture.awayTeamId);
    const venue = instance.venues.find(v => v.venueId === fixture.venueId);

    const dtstart = fixture.dateTime;
    const duration = fixture.estimatedDuration || 120;
    const dtend = new Date(new Date(dtstart).getTime() + duration * 60000).toISOString();

    return `BEGIN:VEVENT
UID:${fixture.fixtureId}@osss.org
DTSTART:${this.formatICalDateTime(dtstart)}
DTEND:${this.formatICalDateTime(dtend)}
SUMMARY:${homeTeam.name} vs ${awayTeam.name}
LOCATION:${venue.name}
DESCRIPTION:OSSS Fixture ID: ${fixture.fixtureId}
END:VEVENT
`;
  }

  import(icalString, originalOsssInstance) {
    const events = this.parseICal(icalString);

    // Detect changes
    const changes = this.detectChanges(events, originalOsssInstance);

    // Apply changes to original
    const updatedInstance = this.applyChanges(originalOsssInstance, changes);

    return updatedInstance;
  }

  detectChanges(events, original) {
    const changes = [];

    events.forEach(event => {
      const fixtureId = event.uid.replace('@osss.org', '');
      const originalFixture = original.instance.fixtures.find(f => f.fixtureId === fixtureId);

      if (!originalFixture) {
        changes.push({ type: 'added', fixture: event });
      } else if (event.dtstart !== originalFixture.dateTime) {
        changes.push({ type: 'modified', fixtureId, newDateTime: event.dtstart });
      }
    });

    return changes;
  }
}
```

---

## CLI Commands

### Convert Command

**Syntax:**
```bash
osss-validate convert [options]
```

**Options:**
```
--from <format>      Source format (json|csv|excel|ical)
--to <format>        Target format (json|csv|excel|ical)
--input <path>       Input file or directory
--output <path>      Output file or directory
--adapter <name>     Use custom adapter
--config <path>      Adapter configuration file
--validate           Validate after conversion
--strict             Fail on any data loss
```

**Examples:**

```bash
# CSV to JSON
osss-validate convert \
  --from csv \
  --to json \
  --input ./csv-files/ \
  --output instance.json \
  --validate

# JSON to iCalendar
osss-validate convert \
  --from json \
  --to ical \
  --input instance.json \
  --output schedule.ics

# Excel to JSON with custom adapter
osss-validate convert \
  --from excel \
  --to json \
  --input league-data.xlsx \
  --output instance.json \
  --adapter legacy-league \
  --config adapter-config.json

# JSON to CSV (multiple files)
osss-validate convert \
  --from json \
  --to csv \
  --input instance.json \
  --output ./csv-export/
```

---

## Fidelity & Data Loss

### Fidelity Matrix

| Source | Target | Fidelity | Data Loss |
|--------|--------|----------|-----------|
| JSON → JSON | 100% | None |
| JSON → CSV | 80% | Complex constraints, nested objects, custom fields |
| JSON → Excel | 85% | Complex constraints (simplified) |
| JSON → iCal | 40% | Constraints, objectives, metadata |
| CSV → JSON | 80% | Limited constraint types |
| Excel → JSON | 85% | Complex selectors |
| iCal → JSON | 40% | Constraints, objectives (merge with original) |

### Handling Data Loss

**Strategy 1: Warn**
```bash
Warning: Converting to CSV will lose the following:
  - Complex selector logic in 3 constraints
  - Venue resource definitions (5 resources)
  - Custom metadata fields (2 fields)

Continue? (y/N)
```

**Strategy 2: Preserve in Comments**
```csv
# OSSS Metadata (preserved for round-trip)
# {"version": "0.1.0", "custom": {"league": "Premier"}}
teamId,name,division
```

**Strategy 3: Sidecar Files**
```
instance.csv          # Main data
instance.osss.json    # Full OSSS data for reference
instance.mapping.json # Mapping/metadata for round-trip
```

---

## Adapter Registry

### Built-in Adapters

| Adapter Name | Source Format | Target | Use Case |
|--------------|---------------|--------|----------|
| `csv-simple` | CSV (standard columns) | OSSS JSON | Basic CSV import |
| `excel-multi` | Excel (.xlsx) | OSSS JSON | Multi-sheet import |
| `ical-export` | OSSS JSON | iCalendar | Calendar integration |
| `google-sheets` | Google Sheets | OSSS JSON | Cloud collaboration |

### Custom Adapters

**Location:** `adapters/custom/`

**Structure:**
```
adapters/
├── custom/
│   ├── legacy-league/
│   │   ├── adapter.js
│   │   ├── config.json
│   │   └── README.md
│   └── saas-platform/
│       ├── adapter.js
│       ├── config.json
│       └── README.md
```

**Configuration Example:**
```json
{
  "adapterName": "legacy-league",
  "version": "1.0.0",
  "sourceFormat": "csv",
  "targetFormat": "json",
  "mappings": {
    "teams": {
      "ID": "teamId",
      "TeamName": "name",
      "Div": "division"
    }
  },
  "transformations": {
    "dateTime": {
      "sourceFormat": "MM/DD/YYYY h:mm A",
      "timezone": "America/New_York"
    }
  }
}
```

---

## Quality Assurance

### Conversion Validation

**After conversion, validate:**

1. **Schema compliance**
   ```bash
   osss-validate instance --instance converted.json --schemas ./schemas
   ```

2. **Data integrity**
   - All teams referenced in fixtures exist
   - All venues referenced in fixtures exist
   - Date ranges are valid
   - No duplicate IDs

3. **Constraint preservation**
   - All original constraints represented
   - Parameters within valid ranges
   - No semantic changes

4. **Round-trip fidelity**
   ```bash
   osss-validate convert --from json --to csv --input original.json --output temp.csv
   osss-validate convert --from csv --to json --input temp.csv --output roundtrip.json
   diff original.json roundtrip.json
   ```

---

## Migration Guidance

### Incremental Adoption Path

**Phase 1: Export Only**
- Keep existing system as source of truth
- Export to OSSS for validation/analysis
- Identify gaps in OSSS support

**Phase 2: Round-Trip**
- Export to OSSS, make changes, import back
- Use OSSS as intermediate format
- Validate round-trip fidelity

**Phase 3: Dual-Write**
- Write to both existing system and OSSS
- Compare outputs for consistency
- Build confidence in OSSS

**Phase 4: OSSS Primary**
- OSSS becomes source of truth
- Export to legacy format for compatibility
- Full OSSS adoption

---

## Best Practices

### For Leagues

✅ **DO:**
- Start with CSV export to understand your data
- Validate converted data before using in production
- Keep original data until confident in conversion
- Document custom mappings

❌ **DON'T:**
- Assume 100% fidelity on first conversion
- Skip validation step
- Delete original data immediately
- Use complex constraints in CSV format

---

### For Vendors

✅ **DO:**
- Provide both import and export
- Preserve OSSS metadata in custom fields
- Document data loss clearly
- Support round-trip conversions
- Version your adapter

❌ **DON'T:**
- Silently drop data
- Change semantics during conversion
- Require manual intervention
- Break backwards compatibility

---

## References

- **CSV RFC 4180:** https://tools.ietf.org/html/rfc4180
- **iCalendar RFC 5545:** https://tools.ietf.org/html/rfc5545
- **Excel OpenXML:** https://docs.microsoft.com/en-us/office/open-xml/
- **Google Sheets API:** https://developers.google.com/sheets/api

---

## Updates

**Version History:**
- v1.0.0 (2025-01-01): Initial specification

**Feedback:** Submit issues or suggestions via GitHub

---

## License

CC-BY-4.0

---

**Interoperability removes adoption barriers. OSSS should work with existing tools, not replace them.**
