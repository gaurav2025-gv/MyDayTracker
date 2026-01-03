import { GoogleGenerativeAI } from "@google/generative-ai";

// Load API Key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
console.log("Gemini Service: API_KEY detected:", !!API_KEY);

let genAI = null;
if (API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY_HERE') {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export const analyzeDayPerformance = async (dateData, contextStats) => {
    if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        throw new Error("API_KEY_MISSING");
    }

    const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-pro"
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
                You are a high-performance productivity coach for 'DayMaker', an enterprise-grade focus app.
                Analyze the following user data for the date: ${dateData.date}

                DAILY DATA:
                - Tasks Logged: ${JSON.stringify(dateData.data?.tasks || [])}
                - Completion Status: ${dateData.data?.status} (green=perfect, blue=partial, red=none)
                - Volume: ${dateData.data?.completed || 0} tasks completed.

                YEARLY CONTEXT:
                - Total Perfect Days: ${contextStats.green}
                - Current Streak: ${contextStats.streak || 0} days

                TASK:
                1. Identify 1-2 major "Mistakes" or missed opportunities (be direct but professional).
                2. Suggest 1-2 powerful "Solutions" or strategies for the next 24 hours.

                FORMAT:
                Return ONLY a JSON object with this structure:
                {
                    "mistakes": ["string", "string"],
                    "solutions": ["string", "string"]
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean the response (sometimes AI wraps in \`\`\`json)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            console.warn(`Gemini: Model ${modelName} returned invalid JSON.`);
            continue;
        } catch (error) {
            console.warn(`Gemini: Model ${modelName} failed. Trying next...`);
            lastError = error;
            continue;
        }
    }

    console.error("Gemini Service: analyzeDayPerformance failed on all models.", lastError);
    throw lastError;
};

export const getDailyMotivation = async () => {
    if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        throw new Error("API_KEY_MISSING");
    }

    const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro",
        "gemini-pro"
    ];
    let lastError = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = "You are a world-class motivational coach. Provide ONE extremely powerful, unique, and concise motivational quote (max 20 words) for someone starting their day. Just the text.";

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim().replace(/^"|"$/g, '');
            return text;
        } catch (error) {
            console.warn(`Gemini: Model ${modelName} failed. Trying next...`);
            lastError = error;
            continue;
        }
    }

    console.error("Gemini Service: getDailyMotivation failed on all models.", lastError);
    throw lastError;
};
