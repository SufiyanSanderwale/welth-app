import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
    const models = await genAI.listModels();
    console.log(models);
}

main().catch(console.error);
