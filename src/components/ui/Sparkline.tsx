interface SparklineProps {
  values: number[];
  /** Optional second series drawn dimmer (e.g. running count behind true count). */
  secondary?: number[];
  color?: string;
  height?: number;
}

/**
 * Dependency-free SVG sparkline. Maps a numeric series to a polyline with a
 * zero baseline, so positive/negative excursions read at a glance.
 */
export function Sparkline({ values, secondary, color = 'var(--accent)', height = 80 }: SparklineProps): JSX.Element {
  const W = 300;
  const H = height;
  if (values.length < 2) {
    return (
      <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <text x={W / 2} y={H / 2} fill="var(--text-faint)" fontSize="11" textAnchor="middle">
          not enough data yet
        </text>
      </svg>
    );
  }

  const all = secondary ? [...values, ...secondary] : values;
  const min = Math.min(0, ...all);
  const max = Math.max(0, ...all);
  const span = max - min || 1;

  const toPoints = (series: number[]): string =>
    series
      .map((v, i) => {
        const x = (i / (series.length - 1)) * W;
        const y = H - ((v - min) / span) * H;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

  const zeroY = H - ((0 - min) / span) * H;

  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <line x1="0" y1={zeroY} x2={W} y2={zeroY} stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="3 3" />
      {secondary && (
        <polyline
          points={toPoints(secondary)}
          fill="none"
          stroke="var(--text-faint)"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <polyline
        points={toPoints(values)}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  );
}
