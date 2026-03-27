import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

console.log("API KEY:", apiKey);

export async function analyzeSystem(description: string): Promise<AuditResult> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              text: `Analyze the following system description and provide a detailed audit:\n\n${description}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          "You are an expert system architect and cloud optimization engineer. Analyze the given system description and identify cost inefficiencies, security risks, performance bottlenecks, and optimization recommendations. Provide a structured JSON response.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallHealth: { type: Type.STRING },
            summary: { type: Type.STRING },
            issues: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: {
                    type: Type.STRING,
                    enum: ["Cost", "Security", "Performance", "Recommendation"],
                  },
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  suggestedFix: { type: Type.STRING },
                  priority: {
                    type: Type.STRING,
                    enum: ["High", "Medium", "Low"],
                  },
                  impact: { type: Type.STRING },
                },
                required: [
                  "category",
                  "title",
                  "explanation",
                  "suggestedFix",
                  "priority",
                  "impact",
                ],
              },
            },
          },
          required: ["overallHealth", "summary", "issues"],
        },
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as AuditResult;

  } catch (error) {
    console.error("Gemini Error:", error);

    // 🔥 Fallback (VERY IMPORTANT for demo)
    return {
      overallHealth: "Critical",
      summary: "Simulated AI response due to API issue.",
      issues: [
        {
          category: "Performance",
          title: "High CPU Usage",
          explanation: "System experiencing high load.",
          suggestedFix: "Upgrade instance type",
          priority: "High",
          impact: "Latency spikes",
        },
      ],
    } as AuditResult;
  }
}