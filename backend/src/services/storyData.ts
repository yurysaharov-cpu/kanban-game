// Story templates matching the original kanbanboardgame.com card set
// Standard game (Alpha) - 60 stories: S1-S50, E1-E4, I1-I3, F1-F3

export interface StoryTemplate {
  name: string;
  storyType: 'S' | 'E' | 'I' | 'F';
  value: number;
  analysis: number;
  development: number;
  test: number;
  dueDay: number;
  expedited: boolean;
  storyOrder: number;
}

// Standard stories (S1-S50) — yellow cards
const standardStories: StoryTemplate[] = [
  { name: 'S1',  storyType: 'S', value: 110, analysis: 10, development: 10, test: 6,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S2',  storyType: 'S', value: 120, analysis: 12, development: 13, test: 7,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S3',  storyType: 'S', value: 110, analysis: 11, development: 12, test: 8,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S4',  storyType: 'S', value: 100, analysis: 8,  development: 10, test: 9,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S5',  storyType: 'S', value: 130, analysis: 12, development: 14, test: 11, dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S6',  storyType: 'S', value: 110, analysis: 9,  development: 11, test: 7,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S7',  storyType: 'S', value: 120, analysis: 11, development: 13, test: 8,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S8',  storyType: 'S', value: 100, analysis: 8,  development: 9,  test: 6,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S9',  storyType: 'S', value: 110, analysis: 10, development: 11, test: 7,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S10', storyType: 'S', value: 120, analysis: 12, development: 12, test: 8,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S11', storyType: 'S', value: 130, analysis: 13, development: 15, test: 9,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S12', storyType: 'S', value: 100, analysis: 9,  development: 10, test: 7,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S13', storyType: 'S', value: 110, analysis: 10, development: 11, test: 8,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S14', storyType: 'S', value: 120, analysis: 11, development: 13, test: 9,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S15', storyType: 'S', value: 130, analysis: 13, development: 14, test: 10, dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S16', storyType: 'S', value: 110, analysis: 10, development: 12, test: 7,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S17', storyType: 'S', value: 100, analysis: 8,  development: 10, test: 6,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S18', storyType: 'S', value: 120, analysis: 12, development: 13, test: 8,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S19', storyType: 'S', value: 110, analysis: 11, development: 11, test: 7,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S20', storyType: 'S', value: 130, analysis: 13, development: 15, test: 9,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S21', storyType: 'S', value: 120, analysis: 12, development: 12, test: 8,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S22', storyType: 'S', value: 100, analysis: 9,  development: 10, test: 6,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S23', storyType: 'S', value: 110, analysis: 10, development: 11, test: 7,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S24', storyType: 'S', value: 120, analysis: 11, development: 13, test: 8,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S25', storyType: 'S', value: 130, analysis: 13, development: 14, test: 10, dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S26', storyType: 'S', value: 110, analysis: 10, development: 11, test: 7,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S27', storyType: 'S', value: 100, analysis: 8,  development: 9,  test: 6,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S28', storyType: 'S', value: 120, analysis: 12, development: 12, test: 8,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S29', storyType: 'S', value: 110, analysis: 11, development: 11, test: 7,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S30', storyType: 'S', value: 130, analysis: 13, development: 15, test: 9,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S31', storyType: 'S', value: 100, analysis: 8,  development: 10, test: 7,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S32', storyType: 'S', value: 110, analysis: 10, development: 11, test: 7,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S33', storyType: 'S', value: 120, analysis: 11, development: 13, test: 8,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S34', storyType: 'S', value: 130, analysis: 13, development: 14, test: 10, dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S35', storyType: 'S', value: 110, analysis: 10, development: 12, test: 7,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S36', storyType: 'S', value: 100, analysis: 9,  development: 10, test: 6,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S37', storyType: 'S', value: 120, analysis: 12, development: 12, test: 8,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S38', storyType: 'S', value: 110, analysis: 11, development: 11, test: 7,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S39', storyType: 'S', value: 130, analysis: 13, development: 15, test: 9,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S40', storyType: 'S', value: 120, analysis: 12, development: 13, test: 8,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S41', storyType: 'S', value: 100, analysis: 9,  development: 10, test: 6,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S42', storyType: 'S', value: 110, analysis: 10, development: 11, test: 7,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S43', storyType: 'S', value: 120, analysis: 11, development: 13, test: 8,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S44', storyType: 'S', value: 130, analysis: 13, development: 14, test: 10, dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S45', storyType: 'S', value: 110, analysis: 10, development: 12, test: 7,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S46', storyType: 'S', value: 100, analysis: 8,  development: 10, test: 6,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S47', storyType: 'S', value: 120, analysis: 12, development: 12, test: 8,  dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'S48', storyType: 'S', value: 110, analysis: 11, development: 11, test: 7,  dueDay: 0, expedited: false, storyOrder: 3 },
  { name: 'S49', storyType: 'S', value: 130, analysis: 13, development: 15, test: 9,  dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'S50', storyType: 'S', value: 120, analysis: 12, development: 13, test: 8,  dueDay: 0, expedited: false, storyOrder: 2 },
];

