import { STANDARD_STORIES, V2_STORIES, TEAM_MEMBERS, MAX_DAYS } from '../services/storyData';

describe('storyData — STANDARD_STORIES', () => {
  it('contains exactly 60 stories', () => {
    expect(STANDARD_STORIES).toHaveLength(60);
  });

  it('has 50 Standard (S) stories', () => {
    const s = STANDARD_STORIES.filter((s) => s.storyType === 'S');
    expect(s).toHaveLength(50);
  });

  it('has 4 Expedite (E) stories', () => {
    const e = STANDARD_STORIES.filter((s) => s.storyType === 'E');
    expect(e).toHaveLength(4);
  });

  it('has 3 Intangible (I) stories', () => {
    const i = STANDARD_STORIES.filter((s) => s.storyType === 'I');
    expect(i).toHaveLength(3);
  });

  it('has 3 Fixed-date (F) stories', () => {
    const f = STANDARD_STORIES.filter((s) => s.storyType === 'F');
    expect(f).toHaveLength(3);
  });

  it('all stories have positive analysis, development, test values', () => {
    for (const s of STANDARD_STORIES) {
      expect(s.analysis).toBeGreaterThan(0);
      expect(s.development).toBeGreaterThan(0);
      expect(s.test).toBeGreaterThan(0);
    }
  });

  it('all E stories are marked as expedited', () => {
    const expedite = STANDARD_STORIES.filter((s) => s.storyType === 'E');
    for (const s of expedite) {
      expect(s.expedited).toBe(true);
    }
  });

  it('F stories have a dueDay > 0', () => {
    const fixed = STANDARD_STORIES.filter((s) => s.storyType === 'F');
    for (const s of fixed) {
      expect(s.dueDay).toBeGreaterThan(0);
    }
  });

  it('story names are unique', () => {
    const names = STANDARD_STORIES.map((s) => s.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });
});

describe('storyData — V2_STORIES', () => {
  it('has fewer stories than Standard', () => {
    expect(V2_STORIES.length).toBeLessThan(STANDARD_STORIES.length);
  });

  it('contains at least one Expedite story', () => {
    expect(V2_STORIES.some((s) => s.storyType === 'E')).toBe(true);
  });
});

describe('storyData — TEAM_MEMBERS', () => {
  it('has exactly 9 team members', () => {
    expect(TEAM_MEMBERS).toHaveLength(9);
  });

  it('has 3 analysts, 3 developers, 3 testers', () => {
    const roles = TEAM_MEMBERS.reduce<Record<string, number>>((acc, m) => {
      acc[m.role] = (acc[m.role] || 0) + 1;
      return acc;
    }, {});
    expect(roles.analyst).toBe(3);
    expect(roles.developer).toBe(3);
    expect(roles.tester).toBe(3);
  });
});

describe('storyData — MAX_DAYS', () => {
  it('Standard game ends at day 35', () => {
    expect(MAX_DAYS.Standard).toBe(35);
  });

  it('V2 game ends at day 21', () => {
    expect(MAX_DAYS.V2).toBe(21);
  });
});
