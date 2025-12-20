import { expect } from 'chai';
import { checkNoOverlapTeam } from '../../src/rules/hard/no_overlap_team.js';

describe('no_overlap_team constraint', () => {
  describe('basic functionality', () => {
    it('should return no violations when teams have no overlapping games', () => {
      const constraint = {};

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a', 'team-b'] }],
          ['game-2', { participants: ['team-a', 'team-c'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-01T22:00:00Z').getTime(),
            _endMs: new Date('2025-01-02T00:30:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should detect violation when same team plays two overlapping games', () => {
      const constraint = {};

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a', 'team-b'] }],
          ['game-2', { participants: ['team-a', 'team-c'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-01T20:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T22:30:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.have.lengthOf(1);
      expect(violations[0]).to.include('team-a');
      expect(violations[0]).to.include('game-1');
      expect(violations[0]).to.include('game-2');
    });

    it('should not flag different teams playing simultaneously', () => {
      const constraint = {};

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a', 'team-b'] }],
          ['game-2', { participants: ['team-c', 'team-d'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });
  });

  describe('overlap detection', () => {
    it('should detect complete overlap (one game during another)', () => {
      const constraint = {};

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a'] }],
          ['game-2', { participants: ['team-a'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T18:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T22:00:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:00:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.have.lengthOf(1);
    });

    it('should detect partial overlap (games partially overlapping)', () => {
      const constraint = {};

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a'] }],
          ['game-2', { participants: ['team-a'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:00:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-01T20:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T22:00:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.have.lengthOf(1);
    });

    it('should not flag games that start exactly when another ends', () => {
      const constraint = {};

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a'] }],
          ['game-2', { participants: ['team-a'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:00:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-01T21:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T23:00:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should detect exact same time overlap', () => {
      const constraint = {};

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a'] }],
          ['game-2', { participants: ['team-a'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:00:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:00:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.have.lengthOf(1);
    });
  });

  describe('multiple teams and games', () => {
    it('should detect violations for multiple teams independently', () => {
      const constraint = {};

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a', 'team-b'] }],
          ['game-2', { participants: ['team-a', 'team-c'] }],
          ['game-3', { participants: ['team-b', 'team-d'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:00:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-01T20:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T22:00:00Z').getTime()
          },
          {
            fixtureId: 'game-3',
            _startMs: new Date('2025-01-01T20:30:00Z').getTime(),
            _endMs: new Date('2025-01-01T22:30:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.have.lengthOf(2);
      expect(violations.some(v => v.includes('team-a'))).to.be.true;
      expect(violations.some(v => v.includes('team-b'))).to.be.true;
    });

    it('should handle 3+ overlapping games for same team', () => {
      const constraint = {};

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a'] }],
          ['game-2', { participants: ['team-a'] }],
          ['game-3', { participants: ['team-a'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:00:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-01T19:30:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-3',
            _startMs: new Date('2025-01-01T20:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T22:00:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.have.length.greaterThan(0);
      expect(violations.every(v => v.includes('team-a'))).to.be.true;
    });
  });

  describe('edge cases', () => {
    it('should handle empty assignments array', () => {
      const constraint = {};
      const idx = {
        fixtures: new Map(),
        assignments: []
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should handle missing fixture in map', () => {
      const constraint = {};
      const idx = {
        fixtures: new Map(),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:00:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should handle fixture with empty participants', () => {
      const constraint = {};
      const idx = {
        fixtures: new Map([
          ['game-1', { participants: [] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:00:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should handle fixture with missing participants field', () => {
      const constraint = {};
      const idx = {
        fixtures: new Map([
          ['game-1', {}]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:00:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should handle team with single game', () => {
      const constraint = {};
      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a', 'team-b'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:00:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });
  });

  describe('game ordering', () => {
    it('should handle games in non-chronological order in input', () => {
      const constraint = {};

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a'] }],
          ['game-2', { participants: ['team-a'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-01T20:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T22:00:00Z').getTime()
          },
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:00:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.have.lengthOf(1);
      expect(violations[0]).to.include('team-a');
    });
  });

  describe('violation messages', () => {
    it('should include team ID and both fixture IDs in violation message', () => {
      const constraint = {};

      const idx = {
        fixtures: new Map([
          ['match-abc', { participants: ['eagles'] }],
          ['match-xyz', { participants: ['eagles'] }]
        ]),
        assignments: [
          {
            fixtureId: 'match-abc',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:00:00Z').getTime()
          },
          {
            fixtureId: 'match-xyz',
            _startMs: new Date('2025-01-01T20:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T22:00:00Z').getTime()
          }
        ]
      };

      const violations = checkNoOverlapTeam(constraint, idx);
      expect(violations).to.have.lengthOf(1);
      expect(violations[0]).to.include('eagles');
      expect(violations[0]).to.include('match-abc');
      expect(violations[0]).to.include('match-xyz');
    });
  });
});
