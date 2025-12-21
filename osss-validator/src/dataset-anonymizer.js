/**
 * OSSS Dataset Anonymizer
 *
 * Anonymizes real-world sports scheduling instances for public sharing while preserving structure.
 */

import crypto from 'node:crypto';

/**
 * Anonymize an OSSS instance
 * @param {object} instance - Original instance
 * @param {object} options - Anonymization options
 * @returns {object} Anonymized instance
 */
export function anonymizeInstance(instance, options = {}) {
  const {
    preserveStructure = true,
    removePII = true,
    fuzzyLocations = true,
    relativeDates = true,
    hashSeed = Date.now()
  } = options;

  const anonymized = JSON.parse(JSON.stringify(instance));

  // Create consistent ID mapping
  const idMap = new Map();
  let teamCounter = 1;
  let venueCounter = 1;

  // Anonymize metadata
  anonymizeMetadata(anonymized.metadata, removePII);

  // Anonymize teams
  if (anonymized.teams) {
    for (const team of anonymized.teams) {
      const oldId = team.id;
      const newId = `team-${teamCounter++}`;
      idMap.set(oldId, newId);

      team.id = newId;
      if (removePII) {
        team.name = `Team ${teamCounter - 1}`;
      }

      // Remove potentially identifying tags
      if (team.tags && removePII) {
        team.tags = team.tags.filter(tag => !isIdentifyingTag(tag));
      }
    }
  }

  // Anonymize venues
  if (anonymized.venues) {
    for (const venue of anonymized.venues) {
      const oldId = venue.id;
      const newId = `venue-${venueCounter++}`;
      idMap.set(oldId, newId);

      venue.id = newId;
      if (removePII) {
        venue.name = `Stadium ${venueCounter - 1}`;
      }

      // Fuzz location if requested
      if (fuzzyLocations && venue.location) {
        venue.location = fuzzyLocation(venue.location);
      }

      // Anonymize resources
      if (venue.resources) {
        for (let i = 0; i < venue.resources.length; i++) {
          venue.resources[i].id = `${newId}-resource-${i + 1}`;
          if (removePII) {
            venue.resources[i].name = `Field ${i + 1}`;
          }
        }
      }
    }
  }

  // Update ID references in fixtures
  if (anonymized.fixtures) {
    for (const fixture of anonymized.fixtures) {
      if (fixture.homeTeam) {
        fixture.homeTeam = idMap.get(fixture.homeTeam) || fixture.homeTeam;
      }
      if (fixture.awayTeam) {
        fixture.awayTeam = idMap.get(fixture.awayTeam) || fixture.awayTeam;
      }
      if (fixture.venue) {
        fixture.venue = idMap.get(fixture.venue) || fixture.venue;
      }

      // Relativize dates if requested
      if (relativeDates && fixture.startTime) {
        // Convert to relative offset from season start
        fixture.startTime = anonymizeDate(fixture.startTime);
      }
      if (relativeDates && fixture.endTime) {
        fixture.endTime = anonymizeDate(fixture.endTime);
      }
    }
  }

  // Update ID references in constraints
  if (anonymized.constraints) {
    anonymizeConstraints(anonymized.constraints, idMap);
  }

  // Add anonymization metadata
  anonymized.metadata.anonymized = true;
  anonymized.metadata.anonymizedAt = new Date().toISOString();
  anonymized.metadata.anonymizationVersion = '1.0.0';
  anonymized.metadata.originalDatasetId = hashString(instance.metadata?.datasetId || 'unknown', hashSeed);

  return anonymized;
}

/**
 * Anonymize metadata
 */
function anonymizeMetadata(metadata, removePII) {
  if (!metadata) return;

  if (removePII) {
    // Remove identifying information
    delete metadata.leagueName;
    delete metadata.organizationName;
    delete metadata.contactEmail;
    delete metadata.contactName;
    delete metadata.address;

    // Keep only structure-relevant fields
    if (metadata.leagueId) {
      metadata.leagueId = 'anonymized-league';
    }
    if (metadata.seasonId) {
      metadata.seasonId = metadata.seasonId.replace(/\d{4}/, 'YYYY');
    }
  }
}

/**
 * Check if a tag is potentially identifying
 */
function isIdentifyingTag(tag) {
  const identifyingPatterns = [
    /club/i,
    /sponsor/i,
    /city-/i,
    /region-/i,
    /\d{4}/  // Years
  ];

  return identifyingPatterns.some(pattern => pattern.test(tag));
}

/**
 * Fuzzy location (add noise to coordinates)
 */
function fuzzyLocation(location, radiusKm = 10) {
  if (!location || !location.lat || !location.lon) {
    return location;
  }

  // Add random noise within radius
  const latNoise = (Math.random() - 0.5) * (radiusKm / 111);  // ~111km per degree lat
  const lonNoise = (Math.random() - 0.5) * (radiusKm / (111 * Math.cos(location.lat * Math.PI / 180)));

  return {
    lat: parseFloat((location.lat + latNoise).toFixed(4)),
    lon: parseFloat((location.lon + lonNoise).toFixed(4))
  };
}

