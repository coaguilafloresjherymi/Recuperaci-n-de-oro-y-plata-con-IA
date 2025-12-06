
import React from 'react';
import { Coefficients, VariableId } from '../types';
import { VARIABLES } from '../constants';
import { Edit3 } from 'lucide-react';

interface Props {
  coefficients: Coefficients;
  onChange: (newCoefficients: Coefficients) => void;
}

export const CoefficientEditor: React.FC<Props> = ({ coefficients, onChange }) => {
  const handleChange = (key: keyof Coefficients, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onChange({ ...coefficients, [key]: numValue });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
        <Edit3 className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-slate-800">Coeficientes del Modelo (Regresión)</h3>
      </div>
      <p className="text-sm text-slate-500 mb-4 italic">
        Ecuación: y = a + b₁x₁ + b₂x₂ + b₃x₃ + b₄x₄ + b₅x₅ + ε
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <label className="text-xs font-medium text-slate-500 mb-1">Intercepto (a)</label>
          <input
            type="number"
            step="0.01"
            value={coefficients.a}
            onChange={(e) => handleChange('a', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
          />
        </div>
        {Object.values(VARIABLES).map((v) => (
          <div key={v.id} className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1" title={v.name}>
              Coef. {v.symbol} ({v.name})
            </label>
            <input
              type="number"
              step="0.001"
              value={coefficients[v.id]}
              onChange={(e) => handleChange(v.id, e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
