import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import StoryCard from '../components/board/StoryCard';
import { Story } from '../types';

function wrap(ui: React.ReactElement) {
  return render(<DndContext>{ui}</DndContext>);
}

const BASE_STORY: Story = {
  StoryId: 1,
  Name: 'S1',
  Value: 110,
  stage: 'analysis',
  StoryOrder: 1,
  Analysis: 10,
  AnalysisDone: 5,
  Development: 8,
  DevelopmentDone: 0,
  Test: 6,
  TestDone: 0,
  Blocked: 0,
  BlockedDone: 0,
  BlockedLabel: null,
  DayReady: 2,
  DayDeployed: 0,
  DueDay: 0,
  Expedited: false,
  IsBlocked: false,
  Label: null,
};

describe('StoryCard', () => {
  it('renders story name', () => {
    wrap(<StoryCard story={BASE_STORY} />);
    expect(screen.getByText('S1')).toBeInTheDocument();
  });

  it('renders story value as dollar amount', () => {
    wrap(<StoryCard story={BASE_STORY} />);
    expect(screen.getByText('$110')).toBeInTheDocument();
  });

  it('does not show value for Intangible stories (value=0)', () => {
    const intangible: Story = { ...BASE_STORY, Name: 'I1', Value: 0 };
    wrap(<StoryCard story={intangible} />);
    expect(screen.queryByText('$0')).not.toBeInTheDocument();
  });

  it('shows due day for Fixed-date stories', () => {
    const fixed: Story = { ...BASE_STORY, Name: 'F1', Value: 300, DueDay: 20 };
    wrap(<StoryCard story={fixed} />);
    expect(screen.getByText(/Due: Day 20/)).toBeInTheDocument();
  });

  it('shows cycle time for deployed stories', () => {
    const deployed: Story = { ...BASE_STORY, stage: 'deployed', DayReady: 3, DayDeployed: 12 };
    wrap(<StoryCard story={deployed} />);
    expect(screen.getByText(/CT: 9d/)).toBeInTheDocument();
  });

  it('applies yellow class for Standard (S) cards', () => {
    const { container } = wrap(<StoryCard story={BASE_STORY} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-[#fff9d7]');
  });

  it('applies blue class for Expedite (E) cards', () => {
    const expedite: Story = { ...BASE_STORY, Name: 'E1', Expedited: true };
    const { container } = wrap(<StoryCard story={expedite} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-[#c3ddff]');
  });

  it('applies green class for Intangible (I) cards', () => {
    const intangible: Story = { ...BASE_STORY, Name: 'I1', Value: 0 };
    const { container } = wrap(<StoryCard story={intangible} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-[#dcffc2]');
  });

  it('applies purple class for Fixed-date (F) cards', () => {
    const fixed: Story = { ...BASE_STORY, Name: 'F1', Value: 300, DueDay: 20 };
    const { container } = wrap(<StoryCard story={fixed} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-[#e7ddf1]');
  });
});

describe('StoryCard — progress bars', () => {
  it('renders 3 progress bars (analysis, dev, test)', () => {
    const { container } = wrap(<StoryCard story={BASE_STORY} />);
    // Each bar is a div with a colored inner div
    const bars = container.querySelectorAll('.w-\\[120px\\]');
    expect(bars.length).toBe(3);
  });

  it('analysis bar fills proportionally to done/total', () => {
    // AnalysisDone=5, Analysis=10 -> 50%
    const { container } = wrap(<StoryCard story={BASE_STORY} />);
    const filledBars = container.querySelectorAll('.h-full');
    const analysisFill = filledBars[0] as HTMLElement;
    expect(analysisFill.style.width).toBe('50%');
  });

  it('fully completed bar shows 100%', () => {
    const done: Story = { ...BASE_STORY, Analysis: 10, AnalysisDone: 10 };
    const { container } = wrap(<StoryCard story={done} />);
    const filledBars = container.querySelectorAll('.h-full');
    expect((filledBars[0] as HTMLElement).style.width).toBe('100%');
  });
});
