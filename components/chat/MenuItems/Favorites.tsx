"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils";
import { Heart, LoaderCircle, Star, Trash } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  deleteChat,
  getChatFavorites,
} from "@/app/(authenticated)/langchain-chat/lib/actions";
import React from "react";

export interface Props {
  id: string;
  chatId: string;

  content: string;
  createdAt: string;
}

const Favorites = ({
  favorites,
  onFavoriteUpdate,
  onDropdownOpen,
  loading,
  onSendFavorite,
}: {
  favorites: Props[];
  onFavoriteUpdate: () => void;
  onDropdownOpen: () => void;
  loading: boolean;
  onSendFavorite: (content: string) => void;
}) => {
  const handleDelete = async (id: string) => {
    try {
      await deleteChat(id);
      onFavoriteUpdate();
      toast.success("Chat deleted successfully");
    } catch (error) {
      toast.error(`Error deleting chat ${error}`);
      throw error;
    }
  };

  return (
    <div>
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) {
            onDropdownOpen();
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          {/* <Button variant={"ghost"} size={"icon"} className="rounded-full"> */}
          <Heart className="w-5 h-5 cursor-pointer text-muted-foreground" />
          {/* </Button> */}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]" side="bottom" align="end">
          <DropdownMenuGroup className="max-h-[400px] overflow-y-auto ">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <LoaderCircle className="w-6 h-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading favorites...
                </span>
              </div>
            ) : favorites?.length > 0 ? (
              favorites.map((item) => (
                <DropdownMenuItem
                  className="bg-muted  overflow-y-auto mb-2 cursor-pointer"
                  key={item.id}
                  onClick={() => onSendFavorite(item.content)}
                >
                  <div className="flex justify-between w-full items-center">
                    <div className="overflow-ellipsis ">
                      <p className="max-w-[90%] overflow-ellipsis line-clamp-1">
                        {item.content}
                      </p>
                      <p>{formatDate(item.createdAt)}</p>
                    </div>
                    <div className="hover:bg-red-100 rounded-md p-2.5">
                      <Trash
                        // onClick={() => handleDelete(item.id)}
                        className="w-5 cursor-not-allowed h-5 text-red-500"
                      />
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No Favorites available
                </p>
              </div>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Favorites;
