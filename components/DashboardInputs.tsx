
import React from 'react';
import { InputValues, VariableId } from '../types';
import { VARIABLES } from '../constants';
import { Sliders } from 'lucide-react';

interface Props {
  inputs: InputValues;
  onChange: (newInputs: InputValues) => void;
}

export const DashboardInputs: React.FC<Props> = ({ inputs, onChange }) => {
  const handleSliderChange = (id: VariableId, value: string) => {
    onChange({ ...inputs, [id]: parseFloat(value) });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 h-full">
      <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
        <Sliders className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-slate-800">Control de Variables (Simulación)</h3>
      </div>
      
      <div className="space-y-6">
        {Object.values(VARIABLES).map((v) => (
          <div key={v.id} className="group">
            <div className="flex justify-between items-end mb-2">
              <div>
                <span className="font-medium text-slate-700">{v.name} ({v.symbol})</span>
                <span className="text-xs text-slate-400 block">{v.description}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-indigo-600">
                  {inputs[v.id]}
                </span>
                <span className="text-xs text-slate-500 ml-1">{v.unit}</span>
              </div>
            </div>
            <input
              type="range"
              min={v.defaultMin}
              max={v.defaultMax}
              step={v.step}
              value={inputs[v.id]}
              onChange={(e) => handleSliderChange(v.id, e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>{v.defaultMin} {v.unit}</span>
              <span>{v.defaultMax} {v.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
