import { GoogleGenAI } from "@google/genai";

// The API key is injected by the environment.
// Safe check for process.env in browser environments
const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    // Suppress warning if running in purely client-side demo without env setup
    if (typeof process !== 'undefined') {
        console.warn("API_KEY is not set. AI features will be disabled.");
    }
}

export const generateAnnouncement = async (prompt: string): Promise<string> => {
    if (!ai) {
        return "La función de IA no está disponible. Por favor, configura la API key.";
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