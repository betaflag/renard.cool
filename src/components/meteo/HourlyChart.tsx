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
  ReferenceArea,
} from 'recharts';
import { Sunrise, Sunset, Thermometer, Hand, Droplets, CloudRain, Wind } from 'lucide-react';

interface HourlyDataPoint {
  hour: string;
  temp: number;
  feelsLike: number;
  precipitation: number;
  precipProb?: number;
  windSpeed?: number;
  humidity?: number;
  isNow?: boolean;
  weatherCode?: number;
}

interface HourlyChartProps {
  data: HourlyDataPoint[];
  sunrise?: string;
  sunset?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;

    return (
      <div
        style={{
          background: 'rgba(26, 26, 46, 0.98)',
          border: '2px solid rgba(255, 107, 0, 0.6)',
          borderRadius: '14px',
          padding: '14px 18px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 25px rgba(255, 107, 0, 0.3)',
          backdropFilter: 'blur(12px)',
          minWidth: '180px',
        }}
      >
        <p
          style={{
            color: '#ff6b00',
            fontWeight: 700,
            marginBottom: '10px',
            fontSize: '1.05rem',
            textShadow: '0 0 12px rgba(255, 107, 0, 0.5)',
            borderBottom: '1px solid rgba(255, 107, 0, 0.3)',
            paddingBottom: '8px',
          }}
        >
          {label}
          {data?.isNow && (
            <span
              style={{
                marginLeft: '8px',
                fontSize: '0.8rem',
                background: 'rgba(255, 107, 0, 0.2)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              Maintenant
            </span>
          )}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ff6b00',
              fontSize: '0.95rem',
              fontWeight: 600,
            }}
          >
            <Thermometer size={18} strokeWidth={2.5} />
            <span>Température: <strong>{data?.temp}°C</strong></span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#fbbf24',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            <Hand size={16} strokeWidth={2.5} />
            <span>Ressenti: <strong>{data?.feelsLike}°C</strong></span>
          </div>

          {data?.precipitation > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#4a9eff',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            >
              <Droplets size={16} strokeWidth={2.5} />
              <span>Précipitations: <strong>{data.precipitation} mm</strong></span>
            </div>
          )}

          {data?.precipProb !== undefined && data.precipProb > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#60a5fa',
                fontSize: '0.85rem',
                fontStyle: 'italic',
              }}
            >
              <CloudRain size={15} strokeWidth={2.5} />
              <span>Probabilité: {data.precipProb}%</span>
            </div>
          )}

          {data?.windSpeed !== undefined && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#d1d5db',
                fontSize: '0.85rem',
              }}
            >
              <Wind size={15} strokeWidth={2.5} />
              <span>Vent: {data.windSpeed} km/h</span>
            </div>
          )}

          {data?.humidity !== undefined && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#d1d5db',
                fontSize: '0.85rem',
              }}
            >
              <Droplets size={15} strokeWidth={2.5} />
              <span>Humidité: {data.humidity}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};


// Custom sunrise/sunset marker with Lucide icons
const SunMarker = ({ x, y, type }: { x: number; y: number; type: 'sunrise' | 'sunset' }) => {
  const Icon = type === 'sunrise' ? Sunrise : Sunset;
  const color = type === 'sunrise' ? '#fbbf24' : '#ff6b00';

  return (
    <g>
      <foreignObject x={x - 12} y={y + 18} width="24" height="24">
        <Icon
          size={24}
          color={color}
          strokeWidth={2}
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </foreignObject>
    </g>
  );
};

