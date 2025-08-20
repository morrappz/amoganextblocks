import { ChatWindow } from "@/components/chat/ChatWindow";
import { GuideInfoBox } from "@/components/chat/GuideInfoBox";

export default function Home() {
  return (
    <div className="w-full  max-w-[800px] mx-auto ">
      <ChatWindow
        key="new-chat"
        endpoint="/api/chat"
        emoji="🏴‍☠️"
        placeholder="Enter prompt..."
        chatId={undefined}
      />
    </div>
  );
}
