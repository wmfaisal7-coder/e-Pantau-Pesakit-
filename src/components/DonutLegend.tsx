interface Datum {
  label: string;
  value: number;
  tone?: string;
}

interface Props {
  title: string;
  data: Datum[];
}

export function DonutLegend({ title, data }: Props) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div className="donut-card">
        <div className="donut-center">
          <div className="donut-total">{total}</div>
          <div className="donut-sub">Jumlah</div>
        </div>
        <div className="donut-legend">
          {data.map((item) => (
            <div key={item.label} className="donut-legend-row">
              <span className={`legend-dot ${item.tone ?? ""}`} />
              <span className="legend-label">{item.label}</span>
              <span className="legend-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
