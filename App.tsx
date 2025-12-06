import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Settings, 
  BarChart2, 
  Save, 
  FolderOpen, 
  Download, 
  Zap, 
  BrainCircuit,
  FileText,
  TrendingUp
} from 'lucide-react';
import { 
  Coefficients, 
  InputValues, 
  VariableId, 
  SavedModel, 
  RangeConfig 
} from './types';
import { 
  DEFAULT_COEFFICIENTS, 
  DEFAULT_INPUTS, 
  VARIABLES, 
  DEFAULT_RANGES 
} from './constants';
import { CoefficientEditor } from './components/CoefficientEditor';
import { DashboardInputs } from './components/DashboardInputs';
import { AnalysisChart } from './components/AnalysisChart';
import { generateEngineeringReport } from './services/geminiService';
import Markdown from 'react-markdown';

const App: React.FC = () => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'model' | 'optimization' | 'analysis'>('dashboard');
  const [coefficients, setCoefficients] = useState<Coefficients>(DEFAULT_COEFFICIENTS);
  const [inputs, setInputs] = useState<InputValues>(DEFAULT_INPUTS);
  const [ranges, setRanges] = useState<RangeConfig>(DEFAULT_RANGES);
  
  // Saved Models
  const [savedModels, setSavedModels] = useState<SavedModel[]>([]);
  const [modelName, setModelName] = useState('');

  // AI Report State
  const [aiReport, setAiReport] = useState<string>('');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // --- Calculations ---
  
  const calculateRecovery = (coeffs: Coefficients, vars: InputValues): number => {
    let y = coeffs.a;
    y += coeffs[VariableId.X1] * vars[VariableId.X1];
    y += coeffs[VariableId.X2] * vars[VariableId.X2];
    y += coeffs[VariableId.X3] * vars[VariableId.X3];
    y += coeffs[VariableId.X4] * vars[VariableId.X4];
    y += coeffs[VariableId.X5] * vars[VariableId.X5];
    return Math.min(100, Math.max(0, y)); // Clamping between 0 and 100
  };

  const currentRecovery = useMemo(() => calculateRecovery(coefficients, inputs), [coefficients, inputs]);

  // Optimization Logic
  const optimizationResult = useMemo(() => {
    const optimizedVars: InputValues = { ...inputs };
    
    // Linear optimization: simple boundary check based on slope sign
    Object.values(VARIABLES).forEach(v => {
      const slope = coefficients[v.id];
      const range = ranges[v.id];
      // If slope is positive, maximize input. If negative, minimize input.
      if (slope >= 0) {
        optimizedVars[v.id] = range.max;
      } else {
        optimizedVars[v.id] = range.min;
      }
    });

    const maxRecovery = calculateRecovery(coefficients, optimizedVars);
    return { maxRecovery, optimizedVars };
  }, [coefficients, ranges]); // Intentionally not dependent on inputs, only ranges and model

  // --- Handlers ---

  const handleSaveModel = () => {
    if (!modelName) return alert('Por favor ingrese un nombre para el modelo.');
    const newModel: SavedModel = {
      id: Date.now().toString(),
      name: modelName,
      coefficients: { ...coefficients },
      timestamp: Date.now(),
    };
    setSavedModels([...savedModels, newModel]);
    setModelName('');
    alert('Modelo guardado correctamente.');
  };

  const handleLoadModel = (model: SavedModel) => {
    setCoefficients(model.coefficients);
    alert(`Modelo "${model.name}" cargado.`);
  };

  const handleExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      model: coefficients,
      currentInputs: inputs,
      currentRecovery: currentRecovery,
      optimizationParams: ranges,
      optimizedResult: optimizationResult,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_recuperacion_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleGenerateAIReport = async () => {
    setIsGeneratingReport(true);
    setShowReportModal(true);
    setAiReport('Generando análisis con Gemini...');
    
    const report = await generateEngineeringReport(
      coefficients,
      inputs,
      currentRecovery,
      optimizationResult.maxRecovery,
      optimizationResult.optimizedVars
    );
    
    setAiReport(report);
    setIsGeneratingReport(false);
  };

  // --- UI Components ---

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800 font-sans">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Zap className="text-yellow-400 w-6 h-6" />
            <h1 className="text-xl font-bold tracking-tight">MetalRecovery AI</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">Predicción & Optimización</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Calculator className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('optimization')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'optimization' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <BrainCircuit className="w-5 h-5" /> Optimización
          </button>
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'analysis' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <BarChart2 className="w-5 h-5" /> Análisis Sensibilidad
          </button>
          <button 
            onClick={() => setActiveTab('model')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'model' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Settings className="w-5 h-5" /> Config. Modelo
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-950">
          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Modelos Guardados</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {savedModels.length === 0 && <p className="text-xs text-slate-600 italic">Sin modelos guardados</p>}
            {savedModels.map(model => (
              <button 
                key={model.id}
                onClick={() => handleLoadModel(model)}
                className="w-full flex items-center gap-2 text-xs text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition"
              >
                <FolderOpen className="w-3 h-3" /> {model.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-800">
            {activeTab === 'dashboard' && 'Panel de Control Principal'}
            {activeTab === 'optimization' && 'Optimización Automática'}
            {activeTab === 'analysis' && 'Análisis de Datos'}
            {activeTab === 'model' && 'Gestión del Modelo Matemático'}
          </h2>
          <div className="flex gap-2">
            <button onClick={handleGenerateAIReport} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-md shadow-sm transition-all text-sm font-medium">
              <FileText className="w-4 h-4" /> Reporte AI
            </button>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md shadow-sm transition-all text-sm font-medium">
              <Download className="w-4 h-4" /> Exportar JSON
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">

          {/* KPI Cards Always Visible on Dashboard/Optimization */}
          {(activeTab === 'dashboard' || activeTab === 'optimization') && (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-sm font-medium text-slate-500 uppercase">Recuperación Actual</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-4xl font-extrabold text-indigo-600">{currentRecovery.toFixed(2)}%</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${currentRecovery > 90 ? 'bg-green-500' : currentRecovery > 70 ? 'bg-indigo-500' : 'bg-amber-500'}`} 
                        style={{ width: `${currentRecovery}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-sm font-medium text-slate-500 uppercase">Potencial Máximo (Optimizado)</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-extrabold text-emerald-600">{optimizationResult.maxRecovery.toFixed(2)}%</span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-2 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +{(optimizationResult.maxRecovery - currentRecovery).toFixed(2)}% mejora potencial
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <p className="text-sm font-medium text-slate-500 uppercase">Estado</p>
                  <div className="mt-2">
                    {currentRecovery >= optimizationResult.maxRecovery - 0.1 ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                        <Zap className="w-4 h-4 mr-1" /> ÓPTIMO
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-800">
                         MEJORABLE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Basado en las restricciones actuales.
                  </p>
                </div>
             </div>
          )}

          {/* TAB CONTENT */}

          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <DashboardInputs inputs={inputs} onChange={setInputs} />
              <div className="space-y-8">
                <AnalysisChart coefficients={coefficients} baseInputs={inputs} />
              </div>
            </div>
          )}

          {activeTab === 'optimization' && (
             <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Restricciones de Optimización</h3>
                </div>
                <p className="text-sm text-slate-500 mb-6">Define los rangos operativos permitidos. El sistema calculará automáticamente la mejor combinación.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {Object.values(VARIABLES).map((v) => (
                     <div key={v.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <label className="font-semibold text-slate-700">{v.name}</label>
                          <span className={`text-xs px-2 py-0.5 rounded ${optimizationResult.optimizedVars[v.id] === ranges[v.id].max ? 'bg-green-100 text-green-700' : optimizationResult.optimizedVars[v.id] === ranges[v.id].min ? 'bg-blue-100 text-blue-700' : 'bg-slate-200'}`}>
                             Sug: {optimizationResult.optimizedVars[v.id]}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           <div>
                             <label className="text-xs text-slate-400">Min</label>
                             <input 
                               type="number" 
                               value={ranges[v.id].min}
                               onChange={(e) => setRanges({...ranges, [v.id]: {...ranges[v.id], min: parseFloat(e.target.value)}})}
                               className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                             />
                           </div>
                           <div>
                             <label className="text-xs text-slate-400">Max</label>
                             <input 
                               type="number" 
                               value={ranges[v.id].max}
                               onChange={(e) => setRanges({...ranges, [v.id]: {...ranges[v.id], max: parseFloat(e.target.value)}})}
                               className="w-full border border-slate-300 rounded px-2 py-1 text-sm"
                             />
                           </div>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                  <h4 className="font-bold text-indigo-900 mb-2">Resultado Óptimo Calculado:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    {Object.values(VARIABLES).map(v => (
                      <div key={v.id} className="flex flex-col">
                         <span className="text-indigo-400 font-medium">{v.symbol}</span>
                         <span className="text-indigo-800 font-bold text-lg">{optimizationResult.optimizedVars[v.id]} <span className="text-xs font-normal">{v.unit}</span></span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-indigo-200 flex justify-between items-center">
                    <span className="text-indigo-900 font-medium">Recuperación Resultante:</span>
                    <span className="text-2xl font-bold text-indigo-700">{optimizationResult.maxRecovery.toFixed(2)}%</span>
                  </div>
                  <button 
                    onClick={() => setInputs(optimizationResult.optimizedVars)}
                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition shadow-sm font-medium"
                  >
                    Aplicar estos valores al Dashboard
                  </button>
                </div>
             </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
               <AnalysisChart coefficients={coefficients} baseInputs={inputs} />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-4">Impacto de Coeficientes</h4>
                    <div className="space-y-3">
                      {Object.values(VARIABLES).map(v => (
                        <div key={v.id} className="flex items-center justify-between">
                           <span className="text-sm text-slate-600">{v.name}</span>
                           <div className="flex items-center gap-3">
                              <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                                 <div 
                                    className={`h-full ${coefficients[v.id] > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                                    style={{ width: `${Math.min(100, Math.abs(coefficients[v.id]) * 50)}%` }} // Arbitrary scale for visual
                                 ></div>
                              </div>
                              <span className="text-sm font-mono w-16 text-right">{coefficients[v.id]}</span>
                           </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 mt-4">* Barras indican magnitud relativa y dirección del impacto.</p>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'model' && (
            <div className="space-y-6">
              <CoefficientEditor coefficients={coefficients} onChange={setCoefficients} />
              
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                  <Save className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-slate-800">Guardar Modelo Actual</h3>
                </div>
                <div className="flex gap-4">
                   <input 
                    type="text" 
                    placeholder="Nombre del modelo (ej. Mina Sur Veta 2)" 
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="flex-1 border border-slate-300 rounded px-4 py-2"
                   />
                   <button 
                    onClick={handleSaveModel}
                    className="bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-800 transition font-medium"
                   >
                     Guardar
                   </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* AI Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <div className="flex items-center gap-2 text-indigo-700">
                 <BrainCircuit className="w-6 h-6" />
                 <h3 className="text-lg font-bold">Análisis Inteligente Gemini</h3>
               </div>
               <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                 ✕
               </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
               {isGeneratingReport ? (
                 <div className="flex flex-col items-center justify-center py-12">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                   <p className="text-slate-600 animate-pulse">Analizando parámetros metalúrgicos...</p>
                 </div>
               ) : (
                 <div className="prose prose-indigo prose-sm w-full max-w-none">
                    <Markdown>{aiReport}</Markdown>
                 </div>
               )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl flex justify-end">
               <button 
                 onClick={() => setShowReportModal(false)}
                 className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 font-medium transition"
               >
                 Cerrar
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;