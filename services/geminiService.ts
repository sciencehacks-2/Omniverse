import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
// NOTE: Ensure process.env.API_KEY is available in your build environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEspCommand = async (userPrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following user request into a JSON command suitable for an ESP32 IoT device.
      
      User Request: "${userPrompt}"
      
      Requirements:
      1. Return ONLY a valid JSON object.
      2. The JSON should be intuitive. 
         - If controlling a light, use keys like "action": "on/off", "component": "led", "color": "hex".
         - If displaying text, use "action": "print", "text": "...".
         - If moving a servo, use "action": "move", "angle": number.
      3. Add a "timestamp" field with the current time in ISO format (I will handle this in code if you don't, but you can add a placeholder).
      4. Do not wrap in markdown code blocks. Just the raw JSON string.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          description: "IoT Command Object",
          properties: {
            command: { type: Type.STRING, description: "The primary action key, e.g., SET_LED, DISPLAY_TEXT" },
            parameters: { 
              type: Type.OBJECT,
              description: "Parameters for the command",
              properties: {
                state: { type: Type.STRING },
                value: { type: Type.NUMBER },
                color: { type: Type.STRING },
                text: { type: Type.STRING },
                speed: { type: Type.INTEGER }
              }
            }
          },
          required: ["command", "parameters"]
        }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI command.");
  }
};
