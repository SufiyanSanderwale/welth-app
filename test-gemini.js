// test-gemini.js
import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    console.log("Loaded API Key:", process.env.GEMINI_API_KEY?.slice(0, 10) + "...");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello in JSON {\"msg\":\"hi\"}");
    console.log("Response:", result.response.text());
}

test().catch(console.error);
