// chat window

"use client";

// import { type Message } from "ai";
import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { toast } from "sonner";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

import { ChatMessageBubble } from "@/components/chat/ChatMessageBubble";
import { IntermediateStep } from "./IntermediateStep";
import { Button } from "../ui/button";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  Coins,
  Ellipsis,
  FileJson,
  Globe,
  HandHelping,
  LoaderCircle,
  Logs,
  MessageCircle,
  Paperclip,
  Plus,
  Settings,
  Settings2,
} from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { UploadDocumentsForm } from "./UploadDocumentsForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { cn } from "@/utils/cn";
import {
  createChat,
  saveMessage,
  getMessagesByChatId,
  updateMessageStatus,
  getChatBookMarks,
  getChatHistory,
  getChatFavorites, // Add this function to your actions
} from "@/app/(authenticated)/langchain-chat/lib/actions";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { saveUserLogs } from "@/utils/userLogs";
import getCurrentBrowser from "@/utils/getCurrentBrowser";
import getUserOS from "@/utils/getCurrentOS";
import getUserLocation from "@/utils/geoLocation";
import { ChatInput } from "./ChatInput";
import { ChatLayout } from "./ChatLayout";
import History from "./MenuItems/History";
import BookMark from "./MenuItems/Bookmark";
import Favorites from "./MenuItems/Favorites";
import { ChatMessages } from "./ChatMessages";
import SuggestedPrompts from "./MenuItems/SuggestedPrompts";
import Assistants from "./MenuItems/Assistants";

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

type IntermediateStepType = {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
  isLike: boolean;
  bookmark: boolean;
  favorite: boolean;
  chart?: string;
};

export function ScrollToBottom(props: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;
  return (
    <Button
      variant="outline"
      className={props.className}
      onClick={() => scrollToBottom()}
    >
      <ArrowDown className="w-4 h-4" />
      <span>Scroll to bottom</span>
    </Button>
  );
}

