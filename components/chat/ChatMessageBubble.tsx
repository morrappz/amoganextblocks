//Chat Message Bubble

import { getChatBookMarks } from "@/app/(authenticated)/langchain-chat/lib/actions";
import { cn } from "@/utils/cn";
import { AlarmClockCheck, Bookmark, Copy, Heart, Star } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChartRenderer } from "./ChartRenderer";
import AnalyticCard from "./AnalyticCard";
import { useSession } from "next-auth/react";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  isLike?: boolean;
  bookmark?: boolean;
  favorite?: boolean;
  chart?: any; // Can now hold complex chart objects
};

interface Props {
  message: Message;
  aiEmoji?: string;
  sources: any[];
  onUpdateMessage: (messageId: string, updates: Partial<Message>) => void;
  onBookmarkUpdate?: () => void;
  onFavoriteUpdate?: () => void;
  parsedMessage: string;
  chartType: any;
  analyticCard: any;
}

export const ChatMessageBubble = React.memo(function ChatMessageBubble(
  props: Props
) {
  const { message, onUpdateMessage, parsedMessage, chartType, analyticCard } =
    props;
  const { data: session } = useSession();

  const handleBookmark = () => {
    onUpdateMessage(message.id, {
      bookmark: !message.bookmark,
    });
    props.onBookmarkUpdate?.();
  };

  const handleFavorite = () => {
    onUpdateMessage(message.id, {
      favorite: !message.favorite,
    });
    props.onFavoriteUpdate?.();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Message Copied Successfully");
  };

  return (
    <div
      className={cn(
        "mb-8 flex flex-col items-start",
        message.role === "user" && "items-end"
      )}
    >
      <div className="mb-1 w-10 h-10 rounded-full flex items-center justify-center  text-muted-foreground">
        {message.role === "user"
          ? session?.user?.user_name?.[0]?.toUpperCase()
          : props.aiEmoji}
      </div>

      <div
        className={cn(
          "rounded-[24px] px-4 py-2 md:max-w-[80%] max-w-[95%] flex flex-col",
          message.role === "user"
            ? "bg-secondary text-secondary-foreground"
            : " text-muted-foreground"
        )}
      >
        <div className="whitespace-pre-wrap flex flex-col">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ children }) => (
                <table className="my-table">{children}</table>
              ),
              thead: ({ children }) => <thead>{children}</thead>,
              tbody: ({ children }) => <tbody>{children}</tbody>,
              tr: ({ children }) => <tr>{children}</tr>,
              th: ({ children }) => <th>{children}</th>,
              td: ({ children }) => <td>{children}</td>,
              ul: ({ children }) => (
                <ul className="list-disc pl-5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5">{children}</ol>
              ),
              li: ({ children }) => <li className="mb-1">{children}</li>,
            }}
          >
            {message.role === "assistant" ? parsedMessage : message.content}
          </ReactMarkdown>

          {/* Render chart if present */}
          {chartType?.data && <ChartRenderer chartData={chartType} />}
          {analyticCard?.tabs && <AnalyticCard analyticCard={analyticCard} />}
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
    </div>
  );
});
