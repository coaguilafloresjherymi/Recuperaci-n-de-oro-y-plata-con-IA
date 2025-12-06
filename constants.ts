
import { VariableId, VariableConfig, Coefficients, InputValues, RangeConfig } from './types';

export const VARIABLES: Record<VariableId, VariableConfig> = {
  [VariableId.X1]: {
    id: VariableId.X1,
    name: 'Granulometría',
    symbol: 'x₁',
    unit: '% -200 mesh',
    description: 'Porcentaje de mineral pasante malla 200',
    defaultMin: 50,
    defaultMax: 95,
    step: 0.1,
  },
  [VariableId.X2]: {
    id: VariableId.X2,
    name: 'Dosif. Colector',
    symbol: 'x₂',
    unit: 'g/t',
    description: 'Cantidad de reactivo colector por tonelada',
    defaultMin: 10,
    defaultMax: 200,
    step: 1,
  },
  [VariableId.X3]: {
    id: VariableId.X3,
    name: 'pH Pulpa',
    symbol: 'x₃',
    unit: 'pH',
    description: 'Acidez/Alcalinidad de la solución',
    defaultMin: 8,
    defaultMax: 12,
    step: 0.1,
  },
  [VariableId.X4]: {
    id: VariableId.X4,
    name: 'Conc. H₂O₂',
    symbol: 'x₄',
    unit: 'ppm',
    description: 'Concentración de Peróxido de Hidrógeno',
    defaultMin: 0,
    defaultMax: 500,
    step: 5,
  },
  [VariableId.X5]: {
    id: VariableId.X5,
    name: 'Tiempo Lixiviación',
    symbol: 'x₅',
    unit: 'hrs',
    description: 'Tiempo de residencia en tanques',
    defaultMin: 12,
    defaultMax: 96,
    step: 1,
  },
};

export const DEFAULT_COEFFICIENTS: Coefficients = {
  a: 15.5,
  [VariableId.X1]: 0.45,
  [VariableId.X2]: 0.12,
  [VariableId.X3]: 1.5,
  [VariableId.X4]: 0.02,
  [VariableId.X5]: 0.35,
};

export const DEFAULT_INPUTS: InputValues = {
  [VariableId.X1]: 75,
  [VariableId.X2]: 100,
  [VariableId.X3]: 10.5,
  [VariableId.X4]: 250,
  [VariableId.X5]: 48,
};

export const DEFAULT_RANGES: RangeConfig = {
  [VariableId.X1]: { min: 60, max: 90 },
  [VariableId.X2]: { min: 50, max: 150 },
  [VariableId.X3]: { min: 9, max: 11.5 },
  [VariableId.X4]: { min: 100, max: 400 },
  [VariableId.X5]: { min: 24, max: 72 },
};
