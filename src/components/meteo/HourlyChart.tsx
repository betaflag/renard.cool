import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface HourlyDataPoint {
  hour: string;
  temp: number;
  feelsLike: number;
  precipitation: number;
  precipProb?: number;
  isNow?: boolean;
}

interface HourlyChartProps {
  data: HourlyDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(26, 26, 46, 0.95)',
          border: '1px solid rgba(255, 107, 0, 0.4)',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 107, 0, 0.2)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <p
          style={{
            color: '#ff6b00',
            fontWeight: 600,
            marginBottom: '8px',
            fontSize: '0.95rem',
            textShadow: '0 0 10px rgba(255, 107, 0, 0.4)',
          }}
        >
          {label}
        </p>
        {payload.map((entry: any, index: number) => {
          let color = entry.color;
          let label = entry.name;
          let value = entry.value;
          let unit = '';

          if (entry.dataKey === 'temp') {
            label = 'Température';
            unit = '°C';
            color = '#ff6b00';
          } else if (entry.dataKey === 'feelsLike') {
            label = 'Ressenti';
            unit = '°C';
            color = '#fbbf24';
          } else if (entry.dataKey === 'precipitation') {
            label = 'Précipitations';
            unit = ' mm';
            color = '#3b82f6';
          }

          return (
            <p
              key={index}
              style={{
                color: color,
                margin: '4px 0',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              {label}: <strong>{value}{unit}</strong>
            </p>
          );
        })}
        {payload[0]?.payload?.precipProb !== undefined && (
          <p
            style={{
              color: '#60a5fa',
              margin: '4px 0',
              fontSize: '0.85rem',
              fontStyle: 'italic',
            }}
          >
            Prob. pluie: {payload[0].payload.precipProb}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

const HourlyChart: React.FC<HourlyChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px',
          color: '#d1d5db',
          fontSize: '1rem',
        }}
      >
        Aucune donnée horaire disponible
      </div>
    );
  }

  // Find current hour index for reference line
  const nowIndex = data.findIndex((d) => d.isNow);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
      >
        <defs>
          {/* Gradient for temperature line */}
          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#ff6b00" stopOpacity={0.2} />
          </linearGradient>
          {/* Gradient for feels-like line */}
          <linearGradient id="feelsLikeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1} />
          </linearGradient>
          {/* Gradient for precipitation bars */}
          <linearGradient id="precipGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255, 255, 255, 0.08)"
          vertical={false}
        />

        <XAxis
          dataKey="hour"
          stroke="#d1d5db"
          style={{
            fontSize: '0.85rem',
            fill: '#d1d5db',
          }}
          tickLine={{ stroke: 'rgba(255, 107, 0, 0.3)' }}
        />

        <YAxis
          yAxisId="temp"
          stroke="#ff6b00"
          style={{
            fontSize: '0.85rem',
            fill: '#ff6b00',
          }}
          tickLine={{ stroke: 'rgba(255, 107, 0, 0.3)' }}
          label={{
            value: 'Température (°C)',
            angle: -90,
            position: 'insideLeft',
            style: { fill: '#ff6b00', fontSize: '0.9rem' },
          }}
        />

        <YAxis
          yAxisId="precip"
          orientation="right"
          stroke="#3b82f6"
          style={{
            fontSize: '0.85rem',
            fill: '#3b82f6',
          }}
          tickLine={{ stroke: 'rgba(59, 130, 246, 0.3)' }}
          label={{
            value: 'Précipitations (mm)',
            angle: 90,
            position: 'insideRight',
            style: { fill: '#3b82f6', fontSize: '0.9rem' },
          }}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 107, 0, 0.05)' }} />

        <Legend
          wrapperStyle={{
            paddingTop: '20px',
            fontSize: '0.9rem',
          }}
          iconType="line"
          formatter={(value) => {
            const labels: { [key: string]: string } = {
              temp: 'Température',
              feelsLike: 'Ressenti',
              precipitation: 'Précipitations',
            };
            return <span style={{ color: '#d1d5db' }}>{labels[value] || value}</span>;
          }}
        />

        {/* Reference line for current time */}
        {nowIndex !== -1 && (
          <ReferenceLine
            x={data[nowIndex].hour}
            stroke="#ff6b00"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: 'Maintenant',
              position: 'top',
              fill: '#ff6b00',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
            yAxisId="temp"
          />
        )}

        {/* Precipitation bars (behind lines) */}
        <Bar
          yAxisId="precip"
          dataKey="precipitation"
          fill="url(#precipGradient)"
          radius={[8, 8, 0, 0]}
          maxBarSize={40}
          opacity={0.7}
        />

        {/* Temperature lines */}
        <Line
          yAxisId="temp"
          type="monotone"
          dataKey="temp"
          stroke="#ff6b00"
          strokeWidth={3}
          dot={{
            fill: '#ff6b00',
            r: 4,
            strokeWidth: 2,
            stroke: 'rgba(26, 26, 46, 0.8)',
          }}
          activeDot={{
            r: 6,
            fill: '#ff6b00',
            stroke: '#fff',
            strokeWidth: 2,
            filter: 'drop-shadow(0 0 8px rgba(255, 107, 0, 0.8))',
          }}
        />

        <Line
          yAxisId="temp"
          type="monotone"
          dataKey="feelsLike"
          stroke="#fbbf24"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{
            fill: '#fbbf24',
            r: 3,
            strokeWidth: 2,
            stroke: 'rgba(26, 26, 46, 0.8)',
          }}
          activeDot={{
            r: 5,
            fill: '#fbbf24',
            stroke: '#fff',
            strokeWidth: 2,
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default HourlyChart;
