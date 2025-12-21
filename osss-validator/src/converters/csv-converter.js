/**
 * OSSS CSV Converter
 *
 * Converts between OSSS JSON and CSV formats
 * Part of Phase 5: Interoperability & Tooling
 */

import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Convert OSSS JSON instance to CSV files
 *
 * @param {Object} osssInstance - OSSS instance object
 * @param {string} outputDir - Directory to write CSV files
 * @returns {Promise<Object>} - Summary of files created
 */
export async function jsonToCsv(osssInstance, outputDir) {
  await fs.mkdir(outputDir, { recursive: true });

  const files = {};

  // Convert teams
  if (osssInstance.instance.teams && osssInstance.instance.teams.length > 0) {
    const teamsCsv = convertTeamsToCsv(osssInstance.instance.teams);
    const teamsPath = path.join(outputDir, 'teams.csv');
    await fs.writeFile(teamsPath, teamsCsv);
    files.teams = teamsPath;
  }

  // Convert venues
  if (osssInstance.instance.venues && osssInstance.instance.venues.length > 0) {
    const venuesCsv = convertVenuesToCsv(osssInstance.instance.venues);
    const venuesPath = path.join(outputDir, 'venues.csv');
    await fs.writeFile(venuesPath, venuesCsv);
    files.venues = venuesPath;

    // Check for multi-resource venues
    const resourcesCsv = convertVenueResourcesToCsv(osssInstance.instance.venues);
    if (resourcesCsv) {
      const resourcesPath = path.join(outputDir, 'venue-resources.csv');
      await fs.writeFile(resourcesPath, resourcesCsv);
      files.venueResources = resourcesPath;
    }
  }

  // Convert fixtures
  if (osssInstance.instance.fixtures && osssInstance.instance.fixtures.length > 0) {
    const fixturesCsv = convertFixturesToCsv(osssInstance.instance.fixtures);
    const fixturesPath = path.join(outputDir, 'fixtures.csv');
    await fs.writeFile(fixturesPath, fixturesCsv);
    files.fixtures = fixturesPath;
  }

  // Convert constraints
  if (osssInstance.instance.constraints && osssInstance.instance.constraints.length > 0) {
    const constraintsCsv = convertConstraintsToCsv(osssInstance.instance.constraints);
    const constraintsPath = path.join(outputDir, 'constraints.csv');
    await fs.writeFile(constraintsPath, constraintsCsv);
    files.constraints = constraintsPath;
  }

  // Save metadata for round-trip
  const metadataPath = path.join(outputDir, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify({
    osssVersion: osssInstance.osssVersion,
    exportDate: new Date().toISOString(),
    metadata: osssInstance.instance.metadata || {}
  }, null, 2));
  files.metadata = metadataPath;

  return files;
}

/**
 * Convert CSV files to OSSS JSON instance
 *
 * @param {string} inputDir - Directory containing CSV files
 * @returns {Promise<Object>} - OSSS instance object
 */
