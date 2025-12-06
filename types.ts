
export enum VariableId {
  X1 = 'x1',
  X2 = 'x2',
  X3 = 'x3',
  X4 = 'x4',
  X5 = 'x5',
}

export interface VariableConfig {
  id: VariableId;
  name: string;
  symbol: string;
  unit: string;
  description: string;
  defaultMin: number;
  defaultMax: number;
  step: number;
}

export interface Coefficients {
  a: number; // Intercept
  [VariableId.X1]: number;
  [VariableId.X2]: number;
  [VariableId.X3]: number;
  [VariableId.X4]: number;
  [VariableId.X5]: number;
}

export interface InputValues {
  [VariableId.X1]: number;
  [VariableId.X2]: number;
  [VariableId.X3]: number;
  [VariableId.X4]: number;
  [VariableId.X5]: number;
}

export interface OptimizationRange {
  min: number;
  max: number;
}

export interface RangeConfig {
  [VariableId.X1]: OptimizationRange;
  [VariableId.X2]: OptimizationRange;
  [VariableId.X3]: OptimizationRange;
  [VariableId.X4]: OptimizationRange;
  [VariableId.X5]: OptimizationRange;
}

export interface SavedModel {
  id: string;
  name: string;
  coefficients: Coefficients;
  timestamp: number;
}
