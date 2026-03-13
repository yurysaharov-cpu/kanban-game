import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RevenuePoint } from '../../types';

interface Props {
  data: RevenuePoint[];
}

export default function RevenueChart({ data }: Props) {
  return (
    <div className="w-full h-[430px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -2 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
          <Line type="monotone" dataKey="revenue" stroke="#5cb85c" strokeWidth={2} dot={false} name="Revenue" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
