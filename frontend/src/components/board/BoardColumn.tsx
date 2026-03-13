import { useDroppable } from '@dnd-kit/core';
import { Story, Stage } from '../../types';
import StoryCard from './StoryCard';

interface Props {
  id: Stage;
  label?: string;
  stories: Story[];
  width: number;
  height: number;
  borderRight?: 'none' | 'dotted' | 'solid';
  labelColor?: string;
  isExpedite?: boolean;
}

export default function BoardColumn({ id, stories, width, height, borderRight = 'dotted', isExpedite = false }: Omit<Props, 'labelColor'>) {
  const { setNodeRef, isOver } = useDroppable({ id: `${isExpedite ? 'exp-' : ''}${id}` });

  // Simple card layout — stack cards
  const CARD_W = 130;
  const CARD_H = 80;
  const MARGIN = 4;

  return (
    <div
      ref={setNodeRef}
      style={{
        width,
        height,
        position: 'relative',
        flexShrink: 0,
        borderRight: borderRight === 'solid' ? '2px solid #bbb' : borderRight === 'dotted' ? '1px dotted #bbb' : 'none',
        backgroundColor: isOver ? 'rgba(74,153,255,0.1)' : undefined,
        transition: 'background-color 0.15s',
      }}
    >
      {stories.map((story, i) => {
        const col = Math.floor((width - MARGIN) / (CARD_W + MARGIN));
        const safeCol = Math.max(col, 1);
        const c = i % safeCol;
        const r = Math.floor(i / safeCol);
        return (
          <StoryCard
            key={story.StoryId}
            story={story}
            style={{
              left: MARGIN + c * (CARD_W + MARGIN),
              top: MARGIN + r * (CARD_H + MARGIN),
            }}
          />
        );
      })}
      {isExpedite && stories.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">
          expedite
        </div>
      )}
    </div>
  );
}
