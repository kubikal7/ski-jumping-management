import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTick = ({ x, y, payload }) => {
  const lines = payload.value.split("\n");

  return (
    <text x={x} y={y} fill="#666" textAnchor="middle">
      {lines.map((line, index) => (
        <tspan key={index} x={x} dy={"1.2em"}>
          {line}
        </tspan>
      ))}
    </text>
  );
};

export default function AthleteCompare({ groupedResults, selectedAthletes = [], metric = 'jumpLength' }) {
  const chartData = useMemo(() => {
    if (!selectedAthletes || selectedAthletes.length === 0) return [];

    const eventAttemptsMap = {};

    selectedAthletes.forEach(a => {
      const results = groupedResults[a.id]?.results || [];
      results.forEach(r => {
        if (!r.event || r.attemptNumber == null) return;
        const date = r.event.startDate.split('T')[0];
        const eventKey = `${date} – ${r.event.name}`;
        if (!eventAttemptsMap[eventKey]) eventAttemptsMap[eventKey] = new Set();
        eventAttemptsMap[eventKey].add(r.attemptNumber);
      });
    });

    const xLabels = [];
    Object.keys(eventAttemptsMap)
      .sort((a, b) => new Date(a.split(' – ')[0]) - new Date(b.split(' – ')[0]))
      .forEach(eventKey => {
        const attempts = Array.from(eventAttemptsMap[eventKey]).sort((a, b) => a - b);
        const maxAttempt = Math.max(...attempts);
        for (let i = 1; i <= maxAttempt; i++) {
          const [date, eventName] = eventKey.split(' – ');
          xLabels.push(`${date}\n${eventName}\nPróba ${i}`);
        }
      });

    return xLabels.map(label => {
      const point = { label };
      selectedAthletes.forEach(a => {
        const results = groupedResults[a.id]?.results || [];
        const match = results.find(r => {
          const date = r.event?.startDate.split('T')[0];
          const rLabel = r.event && `${date} – ${r.event.name} – Próba ${r.attemptNumber}`;
          return rLabel === label.replace(/\n/g, ' – ');
        });
        point[`${a.firstName} ${a.lastName}`] = match?.[metric] ?? null;
      });
      return point;
    });
  }, [groupedResults, selectedAthletes, metric]);

  const getColorById = (id) => {
    let hash = 0;
    const str = id.toString();
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash * 137) % 360;

    const saturation = 60 + (Math.abs(hash) % 20);
    const lightness = 40 + (Math.abs(hash) % 20);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };


  return (
      <div style={{ width: '100%', height: 600, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ bottom: 100, right: 80, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              interval={0}
              tick={<CustomTick />}
              height={70}
            />
            <YAxis
              domain={[
                (dataMin) => Math.floor(dataMin * 0.9),
                (dataMax) => Math.ceil(dataMax * 1.1)
              ]}
            />
            <Tooltip />
            <Legend />
            {selectedAthletes.map(a => (
              <Line
                key={a.id}
                type="monotone"
                dataKey={`${a.firstName} ${a.lastName}`}
                stroke={getColorById(a.id)}
                dot={{ r: 5, stroke: getColorById(a.id), fill: getColorById(a.id) }}
                strokeWidth={2}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {selectedAthletes.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#888',
            pointerEvents: 'none'
          }}>
            Wybierz zawodników, aby zobaczyć wykres
          </div>
        )}
      </div>

  );
}
