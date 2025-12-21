/**
 * OSSS Dataset Generator
 *
 * Generates synthetic sports scheduling instances for testing, training, and competition.
 */

import crypto from 'node:crypto';

/**
 * Seeded random number generator for reproducibility
 */
class SeededRandom {
  constructor(seed) {
    this.seed = seed || Date.now();
    this.state = this.seed;
  }

  next() {
    this.state = (this.state * 1103515245 + 12345) & 0x7fffffff;
    return this.state / 0x7fffffff;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice(array) {
    return array[this.nextInt(0, array.length - 1)];
  }

  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/**
 * Generate a synthetic OSSS instance
 * @param {object} options - Generation options
 * @returns {object} OSSS instance
 */
export function generateInstance(options = {}) {
  const {
    track = 'amateur',
    numTeams = 16,
    numVenues = 8,
    seasonWeeks = 20,
    complexity = 'moderate',
    seed = Date.now(),
    profile = null
  } = options;

  const rng = new SeededRandom(seed);

  // Generate teams
  const teams = generateTeams(numTeams, rng);

  // Generate venues
  const venues = generateVenues(numVenues, rng);

  // Generate fixtures (round-robin)
  const fixtures = generateFixtures(teams, seasonWeeks, rng);

  // Load constraints based on track
  const constraints = generateConstraints(track, complexity, rng);

  // Load objectives
  const objectives = generateObjectives(track, rng);

  const instance = {
    osssVersion: '1.0.0',
    metadata: {
      datasetId: `${track}-generated-${seed}`,
      track,
      generated: new Date().toISOString(),
      generator: 'osss-dataset-generator',
      version: '1.0.0',
      seed,
      leagueId: `generated-${track}`,
      seasonId: '2025',
      timezone: 'UTC',
      difficulty: complexity,
      description: `Synthetic ${track} league dataset`
    },
    teams,
    venues,
    fixtures: [],  // Unscheduled - solver's job
    constraints,
    objectives
  };

  return instance;
}

/**
 * Generate teams
 */
function generateTeams(count, rng) {
  const teams = [];
  const divisions = ['premier', 'championship', 'league-one'];

  for (let i = 0; i < count; i++) {
    teams.push({
      id: `team-${i + 1}`,
      name: `Team ${String.fromCharCode(65 + i)}`,
      division: count > 20 ? rng.choice(divisions) : 'premier',
      tags: [],
      homeVenueId: `venue-${(i % Math.min(count, 10)) + 1}`
    });
  }

  return teams;
}

/**
 * Generate venues
 */
function generateVenues(count, rng) {
  const venues = [];
  const surfaceTypes = ['grass', 'artificial_turf', 'indoor'];

  for (let i = 0; i < count; i++) {
    const lat = 40 + rng.next() * 10;  // Roughly realistic range
    const lon = -100 + rng.next() * 40;

    venues.push({
      id: `venue-${i + 1}`,
      name: `Stadium ${String.fromCharCode(65 + i)}`,
      capacity: 1000 + rng.nextInt(0, 10) * 500,
      location: {
        lat: parseFloat(lat.toFixed(4)),
        lon: parseFloat(lon.toFixed(4))
      },
      resources: [
        {
          id: `field-${i + 1}`,
          name: `Main Field`,
          type: 'field',
          surface: rng.choice(surfaceTypes),
          changeoverMinutes: rng.choice([15, 20, 30])
        }
      ],
      availability: [
        {
          start: '2025-01-01T00:00:00Z',
          end: '2025-12-31T23:59:59Z',
          recurring: {
            pattern: 'weekly',
            daysOfWeek: [6, 0],  // Weekends
            startTime: '08:00',
            endTime: '20:00'
          },
          priority: 8
        }
      ]
    });
  }

  return venues;
}

/**
 * Generate fixtures (unscheduled)
 */
function generateFixtures(teams, weeks, rng) {
  const fixtures = [];
  const fixtureCount = teams.length * (teams.length - 1) / 2;  // Round-robin

  let fixtureId = 1;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      fixtures.push({
        id: `fixture-${fixtureId++}`,
        homeTeam: teams[i].id,
        awayTeam: teams[j].id,
        durationMinutes: 120,
        phase: 'regular'
      });
    }
  }

  return fixtures;
}

/**
 * Generate constraints based on track
 */
