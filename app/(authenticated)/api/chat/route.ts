import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";

export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

/**
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    const selectedLanguage = body.language;
    const aiModel = body.aiModel;
    const TEMPLATE = `You are a helpful assistant.
      Current conversation:
      {chat_history}
      User: {input} and note that give the response in  ${selectedLanguage} Language
      AI:`;
    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    /**
     *
     * See a full list of supported models at:
     * https://js.langchain.com/docs/modules/model_io/models/
     */

    const modelsMap = {
      openai: new ChatOpenAI({ temperature: 0.8, model: "gpt-4o-mini" }),
      gemini: new ChatGoogleGenerativeAI({
        temperature: 0.8,
        model: "gemini-2.0-flash",
      }),
      grok: new ChatGroq({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
      }),
      mistral: new ChatMistralAI({
        model: "mistral-large-latest",
        temperature: 0,
      }),
      claude: new ChatAnthropic({
        model: "claude-3-5-sonnet-20240620",
        temperature: 0,
      }),
      deepseek: new ChatDeepSeek({
        model: "deepseek-reasoner",
        temperature: 0,
      }),
    };

    const model = modelsMap[aiModel] || modelsMap["openai"];
    /**
     * Chat models stream message chunks rather than bytes, so this
     * output parser handles serialization and byte-encoding.
     */
    const outputParser = new HttpResponseOutputParser();

    /**
     * Can also initialize as:
     *
     * import { RunnableSequence } from "@langchain/core/runnables";
     * const chain = RunnableSequence.from([prompt, model, outputParser]);
     */
    const chain = prompt.pipe(model).pipe(outputParser);

    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join("\n"),
      input: currentMessageContent,
    });

    return new StreamingTextResponse(stream);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
