/* eslint-disable @typescript-eslint/no-explicit-any */
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
  FileJson,
  Globe,
  LoaderCircle,
  MessageCircle,
  Paperclip,
  Plus,
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
import BookMark from "@/app/(authenticated)/langchain-chat/_components/Bookmark";
import Favorites from "@/app/(authenticated)/langchain-chat/_components/Favorites";
import HistoryView from "@/app/(authenticated)/langchain-chat/_components/History";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  isLike?: boolean;
  bookmark?: boolean;
  favorite?: boolean;
};

function ChatMessages(props: {
  messages: Message[];
  emptyStateComponent: ReactNode;
  sourcesForMessages: Record<string, any>;
  aiEmoji?: string;
  className?: string;
  onUpdateMessage: (messageId: string, updates: Partial<Message>) => void;
  setBookmarks: Dispatch<SetStateAction<never[]>>;
  setFavorites: Dispatch<SetStateAction<never[]>>;
}) {
  const handleBookmarkUpdate = async () => {
    const updatedBookmarks = await getChatBookMarks("LangStarter");
    props.setBookmarks(updatedBookmarks);
  };
  const handleFavoriteUpdate = async () => {
    const updatedBookmarks = await getChatFavorites("LangStarter");
    props.setFavorites(updatedBookmarks);
  };
  return (
    <div className="flex flex-col mt-5 max-w-[768px] mx-auto pb-12 w-full">
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
            onBookmarkUpdate={handleBookmarkUpdate}
            onFavoriteUpdate={handleFavoriteUpdate}
          />
        );
      })}
    </div>
  );
}

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

function ScrollToBottom(props: { className?: string }) {
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

function StickyToBottomContent(props: {
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

export function ChatLayout(props: { content: ReactNode; footer: ReactNode }) {
  return (
    <StickToBottom>
      <StickyToBottomContent
        className="absolute inset-0"
        contentClassName="py-8 px-2"
        content={props.content}
        footer={
          <div className="sticky  bottom-8 px-2">
            <ScrollToBottom className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4" />
            {props.footer}
          </div>
        }
      />
    </StickToBottom>
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
  const msgId = uuidv4();

  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const handleHistory = async () => {
    try {
      const historyData = await getChatHistory("LangStarter");
      setHistory(historyData);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to update history");
    }
  };

  // Fetch initial data when component mounts
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch bookmarks
        const bookmarksData = await getChatBookMarks("LangStarter");
        setBookmarks(bookmarksData);

        // Fetch favorites
        const favoritesData = await getChatFavorites("LangStarter");
        setFavorites(favoritesData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load initial data");
      }
    };

    fetchInitialData();
    handleHistory();
  }, []);

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
      console.log("onFinish message-----", message);
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

          // Create a properly typed message object
          const messageToSave = {
            id: message.id || `msg-${Date.now()}`,
            role: "assistant",
            content: message.content || "",
            isLike: false,
            bookmark: false,
            favorite: false,
            createdAt: new Date(),
          };

          // Save the message to the database
          await saveMessage({
            id: messageToSave.id,
            chatId: chatIdToUse,
            role: messageToSave.role,
            content: messageToSave.content,
            chat_group: "LangStarter",
            status: "active",
            user_id: session?.user?.user_catalog_id || "",
            createdAt: new Date().toISOString(),
            isLike: messageToSave.isLike,
            bookmark: messageToSave.bookmark,
            favorite: messageToSave.favorite,
          });
          handleHistory();
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
      if (props.chatId && session?.user?.user_catalog_id) {
        try {
          const existingMessages = await getMessagesByChatId(props.chatId);
          console.log("existingmessages-----", existingMessages);
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
          }
          setCurrentChatId(props.chatId);
          setMessagesLoaded(true);
        } catch (error) {
          console.error("Failed to load messages:", error);
          setMessagesLoaded(true);
        }
      } else {
        setMessagesLoaded(true);
      }
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

      const intermediateStepMessages = [];
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
  const handleBookmarkUpdate = async () => {
    const updatedBookmarks = await getChatBookMarks("LangStarter");
    setBookmarks(updatedBookmarks);
  };
  const handleHistoryUpdate = async () => {
    const updatedHistory = await getChatHistory("LangStarter");
    setHistory(updatedHistory);
  };
  const handleFavoritesUpdate = async () => {
    const updatedBookmarks = await getChatFavorites("LangStarter");
    setFavorites(updatedBookmarks);
  };
  console.log("messages-----", chat.messages);
  return (
    <div className="flex-1">
      <div className="flex items-center">
        <div className=" w-full justify-end items-center flex   z-50">
          <Coins className="text-yellow-500" />
          <HistoryView
            history={history}
            onHistoryUpdate={handleHistoryUpdate}
          />
          <BookMark
            bookmarks={bookmarks}
            onBookmarkUpdate={handleBookmarkUpdate}
          />
          <Favorites
            favorites={favorites}
            onFavoriteUpdate={handleFavoritesUpdate}
          />
          <Link href="/langchain-chat/chat">
            <Plus className=" text-muted-foreground" />
          </Link>
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
              setBookmarks={setBookmarks}
              setFavorites={setFavorites}
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
