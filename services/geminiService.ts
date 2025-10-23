
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available in the environment variables
const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: apiKey! });

export const generateAnnouncement = async (prompt: string): Promise<string> => {
    if (!apiKey) {
        return "Error: API key is not configured. Please set the API_KEY environment variable.";
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful assistant for a neighborhood community app called 'Rinconada de Ceibas'. Your tone should be friendly, clear, and concise. Format your response as a community announcement.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating announcement with Gemini:", error);
        return "Hubo un error al generar el anuncio. Por favor, inténtalo de nuevo.";
    }
};
