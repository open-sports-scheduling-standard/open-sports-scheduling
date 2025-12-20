import { expect } from 'chai';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const examplesDir = join(__dirname, '../../../examples');

describe('OSSS Validator Integration Tests', () => {
  describe('Example Instance Files', () => {
    it('should successfully parse youth-league example', async () => {
      const instancePath = join(examplesDir, 'youth-league/osss-instance.json');
      const content = await readFile(instancePath, 'utf-8');
      const instance = JSON.parse(content);

      expect(instance).to.be.an('object');
      expect(instance.id).to.equal('youth-league-2025');
      expect(instance.name).to.be.a('string');
      expect(instance.timezone).to.be.a('string');
      expect(instance.season).to.be.an('object');
      expect(instance.entities).to.be.an('object');
      expect(instance.fixtures).to.be.an('array');
      expect(instance.constraints).to.be.an('array');
    });

    it('should successfully parse amateur-league example', async () => {
      const instancePath = join(examplesDir, 'amateur-league/osss-instance.json');
      const content = await readFile(instancePath, 'utf-8');
      const instance = JSON.parse(content);

      expect(instance).to.be.an('object');
      expect(instance.id).to.equal('amateur-league-2025');
      expect(instance.name).to.be.a('string');
      expect(instance.timezone).to.equal('Europe/Dublin');
      expect(instance.season).to.be.an('object');
      expect(instance.entities).to.be.an('object');
      expect(instance.entities.teams).to.be.an('array').with.length.greaterThan(0);
      expect(instance.entities.venues).to.be.an('array').with.length.greaterThan(0);
    });

    it('should successfully parse pro-league example', async () => {
      const instancePath = join(examplesDir, 'pro-league/osss-instance.json');
      const content = await readFile(instancePath, 'utf-8');
      const instance = JSON.parse(content);

      expect(instance).to.be.an('object');
      expect(instance.id).to.equal('pro-league-2025');
      expect(instance.version).to.equal('0.1.0');
      expect(instance.name).to.be.a('string');
      expect(instance.timezone).to.equal('America/New_York');
      expect(instance.season).to.be.an('object');
      expect(instance.season.blackout_dates).to.be.an('array');
      expect(instance.competition).to.be.an('object');
    });
  });

  describe('Youth League Instance Validation', () => {
    let instance;

    before(async () => {
      const instancePath = join(examplesDir, 'youth-league/osss-instance.json');
      const content = await readFile(instancePath, 'utf-8');
      instance = JSON.parse(content);
    });

    it('should have valid season dates', () => {
      expect(instance.season.start).to.match(/^\d{4}-\d{2}-\d{2}T/);
      expect(instance.season.end).to.match(/^\d{4}-\d{2}-\d{2}T/);

      const start = new Date(instance.season.start);
      const end = new Date(instance.season.end);
      expect(start.getTime()).to.be.lessThan(end.getTime());
    });

    it('should have valid constraint structure', () => {
      expect(instance.constraints).to.be.an('array');

      instance.constraints.forEach(constraint => {
        expect(constraint).to.have.property('id');
        expect(constraint).to.have.property('type');
        expect(constraint.type).to.be.oneOf(['hard', 'soft']);
        expect(constraint).to.have.property('rule');
        expect(constraint).to.have.property('selector');
      });
    });

    it('should have at least one hard constraint', () => {
      const hardConstraints = instance.constraints.filter(c => c.type === 'hard');
      expect(hardConstraints).to.have.length.greaterThan(0);
    });

    it('should have valid team entities', () => {
      expect(instance.entities.teams).to.be.an('array');

      instance.entities.teams.forEach(team => {
        expect(team).to.have.property('id');
        expect(team).to.have.property('name');
        expect(team.id).to.be.a('string').with.length.greaterThan(0);
        expect(team.name).to.be.a('string').with.length.greaterThan(0);
      });
    });

    it('should have valid venue entities', () => {
      expect(instance.entities.venues).to.be.an('array');

      instance.entities.venues.forEach(venue => {
        expect(venue).to.have.property('id');
        expect(venue).to.have.property('name');
        expect(venue.id).to.be.a('string').with.length.greaterThan(0);
        expect(venue.name).to.be.a('string').with.length.greaterThan(0);
      });
    });

    it('should have valid fixtures', () => {
      expect(instance.fixtures).to.be.an('array');

      instance.fixtures.forEach(fixture => {
        expect(fixture).to.have.property('id');
        expect(fixture).to.have.property('participants');
        expect(fixture).to.have.property('durationMinutes');
        expect(fixture.participants).to.be.an('array');
        expect(fixture.durationMinutes).to.be.a('number').greaterThan(0);
      });
    });

    it('should have referential integrity in fixtures', () => {
      const teamIds = new Set(instance.entities.teams.map(t => t.id));

      instance.fixtures.forEach(fixture => {
        fixture.participants.forEach(teamId => {
          expect(teamIds.has(teamId), `Team ${teamId} in fixture ${fixture.id} does not exist`).to.be.true;
        });
      });
    });
  });

  describe('Amateur League Instance Validation', () => {
    let instance;

    before(async () => {
      const instancePath = join(examplesDir, 'amateur-league/osss-instance.json');
      const content = await readFile(instancePath, 'utf-8');
      instance = JSON.parse(content);
    });

    it('should have min_rest_time constraint with valid params', () => {
      const minRestConstraint = instance.constraints.find(c => c.rule === 'min_rest_time');
      expect(minRestConstraint).to.exist;
      expect(minRestConstraint.params).to.have.property('min_hours');
      expect(minRestConstraint.params.min_hours).to.be.a('number').greaterThan(0);
    });

    it('should have soft constraints with penalty definitions', () => {
      const softConstraints = instance.constraints.filter(c => c.type === 'soft');

      softConstraints.forEach(constraint => {
        expect(constraint).to.have.property('penalty');
        expect(constraint.penalty).to.have.property('model');
        expect(constraint.penalty).to.have.property('weight');
        expect(constraint.penalty.weight).to.be.a('number');
      });
    });

    it('should have valid objectives', () => {
      expect(instance.objectives).to.be.an('array');

      instance.objectives.forEach(objective => {
        expect(objective).to.have.property('metric');
        expect(objective).to.have.property('aggregation');
        expect(objective).to.have.property('weight');
        expect(objective.weight).to.be.a('number');
      });
    });
  });

  describe('Pro League Instance Validation', () => {
    let instance;

    before(async () => {
      const instancePath = join(examplesDir, 'pro-league/osss-instance.json');
      const content = await readFile(instancePath, 'utf-8');
      instance = JSON.parse(content);
    });

    it('should have version field', () => {
      expect(instance).to.have.property('version');
      expect(instance.version).to.match(/^\d+\.\d+\.\d+$/);
    });

    it('should have competition metadata', () => {
      expect(instance).to.have.property('competition');
      expect(instance.competition).to.have.property('sport');
      expect(instance.competition).to.have.property('level');
      expect(instance.competition).to.have.property('league');
    });

    it('should have blackout dates', () => {
      expect(instance.season).to.have.property('blackout_dates');
      expect(instance.season.blackout_dates).to.be.an('array');

      instance.season.blackout_dates.forEach(blackout => {
        expect(blackout).to.have.property('start');
        expect(blackout).to.have.property('end');
        expect(blackout).to.have.property('reason');
      });
    });

    it('should have teams with geographic locations', () => {
      instance.entities.teams.forEach(team => {
        expect(team).to.have.property('location');
        expect(team.location).to.have.property('latitude');
        expect(team.location).to.have.property('longitude');
        expect(team.location).to.have.property('city');
        expect(team.location).to.have.property('state');
      });
    });

    it('should have venues with capacity and resources', () => {
      instance.entities.venues.forEach(venue => {
        expect(venue).to.have.property('capacity');
        expect(venue.capacity).to.be.a('number').greaterThan(0);
        expect(venue).to.have.property('resources');
        expect(venue.resources).to.be.an('array');
      });
    });

    it('should have officials', () => {
      expect(instance.entities).to.have.property('officials');
      expect(instance.entities.officials).to.be.an('array').with.length.greaterThan(0);

      instance.entities.officials.forEach(official => {
        expect(official).to.have.property('id');
        expect(official).to.have.property('name');
        expect(official).to.have.property('type');
        expect(official.type).to.equal('official');
      });
    });

    it('should have fixtures with tags', () => {
      instance.fixtures.forEach(fixture => {
        expect(fixture).to.have.property('tags');
        expect(fixture.tags).to.be.an('array');
      });
    });

    it('should have nationally-televised fixtures', () => {
      const nationalGames = instance.fixtures.filter(f =>
        f.tags && f.tags.includes('nationally-televised')
      );
      expect(nationalGames).to.have.length.greaterThan(0);
    });

    it('should have broadcast window constraint for national games', () => {
      const broadcastConstraint = instance.constraints.find(c =>
        c.id === 'broadcast_prime_time_national'
      );
      expect(broadcastConstraint).to.exist;
      expect(broadcastConstraint.type).to.equal('hard');
      expect(broadcastConstraint.rule).to.equal('broadcast_window');
    });

    it('should have multiple constraint priorities', () => {
      const priorities = new Set(instance.constraints.map(c => c.priority).filter(p => p !== undefined));
      expect(priorities.size).to.be.greaterThan(1);
    });

    it('should have constraints with tags', () => {
      const constraintsWithTags = instance.constraints.filter(c => c.tags && c.tags.length > 0);
      expect(constraintsWithTags).to.have.length.greaterThan(0);
    });

    it('should have metadata field', () => {
      expect(instance).to.have.property('metadata');
      expect(instance.metadata).to.be.an('object');
    });
  });

  describe('Cross-Example Consistency', () => {
    it('all examples should have consistent required fields', async () => {
      const examples = ['youth-league', 'amateur-league', 'pro-league'];

      for (const example of examples) {
        const instancePath = join(examplesDir, `${example}/osss-instance.json`);
        const content = await readFile(instancePath, 'utf-8');
        const instance = JSON.parse(content);

        expect(instance, `${example} missing id`).to.have.property('id');
        expect(instance, `${example} missing name`).to.have.property('name');
        expect(instance, `${example} missing timezone`).to.have.property('timezone');
        expect(instance, `${example} missing season`).to.have.property('season');
        expect(instance, `${example} missing entities`).to.have.property('entities');
        expect(instance, `${example} missing fixtures`).to.have.property('fixtures');
        expect(instance, `${example} missing constraints`).to.have.property('constraints');
      }
    });

    it('all examples should have no_overlap_team constraint', async () => {
      const examples = ['youth-league', 'amateur-league', 'pro-league'];

      for (const example of examples) {
        const instancePath = join(examplesDir, `${example}/osss-instance.json`);
        const content = await readFile(instancePath, 'utf-8');
        const instance = JSON.parse(content);

        const noOverlapConstraint = instance.constraints.find(c =>
          c.rule === 'no_overlap_team'
        );
        expect(noOverlapConstraint, `${example} missing no_overlap_team constraint`).to.exist;
        expect(noOverlapConstraint.type).to.equal('hard');
      }
    });

    it('all examples should have valid ISO-8601 timestamps', async () => {
      const examples = ['youth-league', 'amateur-league', 'pro-league'];
      const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

      for (const example of examples) {
        const instancePath = join(examplesDir, `${example}/osss-instance.json`);
        const content = await readFile(instancePath, 'utf-8');
        const instance = JSON.parse(content);

        expect(instance.season.start, `${example} invalid season start`).to.match(iso8601Pattern);
        expect(instance.season.end, `${example} invalid season end`).to.match(iso8601Pattern);
      }
    });
  });
});
