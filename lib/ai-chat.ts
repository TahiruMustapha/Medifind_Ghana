import { openai } from "@ai-sdk/openai";
import { streamText,generateText } from "ai";

const SYSTEM_PROMPT = `You are MediBot, a helpful medical assistant for MediFind Ghana. 
You provide information about medications, their uses, side effects, and general health advice.
Important rules:
- Only provide general information about medications and health topics
- Do not diagnose conditions or prescribe medications
- Always advise users to consult healthcare professionals for specific medical advice
- If you're unsure about something, acknowledge your limitations
- Keep responses concise and easy to understand
- For serious medical emergencies, advise users to seek immediate medical attention`;

export async function generateChatResponse(messages: any[]) {
  try {
    const result = await generateText({
      model: openai("gpt-4o"),
      system: SYSTEM_PROMPT,
      messages,
    });

    return result.text;
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw error;
  }
}

export function validateChatMessage(message: string) {
  if (!message || message.trim() === "") {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (message.length > 500) {
    return {
      valid: false,
      error: "Message is too long (maximum 500 characters)",
    };
  }

  return { valid: true };
}
