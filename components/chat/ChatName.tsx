"use client";
import {
  fetchChatTitle,
  updateChatTitle,
} from "@/app/(authenticated)/langchain-chat/lib/actions";
import { Bookmark, Check, Edit, X } from "lucide-react";
import React from "react";
import { Input } from "../ui/input";
import { toast } from "sonner";

const ChatName = ({ id }: { id?: string }) => {
  const [title, setTitle] = React.useState<string>("");
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [editedTitle, setEditedTitle] = React.useState("");
  const [bookmark, setBookmark] = React.useState(false);

  React.useEffect(() => {
    const getChatTitle = async () => {
      if (id) {
        const chatTitle = await fetchChatTitle(id);
        setTitle(chatTitle.title);
        setBookmark(chatTitle.bookmark);
      }
    };
    getChatTitle();
  }, [id]);

  const handleUpdateTitle = async () => {
    try {
      if (editedTitle) {
        await updateChatTitle(editedTitle, false, id);
        toast.success("Chat title updated successfully");
      }
    } catch (error) {
      console.error("Failed to update chat title:", error);
      toast.error("Failed to update chat title");
    }
    setEditingTitle(false);
  };

  const handleBookmark = async () => {
    const currentTitle = editedTitle || title;
    try {
      await updateChatTitle(currentTitle, !bookmark, id);
      if (bookmark) {
        toast.success("Chat unbookmarked successfully");
      } else {
        toast.success("Chat bookmarked successfully");
      }
    } catch (error) {
      console.error("Failed to bookmark chat:", error);
      toast.error("Failed to bookmark chat");
    }
  };

  console.log("bookmark----", bookmark);

  return (
    <div className="flex items-center gap-2.5">
      <Input
        type="text"
        value={`${editedTitle ? editedTitle : title}`}
        className={`border-0 w-fit max-w-[50% ] ${
          editingTitle ? "border border-primary" : ""
        }`}
        readOnly={!editingTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
      />
      <div className="flex items-center gap-2">
        {editingTitle ? (
          <div className="flex items-center gap-2">
            <Check
              className="w-5 h-5 cursor-pointer"
              onClick={handleUpdateTitle}
            />
            <X
              className="w-5 h-5 cursor-pointer"
              onClick={() => {
                setEditingTitle(false);
                setEditedTitle("");
              }}
            />
          </div>
        ) : (
          <Edit
            className="w-5 h-5 cursor-pointer text-muted-foreground hover:text-primary"
            onClick={() => {
              setEditingTitle(true);
              setEditedTitle(title);
            }}
          />
        )}
        <Bookmark
          onClick={() => {
            setBookmark(!bookmark);
            handleBookmark();
          }}
          className={`w-5 h-5 text-muted-foreground cursor-pointer ${
            bookmark ? "text-primary fill-primary" : ""
          }`}
        />
      </div>
    </div>
  );
};

export default ChatName;
