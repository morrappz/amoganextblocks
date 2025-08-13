//Chat Message Bubble

import { getChatBookMarks } from "@/app/(authenticated)/langchain-chat/lib/actions";
import { cn } from "@/utils/cn";
import {
  AlarmClockCheck,
  Bookmark,
  Copy,
  Ellipsis,
  Heart,
  Star,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChartRenderer } from "../ChartRenderer";

import { useSession } from "next-auth/react";
import ShareMenu from "../MenuItems/ShareMenu";
import RenderTable from "../RenderTable";
import AnalyticCardFileApi from "../AnalyticCardFileApi/AnalyticCardFileApi";
import ShareFileMenu from "../AnalyticCardFileApi/ShareMenu";
import AnalyticCard from "./AnalyticCard";
import { ChartData } from "../types/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  isLike?: boolean;
  bookmark?: boolean;
  favorite?: boolean;
  table_columns?: string[];
  chart?: ChartData;
  analysisPrompt?: { text: string; data: any };
};

interface Props {
  message: Message;
  aiEmoji?: string;
  sources: any[];
  onUpdateMessage: (messageId: string, updates: Partial<Message>) => void;
  onBookmarkUpdate?: () => void;
  onFavoriteUpdate?: () => void;
  parsedMessage: any;
  tableColumns?: string[] | undefined;
  onAnalyzeData?: (messageId: string, data: any) => Promise<void>; // New prop
  onDismissAnalysisPrompt?: (messageId: string) => void; // New prop
}

export const AssistantMessageBubble = React.memo(function ChatMessageBubble(
  props: Props
) {
  const { message, onUpdateMessage, parsedMessage } = props;
  const { data: session } = useSession();

  const assistantResponse = Array.isArray(parsedMessage) ? (
    <AnalyticCard data={parsedMessage} tableColumns={props.tableColumns} />
  ) : (
    parsedMessage
  );

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
          "rounded-[24px] px-4 py-2 md:max-w-[80%]  max-w-[95%] flex flex-col",
          message.role === "user"
            ? "bg-secondary text-secondary-foreground"
            : " text-muted-foreground md:min-w-[80%]"
        )}
      >
        <div className="whitespace-pre-wrap flex flex-col">
          <div>
            {message.role === "assistant" ? assistantResponse : message.content}
          </div>
          {message.role === "assistant" && message.analysisPrompt && (
            <div className="border-t-2 flex items-center  gap-2.5">
              <h1>{message.analysisPrompt.text}</h1>
              <div className="flex gap-2.5 mt-1">
                <Button
                  variant={"outline"}
                  className="rounded-full"
                  onClick={() =>
                    props.onAnalyzeData?.(
                      message.id,
                      message.analysisPrompt?.data
                    )
                  }
                >
                  Yes
                </Button>
                <Button
                  variant={"outline"}
                  className="rounded-full"
                  onClick={() => props.onDismissAnalysisPrompt?.(message.id)}
                >
                  No
                </Button>
              </div>
            </div>
          )}

          {message.role === "assistant" && (
            <div className="flex justify-between items-center">
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
              {Array.isArray(parsedMessage) && (
                <ShareFileMenu data={parsedMessage} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
