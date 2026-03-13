import { TeamMember } from '../../types';
import { useDraggable } from '@dnd-kit/core';

interface Props {
  member: TeamMember;
  style?: React.CSSProperties;
}

const ROLE_COLORS: Record<string, string> = {
  analyst:   '#d43f3a',
  developer: '#357ebd',
  tester:    '#4cae4c',
};

const ROLE_LETTER: Record<string, string> = {
  analyst:   'A',
  developer: 'D',
  tester:    'T',
};

export default function TeamMemberToken({ member, style }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `member-${member.TeamMemberId}`,
    data: { type: 'member', member },
  });

  const dragStyle = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 9999 }
    : {};

  const color = ROLE_COLORS[member.Role] || '#888';

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="absolute w-8 h-8 rounded-full cursor-move flex items-center justify-center font-bold text-white text-sm border-2 border-white shadow"
      style={{
        backgroundColor: color,
        opacity: member.Active ? 1 : 0.4,
        ...style,
        ...dragStyle,
      }}
      title={`${member.Role} #${member.TeamMemberId}`}
    >
      {ROLE_LETTER[member.Role]}
    </div>
  );
}
