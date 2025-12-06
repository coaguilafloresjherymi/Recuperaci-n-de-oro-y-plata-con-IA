
import { GoogleGenAI } from "@google/genai";
import { Coefficients, InputValues, VariableId } from "../types";
import { VARIABLES } from "../constants";

export const generateEngineeringReport = async (
  coefficients: Coefficients,
  inputs: InputValues,
  recovery: number,
  optimizedRecovery: number,
  optimizedInputs: InputValues
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "Error: API Key no configurada. Por favor configure process.env.API_KEY.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct a detailed prompt
    const prompt = `
      Actúa como un Ingeniero Metalurgista experto en procesamiento de minerales (Oro/Plata).
      Analiza los siguientes datos de un proceso de lixiviación/recuperación basado en un modelo de regresión lineal.

      DATOS ACTUALES:
      - Recuperación Predicha: ${recovery.toFixed(2)}%
      - Variables Operativas:
        ${Object.values(VARIABLES).map(v => `- ${v.name}: ${inputs[v.id]} ${v.unit} (Coeficiente impacto: ${coefficients[v.id]})`).join('\n')}
      - Intercepto del modelo: ${coefficients.a}

      DATOS DE OPTIMIZACIÓN (Teórica):
      - Recuperación Máxima Posible: ${optimizedRecovery.toFixed(2)}%
      - Configuración Óptima:
        ${Object.values(VARIABLES).map(v => `- ${v.name}: ${optimizedInputs[v.id]} ${v.unit}`).join('\n')}

      Genera un reporte técnico breve (máximo 300 palabras) en formato Markdown que incluya:
      1. **Diagnóstico**: ¿El proceso actual es eficiente comparado con el óptimo?
      2. **Análisis de Sensibilidad**: Basado en los coeficientes, ¿Qué variable tiene mayor impacto positivo o negativo?
      3. **Recomendaciones Operativas**: 3 acciones concretas para acercarse a la recuperación óptima.
      
      Usa un tono profesional, técnico y directo.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No se pudo generar el reporte.";
  } catch (error) {
    console.error("Error generating report:", error);
    return "Error al conectar con el servicio de IA para generar el reporte. Verifique su conexión o API Key.";
  }
};
