
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { Coefficients, InputValues, VariableId } from '../types';
import { VARIABLES } from '../constants';
import { TrendingUp } from 'lucide-react';

interface Props {
  coefficients: Coefficients;
  baseInputs: InputValues;
}

export const AnalysisChart: React.FC<Props> = ({ coefficients, baseInputs }) => {
  const [selectedVar, setSelectedVar] = useState<VariableId>(VariableId.X1);

  const data = useMemo(() => {
    const config = VARIABLES[selectedVar];
    const range = config.defaultMax - config.defaultMin;
    const steps = 20;
    const stepSize = range / steps;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const val = config.defaultMin + (stepSize * i);
      // Calculate Y keeping others constant
      let y = coefficients.a;
      
      Object.values(VARIABLES).forEach(v => {
        if (v.id === selectedVar) {
          y += coefficients[v.id] * val;
        } else {
          y += coefficients[v.id] * baseInputs[v.id];
        }
      });
      
      // Cap at 100% logically, though regression is blind
      y = Math.min(100, Math.max(0, y));

      points.push({
        x: parseFloat(val.toFixed(2)),
        y: parseFloat(y.toFixed(2)),
      });
    }
    return points;
  }, [coefficients, baseInputs, selectedVar]);

  // Determine current value point for reference line
  const currentVal = baseInputs[selectedVar];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-800">Análisis de Sensibilidad</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">Variable:</span>
          <select
            value={selectedVar}
            onChange={(e) => setSelectedVar(e.target.value as VariableId)}
            className="border border-slate-300 rounded px-2 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.values(VARIABLES).map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="x" 
              type="number" 
              domain={['auto', 'auto']}
              label={{ value: VARIABLES[selectedVar].unit, position: 'bottom', offset: 0 }}
              stroke="#64748b"
            />
            <YAxis 
              domain={[0, 100]} 
              label={{ value: 'Recuperación (%)', angle: -90, position: 'insideLeft' }}
              stroke="#64748b"
            />
            <Tooltip 
              formatter={(value: number) => [`${value}%`, 'Recuperación']}
              labelFormatter={(label: number) => `${VARIABLES[selectedVar].name}: ${label} ${VARIABLES[selectedVar].unit}`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <ReferenceLine x={currentVal} stroke="red" strokeDasharray="3 3">
               <Label value="Actual" position="top" fill="red" fontSize={12} />
            </ReferenceLine>
            <Line 
              type="monotone" 
              dataKey="y" 
              stroke="#4f46e5" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 2 }} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-slate-500 mt-2 text-center">
        Mostrando variación de recuperación manteniendo las otras 4 variables constantes.
      </p>
    </div>
  );
};
