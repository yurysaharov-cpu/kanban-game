import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CycleTimePoint } from '../../types';

interface Props {
  data: CycleTimePoint[];
}

export default function CycleTimeChart({ data }: Props) {
  return (
    <div className="w-full h-[430px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dayDeployed" name="Day deployed" label={{ value: 'Day deployed', position: 'insideBottom', offset: -2 }} />
          <YAxis dataKey="cycleTime" name="Cycle time (days)" label={{ value: 'Cycle time (days)', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ payload }) => {
              if (!payload?.length) return null;
              const p = payload[0].payload as CycleTimePoint;
              return (
                <div className="bg-black text-white text-xs p-2 rounded">
                  <div>{p.name}: {p.cycleTime} days</div>
                  <div>Deployed: Day {p.dayDeployed}</div>
                </div>
              );
            }}
          />
          <Scatter data={data} fill="#357ebd" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
