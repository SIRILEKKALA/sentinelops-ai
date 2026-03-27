import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types";

const apiKey = process.env.GEMINI_API_KEY;

export async function analyzeSystem(description: string): Promise<AuditResult> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: `Analyze the following system description and provide a detailed audit: \n\n${description}` }] }],
    config: {
      systemInstruction: "You are an expert system architect and cloud optimization engineer. Analyze the given system description and identify cost inefficiencies, security risks, performance bottlenecks, and optimization recommendations. Provide a structured JSON response.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallHealth: { type: Type.STRING, description: "Overall health status of the system (e.g., Excellent, Good, Fair, Poor, Critical)" },
          summary: { type: Type.STRING, description: "A brief summary of the overall findings" },
          issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING, enum: ["Cost", "Security", "Performance", "Recommendation"] },
                title: { type: Type.STRING },
                explanation: { type: Type.STRING },
                suggestedFix: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                impact: { type: Type.STRING }
              },
              required: ["category", "title", "explanation", "suggestedFix", "priority", "impact"]
            }
          }
        },
        required: ["overallHealth", "summary", "issues"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(text) as AuditResult;
}
