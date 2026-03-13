import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable } from '@dnd-kit/core';
import { gameApi } from '../api/game';
import { useGameStore } from '../store/gameStore';
import { Story, TeamMember, Stage, CfdData, RevenuePoint, CycleTimePoint } from '../types';
import BoardColumn from '../components/board/BoardColumn';
import StoryCard from '../components/board/StoryCard';
import TeamMemberToken from '../components/board/TeamMemberToken';
import CfdChart from '../components/charts/CfdChart';
import RevenueChart from '../components/charts/RevenueChart';
import CycleTimeChart from '../components/charts/CycleTimeChart';

type ChartModal = 'cfd' | 'revenue' | 'cycleTime' | null;

const BOARD_STAGES: Stage[] = ['ready', 'analysis', 'analysis-done', 'development', 'development-done', 'test', 'deployed'];

// Column widths matching original (total ~1050px for the active area)
const COL_WIDTHS: Record<Stage, number> = {
  deck: 171,
  ready: 146,
  analysis: 146,
  'analysis-done': 143,
  development: 146,
  'development-done': 143,
  test: 146,
  deployed: 146,
};

const COL_BORDERS: Record<Stage, 'none' | 'dotted' | 'solid'> = {
  deck: 'dotted',
  ready: 'solid',
  analysis: 'dotted',
  'analysis-done': 'solid',
  development: 'dotted',
  'development-done': 'solid',
  test: 'dotted',
  deployed: 'none',
};

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const gameId = parseInt(id || '0');
  const navigate = useNavigate();
  const { state, setState, loading, setLoading } = useGameStore();
  const [activeItem, setActiveItem] = useState<{ type: 'story'; story: Story } | { type: 'member'; member: TeamMember } | null>(null);
  const [chartModal, setChartModal] = useState<ChartModal>(null);
  const [chartData, setChartData] = useState<{ cfd?: CfdData; revenue?: RevenuePoint[]; cycleTime?: CycleTimePoint[] }>({});
  const [working, setWorking] = useState(false);
  const [standup, setStandup] = useState(true);

  useEffect(() => {
    setLoading(true);
    gameApi.start(gameId).then((s) => { setState(s); setLoading(false); });
  }, [gameId, setState, setLoading]);

  const handleStartWork = useCallback(async () => {
    if (working) return;
    if (standup) {
      setStandup(false);
      return;
    }
    setWorking(true);
    try {
      const next = await gameApi.next(gameId);
      setState(next);
      setStandup(true);
    } finally {
      setWorking(false);
    }
  }, [gameId, setState, standup, working]);

  async function openChart(type: ChartModal) {
    if (!type) return;
    setChartModal(type);
    if (type === 'cfd' && !chartData.cfd) {
      const cfd = await gameApi.cfd(gameId);
      setChartData((d) => ({ ...d, cfd }));
    } else if (type === 'revenue' && !chartData.revenue) {
      const revenue = await gameApi.revenue(gameId);
      setChartData((d) => ({ ...d, revenue }));
    } else if (type === 'cycleTime' && !chartData.cycleTime) {
      const cycleTime = await gameApi.cycleTime(gameId);
      setChartData((d) => ({ ...d, cycleTime }));
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { type: 'story'; story: Story } | { type: 'member'; member: TeamMember };
    setActiveItem(data);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    const { active, over } = event;
    if (!over || !state) return;

    const activeData = active.data.current as { type: string; story?: Story; member?: TeamMember };
    const overId = over.id as string;

    if (activeData.type === 'story' && activeData.story) {
      // Drop story to a column
      const stage = overId.replace('exp-', '') as Stage;
      if (stage !== activeData.story.stage) {
        const next = await gameApi.moveStory(gameId, activeData.story.StoryId, stage);
        setState(next);
      }
    } else if (activeData.type === 'member' && activeData.member) {
      // Drop member to a story card or unassign
      if (overId.startsWith('story-')) {
        const storyId = parseInt(overId.replace('story-', ''));
        const next = await gameApi.moveTeamMember(gameId, activeData.member.TeamMemberId, storyId);
        setState(next);
      }
    }
  }

  const { setNodeRef: deckRef, isOver: isDeckOver } = useDroppable({ id: 'deck' });
  const { setNodeRef: expDeckRef, isOver: isExpDeckOver } = useDroppable({ id: 'exp-deck' });

  if (loading || !state) {
    return <div className="min-h-screen bg-[#003f5e] flex items-center justify-center text-white text-xl">Loading...</div>;
  }

  const storiesByStage = (stage: Stage, expedited?: boolean) =>
    state.Stories.filter((s) => {
      if (s.stage !== stage) return false;
      if (expedited !== undefined) return s.Expedited === expedited;
      return true;
    });

  const deckStories = state.Stories.filter((s) => s.stage === 'deck');
  const expediteDeck = deckStories.filter((s) => s.Expedited);
  const standardDeck = deckStories.filter((s) => s.Name.startsWith('S'));
  const fixedDeck = deckStories.filter((s) => s.Name.startsWith('F'));
  const intangibleDeck = deckStories.filter((s) => s.Name.startsWith('I'));

  return (
    <div className="min-h-screen bg-[#003f5e] flex items-start justify-center pt-[7px]">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div
          style={{ width: 1195, height: 645, border: '1px solid #bbb', backgroundColor: '#fff', position: 'relative', overflow: 'hidden' }}
          className="shadow-[0_0_10px_#fff]"
        >
          {/* Board Header */}
          <div style={{ height: 70, backgroundColor: '#d9edf7', borderBottom: '1px solid #bbb', position: 'relative' }}>
            {/* Logo */}
            <div style={{ position: 'absolute', left: 10, top: 10 }}>
              <span className="text-xl font-bold text-[#003f5e]">Kanban</span>
            </div>

            {/* Status: Day + Revenue */}
            <div style={{ position: 'absolute', left: 179, top: 4, width: 346, height: 60, border: '1px solid #cecece', backgroundColor: '#fff', borderRadius: 4 }}>
              <div style={{ position: 'absolute', left: 9, top: 9, width: 155, lineHeight: '40px', textAlign: 'center', fontSize: 18, fontWeight: 700, border: '1px solid #cecece', backgroundColor: '#f8f8f8' }}>
                {state.Day > 0 ? `Day ${state.Day}` : '\u00a0'}
              </div>
              <div style={{ position: 'absolute', left: 180, top: 9, width: 155, lineHeight: '40px', textAlign: 'center', fontSize: 18, fontWeight: 700, border: '1px solid #cecece', backgroundColor: '#f8f8f8' }}>
                ${state.TotalRevenue.toLocaleString()}
              </div>
            </div>

            {/* Controls */}
            <div style={{ position: 'absolute', left: 535, top: 4, width: 296, height: 60, border: '1px solid #cecece', backgroundColor: '#fff', borderRadius: 4 }}>
              <div style={{ position: 'absolute', left: 4, bottom: 4, fontSize: 13, fontWeight: 700, color: '#000' }}>
                {standup ? 'Standup' : 'Working'}
              </div>
              {!state.GameOver && (
                <button
                  onClick={handleStartWork}
                  disabled={working}
                  style={{ position: 'absolute', left: 150, top: 9, width: 138, height: 42, fontWeight: 700 }}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded"
                >
                  {standup ? 'Start work' : working ? 'Working...' : 'Next Day'}
                </button>
              )}
              {/* Team members panel */}
              <div style={{ position: 'absolute', left: 4, top: 9 }}>
                {state.TeamMembers.filter((m) => m.Active).map((m) => (
                  <TeamMemberToken key={m.TeamMemberId} member={m} style={{ position: 'relative', display: 'inline-block', margin: 2 }} />
                ))}
              </div>
            </div>

            {/* Chart buttons + actions */}
            <div style={{ position: 'absolute', left: 840, top: 4, width: 346, height: 60, border: '1px solid #cecece', backgroundColor: '#fff', borderRadius: 4 }}>
              <button onClick={() => openChart('cfd')} style={{ position: 'absolute', left: 10, top: 9, width: 40, height: 40, borderRadius: 3, border: '1px solid gray', backgroundColor: '#b9ddb2' }} title="Cumulative Flow Diagram">CFD</button>
              <button onClick={() => openChart('revenue')} style={{ position: 'absolute', left: 60, top: 9, width: 40, height: 40, borderRadius: 3, border: '1px solid gray', backgroundColor: '#b9ddb2' }} title="Financial chart">$$$</button>
              <button onClick={() => openChart('cycleTime')} style={{ position: 'absolute', left: 110, top: 9, width: 40, height: 40, borderRadius: 3, border: '1px solid gray', backgroundColor: '#b9ddb2' }} title="Cycle Time">CT</button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{ position: 'absolute', left: 275, top: 9, height: 42, width: 60, fontWeight: 700 }}
                className="bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Exit
              </button>
            </div>

            {/* Game Over banner */}
            {state.GameOver && (
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontSize: 22, fontWeight: 700, color: '#c00000' }}>
                Game Over — ${state.TotalRevenue.toLocaleString()}
              </div>
            )}
          </div>

          {/* Stage Header */}
          <div style={{ height: 40, borderBottom: '1px solid #bbb', display: 'flex' }}>
            <div style={{ width: COL_WIDTHS.deck, height: 40, lineHeight: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: 14, color: '#888', borderRight: '1px dotted #bbb', flexShrink: 0 }}>Backlog</div>
            <div style={{ width: COL_WIDTHS.ready, height: 40, lineHeight: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: 14, color: '#888', borderRight: '2px solid #bbb', flexShrink: 0 }}>
              Ready (<span>{state.Wip[0]}</span>)
            </div>
            <div style={{ width: COL_WIDTHS.analysis + COL_WIDTHS['analysis-done'], height: 20, lineHeight: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: 14, color: '#d43f3a', borderRight: '2px solid #bbb', flexShrink: 0 }}>
              Analysis ({state.Wip[1]})
            </div>
            <div style={{ width: COL_WIDTHS.development + COL_WIDTHS['development-done'], height: 20, lineHeight: '20px', textAlign: 'center', fontWeight: 'bold', fontSize: 14, color: '#357ebd', borderRight: '2px solid #bbb', flexShrink: 0 }}>
              Development ({state.Wip[2]})
            </div>
            <div style={{ width: COL_WIDTHS.test, height: 40, lineHeight: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: 14, color: '#4cae4c', borderRight: '1px dotted #bbb', flexShrink: 0 }}>
              Test ({state.Wip[3]})
            </div>
            <div style={{ width: COL_WIDTHS.deployed, height: 40, lineHeight: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: 14, flexShrink: 0 }}>
              Deployed
            </div>
          </div>

          {/* Lanes */}
          <div style={{ position: 'relative' }}>
            {/* Expedite lane */}
            <div style={{ height: 92, borderBottom: '1px solid #bbb', backgroundColor: '#eee', display: 'flex' }}>
              {/* Backlog-expedite */}
              <div
                ref={expDeckRef}
                style={{ width: COL_WIDTHS.deck, height: 92, borderRight: '1px dotted #bbb', flexShrink: 0, position: 'relative', backgroundColor: isExpDeckOver ? 'rgba(74,153,255,0.1)' : undefined, overflowY: 'hidden' }}
              >
                {expediteDeck.length === 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', fontSize: 11 }}>expedite</div>
                )}
                {expediteDeck.map((s) => (
                  <div key={s.StoryId} style={{ position: 'relative', height: 84, flexShrink: 0 }}>
                    <StoryCard story={s} style={{ left: (COL_WIDTHS.deck - 130) / 2, top: 4 }} />
                  </div>
                ))}
              </div>
              {BOARD_STAGES.map((stage) => (
                <BoardColumn
                  key={`exp-${stage}`}
                  id={stage}
                  stories={storiesByStage(stage, true)}
                  width={COL_WIDTHS[stage]}
                  height={92}
                  borderRight={COL_BORDERS[stage]}
                  isExpedite
                />
              ))}
            </div>

            {/* Standard lane */}
            <div style={{ height: 440, backgroundColor: '#fafafa', display: 'flex' }}>
              {/* Backlog deck */}
              <div
                ref={deckRef}
                style={{ width: COL_WIDTHS.deck, height: 440, borderRight: '1px dotted #bbb', flexShrink: 0, backgroundColor: isDeckOver ? 'rgba(74,153,255,0.1)' : '#eee', overflowY: 'auto' }}
              >
                {fixedDeck.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: '#888', padding: '4px 0 2px 8px' }}>Fixed ({fixedDeck.length})</div>
                    {fixedDeck.map((s) => (
                      <div key={s.StoryId} style={{ position: 'relative', height: 84 }}>
                        <StoryCard story={s} style={{ left: (COL_WIDTHS.deck - 130) / 2, top: 2 }} />
                      </div>
                    ))}
                  </div>
                )}
                {standardDeck.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: '#888', padding: '4px 0 2px 8px' }}>Standard ({standardDeck.length})</div>
                    {standardDeck.map((s) => (
                      <div key={s.StoryId} style={{ position: 'relative', height: 84 }}>
                        <StoryCard story={s} style={{ left: (COL_WIDTHS.deck - 130) / 2, top: 2 }} />
                      </div>
                    ))}
                  </div>
                )}
                {intangibleDeck.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: '#888', padding: '4px 0 2px 8px' }}>Intangible ({intangibleDeck.length})</div>
                    {intangibleDeck.map((s) => (
                      <div key={s.StoryId} style={{ position: 'relative', height: 84 }}>
                        <StoryCard story={s} style={{ left: (COL_WIDTHS.deck - 130) / 2, top: 2 }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {BOARD_STAGES.map((stage) => (
                <BoardColumn
                  key={stage}
                  id={stage}
                  stories={storiesByStage(stage, false)}
                  width={COL_WIDTHS[stage]}
                  height={440}
                  borderRight={COL_BORDERS[stage]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeItem?.type === 'story' && (
            <StoryCard story={activeItem.story} />
          )}
          {activeItem?.type === 'member' && (
            <TeamMemberToken member={activeItem.member} />
          )}
        </DragOverlay>
      </DndContext>

      {/* Chart Modal */}
      {chartModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setChartModal(null)}>
          <div className="bg-white rounded-lg shadow-2xl w-[900px]" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-header p-3 flex justify-between items-center rounded-t-lg text-white ${chartModal === 'cfd' ? 'bg-[#31708f]' : chartModal === 'revenue' ? 'bg-[#3c763d]' : 'bg-[#8a6d3b]'}`}>
              <h3 className="font-bold text-lg">
                {chartModal === 'cfd' ? 'Cumulative Flow Diagram' : chartModal === 'revenue' ? 'Financial Chart' : 'Cycle Time'}
              </h3>
              <button onClick={() => setChartModal(null)} className="text-white text-2xl leading-none hover:text-gray-200">×</button>
            </div>
            <div className="p-4">
              {chartModal === 'cfd' && chartData.cfd && <CfdChart data={chartData.cfd} />}
              {chartModal === 'revenue' && chartData.revenue && <RevenueChart data={chartData.revenue} />}
              {chartModal === 'cycleTime' && chartData.cycleTime && <CycleTimeChart data={chartData.cycleTime} />}
              {(chartModal === 'cfd' && !chartData.cfd) ||
               (chartModal === 'revenue' && !chartData.revenue) ||
               (chartModal === 'cycleTime' && !chartData.cycleTime)
                ? <div className="h-[430px] flex items-center justify-center text-gray-400">Loading chart...</div>
                : null}
            </div>
            <div className="p-3 border-t text-right">
              <button onClick={() => setChartModal(null)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
