import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AthleteResultsBlock({ athlete, results, onEdit, onDelete }) {
  const [metric, setMetric] = useState("jumpLength");
  const [blockExpanded, setBlockExpanded] = useState(false);
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);

  const sorted = [...results].sort((a, b) => a.attemptNumber - b.attemptNumber);

  const metricOptions = [
    { key: "jumpLength", label: "Długość skoku (m)" },
    { key: "totalPoints", label: "Punkty" },
    { key: "speedTakeoff", label: "Prędkość na progu (km/h)" },
    { key: "gate", label: "Belka" },
    { key: "flightTime", label: "Czas lotu (s)" },
    { key: "stylePoints", label: "Ocena stylu" },
    { key: "windCompensation", label: "Korekta wiatru" },
  ];

  return (
    <div className="card column">
      <div onClick={() => setBlockExpanded((prev) => !prev)} className="tool-title" style={{cursor: "pointer"}}>
        <h4 style={{ margin: 0 }}>
          {athlete.firstName} {athlete.lastName}
        </h4>
        <span>{blockExpanded ? "▲" : "▼"}</span>
      </div>

      {blockExpanded && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 8,
              marginBottom: 12,
            }}
          >
            <select value={metric} onChange={(e) => setMetric(e.target.value)} className="input">
              {metricOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="row"
            style={{
              width: "100%",
              height: 300,
            }}
          >
            <div
              style={{
                flex: "0 0 250px",
                overflowY: "auto",
                paddingRight: 8,
              }}
            >
              {sorted.map((res) => {
                const isExpanded = expandedAttemptId === res.id;
                return (
                  <div
                    key={res.id}
                    className="attempt-card"
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: 8,
                    }}
                  >
                    <div
                      onClick={() => setExpandedAttemptId(isExpanded ? null : res.id)}
                      className="tool-title"
                      style={{cursor: "pointer"}}
                    >
                      <span>Próba {res.attemptNumber}</span>
                      <span>{isExpanded ? "▲" : "▼"}</span>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: 8, fontSize: 14 }}>
                        <div><strong>Długość:</strong> {res.jumpLength ?? "-"} m</div>
                        <div><strong>Punkty:</strong> {res.totalPoints ?? "-"}</div>
                        <div><strong>Styl:</strong> {res.stylePoints ?? "-"}</div>
                        <div><strong>Kompensacja za wiatr:</strong> {res.windCompensation ?? "-"}</div>
                        <div><strong>Belka:</strong> {res.gate ?? "-"}</div>
                        <div><strong>Prędkość:</strong> {res.speedTakeoff ?? "-"} km/h</div>
                        <div><strong>Czas lotu:</strong> {res.flightTime ?? "-"} s</div>
                        <div><strong>Komentarz:</strong> {res.coachComment || "brak"}</div>
                        {res.videoUrl && (
                          <div>
                            <a href={res.videoUrl} target="_blank" rel="noopener noreferrer">
                              Zobacz wideo
                            </a>
                          </div>
                        )}
                        <div className="row">
                          <button className="btn" onClick={() => onEdit(res)}>Edytuj</button>
                          <button className="btn danger" onClick={() => onDelete(res)}>Usuń</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{flex: "1 1 auto"}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sorted}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="attemptNumber"
                    label={{ value: "Próba", position: "insideBottomRight", offset: 0 }}
                  />
                  <YAxis
                    domain={[
                      (dataMin) => Math.floor(dataMin * 0.9),
                      (dataMax) => Math.ceil(dataMax * 1.1)
                    ]}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={metric}
                    stroke="red"
                    strokeWidth={2}
                    dot={{ r: 5, stroke: 'red', fill: 'red' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
