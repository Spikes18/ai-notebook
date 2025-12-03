import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We use the flash model for speed on interactive tasks
const MODEL_NAME = 'gemini-2.5-flash';

export const generateTitle = async (content: string): Promise<string> => {
  if (!content.trim()) return "Untitled Note";

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Generate a short, concise, and engaging title (max 5-6 words) for the following note. Do not use quotes. \n\nNote Content:\n${content.substring(0, 1000)}`,
    });
    return response.text?.trim() || "Untitled Note";
  } catch (error) {
    console.error("Error generating title:", error);
    throw new Error("Failed to generate title");
  }
};

export const summarizeNote = async (content: string): Promise<string> => {
  if (!content.trim()) return "";

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Provide a concise summary (bullet points) of the following text. \n\nText:\n${content}`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error summarizing note:", error);
    throw new Error("Failed to summarize note");
  }
};

export const polishText = async (content: string): Promise<string> => {
  if (!content.trim()) return "";

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Fix grammar, improve flow, and professionally polish the following text without changing the original meaning significantly. Return only the polished text.\n\nText:\n${content}`,
    });
    return response.text?.trim() || content;
  } catch (error) {
    console.error("Error polishing text:", error);
    throw new Error("Failed to polish text");
  }
};
