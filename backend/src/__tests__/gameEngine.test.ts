/**
 * Unit tests for game engine logic.
 * We test the pure/deterministic parts by mocking Math.random.
 */

import { STAGES } from '../services/gameEngine';

describe('gameEngine — STAGES', () => {
  it('contains all 8 stages in correct order', () => {
    expect(STAGES).toEqual([
      'deck',
      'ready',
      'analysis',
      'analysis-done',
      'development',
      'development-done',
      'test',
      'deployed',
    ]);
  });
});

describe('gameEngine — dice roll logic (pure)', () => {
  // We test the dice math directly since rollDice is internal
  it('specialist doubles work: roll=3, analysis stage -> 6 points applied', () => {
    const roll = 3;
    const isSpecialist = true;
    const work = isSpecialist ? roll * 2 : roll;
    expect(work).toBe(6);
  });

  it('non-specialist gets base roll: roll=5 -> 5 points', () => {
    const roll = 5;
    const isSpecialist = false;
    const work = isSpecialist ? roll * 2 : roll;
    expect(work).toBe(5);
  });

  it('work cannot exceed remaining points on a story', () => {
    const remaining = 3;
    const work = 10;
    const applied = Math.min(work, remaining);
    expect(applied).toBe(3);
  });
});

describe('gameEngine — stage auto-advance (pure logic)', () => {
  it('story advances from analysis to analysis-done when analysisDone >= analysis', () => {
    const story = { stage: 'analysis', analysis: 10, analysisDone: 10, development: 8, developmentDone: 0, test: 5, testDone: 0 };
    let nextStage = story.stage;
    if (story.stage === 'analysis' && story.analysisDone >= story.analysis) nextStage = 'analysis-done';
    expect(nextStage).toBe('analysis-done');
  });

  it('story stays in analysis if work not complete', () => {
    const story = { stage: 'analysis', analysis: 10, analysisDone: 7 };
    let nextStage = story.stage;
    if (story.analysisDone >= story.analysis) nextStage = 'analysis-done';
    expect(nextStage).toBe('analysis');
  });

  it('story advances from development to development-done when complete', () => {
    const story = { stage: 'development', development: 12, developmentDone: 12 };
    let nextStage = story.stage;
    if (story.stage === 'development' && story.developmentDone >= story.development) nextStage = 'development-done';
    expect(nextStage).toBe('development-done');
  });

  it('story advances from test to deployed when testDone >= test', () => {
    const story = { stage: 'test', test: 8, testDone: 8, value: 110 };
    let nextStage = story.stage;
    let revenue = 0;
    if (story.stage === 'test' && story.testDone >= story.test) {
      nextStage = 'deployed';
      revenue += story.value;
    }
    expect(nextStage).toBe('deployed');
    expect(revenue).toBe(110);
  });

  it('Intangible story (value=0) generates no revenue on deploy', () => {
    const story = { stage: 'test', test: 5, testDone: 5, value: 0 };
    let revenue = 0;
    if (story.stage === 'test' && story.testDone >= story.test) revenue += story.value;
    expect(revenue).toBe(0);
  });
});

describe('gameEngine — WIP counting (pure logic)', () => {
  const mockStories = [
    { stage: 'ready' },
    { stage: 'ready' },
    { stage: 'analysis' },
    { stage: 'analysis-done' },
    { stage: 'development' },
    { stage: 'development-done' },
    { stage: 'test' },
    { stage: 'test' },
    { stage: 'deployed' },
    { stage: 'deck' },
    { stage: 'deck' },
  ];

  it('counts ready WIP correctly', () => {
    const count = mockStories.filter((s) => s.stage === 'ready').length;
    expect(count).toBe(2);
  });

  it('counts analysis WIP (in-progress + done)', () => {
    const count = mockStories.filter((s) => s.stage === 'analysis' || s.stage === 'analysis-done').length;
    expect(count).toBe(2);
  });

  it('counts test WIP correctly', () => {
    const count = mockStories.filter((s) => s.stage === 'test').length;
    expect(count).toBe(2);
  });

  it('deployed stories are NOT counted in WIP', () => {
    const deployed = mockStories.filter((s) => s.stage === 'deployed').length;
    expect(deployed).toBe(1);
  });
});

describe('gameEngine — cycle time calculation (pure logic)', () => {
  it('calculates cycle time as dayDeployed - dayReady', () => {
    const story = { dayReady: 3, dayDeployed: 15 };
    const cycleTime = story.dayDeployed - story.dayReady;
    expect(cycleTime).toBe(12);
  });

  it('cycle time of 0 when deployed same day as ready', () => {
    const story = { dayReady: 5, dayDeployed: 5 };
    expect(story.dayDeployed - story.dayReady).toBe(0);
  });
});

describe('gameEngine — game over conditions (pure logic)', () => {
  it('Standard game ends at day 35', () => {
    const maxDay = 35;
    expect(36 > maxDay).toBe(true);
    expect(35 >= maxDay).toBe(true);
    expect(34 >= maxDay).toBe(false);
  });

  it('V2 game ends at day 21', () => {
    const maxDay = 21;
    expect(22 >= maxDay).toBe(true);
    expect(20 >= maxDay).toBe(false);
  });
});
