import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import TeamMemberToken from '../components/board/TeamMemberToken';
import { TeamMember } from '../types';

function wrap(ui: React.ReactElement) {
  return render(<DndContext>{ui}</DndContext>);
}

const ANALYST: TeamMember = { TeamMemberId: 1, Role: 'analyst', Active: true, StoryId: null };
const DEVELOPER: TeamMember = { TeamMemberId: 2, Role: 'developer', Active: true, StoryId: null };
const TESTER: TeamMember = { TeamMemberId: 3, Role: 'tester', Active: true, StoryId: null };
const INACTIVE: TeamMember = { TeamMemberId: 4, Role: 'analyst', Active: false, StoryId: null };

describe('TeamMemberToken', () => {
  it('renders "A" for analyst', () => {
    wrap(<TeamMemberToken member={ANALYST} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders "D" for developer', () => {
    wrap(<TeamMemberToken member={DEVELOPER} />);
    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('renders "T" for tester', () => {
    wrap(<TeamMemberToken member={TESTER} />);
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('shows correct title attribute', () => {
    wrap(<TeamMemberToken member={ANALYST} />);
    expect(screen.getByTitle('analyst #1')).toBeInTheDocument();
  });

  it('active member has full opacity', () => {
    const { container } = wrap(<TeamMemberToken member={ANALYST} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.opacity).toBe('1');
  });

  it('inactive member has reduced opacity', () => {
    const { container } = wrap(<TeamMemberToken member={INACTIVE} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.opacity).toBe('0.4');
  });

  it('analyst has red background color', () => {
    const { container } = wrap(<TeamMemberToken member={ANALYST} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.backgroundColor).toBe('rgb(212, 63, 58)'); // #d43f3a
  });

  it('developer has blue background color', () => {
    const { container } = wrap(<TeamMemberToken member={DEVELOPER} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.backgroundColor).toBe('rgb(53, 126, 189)'); // #357ebd
  });

  it('tester has green background color', () => {
    const { container } = wrap(<TeamMemberToken member={TESTER} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.backgroundColor).toBe('rgb(76, 174, 76)'); // #4cae4c
  });
});
