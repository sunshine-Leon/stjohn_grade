import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';

const GradeChart = ({ data, stats, title, color = "#6366f1" }) => {
    // Frequency distribution for bars
    const distribution = Array.from({ length: 11 }, (_, i) => {
        const range = i * 10;
        const count = data.filter(v => v >= range && v < (range + 10)).length;
        return { name: `${range}-${range + 9}`, count };
    });

    return (
        <div className="chart-container">
            <h3>{title} 分佈圖</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <BarChart data={distribution}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {distribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={color} fillOpacity={0.8} />
                            ))}
                        </Bar>
                        <ReferenceLine x={Math.floor(stats.mean / 10) * 10 - (stats.mean % 10 === 0 ? 10 : 0)} stroke="#ef4444" label="平均" strokeDasharray="3 3" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="chart-stats-grid">
                <div className="mini-stat"><span>平均:</span> <strong>{stats.mean}</strong></div>
                <div className="mini-stat"><span>中位數:</span> <strong>{stats.median}</strong></div>
                <div className="mini-stat"><span>標準差:</span> <strong>{stats.sd}</strong></div>
                <div className="mini-stat"><span>最高:</span> <strong>{stats.max}</strong></div>
                <div className="mini-stat"><span>最低:</span> <strong>{stats.min}</strong></div>
            </div>
        </div>
    );
};

export default GradeChart;
