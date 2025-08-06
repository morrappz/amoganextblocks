import { ReactNode } from "react";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { IntermediateStep } from "./IntermediateStep";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  isLike?: boolean;
  bookmark?: boolean;
  favorite?: boolean;
};

export function ChatMessages(props: {
  messages: Message[];
  emptyStateComponent: ReactNode;
  sourcesForMessages: Record<string, any>;
  aiEmoji?: string;
  className?: string;
  onUpdateMessage: (messageId: string, updates: Partial<Message>) => void;
  // setBookmarks: Dispatch<SetStateAction<never[]>>;
  // setFavorites: Dispatch<SetStateAction<never[]>>;
}) {
  // const handleBookmarkUpdate = async () => {
  //   const updatedBookmarks = await getChatBookMarks("LangStarter");
  //   props.setBookmarks(updatedBookmarks);
  // };
  // const handleFavoriteUpdate = async () => {
  //   const updatedBookmarks = await getChatFavorites("LangStarter");
  //   props.setFavorites(updatedBookmarks);
  // };
  return (
    <div className="flex flex-col mt-5 -z-10 max-w-[768px] mx-auto pb-12 w-full">
      {props.messages.map((m, i) => {
        if (m.role === "system") {
          return <IntermediateStep key={m.id} message={m} />;
        }

        const sourceKey = (props.messages.length - 1 - i).toString();
        return (
          <ChatMessageBubble
            key={m.id}
            message={m}
            aiEmoji={props.aiEmoji}
            sources={props.sourcesForMessages[sourceKey]}
            onUpdateMessage={props.onUpdateMessage}
            // onBookmarkUpdate={handleBookmarkUpdate}
            // onFavoriteUpdate={handleFavoriteUpdate}
          />
        );
      })}
    </div>
  );
}