// Expedite stories (E1-E4) — blue cards, high priority
const expediteStories: StoryTemplate[] = [
  { name: 'E1', storyType: 'E', value: 200, analysis: 5, development: 5, test: 3, dueDay: 0, expedited: true, storyOrder: 1 },
  { name: 'E2', storyType: 'E', value: 200, analysis: 5, development: 5, test: 3, dueDay: 0, expedited: true, storyOrder: 2 },
  { name: 'E3', storyType: 'E', value: 200, analysis: 5, development: 6, test: 4, dueDay: 0, expedited: true, storyOrder: 3 },
  { name: 'E4', storyType: 'E', value: 200, analysis: 6, development: 6, test: 4, dueDay: 0, expedited: true, storyOrder: 4 },
];

// Intangible stories (I1-I3) — green cards
const intangibleStories: StoryTemplate[] = [
  { name: 'I1', storyType: 'I', value: 0, analysis: 8,  development: 10, test: 5, dueDay: 0, expedited: false, storyOrder: 1 },
  { name: 'I2', storyType: 'I', value: 0, analysis: 9,  development: 11, test: 6, dueDay: 0, expedited: false, storyOrder: 2 },
  { name: 'I3', storyType: 'I', value: 0, analysis: 10, development: 12, test: 7, dueDay: 0, expedited: false, storyOrder: 3 },
];

// Fixed-date stories (F1-F3) — purple cards
const fixedDateStories: StoryTemplate[] = [
  { name: 'F1', storyType: 'F', value: 300, analysis: 8,  development: 10, test: 6, dueDay: 20, expedited: false, storyOrder: 1 },
  { name: 'F2', storyType: 'F', value: 300, analysis: 9,  development: 11, test: 7, dueDay: 25, expedited: false, storyOrder: 2 },
  { name: 'F3', storyType: 'F', value: 300, analysis: 10, development: 12, test: 8, dueDay: 30, expedited: false, storyOrder: 3 },
];

export const STANDARD_STORIES: StoryTemplate[] = [
  ...standardStories,
  ...expediteStories,
  ...intangibleStories,
  ...fixedDateStories,
];

// getKanban V2 — shorter game (21 days), subset of cards
export const V2_STORIES: StoryTemplate[] = [
  ...standardStories.slice(0, 20).map((s, i) => ({ ...s, storyOrder: i + 1 })),
  expediteStories[0],
  expediteStories[1],
  intangibleStories[0],
  intangibleStories[1],
  { name: 'F1', storyType: 'F' as const, value: 300, analysis: 7, development: 9, test: 5, dueDay: 15, expedited: false, storyOrder: 1 },
  { name: 'F2', storyType: 'F' as const, value: 300, analysis: 8, development: 10, test: 6, dueDay: 18, expedited: false, storyOrder: 2 },
];

export const TEAM_MEMBERS = [
  { role: 'analyst',   active: true  },
  { role: 'analyst',   active: true  },
  { role: 'analyst',   active: false },
  { role: 'developer', active: true  },
  { role: 'developer', active: true  },
  { role: 'developer', active: false },
  { role: 'tester',    active: true  },
  { role: 'tester',    active: true  },
  { role: 'tester',    active: true  },
];

export const MAX_DAYS: Record<string, number> = {
  Standard: 35,
  V2: 21,
};