function generateConstraints(track, complexity, rng) {
  const baseConstraints = {
    required: [
      {
        ruleId: 'no_overlap_team',
        type: 'hard',
        selector: { teams: '*' }
      },
      {
        ruleId: 'no_overlap_venue_resource',
        type: 'hard',
        selector: { venues: '*' }
      }
    ]
  };

  const trackProfiles = {
    youth: {
      required: [
        ...baseConstraints.required,
        {
          ruleId: 'min_rest_time',
          type: 'hard',
          params: { min_hours: 72 },
          selector: { teams: '*' }
        },
        {
          ruleId: 'max_games_per_day',
          type: 'hard',
          params: { max_games: 1 },
          selector: { teams: '*' }
        }
      ],
      recommended: [
        {
          ruleId: 'home_away_balance',
          type: 'soft',
          params: { max_delta: 2 },
          penalty: { perViolation: 10 }
        }
      ]
    },
    amateur: {
      required: [
        ...baseConstraints.required,
        {
          ruleId: 'min_rest_time',
          type: 'hard',
          params: { min_hours: 48 },
          selector: { teams: '*' }
        }
      ],
      recommended: [
        {
          ruleId: 'home_away_balance',
          type: 'soft',
          params: { max_delta: 2 },
          penalty: { perViolation: 15 }
        },
        {
          ruleId: 'minimize_travel',
          type: 'soft',
          penalty: { perKm: 2 }
        }
      ]
    },
    professional: {
      required: [
        ...baseConstraints.required,
        {
          ruleId: 'min_rest_time',
          type: 'hard',
          params: { min_hours: 48 },
          selector: { teams: '*' }
        }
      ],
      recommended: [
        {
          ruleId: 'home_away_balance',
          type: 'soft',
          params: { max_delta: 1 },
          penalty: { perViolation: 100 }
        },
        {
          ruleId: 'minimize_travel',
          type: 'soft',
          penalty: { perKm: 1 }
        }
      ]
    }
  };

  return trackProfiles[track] || trackProfiles.amateur;
}

/**
 * Generate objectives based on track
 */
function generateObjectives(track, rng) {
  const trackObjectives = {
    youth: {
      objectives: [
        { objectiveId: 'total_travel_distance', weight: 2.0 },
        { objectiveId: 'home_away_balance', weight: 1.5 },
        { objectiveId: 'rest_time_average', weight: 1.5 }
      ],
      aggregation: { mode: 'weighted_sum' }
    },
    amateur: {
      objectives: [
        { objectiveId: 'total_travel_distance', weight: 1.75 },
        { objectiveId: 'home_away_balance', weight: 1.75 },
        { objectiveId: 'schedule_compactness', weight: 1.5 }
      ],
      aggregation: { mode: 'weighted_sum' }
    },
    professional: {
      objectives: [
        { objectiveId: 'home_away_balance', weight: 2.0 },
        { objectiveId: 'primetime_distribution', weight: 1.75 },
        { objectiveId: 'total_travel_distance', weight: 1.25 }
      ],
      aggregation: { mode: 'weighted_sum' }
    }
  };

  return trackObjectives[track] || trackObjectives.amateur;
}

/**
 * Mutate an existing instance
 * @param {object} instance - Original instance
 * @param {object} mutation - Mutation config
 * @returns {object} Mutated instance
 */
export function mutateInstance(instance, mutation = {}) {
  const { type, ...params } = mutation;
  const mutated = JSON.parse(JSON.stringify(instance));

  switch (type) {
    case 'add-teams': {
      const numToAdd = params.numTeams || 4;
      const currentMax = mutated.teams.length;
      for (let i = 0; i < numToAdd; i++) {
        mutated.teams.push({
          id: `team-${currentMax + i + 1}`,
          name: `Team ${String.fromCharCode(65 + currentMax + i)}`,
          division: mutated.teams[0].division
        });
      }
      break;
    }

    case 'remove-venues': {
      const numToRemove = params.numVenues || 2;
      mutated.venues = mutated.venues.slice(0, -numToRemove);
      break;
    }

    case 'tighten-rest': {
      const reduction = params.hours || 24;
      for (const constraint of mutated.constraints.required || []) {
        if (constraint.ruleId === 'min_rest_time' && constraint.params) {
          constraint.params.min_hours -= reduction;
        }
      }
      break;
    }

    default:
      throw new Error(`Unknown mutation type: ${type}`);
  }

  mutated.metadata.mutatedFrom = instance.metadata.datasetId;
  mutated.metadata.mutation = mutation;
  mutated.metadata.datasetId = `${instance.metadata.datasetId}-mutated`;

  return mutated;
}
