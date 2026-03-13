import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CfdData } from '../../types';

interface Props {
  data: CfdData;
}

export default function CfdChart({ data }: Props) {
  const days = data.ready.length;
  const chartData = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    ready:       data.ready[i] ?? 0,
    analysis:    data.analysis[i] ?? 0,
    development: data.development[i] ?? 0,
    test:        data.test[i] ?? 0,
    deployed:    data.deployed[i] ?? 0,
  }));

  return (
    <div className="w-full h-[430px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -2 }} />
          <YAxis label={{ value: 'Stories', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="deployed"    stackId="1" stroke="#000"    fill="#000"    fillOpacity={0.7} name="Deployed" />
          <Area type="monotone" dataKey="test"        stackId="1" stroke="#4cae4c" fill="#4cae4c" fillOpacity={0.7} name="Test" />
          <Area type="monotone" dataKey="development" stackId="1" stroke="#357ebd" fill="#357ebd" fillOpacity={0.7} name="Development" />
          <Area type="monotone" dataKey="analysis"    stackId="1" stroke="#d43f3a" fill="#d43f3a" fillOpacity={0.7} name="Analysis" />
          <Area type="monotone" dataKey="ready"       stackId="1" stroke="#888"    fill="#ccc"    fillOpacity={0.7} name="Ready" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