export async function csvToJson(inputDir) {
  const instance = {
    osssVersion: "0.1.0",
    instance: {}
  };

  // Load metadata if exists
  try {
    const metadataPath = path.join(inputDir, 'metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const metadata = JSON.parse(metadataContent);
    instance.osssVersion = metadata.osssVersion || "0.1.0";
    instance.instance.metadata = metadata.metadata || {};
  } catch (err) {
    // Metadata optional
  }

  // Load teams
  try {
    const teamsPath = path.join(inputDir, 'teams.csv');
    const teamsCsv = await fs.readFile(teamsPath, 'utf-8');
    instance.instance.teams = parseTeamsCsv(teamsCsv);
  } catch (err) {
    throw new Error(`Failed to load teams.csv: ${err.message}`);
  }

  // Load venues
  try {
    const venuesPath = path.join(inputDir, 'venues.csv');
    const venuesCsv = await fs.readFile(venuesPath, 'utf-8');
    instance.instance.venues = parseVenuesCsv(venuesCsv);

    // Load venue resources if exists
    try {
      const resourcesPath = path.join(inputDir, 'venue-resources.csv');
      const resourcesCsv = await fs.readFile(resourcesPath, 'utf-8');
      mergeVenueResources(instance.instance.venues, parseVenueResourcesCsv(resourcesCsv));
    } catch (err) {
      // Resources optional
    }
  } catch (err) {
    throw new Error(`Failed to load venues.csv: ${err.message}`);
  }

  // Load fixtures
  try {
    const fixturesPath = path.join(inputDir, 'fixtures.csv');
    const fixturesCsv = await fs.readFile(fixturesPath, 'utf-8');
    instance.instance.fixtures = parseFixturesCsv(fixturesCsv);
  } catch (err) {
    throw new Error(`Failed to load fixtures.csv: ${err.message}`);
  }

  // Load constraints (optional)
  try {
    const constraintsPath = path.join(inputDir, 'constraints.csv');
    const constraintsCsv = await fs.readFile(constraintsPath, 'utf-8');
    instance.instance.constraints = parseConstraintsCsv(constraintsCsv);
  } catch (err) {
    // Constraints optional
  }

  return instance;
}

// ============================================================================
// CSV Generation Functions
// ============================================================================

function convertTeamsToCsv(teams) {
  const rows = [
    'teamId,name,division,ageGroup,homeVenueId,locationLat,locationLon'
  ];

  for (const team of teams) {
    const row = [
      escapeCsv(team.teamId),
      escapeCsv(team.name || ''),
      escapeCsv(team.division || ''),
      escapeCsv(team.ageGroup || ''),
      escapeCsv(team.homeVenue || ''),
      team.location?.lat || '',
      team.location?.lon || ''
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

function convertVenuesToCsv(venues) {
  const rows = [
    'venueId,name,locationLat,locationLon,capacity,surfaceType,venueType'
  ];

  for (const venue of venues) {
    const row = [
      escapeCsv(venue.venueId),
      escapeCsv(venue.name || ''),
      venue.location?.lat || '',
      venue.location?.lon || '',
      venue.capacity || '',
      escapeCsv(venue.surfaceType || ''),
      escapeCsv(venue.venueType || '')
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

function convertVenueResourcesToCsv(venues) {
  const rows = [];
  let hasResources = false;

  for (const venue of venues) {
    if (venue.resources && venue.resources.length > 0) {
      hasResources = true;
      for (const resource of venue.resources) {
        const row = [
          escapeCsv(venue.venueId),
          escapeCsv(resource.resourceId),
          escapeCsv(resource.resourceType || ''),
          escapeCsv(resource.surfaceType || ''),
          resource.capacity || ''
        ];
        rows.push(row.join(','));
      }
    }
  }

  if (!hasResources) return null;

  rows.unshift('venueId,resourceId,resourceType,surfaceType,capacity');
  return rows.join('\n');
}

function convertFixturesToCsv(fixtures) {
  const rows = [
    'fixtureId,homeTeamId,awayTeamId,venueId,resourceId,dateTime,estimatedDuration,status'
  ];

  for (const fixture of fixtures) {
    const row = [
      escapeCsv(fixture.fixtureId),
      escapeCsv(fixture.homeTeamId),
      escapeCsv(fixture.awayTeamId),
      escapeCsv(fixture.venueId || ''),
      escapeCsv(fixture.resourceId || ''),
      escapeCsv(fixture.dateTime || ''),
      fixture.estimatedDuration || '',
      escapeCsv(fixture.status || 'scheduled')
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

function convertConstraintsToCsv(constraints) {
  const rows = [
    'constraintId,type,params'
  ];

  for (const constraint of constraints) {
    const params = serializeParams(constraint.params || {});
    const row = [
      escapeCsv(constraint.constraintId),
      escapeCsv(constraint.type || 'hard'),
      escapeCsv(params)
    ];
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

function serializeParams(params) {
  // Simple key=value;key=value format
  const pairs = [];
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'object') {
      // Complex objects -> JSON string
      pairs.push(`${key}=${JSON.stringify(value)}`);
    } else {
      pairs.push(`${key}=${value}`);
    }
  }
  return pairs.join(';');
}

// ============================================================================
// CSV Parsing Functions
// ============================================================================

function parseTeamsCsv(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  const teams = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const team = {
      teamId: values[0],
      name: values[1]
    };

    if (values[2]) team.division = values[2];
    if (values[3]) team.ageGroup = values[3];
    if (values[4]) team.homeVenue = values[4];
    if (values[5] && values[6]) {
      team.location = {
        lat: parseFloat(values[5]),
        lon: parseFloat(values[6])
      };
    }

    teams.push(team);
  }

  return teams;
}

function parseVenuesCsv(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  const venues = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const venue = {
      venueId: values[0],
      name: values[1],
      location: {
        lat: parseFloat(values[2]),
        lon: parseFloat(values[3])
      }
    };

    if (values[4]) venue.capacity = parseInt(values[4], 10);
    if (values[5]) venue.surfaceType = values[5];
    if (values[6]) venue.venueType = values[6];

    venues.push(venue);
  }

  return venues;
}

function parseVenueResourcesCsv(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  const resourcesByVenue = {};

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const venueId = values[0];

    if (!resourcesByVenue[venueId]) {
      resourcesByVenue[venueId] = [];
    }

    const resource = {
      resourceId: values[1],
      resourceType: values[2]
    };

    if (values[3]) resource.surfaceType = values[3];
    if (values[4]) resource.capacity = parseInt(values[4], 10);

    resourcesByVenue[venueId].push(resource);
  }

  return resourcesByVenue;
}

function mergeVenueResources(venues, resourcesByVenue) {
  for (const venue of venues) {
    if (resourcesByVenue[venue.venueId]) {
      venue.resources = resourcesByVenue[venue.venueId];
    }
  }
}

function parseFixturesCsv(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  const fixtures = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const fixture = {
      fixtureId: values[0],
      homeTeamId: values[1],
      awayTeamId: values[2],
      dateTime: values[5]
    };

    if (values[3]) fixture.venueId = values[3];
    if (values[4]) fixture.resourceId = values[4];
    if (values[6]) fixture.estimatedDuration = parseInt(values[6], 10);
    if (values[7]) fixture.status = values[7];

    fixtures.push(fixture);
  }

  return fixtures;
}

function parseConstraintsCsv(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  const constraints = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const constraint = {
      constraintId: values[0],
      type: values[1] || 'hard',
      params: parseParams(values[2] || '')
    };

    constraints.push(constraint);
  }

  return constraints;
}

function parseParams(paramsStr) {
  if (!paramsStr) return {};

  const params = {};
  const pairs = paramsStr.split(';');

  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (!key || !value) continue;

    // Try to parse as JSON for complex values
    try {
      params[key.trim()] = JSON.parse(value.trim());
    } catch (err) {
      // If not JSON, treat as string or number
      const trimmedValue = value.trim();
      if (!isNaN(trimmedValue)) {
        params[key.trim()] = parseFloat(trimmedValue);
      } else {
        params[key.trim()] = trimmedValue;
      }
    }
  }

  return params;
}

// ============================================================================
// Utility Functions
// ============================================================================

function escapeCsv(value) {
  if (value === null || value === undefined) return '';

  const str = String(value);

  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

function parseCsvLine(line) {
  const values = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        currentValue += '"';
        i++; // Skip next quote
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of value
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Push last value
  values.push(currentValue);

  return values;
}

// ============================================================================
// Validation
// ============================================================================

export function validateCsvConversion(original, converted) {
  const warnings = [];
  const errors = [];

  // Check team count
  if (original.instance.teams.length !== converted.instance.teams.length) {
    errors.push(`Team count mismatch: ${original.instance.teams.length} -> ${converted.instance.teams.length}`);
  }

  // Check venue count
  if (original.instance.venues.length !== converted.instance.venues.length) {
    errors.push(`Venue count mismatch: ${original.instance.venues.length} -> ${converted.instance.venues.length}`);
  }

  // Check fixture count
  if (original.instance.fixtures.length !== converted.instance.fixtures.length) {
    errors.push(`Fixture count mismatch: ${original.instance.fixtures.length} -> ${converted.instance.fixtures.length}`);
  }

  // Check for complex constraints that may be lost
  if (original.instance.constraints) {
    for (const constraint of original.instance.constraints) {
      if (constraint.selector && typeof constraint.selector === 'object') {
        warnings.push(`Complex selector in constraint ${constraint.constraintId} may lose fidelity in CSV`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