export function StickyToBottomContent(props: {
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const context = useStickToBottomContext();

  // scrollRef will also switch between overflow: unset to overflow: auto
  return (
    <div
      ref={context.scrollRef}
      style={{ width: "100%", height: "100%" }}
      className={cn("grid grid-rows-[1fr,auto]", props.className)}
    >
      <div ref={context.contentRef} className={props.contentClassName}>
        {props.content}
      </div>

      {props.footer}
    </div>
  );
}

export function ChatWindow(props: {
  endpoint: string;
  emptyStateComponent: ReactNode;
  placeholder?: string;
  emoji?: string;
  showIngestForm?: boolean;
  showIntermediateStepsToggle?: boolean;
  chatId?: string;
}) {
  const [showIntermediateSteps, setShowIntermediateSteps] = useState(
    !!props.showIntermediateStepsToggle
  );
  const [intermediateStepsLoading, setIntermediateStepsLoading] =
    useState(false);
  const [currentChatId, setCurrentChatId] = useState(props.chatId);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [selectedAIModel, setSelectedAIModel] = useState("openai");
  const msgId = uuidv4();

  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});

  const [history, setHistory] = useState([]);
  const [bookmarks, setBookMarks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [bookMarkLoading, setBookMarkLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Fetch history when dropdown opens
  const fetchHistory = async () => {
    if (historyLoading) return; // Prevent multiple calls

    setHistoryLoading(true);
    try {
      const response = await getChatHistory("LangStarter");
      setHistory(response);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Error fetching History");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch Bookmarks

  const fetchBookMarks = async () => {
    if (bookMarkLoading) return;
    setBookMarkLoading(true);
    try {
      const response = await getChatBookMarks("LangStarter");
      setBookMarks(response);
    } catch (error) {
      console.error("Error fetching Bookmarks:", error);
      toast.error("Error fetching Bookmarks");
      throw error;
    } finally {
      setBookMarkLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (favoriteLoading) return; // Fixed: was checking bookMarkLoading instead of favoriteLoading
    setFavoriteLoading(true);
    try {
      const response = await getChatFavorites("LangStarter");
      setFavorites(response);
    } catch (error) {
      console.error("Error fetching Favorites:", error);
      toast.error("Error fetching Favorites");
      throw error;
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Function to refresh history after operations like delete
  const refreshHistory = async () => {
    await fetchHistory();
  };

  const refreshBookMarks = async () => {
    await fetchBookMarks();
  };

  const refreshFavorites = async () => {
    await fetchFavorites();
  };

  useEffect(() => {
    const saveLogs = async () => {
      try {
        await saveUserLogs({
          status: "Success",
          description: "Langchain-Chat Page viewed",
          event_type: "Langchain-Chat Page viewed",
          browser: getCurrentBrowser(),
          device: getUserOS(),
          geo_location: await getUserLocation(),
          operating_system: getUserOS(),
        });
      } catch (error) {
        throw error;
      }
    };
    saveLogs();
  }, []);

  const { data: session } = useSession();

  const chat = useChat({
    api: props.endpoint,
    id: currentChatId,
    body: {
      language: selectedLanguage,
      aiModel: selectedAIModel,
    },
    onResponse(response) {
      const sourcesHeader = response.headers.get("x-sources");
      const sources = sourcesHeader
        ? JSON.parse(Buffer.from(sourcesHeader, "base64").toString("utf8"))
        : [];

      const messageIndexHeader = response.headers.get("x-message-index");
      if (sources.length && messageIndexHeader !== null) {
        setSourcesForMessages({
          ...sourcesForMessages,
          [messageIndexHeader]: sources,
        });
      }
    },
    streamMode: "text",
    onError: (e) =>
      toast.error(`Error while processing your request`, {
        description: e.message,
      }),
    onFinish: async (message) => {
      // Save assistant messages to the database
      if (message.role === "assistant") {
        try {
          let chatIdToUse = currentChatId;
          if (!chatIdToUse) {
            const pathParts = window.location.pathname.split("/");
            const chatIdFromUrl = pathParts[pathParts.length - 1];
            chatIdToUse =
              chatIdFromUrl && chatIdFromUrl !== "chat"
                ? chatIdFromUrl
                : uuidv4();
          }

          // Save the original message content to the database
          await saveMessage({
            id: message.id || `msg-${Date.now()}`,
            chatId: chatIdToUse,
            role: "assistant",
            content: message.content, // Save original content
            chat_group: "LangStarter",
            status: "active",
            user_id: session?.user?.user_catalog_id || "",
            createdAt: new Date().toISOString(),
            isLike: false,
            bookmark: false,
            favorite: false,
          });
          // handleHistory();
        } catch (error) {
          console.error("Failed to save assistant message:", error);
          toast.error("Failed to save assistant message");
          await saveUserLogs({
            status: "failure",
            description: "Assistant message failed to save",
            event_type: "Assistant message save failed",
            browser: getCurrentBrowser(),
            device: getUserOS(),
            geo_location: await getUserLocation(),
            operating_system: getUserOS(),
            response_error: true,
            error_message: error,
          });
        }
      }
    },
    generateId: () => uuidv4(),
  });

  // Function to update message status
  const handleUpdateMessage = async (
    messageId: string,
    updates: Partial<Message>
  ) => {
    try {
      // Update local state
      const updatedMessages = chat.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      chat.setMessages(updatedMessages);

      // Update database if currentChatId exists
      if (currentChatId) {
        await updateMessageStatus({
          messageId,
          isLike: updates.isLike,
          bookmark: updates.bookmark,
          favorite: updates.favorite,
        });

        // Show appropriate toast message
        if (updates.bookmark !== undefined) {
          toast.success(
            updates.bookmark ? "Message bookmarked" : "Bookmark removed"
          );
        }
        if (updates.favorite !== undefined) {
          toast.success(
            updates.favorite ? "Message favorited" : "Favorite removed"
          );
        }
        if (updates.isLike !== undefined) {
          toast.success(updates.isLike ? "Message liked" : "Like removed");
        }
      }
    } catch (error) {
      console.error("Failed to update message status:", error);
      toast.error("Failed to update message status");
    }
  };

  // Load existing messages when component mounts or chatId changes
  useEffect(() => {
    const loadMessages = async () => {
      setMessagesLoaded(false); // Reset loading state

      if (props.chatId && session?.user?.user_catalog_id) {
        try {
          const existingMessages = await getMessagesByChatId(props.chatId);
          if (existingMessages && existingMessages.length > 0) {
            // Convert database messages to useChat format
            const formattedMessages: Message[] = existingMessages.map(
              (msg: any) => ({
                id: msg.id,
                role: msg.role as "user" | "assistant" | "system",
                content: msg.content,
                createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
                isLike: msg.isLike,
                bookmark: msg.bookmark,
                favorite: msg.favorite,
              })
            );
            chat.setMessages(formattedMessages);
          } else {
            // No messages found, clear the chat
            chat.setMessages([]);
          }
        } catch (error) {
          console.error("Failed to load messages:", error);
          chat.setMessages([]); // Clear messages on error
        }
      } else {
        // No chatId provided (new chat), clear everything
        chat.setMessages([]);
        // Clear sources and reset other states
        setSourcesForMessages({});
      }

      setMessagesLoaded(true);
    };

    loadMessages();
  }, [props.chatId, session?.user?.user_catalog_id]);

  const createNewChatAndRedirect = async (userMessage: string) => {
    try {
      const newChatId = uuidv4();

      await createChat({
        id: newChatId,
        title: userMessage.slice(0, 100), // Limit title length
        chat_group: "LangStarter",
        status: "active",
        user_id: session?.user?.user_catalog_id,
        createdAt: new Date().toISOString(),
      });

      setCurrentChatId(newChatId);

      // Update URL without page reload
      window.history.replaceState(
        window.history.state,
        "",
        `/langchain-chat/chat/${newChatId}`
      );

      // Refresh history after creating new chat
      setTimeout(() => {
        refreshHistory();
      }, 500); // Small delay to ensure the chat is saved

      return newChatId;
    } catch (error) {
      console.error("Failed to create chat:", error);
      toast.error("Failed to create new chat");
      throw error;
    }
  };

  const saveUserMessage = async (
    chatId: string,
    messageId: string,
    content: string
  ) => {
    try {
      await saveMessage({
        id: messageId,
        chatId: chatId,
        role: "user",
        content: content,
        chat_group: "LangStarter",
        status: "active",
        user_id: session?.user?.user_catalog_id,
        createdAt: new Date().toISOString(),
        isLike: false,
        bookmark: false,
        favorite: false,
      });
    } catch (error) {
      console.error("Failed to save user message:", error);
      toast.error("Failed to save user message");
    }
  };

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (chat.isLoading || intermediateStepsLoading) return;

    const userMessage = chat.input;
    if (!userMessage.trim()) return;

    let chatId = currentChatId;

    // Create new chat if this is the first message
    if (!chatId) {
      try {
        chatId = await createNewChatAndRedirect(userMessage);
        setCurrentChatId(chatId);
      } catch (error) {
        console.error(error);
        return; // Exit if chat creation failed
      }
    }

    // Save user message
    const userMessageId = uuidv4();
    await saveUserMessage(chatId, userMessageId, userMessage);

    if (!showIntermediateSteps) {
      // Simple case: let useChat handle the flow and onFinish will save the response
      chat.handleSubmit(e);
      return;
    }

    // Complex case: Handle intermediate steps manually
    setIntermediateStepsLoading(true);

    // Clear input and add user message to UI
    chat.setInput("");
    const messagesWithUserReply = chat.messages.concat({
      id: userMessageId,
      content: userMessage,
      role: "user",
      createdAt: new Date(),
      isLike: false,
      bookmark: false,
      favorite: false,
    });
    chat.setMessages(messagesWithUserReply);

    try {
      const response = await fetch(props.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesWithUserReply,
          show_intermediate_steps: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      setIntermediateStepsLoading(false);

      const responseMessages: Message[] = json.messages;

      // Represent intermediate steps as system messages for display purposes
      const toolCallMessages = responseMessages.filter(
        (responseMessage: Message) => {
          return (
            (responseMessage.role === "assistant" &&
              !!responseMessage.tool_calls?.length) ||
            responseMessage.role === "tool"
          );
        }
      );

      const intermediateStepMessages: IntermediateStepType[] = [];
      for (let i = 0; i < toolCallMessages.length; i += 2) {
        const aiMessage = toolCallMessages[i];
        const toolMessage = toolCallMessages[i + 1];
        intermediateStepMessages.push({
          id: msgId,
          role: "system" as const,
          content: JSON.stringify({
            action: aiMessage.tool_calls?.[0],
            observation: toolMessage.content,
          }),
          createdAt: new Date(),
          isLike: false,
          bookmark: false,
          favorite: false,
        });
      }

      const newMessages = [...messagesWithUserReply];
      for (const message of intermediateStepMessages) {
        newMessages.push(message);
        chat.setMessages([...newMessages]);
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 + Math.random() * 1000)
        );
      }

      const finalAssistantMessage = {
        id: msgId,
        content: responseMessages[responseMessages.length - 1].content,
        role: "assistant" as const,
        createdAt: new Date(),
        isLike: false,
        bookmark: false,
        favorite: false,
      };

      chat.setMessages([...newMessages, finalAssistantMessage]);

      // Save the final assistant message
      try {
        await saveMessage({
          id: msgId,
          chatId: chatId,
          role: "assistant",
          content: finalAssistantMessage.content,
          chat_group: "LangStarter",
          status: "active",
          user_id: session?.user?.user_catalog_id,
          createdAt: new Date().toISOString(),
          isLike: false,
          bookmark: false,
          favorite: false,
        });
      } catch (error) {
        console.error("Failed to save assistant message:", error);
        toast.error("Failed to save assistant message");
      }
    } catch (error) {
      setIntermediateStepsLoading(false);
      console.error("Error in sendMessage:", error);
      toast.error("Failed to process message");
    }
  }

  // Don't render until messages are loaded (or confirmed empty)
  if (!messagesLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoaderCircle className="animate-spin w-8 h-8" />
      </div>
    );
  }
  // const handleBookmarkUpdate = async () => {
  //   const updatedBookmarks = await getChatBookMarks("LangStarter");
  //   setBookmarks(updatedBookmarks);
  // };
  // const handleHistoryUpdate = async () => {
  //   const updatedHistory = await getChatHistory("LangStarter");
  //   setHistory(updatedHistory);
  // };
  // const handleFavoritesUpdate = async () => {
  //   const updatedBookmarks = await getChatFavorites("LangStarter");
  //   setFavorites(updatedBookmarks);
  // };
  // console.log("messages-----", chat.messages);
  return (
    <div className="">
      <div className="flex relative z-50 bg-background items-center">
        <div className=" bg-muted rounded-full p-2.5 ">
          <p className="flex text-sm">
            Model: <span className="capitalize"> {selectedAIModel}</span>
          </p>
        </div>
        <div className=" w-full justify-end items-center flex  gap-2.5 z-50">
          {/* <Coins className="text-yellow-500" />
          <History
            history={history}
            onDropdownOpen={fetchHistory}
            onHistoryUpdate={refreshHistory}
            loading={historyLoading}
          />
          <BookMark
            bookmarks={bookmarks}
            onDropdownOpen={fetchBookMarks}
            onBookMarkUpdate={refreshBookMarks}
            loading={bookMarkLoading}
          /> */}
          <Favorites
            favorites={favorites}
            onDropdownOpen={fetchFavorites}
            onFavoriteUpdate={refreshFavorites}
            loading={favoriteLoading}
          />
          <SuggestedPrompts />
          <Link href="/langchain-chat/chat">
            <Plus className=" text-muted-foreground" />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="w-5 h-5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Assistants />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <History
                    history={history}
                    onDropdownOpen={fetchHistory}
                    onHistoryUpdate={refreshHistory}
                    loading={historyLoading}
                  />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <Coins className="text-yellow-500" />
                    <span>Token Use</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <Logs className="w-5 h-5 text-muted-foreground" />
                    <span>Chat Logs</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    <span>Settings</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ChatLayout
        content={
          chat.messages.length === 0 ? (
            <div>{props.emptyStateComponent}</div>
          ) : (
            <ChatMessages
              aiEmoji={props.emoji}
              messages={chat.messages}
              emptyStateComponent={props.emptyStateComponent}
              sourcesForMessages={sourcesForMessages}
              onUpdateMessage={handleUpdateMessage}
              // setBookmarks={setBookmarks}
              // setFavorites={setFavorites}
            />
          )
        }
        footer={
          <ChatInput
            value={chat.input}
            onChange={chat.handleInputChange}
            onSubmit={sendMessage}
            loading={chat.isLoading || intermediateStepsLoading}
            placeholder={props.placeholder ?? "What's it like to be a pirate?"}
            setSelectedLanguage={setSelectedLanguage}
            setSelectedAIModel={setSelectedAIModel}
          >
            {props.showIngestForm && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="pl-2 pr-3 -ml-2"
                    disabled={chat.messages.length !== 0}
                  >
                    <Paperclip className="size-4" />
                    <span>Upload document</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload document</DialogTitle>
                    <DialogDescription>
                      Upload a document to use for the chat.
                    </DialogDescription>
                  </DialogHeader>
                  <UploadDocumentsForm />
                </DialogContent>
              </Dialog>
            )}

            {props.showIntermediateStepsToggle && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="show_intermediate_steps"
                  name="show_intermediate_steps"
                  checked={showIntermediateSteps}
                  disabled={chat.isLoading || intermediateStepsLoading}
                  onCheckedChange={(e) => setShowIntermediateSteps(!!e)}
                />
                <label htmlFor="show_intermediate_steps" className="text-sm">
                  Show intermediate steps
                </label>
              </div>
            )}
          </ChatInput>
        }
      />
    </div>
  );
}
