import { NextRequest, NextResponse } from "next/server";
import { StreamingTextResponse } from "ai";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export const runtime = "edge";

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ApiRequest {
  data: any;
  messages?: ChatMessage[];
  userPrompt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { data, messages, userPrompt }: ApiRequest = await req.json();

    if (!data) {
      return NextResponse.json(
        { error: "No data provided for analysis" },
        { status: 400 }
      );
    }

    // Initialize the model
    const model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4-turbo-preview",
      streaming: true,
    });

    let chain;
    let input;

    if (userPrompt && messages) {
      // Chat with context mode
      const chatTemplate = `You are a helpful data analysis assistant. You have access to the following data:

{data}

Previous conversation:
{history}

User: {userPrompt}
Assistant:`;

      const prompt = PromptTemplate.fromTemplate(chatTemplate);
      chain = prompt.pipe(model);
      
      // Format conversation history
      const history = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');
      
      input = {
        data: typeof data === "string" ? data : JSON.stringify(data, null, 2),
        history,
        userPrompt
      };
    } else {
      // Simple data analysis mode
      const analysisTemplate = `You are a helpful data analysis assistant. Please analyze and summarize the following data in a clear and concise way. Focus on the key points and provide meaningful insights:

{data}`;

      const prompt = PromptTemplate.fromTemplate(analysisTemplate);
      chain = prompt.pipe(model);
      
      input = {
        data: typeof data === "string" ? data : JSON.stringify(data, null, 2)
      };
    }

    const stream = await chain.stream(input);

    // Convert the stream to a ReadableStream
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (!chunk.content) continue;
            
            let content = '';
            if (Array.isArray(chunk.content)) {
              // Handle array of content parts
              content = chunk.content
                .map(part => {
                  if (typeof part === 'string') return part;
                  if ('text' in part) return part.text;
                  return '';
                })
                .join('');
            } else {
              // Handle string content
              content = String(chunk.content);
            }
            
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new StreamingTextResponse(readableStream);
  } catch (error) {
    console.error("Error in analyze-data API:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error },
      { status: 500 }
    );
  }
}