const HourlyChart: React.FC<HourlyChartProps> = ({ data, sunrise, sunset }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  const nowHour = nowIndex !== -1 ? data[nowIndex].hour : null;

  // Parse sunrise/sunset hours
  const sunriseHour = sunrise ? `${new Date(sunrise).getHours()}h` : null;
  const sunsetHour = sunset ? `${new Date(sunset).getHours()}h` : null;

  // Filter data for mobile - show every 3 hours
  const displayData = isMobile
    ? data.filter((_, index) => index % 3 === 0 || data[index].isNow)
    : data;

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 350 : 400}>
      <ComposedChart
        data={displayData}
        margin={{
          top: 20,
          right: isMobile ? 10 : 20,
          left: isMobile ? 0 : 10,
          bottom: isMobile ? 10 : 20,
        }}
      >
        <defs>
          {/* Enhanced gradient for temperature line */}
          <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff6b00" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#ff6b00" stopOpacity={0} />
          </linearGradient>

          {/* Lighter gradient for precipitation bars */}
          <linearGradient id="precipGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4a9eff" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#4a9eff" stopOpacity={0.3} />
          </linearGradient>

          {/* Glow filter for now line */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Improved grid - more visible, horizontal only */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255, 255, 255, 0.1)"
          vertical={false}
        />

        <XAxis
          dataKey="hour"
          stroke="#d1d5db"
          style={{
            fontSize: isMobile ? '0.75rem' : '0.9rem',
            fill: '#d1d5db',
            fontWeight: 500,
          }}
          tickLine={{ stroke: 'rgba(255, 107, 0, 0.3)' }}
          tick={(props) => {
            const { x, y, payload } = props;
            const isNow = payload.value === nowHour;
            const isSunrise = payload.value === sunriseHour;
            const isSunset = payload.value === sunsetHour;

            return (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={isMobile ? 12 : 16}
                  textAnchor="middle"
                  fill={isNow ? '#ff6b00' : '#d1d5db'}
                  fontSize={isNow ? (isMobile ? '0.8rem' : '0.95rem') : (isMobile ? '0.75rem' : '0.85rem')}
                  fontWeight={isNow ? 700 : 500}
                  style={{
                    textShadow: isNow ? '0 0 10px rgba(255, 107, 0, 0.6)' : 'none',
                  }}
                >
                  {payload.value}
                </text>

                {/* Sunrise/Sunset markers - hide on mobile */}
                {!isMobile && isSunrise && <SunMarker x={0} y={0} type="sunrise" />}
                {!isMobile && isSunset && <SunMarker x={0} y={0} type="sunset" />}
              </g>
            );
          }}
        />

        {/* Single Y-axis for temperature */}
        <YAxis
          stroke="#ff6b00"
          style={{
            fontSize: isMobile ? '0.75rem' : '0.9rem',
            fill: '#ff8c42',
            fontWeight: 500,
          }}
          tickLine={{ stroke: 'rgba(255, 107, 0, 0.3)' }}
          label={{
            value: '°C',
            angle: -90,
            position: 'insideLeft',
            style: {
              fill: '#ff6b00',
              fontSize: isMobile ? '0.85rem' : '1rem',
              fontWeight: 600,
            },
            offset: isMobile ? 0 : 5,
          }}
          domain={['auto', 'auto']}
          tickCount={isMobile ? 5 : 7}
        />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{
            stroke: 'rgba(255, 107, 0, 0.3)',
            strokeWidth: 2,
            fill: 'rgba(255, 107, 0, 0.05)',
          }}
        />

        {/* Legend at bottom */}
        <Legend
          wrapperStyle={{
            paddingTop: isMobile ? '25px' : '40px',
            fontSize: isMobile ? '0.8rem' : '0.9rem',
          }}
          iconType="line"
          iconSize={isMobile ? 12 : 16}
          formatter={(value) => {
            const labels: { [key: string]: string } = {
              temp: 'Température',
              feelsLike: 'Ressenti',
              precipitation: 'Précipitations',
            };
            return <span style={{ color: '#d1d5db' }}>{labels[value] || value}</span>;
          }}
        />

        {/* Simple reference line for current time */}
        {nowIndex !== -1 && nowHour && (
          <>
            {/* Background glow - only on desktop */}
            {!isMobile && (
              <ReferenceArea
                x1={nowIndex > 0 ? data[nowIndex - 1].hour : data[nowIndex].hour}
                x2={nowIndex < data.length - 1 ? data[nowIndex + 1].hour : data[nowIndex].hour}
                fill="rgba(255, 107, 0, 0.08)"
                fillOpacity={0.5}
              />
            )}

            {/* Main line with glow effect */}
            <ReferenceLine
              x={nowHour}
              stroke="#ff6b00"
              strokeWidth={isMobile ? 2 : 3}
              filter={isMobile ? undefined : "url(#glow)"}
            >
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="2s"
                repeatCount="indefinite"
              />
            </ReferenceLine>
          </>
        )}

        {/* Precipitation bars - lighter, more subtle, no separate axis */}
        <Bar
          dataKey="precipitation"
          fill="url(#precipGradient)"
          radius={[6, 6, 0, 0]}
          maxBarSize={isMobile ? 20 : 30}
          opacity={0.5}
          label={(props) => {
            if (isMobile) return null; // Hide labels on mobile
            const { x, y, width, value } = props;
            if (value > 0.5) {
              return (
                <text
                  x={x + width / 2}
                  y={y - 5}
                  fill="#4a9eff"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                >
                  {value}mm
                </text>
              );
            }
            return null;
          }}
        />

        {/* Temperature line - thicker, more prominent */}
        <Line
          type="monotone"
          dataKey="temp"
          stroke="#ff6b00"
          strokeWidth={isMobile ? 3 : 4}
          dot={
            isMobile
              ? false
              : {
                  fill: '#ff6b00',
                  r: 5,
                  strokeWidth: 2,
                  stroke: 'rgba(26, 26, 46, 1)',
                }
          }
          activeDot={{
            r: isMobile ? 5 : 7,
            fill: '#ff6b00',
            stroke: '#fff',
            strokeWidth: 2,
            filter: isMobile ? undefined : 'drop-shadow(0 0 10px rgba(255, 107, 0, 0.9))',
          }}
        />

        {/* Feels-like line - thinner, more transparent */}
        <Line
          type="monotone"
          dataKey="feelsLike"
          stroke="#ffd700"
          strokeWidth={isMobile ? 2 : 2.5}
          strokeDasharray="5 5"
          opacity={0.7}
          dot={
            isMobile
              ? false
              : {
                  fill: '#fbbf24',
                  r: 3.5,
                  strokeWidth: 2,
                  stroke: 'rgba(26, 26, 46, 1)',
                }
          }
          activeDot={{
            r: isMobile ? 4 : 6,
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
