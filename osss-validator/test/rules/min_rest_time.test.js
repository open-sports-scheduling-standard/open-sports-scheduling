import { expect } from 'chai';
import { checkMinRestTime } from '../../src/rules/hard/min_rest_time.js';

describe('min_rest_time constraint', () => {
  describe('basic functionality', () => {
    it('should return no violations when rest time meets minimum', () => {
      const constraint = {
        params: { min_hours: 72 }
      };

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
            _startMs: new Date('2025-01-05T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-05T21:30:00Z').getTime()
          }
        ]
      };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should detect violations when rest time is below minimum', () => {
      const constraint = {
        params: { min_hours: 72 }
      };

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
            _startMs: new Date('2025-01-03T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-03T21:30:00Z').getTime()
          }
        ]
      };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.have.lengthOf(1);
      expect(violations[0]).to.include('team-a');
      expect(violations[0]).to.include('game-1');
      expect(violations[0]).to.include('game-2');
    });

    it('should handle multiple teams correctly', () => {
      const constraint = {
        params: { min_hours: 48 }
      };

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
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-02T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-02T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-3',
            _startMs: new Date('2025-01-03T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-03T21:30:00Z').getTime()
          }
        ]
      };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.have.lengthOf(2);
      expect(violations.some(v => v.includes('team-a'))).to.be.true;
      expect(violations.some(v => v.includes('team-b'))).to.be.true;
    });
  });

  describe('edge cases', () => {
    it('should return empty array when min_hours is missing', () => {
      const constraint = { params: {} };
      const idx = { fixtures: new Map(), assignments: [] };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should return empty array when min_hours is not a number', () => {
      const constraint = { params: { min_hours: 'invalid' } };
      const idx = { fixtures: new Map(), assignments: [] };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should return empty array when min_hours is negative', () => {
      const constraint = { params: { min_hours: -10 } };
      const idx = { fixtures: new Map(), assignments: [] };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should return empty array when min_hours is zero', () => {
      const constraint = { params: { min_hours: 0 } };
      const idx = { fixtures: new Map(), assignments: [] };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should handle teams with only one game', () => {
      const constraint = {
        params: { min_hours: 72 }
      };

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a', 'team-b'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          }
        ]
      };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should handle missing fixture in map', () => {
      const constraint = {
        params: { min_hours: 72 }
      };

      const idx = {
        fixtures: new Map(),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          }
        ]
      };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should handle empty assignments array', () => {
      const constraint = {
        params: { min_hours: 72 }
      };

      const idx = {
        fixtures: new Map(),
        assignments: []
      };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });
  });

  describe('rest time calculation', () => {
    it('should calculate rest time correctly for exactly minimum hours', () => {
      const constraint = {
        params: { min_hours: 72 }
      };

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a'] }],
          ['game-2', { participants: ['team-a'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-04T21:30:00Z').getTime(),
            _endMs: new Date('2025-01-04T23:00:00Z').getTime()
          }
        ]
      };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.be.an('array').that.is.empty;
    });

    it('should calculate rest time correctly for just below minimum', () => {
      const constraint = {
        params: { min_hours: 72 }
      };

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a'] }],
          ['game-2', { participants: ['team-a'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-04T21:00:00Z').getTime(),
            _endMs: new Date('2025-01-04T23:00:00Z').getTime()
          }
        ]
      };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.have.lengthOf(1);
      expect(violations[0]).to.include('71.50h');
    });

    it('should report actual rest hours in violation message', () => {
      const constraint = {
        params: { min_hours: 72 }
      };

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a'] }],
          ['game-2', { participants: ['team-a'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-03T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-03T21:30:00Z').getTime()
          }
        ]
      };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations[0]).to.match(/45\.50h/);
      expect(violations[0]).to.match(/min 72h/);
    });
  });

  describe('multiple consecutive games', () => {
    it('should detect all violations when team has 3+ games with insufficient rest', () => {
      const constraint = {
        params: { min_hours: 48 }
      };

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
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-02T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-02T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-3',
            _startMs: new Date('2025-01-03T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-03T21:30:00Z').getTime()
          }
        ]
      };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.have.lengthOf(2);
    });

    it('should handle mix of valid and invalid rest periods', () => {
      const constraint = {
        params: { min_hours: 48 }
      };

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
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-04T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-04T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-3',
            _startMs: new Date('2025-01-05T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-05T21:30:00Z').getTime()
          }
        ]
      };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.have.lengthOf(1);
      expect(violations[0]).to.include('game-2');
      expect(violations[0]).to.include('game-3');
    });
  });

  describe('game ordering', () => {
    it('should handle games in non-chronological order in input', () => {
      const constraint = {
        params: { min_hours: 72 }
      };

      const idx = {
        fixtures: new Map([
          ['game-1', { participants: ['team-a'] }],
          ['game-2', { participants: ['team-a'] }]
        ]),
        assignments: [
          {
            fixtureId: 'game-2',
            _startMs: new Date('2025-01-03T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-03T21:30:00Z').getTime()
          },
          {
            fixtureId: 'game-1',
            _startMs: new Date('2025-01-01T19:00:00Z').getTime(),
            _endMs: new Date('2025-01-01T21:30:00Z').getTime()
          }
        ]
      };

      const violations = checkMinRestTime(constraint, idx);
      expect(violations).to.have.lengthOf(1);
      expect(violations[0]).to.include('45.50h');
    });
  });
});
