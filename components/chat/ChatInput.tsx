import { cn } from "@/utils/cn";
import React, { FormEvent, ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  ArrowUp,
  Bot,
  FileJson,
  Globe,
  LoaderCircle,
  MessageCircle,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export function ChatInput(props: {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onStop?: () => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  placeholder?: string;
  children?: ReactNode;
  className?: string;
  actions?: ReactNode;
  setSelectedLanguage: (value: string) => void;
  setSelectedAIModel: (value: string) => void;
}) {
  const disabled = props.loading && props.onStop == null;
  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();

        if (props.loading) {
          props.onStop?.();
        } else {
          props.onSubmit(e);
        }
      }}
      className={cn("flex w-full flex-col", props.className)}
    >
      <div className="border border-input bg-secondary rounded-lg flex flex-col gap-2 max-w-[768px] w-full mx-auto">
        <input
          value={props.value}
          placeholder={props.placeholder}
          onChange={props.onChange}
          className="border-none outline-none bg-transparent p-4"
        />

        <div className="flex justify-between ml-4 mr-2 mb-2">
          <div className="flex gap-3">
            <div className="flex gap-2.5 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2.5 bg-muted border-2 p-1  cursor-pointer rounded-full">
                    <Settings2 className="w-5 h-5" />
                    <h1 className="">Tools</h1>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Link
                        href="/langchain-chat/chat"
                        className="flex items-center gap-2.5"
                      >
                        <MessageCircle className="w-5 h-5" /> General
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/langchain-chat/structured_output"
                        className="flex items-center gap-2.5"
                      >
                        <FileJson className="w-5 h-5" /> Structured Output
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/langchain-chat/agents"
                        className="flex items-center gap-2.5"
                      >
                        <Globe className="w-5 h-5" /> Agents
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/langchain-chat/retrieval"
                        className="flex items-center gap-2.5"
                      >
                        <Bot className="w-5 h-5" /> Retrieval
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link
                        href="/langchain-chat/retrieval_agents"
                        className="flex items-center gap-2.5"
                      >
                        <Bot className="w-5 h-5" /> Retrieval Agents
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2.5 bg-muted border-2 p-1  cursor-pointer rounded-full">
                    <Settings2 className="w-5 h-5" />
                    <h1 className="">Language</h1>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => props.setSelectedLanguage("english")}
                    >
                      English
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => props.setSelectedLanguage("hindi")}
                    >
                      Hindi
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => props.setSelectedLanguage("telugu")}
                    >
                      Telugu
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => props.setSelectedLanguage("malaysia")}
                    >
                      Malaysia
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => props.setSelectedLanguage("vietnam")}
                    >
                      Vietnam
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2.5 bg-muted border-2 p-1  cursor-pointer rounded-full">
                    <Settings2 className="w-5 h-5" />
                    <h1 className="">Model</h1>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent defaultValue={"openai"}>
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => props.setSelectedAIModel("openai")}
                    >
                      Open AI
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => props.setSelectedAIModel("gemini")}
                    >
                      Gemini
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => props.setSelectedAIModel("claude")}
                    >
                      Claude
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => props.setSelectedAIModel("deepseek")}
                    >
                      DeepSeek
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => props.setSelectedAIModel("grok")}
                    >
                      Grok
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => props.setSelectedAIModel("mistral")}
                    >
                      Mistral
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {props.children}
          </div>

          <div className="flex gap-2 self-end">
            {props.actions}
            <Button
              size={"icon"}
              type="submit"
              className="self-end rounded-full"
              disabled={disabled}
            >
              {props.loading ? (
                <span role="status" className="flex justify-center">
                  <LoaderCircle className="animate-spin" />
                  <span className="sr-only">Loading...</span>
                </span>
              ) : (
                <span>
                  <ArrowUp className="w-5 h-5" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
