// import { generateChatResponse, validateChatMessage } from "@/lib/ai-chat";
// import { verifyToken } from "@/lib/auth";
// import { connectToMongoDB } from "@/lib/mongodb";
// import { NextRequest, NextResponse } from "next/server";

// export async function POST(request: NextRequest) {
//   try {
//     const { messages } = await request.json();
//     const lastMessage = messages[messages.length - 1].content;

//     //Validate the message
//     const validation = validateChatMessage(lastMessage);
//     if (!validation.valid) {
//       return NextResponse.json({ error: validation.error }, { status: 400 });
//     }

//     //Generate response
//     const result = await generateChatResponse(messages);

//     //Log  chat if user is authenticated
//     // Get user ID from middleware
//     const token = request.cookies.get("auth_token")?.value;
//     if (!token) {
//       return NextResponse.json({ error: "Unauthorized " }, { status: 401 });
//     }
//     const payload = await verifyToken(token);
//     if (!payload) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }
//     const userId = payload.userId;
//     if (userId) {
//       const { db } = await connectToMongoDB();
//       await db.collection("chatHistory").insertOne({
//         userId: payload.userId,
//         message: lastMessage,
//         response: result,
//         timestamp: new Date(),
//       });
//     }
//     return result;
//   } catch (error) {
//     console.error("Chat API error:", error);
//     return NextResponse.json(
//       { error: "Failed to process chat request" },
//       { status: 500 }
//     );
//   }
// }

import { type NextRequest, NextResponse } from "next/server"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

export async function POST(request: NextRequest) {
  try {
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 })
    }

    const { messages, context } = await request.json()

    // System prompt to make the AI helpful for medical/pharmacy queries
    const systemPrompt = {
      role: "system",
      content: `You are MediBot, an AI assistant for MediFind Ghana - a platform that helps people find medicines at pharmacies across Ghana. 

Your role is to:
1. Help users with general health and medicine information
2. Provide guidance on common medications and their uses
3. Suggest when users should consult healthcare professionals
4. Help users understand how to use the MediFind Ghana platform
5. Answer questions about pharmacy services and medicine availability

Important guidelines:
- Always recommend consulting healthcare professionals for serious medical concerns
- Do not provide specific medical diagnoses or prescriptions
- Focus on general health education and platform assistance
- Be culturally sensitive to Ghanaian context
- Encourage users to verify medicine availability through the platform
- Remind users that medicine prices and availability can change

Context about MediFind Ghana:
- Users can search for medicines across pharmacies in Ghana
- Pharmacies can register and update their inventory
- Users can report medicine availability
- SMS integration allows users to search via text messages
- The platform covers major cities like Accra, Kumasi, Tamale, etc.

${context ? `Additional context: ${context}` : ""}`,
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://medifind-ghana.vercel.app", // Your site URL
        "X-Title": "MediFind Ghana", // Your site name
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-0528:free",
        messages: [systemPrompt, ...messages],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("OpenRouter API error:", errorData)
      return NextResponse.json({ error: "Failed to get response from AI" }, { status: 500 })
    }

    const data = await response.json()

    return NextResponse.json({
      message: data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.",
      usage: data.usage,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
