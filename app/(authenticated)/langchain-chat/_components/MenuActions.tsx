"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Coins, History, Menu, Plus, Star, Trash } from "lucide-react";
import React from "react";
import { deleteChat, getChatHistory } from "../lib/actions";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import HistoryView from "./History";
import Favorites from "./Favorites";
import BookMark from "./Bookmark";

export interface HistoryProps {
  id: string;
  title: string;
  createdAt: string;
}

const MenuActions = () => {
  const [history, setHistory] = React.useState<HistoryProps[]>([]);

  const fetchHistory = React.useCallback(async () => {
    try {
      const data = await getChatHistory("LangStarter");

      setHistory(data);
    } catch (error) {
      toast.error(`Error ${error}`);
      throw error;
    }
  }, []);

  return (
    <div className="flex items-center gap-2.5">
      <Coins className="text-yellow-500 h-5 w-5" />
      <HistoryView history={history} fetchHistory={fetchHistory} />
      <BookMark />
      <Favorites history={history} fetchHistory={fetchHistory} />
      <Link href={`/langchain-chat/chat`}>
        <Plus className="w-5 h-5 text-muted-foreground" />
      </Link>
    </div>
  );
};

export default MenuActions;