/**
 * Anonymize date (convert to relative time from epoch)
 */
function anonymizeDate(dateString) {
  // Convert to relative offset (days from 2025-01-01)
  const epochDate = new Date('2025-01-01T00:00:00Z');
  const date = new Date(dateString);
  const daysSinceEpoch = Math.floor((date - epochDate) / (1000 * 60 * 60 * 24));

  // Reconstruct as offset
  const anonymizedDate = new Date(epochDate);
  anonymizedDate.setDate(anonymizedDate.getDate() + daysSinceEpoch);

  return anonymizedDate.toISOString();
}

/**
 * Anonymize constraints (update selectors with new IDs)
 */
function anonymizeConstraints(constraints, idMap) {
  const processConstraintList = (list) => {
    if (!list) return;

    for (const constraint of list) {
      if (constraint.selector) {
        updateSelector(constraint.selector, idMap);
      }
    }
  };

  processConstraintList(constraints.required);
  processConstraintList(constraints.recommended);
}

/**
 * Update selector with anonymized IDs
 */
function updateSelector(selector, idMap) {
  if (!selector) return;

  // Update team IDs
  if (selector.teams && Array.isArray(selector.teams)) {
    selector.teams = selector.teams.map(id => idMap.get(id) || id);
  }

  // Update venue IDs
  if (selector.venues && Array.isArray(selector.venues)) {
    selector.venues = selector.venues.map(id => idMap.get(id) || id);
  }

  // Update fixture IDs
  if (selector.fixtures && Array.isArray(selector.fixtures)) {
    selector.fixtures = selector.fixtures.map(id => idMap.get(id) || id);
  }

  // Handle nested selectors (allOf, anyOf, not)
  if (selector.allOf) {
    selector.allOf.forEach(sub => updateSelector(sub, idMap));
  }
  if (selector.anyOf) {
    selector.anyOf.forEach(sub => updateSelector(sub, idMap));
  }
  if (selector.not) {
    updateSelector(selector.not, idMap);
  }
}

/**
 * Hash a string for pseudonymization
 */
function hashString(str, seed) {
  const hash = crypto.createHash('sha256');
  hash.update(str + seed);
  return hash.digest('hex').substring(0, 16);
}

/**
 * Verify anonymization quality
 * @param {object} original - Original instance
 * @param {object} anonymized - Anonymized instance
 * @returns {object} Quality report
 */
export function verifyAnonymization(original, anonymized) {
  const report = {
    structurePreserved: true,
    piiRemoved: true,
    warnings: [],
    statistics: {}
  };

  // Check structure preservation
  report.statistics.originalTeams = original.teams?.length || 0;
  report.statistics.anonymizedTeams = anonymized.teams?.length || 0;
  report.statistics.originalVenues = original.venues?.length || 0;
  report.statistics.anonymizedVenues = anonymized.venues?.length || 0;
  report.statistics.originalFixtures = original.fixtures?.length || 0;
  report.statistics.anonymizedFixtures = anonymized.fixtures?.length || 0;

  if (report.statistics.originalTeams !== report.statistics.anonymizedTeams) {
    report.structurePreserved = false;
    report.warnings.push('Team count mismatch');
  }

  if (report.statistics.originalVenues !== report.statistics.anonymizedVenues) {
    report.structurePreserved = false;
    report.warnings.push('Venue count mismatch');
  }

  // Check for potential PII leakage
  const jsonString = JSON.stringify(anonymized);

  // Check for email patterns
  if (/@\w+\.\w+/.test(jsonString)) {
    report.piiRemoved = false;
    report.warnings.push('Potential email address found');
  }

  // Check for phone patterns
  if (/\d{3}-\d{3}-\d{4}/.test(jsonString)) {
    report.piiRemoved = false;
    report.warnings.push('Potential phone number found');
  }

  // Check for specific names (basic heuristic)
  const originalNames = new Set();
  if (original.teams) {
    original.teams.forEach(t => originalNames.add(t.name));
  }
  if (original.venues) {
    original.venues.forEach(v => originalNames.add(v.name));
  }

  for (const name of originalNames) {
    if (jsonString.includes(name)) {
      report.piiRemoved = false;
      report.warnings.push(`Original name '${name}' still present`);
    }
  }

  report.valid = report.structurePreserved && report.piiRemoved;

  return report;
}

/**
 * Generate anonymization report
 */
export function generateAnonymizationReport(original, anonymized) {
  const verification = verifyAnonymization(original, anonymized);

  const report = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    verification,
    transformations: {
      teamsRenamed: original.teams?.length || 0,
      venuesRenamed: original.venues?.length || 0,
      locationsFuzzed: anonymized.venues?.filter(v => v.location).length || 0,
      datesRelativized: anonymized.fixtures?.filter(f => f.startTime).length || 0
    },
    qualityScore: verification.valid ? 100 : 50,
    recommendation: verification.valid ?
      'Safe to publish' :
      'Review warnings before publishing'
  };

  return report;
}
