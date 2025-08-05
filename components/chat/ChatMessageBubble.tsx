/* eslint-disable @typescript-eslint/no-explicit-any */

import { cn } from "@/utils/cn";
import { AlarmClockCheck, Bookmark, Copy, Heart, Star } from "lucide-react";
import React from "react";
import { toast } from "sonner";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  isLike?: boolean;
  bookmark?: boolean;
  favorite?: boolean;
};

interface Props {
  message: Message;
  aiEmoji?: string;
  sources: any[];
  onUpdateMessage: (messageId: string, updates: Partial<Message>) => void;
}

export function ChatMessageBubble(props: Props) {
  const { message, onUpdateMessage } = props;

  const handleBookmark = () => {
    onUpdateMessage(message.id, {
      bookmark: !message.bookmark,
    });
  };

  const handleFavorite = () => {
    onUpdateMessage(message.id, {
      favorite: !message.favorite,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Message Copied Successfully");
  };

  return (
    <div
      className={cn(
        `rounded-[24px] max-w-[80%] mb-8 flex`,
        message.role === "user"
          ? "bg-secondary text-secondary-foreground px-4 py-2"
          : null,
        message.role === "user" ? "ml-auto" : "mr-auto"
      )}
    >
      {message.role !== "user" && (
        <div className="mr-4 border bg-secondary -mt-2 rounded-full w-10 h-10 flex-shrink-0 flex items-center justify-center">
          {props.aiEmoji}
        </div>
      )}

      <div className="whitespace-pre-wrap flex flex-col">
        <span>{message.content}</span>
        {message.role === "assistant" && (
          <div className="flex items-center gap-2.5 mt-2">
            <Copy
              onClick={handleCopy}
              className="h-5 w-5 cursor-pointer hover:text-primary text-muted-foreground"
            />
            <Bookmark
              onClick={handleBookmark}
              className={`h-5 w-5 ${
                message.bookmark ? "fill-primary text-primary" : ""
              } cursor-pointer hover:text-primary text-muted-foreground`}
            />

            <Star
              onClick={handleFavorite}
              className={`h-5 w-5 ${
                message.favorite ? "fill-yellow-500 text-yellow-500" : ""
              } cursor-pointer hover:text-yellow-600 text-muted-foreground`}
            />
            <AlarmClockCheck className="h-5 cursor-pointer hover:text-primary w-5 text-muted-foreground" />
          </div>
        )}

        {props.sources && props.sources.length ? (
          <>
            <code className="mt-4 mr-auto bg-primary px-2 py-1 rounded">
              <h2>🔍 Sources:</h2>
            </code>
            <code className="mt-1 mr-2 bg-primary px-2 py-1 rounded text-xs">
              {props.sources?.map((source, i) => (
                <div className="mt-2" key={"source:" + i}>
                  {i + 1}. &quot;{source.pageContent}&quot;
                  {source.metadata?.loc?.lines !== undefined ? (
                    <div>
                      <br />
                      Lines {source.metadata?.loc?.lines?.from} to{" "}
                      {source.metadata?.loc?.lines?.to}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              ))}
            </code>
          </>
        ) : null}
      </div>
    </div>
  );
}
