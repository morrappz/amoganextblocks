import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  HttpResponseOutputParser,
  StructuredOutputParser,
} from "langchain/output_parsers";

export const runtime = "edge";

/**
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json(
        { error: "No data provided for analysis" },
        { status: 400 }
      );
    }

    const TEMPLATE = `You are a helpful assistant. Please analyze and summarize the following data in a clear and concise way. Focus on the key points and provide meaningful insights:

{data}`;

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    // Use the first available model (you can adjust this based on your preference)
    const model = new ChatOpenAI({
      temperature: 0.7,
      model: "gpt-4-turbo-preview",
      streaming: false, // Disable streaming for this endpoint
    });

    const outputParser = new HttpResponseOutputParser();

    const chain = prompt.pipe(model).pipe(outputParser);

    const result = await chain.invoke({
      data: typeof data === "string" ? data : JSON.stringify(data, null, 2),
    });

    return NextResponse.json({
      success: true,
      content: result,
    });
  } catch (error) {
    console.error("Error in analyze-data API:", error);
    return NextResponse.json(
      { error: "Failed to analyze data", details: error.message },
      { status: 500 }
    );
  }
}
