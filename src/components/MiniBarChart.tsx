interface Datum {
  label: string;
  value: number;
}

interface Props {
  title: string;
  data: Datum[];
}

export function MiniBarChart({ title, data }: Props) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="mini-chart">
        {data.map((item) => (
          <div key={item.label} className="mini-chart-row">
            <div className="mini-chart-label">{item.label}</div>
            <div className="mini-chart-bar-wrap">
              <div className="mini-chart-bar" style={{ width: `${(item.value / max) * 100}%` }} />
            </div>
            <div className="mini-chart-value">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
