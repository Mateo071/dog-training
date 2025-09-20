import React from 'react';

// Simple Line Chart Component inspired by shadcn design
export const LineChart = ({ data, width = 400, height = 200, className = '' }) => {
  if (!data || data.length === 0) return null;

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Get data bounds
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  // Generate points for the line
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.value - minValue) / valueRange) * chartHeight;
    return { x, y, value: d.value, label: d.label };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="50" height="40" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 40" fill="none" stroke="rgb(229 231 235)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width={chartWidth} height={chartHeight} x={padding} y={padding} fill="url(#grid)" />

        {/* Chart area background */}
        <rect
          x={padding}
          y={padding}
          width={chartWidth}
          height={chartHeight}
          fill="rgb(249 250 251)"
          stroke="rgb(229 231 235)"
          strokeWidth="1"
          rx="4"
        />

        {/* Line path */}
        <path
          d={pathData}
          fill="none"
          stroke="rgb(59 130 246)"
          strokeWidth="2"
          className="drop-shadow-sm"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="rgb(59 130 246)"
              stroke="white"
              strokeWidth="2"
              className="drop-shadow-sm hover:r-6 transition-all cursor-pointer"
            />
            {/* Tooltip on hover */}
            <circle
              cx={point.x}
              cy={point.y}
              r="15"
              fill="transparent"
              className="hover:fill-blue-50 hover:fill-opacity-20"
            />
          </g>
        ))}

        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map((percent, i) => {
          const y = padding + chartHeight - (percent / 100) * chartHeight;
          const value = Math.round(minValue + (valueRange * percent / 100));
          return (
            <g key={i}>
              <line x1={padding - 5} y1={y} x2={padding} y2={y} stroke="rgb(156 163 175)" strokeWidth="1" />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {points.filter((_, i) => i % Math.ceil(points.length / 6) === 0).map((point, i) => (
          <text
            key={i}
            x={point.x}
            y={height - 10}
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            {point.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

// Simple Bar Chart Component
export const BarChart = ({ data, width = 400, height = 200, className = '' }) => {
  if (!data || data.length === 0) return null;

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = chartWidth / data.length * 0.7;
  const barSpacing = chartWidth / data.length * 0.3;

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height}>
        {/* Chart area background */}
        <rect
          x={padding}
          y={padding}
          width={chartWidth}
          height={chartHeight}
          fill="rgb(249 250 251)"
          stroke="rgb(229 231 235)"
          strokeWidth="1"
          rx="4"
        />

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * chartHeight;
          const x = padding + i * (barWidth + barSpacing) + barSpacing / 2;
          const y = padding + chartHeight - barHeight;

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="rgb(59 130 246)"
                rx="2"
                className="hover:fill-blue-600 transition-colors cursor-pointer drop-shadow-sm"
              />
              {/* Value label on top of bar */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="text-xs fill-gray-600 font-medium"
              >
                {d.value}
              </text>
              {/* Category label */}
              <text
                x={x + barWidth / 2}
                y={height - 10}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Y-axis */}
        <line x1={padding} y1={padding} x2={padding} y2={padding + chartHeight} stroke="rgb(156 163 175)" strokeWidth="1" />

        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map((percent, i) => {
          const y = padding + chartHeight - (percent / 100) * chartHeight;
          const value = Math.round(maxValue * percent / 100);
          return (
            <g key={i}>
              <line x1={padding - 5} y1={y} x2={padding} y2={y} stroke="rgb(156 163 175)" strokeWidth="1" />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// Donut Chart Component
export const DonutChart = ({ data, size = 200, className = '' }) => {
  if (!data || data.length === 0) return null;

  const radius = size / 2 - 20;
  const innerRadius = radius * 0.6;
  const center = size / 2;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  let accumulatedValue = 0;
  const colors = [
    'rgb(59 130 246)',   // blue
    'rgb(16 185 129)',   // green
    'rgb(245 158 11)',   // yellow
    'rgb(239 68 68)',    // red
    'rgb(139 92 246)',   // purple
    'rgb(236 72 153)'    // pink
  ];

  const createArcPath = (startAngle, endAngle, outerR, innerR) => {
    const start = polarToCartesian(center, center, outerR, endAngle);
    const end = polarToCartesian(center, center, outerR, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    const outerArc = [
      "M", start.x, start.y,
      "A", outerR, outerR, 0, largeArcFlag, 0, end.x, end.y
    ];

    const innerStart = polarToCartesian(center, center, innerR, endAngle);
    const innerEnd = polarToCartesian(center, center, innerR, startAngle);

    const innerArc = [
      "L", innerEnd.x, innerEnd.y,
      "A", innerR, innerR, 0, largeArcFlag, 0, innerStart.x, innerStart.y
    ];

    return outerArc.concat(innerArc).concat(["Z"]).join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size}>
        {data.map((d, i) => {
          const percentage = d.value / total;
          const startAngle = (accumulatedValue / total) * 360;
          const endAngle = startAngle + (percentage * 360);

          accumulatedValue += d.value;

          const pathData = createArcPath(startAngle, endAngle, radius, innerRadius);

          return (
            <path
              key={i}
              d={pathData}
              fill={colors[i % colors.length]}
              className="hover:opacity-80 transition-opacity cursor-pointer drop-shadow-sm"
            />
          );
        })}

        {/* Center text */}
        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          className="text-2xl font-bold fill-gray-900"
        >
          {total}
        </text>
        <text
          x={center}
          y={center + 15}
          textAnchor="middle"
          className="text-sm fill-gray-500"
        >
          Total
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center text-sm">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: colors[i % colors.length] }}
            />
            <span className="text-gray-600">{d.label}</span>
            <span className="ml-auto font-medium text-gray-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({ value, max, label, className = '' }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value} / {max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-right text-xs text-gray-500">
        {percentage.toFixed(1)}%
      </div>
    </div>
  );
};