import { OpenAIStream, StreamingTextResponse } from "ai";
import OpenAI from "openai";

const openai = new OpenAI();

export const runtime = "edge";

interface Character {
  id: number;
  name: string;
  description: string;
  personality: string;
}

export async function POST(req: Request) {
  try {
    // Extraer el contenido de messages
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error(
        "Invalid data format: 'messages' should be a non-empty array.",
      );
    }

    const userMessage = messages.find((message) => message.role === "user");
    if (!userMessage) {
      throw new Error("Invalid data format: No user message found.");
    }

    // Parsear el contenido JSON
    const { characters } = JSON.parse(userMessage.content);

    if (!Array.isArray(characters)) {
      throw new Error("Invalid data format: 'characters' should be an array.");
    }

    // Generar el prompt basado en los personajes recibidos
    const characterDescriptions = characters
      .map((character: Character) => {
        return `${character.name}: ${character.description} Their personality traits are ${character.personality}.`;
      })
      .join("\n");

    const prompt = `Create a short story featuring the following characters:\n${characterDescriptions}\n\nThe story should be captivating, imaginative, and thought-provoking, exploring themes that suit these characters. Make sure to incorporate their unique traits and personalities into the narrative.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: [
        {
          role: "system",
          content: `You are a professional storyteller who has been hired to write a series of short stories for a new anthology. Create a short story featuring the following characters:\n${characterDescriptions}\n\nThe story should be captivating, imaginative, and thought-provoking, exploring themes that suit these characters. Make sure to incorporate their unique traits and personalities into the narrative.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Utiliza OpenAIStream para procesar la respuesta
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error processing request:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
    });
  }
}
