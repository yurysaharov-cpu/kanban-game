import { Story } from '../../types';
import { useDraggable } from '@dnd-kit/core';

interface Props {
  story: Story;
  style?: React.CSSProperties;
}

const TYPE_CLASSES: Record<string, string> = {
  S: 'bg-[#fff9d7] border-[#fed22f]',
  E: 'bg-[#c3ddff] border-[#4a99ff]',
  I: 'bg-[#dcffc2] border-[#7dbb00]',
  F: 'bg-[#e7ddf1] border-[#c69cf3]',
};

function ProgressBar({ done, total, color }: { done: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min(100, (done / total) * 100) : 0;
  return (
    <div className="w-[120px] h-[9px] mx-[4px] my-[1px] bg-gray-200 rounded-sm overflow-hidden">
      <div className="h-full rounded-sm" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

export default function StoryCard({ story, style }: Props) {
  const typeKey = story.Name[0];
  const typeClass = TYPE_CLASSES[typeKey] || TYPE_CLASSES['S'];

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `story-${story.StoryId}`,
    data: { type: 'story', story },
  });

  const dragStyle = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 9999, opacity: 0.9 }
    : {};

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`absolute w-[130px] h-[80px] border cursor-move font-[Arial,sans-serif] rounded-sm ${typeClass} ${isDragging ? 'shadow-2xl' : ''}`}
      style={{ ...style, ...dragStyle }}
    >
      {/* Header */}
      <div className="h-[22px] flex justify-between items-center px-1 border-b border-dashed border-inherit bg-white/50">
        <span className="text-sm font-bold text-gray-500">{story.Name}</span>
        <span className="text-sm font-bold text-gray-500">{story.Value > 0 ? `$${story.Value}` : ''}</span>
      </div>
      {/* Progress bars */}
      <div className="py-[2px]">
        <ProgressBar done={story.AnalysisDone} total={story.Analysis} color="#d43f3a" />
        <ProgressBar done={story.DevelopmentDone} total={story.Development} color="#357ebd" />
        <ProgressBar done={story.TestDone} total={story.Test} color="#4cae4c" />
      </div>
      {/* Cycle time / due day */}
      <div className="h-[12px] text-center text-[10px] font-bold text-gray-400 bg-white/50 border-t border-dashed border-inherit leading-[10px]">
        {story.DueDay > 0 ? `Due: Day ${story.DueDay}` : story.DayDeployed > 0 ? `CT: ${story.DayDeployed - story.DayReady}d` : ''}
      </div>
    </div>
  );
}
