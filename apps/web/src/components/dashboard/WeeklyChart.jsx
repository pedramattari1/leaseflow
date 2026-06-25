import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function WeeklyChart({ data, weekOf }) {
  return (
    <div className="bg-surface rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Weekly Tours</h3>
        {weekOf && <span className="text-xs text-text-tertiary">Week of {weekOf}</span>}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barCategoryGap="25%">
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B6B6B' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #E8E6E1', fontSize: 13 }}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="current" name="This Week" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
          <Bar dataKey="prior" name="Last Week" fill="#E8E6E1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
