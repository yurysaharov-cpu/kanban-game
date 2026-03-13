import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gameApi } from '../api/game';
import { GameSummary, LeaderboardEntry } from '../types';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showNewGame, setShowNewGame] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const username = useAuthStore((s) => s.username);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    gameApi.list().then(setGames);
    gameApi.leaderboard('Standard').then(setLeaderboard);
  }, []);

  async function createGame(gameType: string) {
    const { gameId } = await gameApi.create(gameType);
    navigate(`/game/${gameId}`);
  }

  async function deleteGame(id: number) {
    await gameApi.delete(id);
    setGames((prev) => prev.filter((g) => g.id !== id));
    setDeleteId(null);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-[#003f5e] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-white text-2xl font-bold">
            Kanban Simulator — {username}
          </h1>
          <button onClick={handleLogout} className="bg-white text-gray-700 px-4 py-2 rounded hover:bg-gray-100 font-medium">
            Log off
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Games list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg text-gray-700">My last played games</h2>
                <button
                  onClick={() => setShowNewGame(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
                >
                  + Start a new game
                </button>
              </div>
              {games.length === 0 ? (
                <p className="text-gray-400 text-center py-6">No games yet. Start one!</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-gray-500">
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Revenue</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((g) => (
                      <tr key={g.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 text-gray-600">{g.gameType}</td>
                        <td className="py-2 font-medium">${g.totalRevenue.toLocaleString()}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${g.isCompleted ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {g.isCompleted ? 'Completed' : 'In progress'}
                          </span>
                        </td>
                        <td className="py-2 space-x-2">
                          {!g.isCompleted && (
                            <button
                              onClick={() => navigate(`/game/${g.id}`)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                            >
                              Continue
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/game/${g.id}`)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                          >
                            View charts
                          </button>
                          <button
                            onClick={() => setDeleteId(g.id)}
                            className="bg-red-100 text-red-600 px-3 py-1 rounded text-xs hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="font-bold text-lg text-gray-700 mb-3">Top 50 standard games</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="text-left py-1">Rank</th>
                  <th className="text-left py-1">Name</th>
                  <th className="text-right py-1">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-1 text-gray-400 font-mono text-xs">{String(i + 1).padStart(2, '0')}.</td>
                    <td className="py-1 text-gray-700 truncate max-w-[100px]">{entry.username}</td>
                    <td className="py-1 text-right font-medium text-green-700">${entry.score.toLocaleString()}</td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr><td colSpan={3} className="text-gray-400 text-center py-4">No scores yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New game modal */}
      {showNewGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Select game</h3>
              <button onClick={() => setShowNewGame(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => createGame('Standard')}
                className="w-full text-left border rounded p-3 hover:bg-blue-50 hover:border-blue-400"
              >
                <div className="font-semibold text-blue-600">Standard game</div>
                <div className="text-sm text-gray-500">Play standard game with default settings</div>
                <div className="text-xs text-gray-400 mt-1">Game ends when day 35 is complete.</div>
              </button>
              <button
                onClick={() => createGame('V2')}
                className="w-full text-left border rounded p-3 hover:bg-blue-50 hover:border-blue-400"
              >
                <div className="font-semibold text-blue-600">getKanban Version 2</div>
                <div className="text-sm text-gray-500">Based on getKanban Board Game with same story cards & events.</div>
                <div className="text-xs text-gray-400 mt-1">Game ends when day 21 is complete.</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-2xl">
            <h3 className="font-bold text-lg mb-2">Delete game?</h3>
            <p className="text-gray-500 text-sm mb-4">Are you sure you want to delete this game?</p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
              <button onClick={() => deleteGame(deleteId)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
