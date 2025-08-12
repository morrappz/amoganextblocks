"use server";

import { auth } from "@/auth";
import { postgrest } from "@/lib/postgrest";

export async function getChatHistory(chatGroup: string) {
  const session = await auth();
  const userId = session?.user?.user_catalog_id;
  try {
    const { data, error } = await postgrest
      .from("chat")
      .select("id,title,createdAt")
      .eq("user_id", userId)
      .eq("chat_group", chatGroup)
      .eq("status", "active")
      .order("createdAt", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    return error;
  }
}

export async function getChatBookMarks(chatGroup: string) {
  const session = await auth();
  const userId = session?.user?.user_catalog_id;
  try {
    const { data, error } = await postgrest
      .asAdmin()
      .from("message")
      .select("id,chatId,content,createdAt")
      .eq("user_id", userId)
      .eq("chat_group", chatGroup)
      .eq("bookmark", true)
      .eq("status", "active")
      .order("createdAt", { ascending: true });
    if (error) throw error;

    return data;
  } catch (error) {
    return error;
  }
}

export async function getChatFavorites(chatGroup: string) {
  const session = await auth();
  const userId = session?.user?.user_catalog_id;
  try {
    const { data, error } = await postgrest
      .asAdmin()
      .from("message")
      .select("id, chatId ,content,createdAt")
      .eq("user_id", userId)
      .eq("chat_group", chatGroup)
      .eq("favorite", true)
      .eq("status", "active")
      .order("createdAt", { ascending: true });

    if (error) throw error;

    return data;
  } catch (error) {
    return error;
  }
}

export async function createChat(payload) {
  const session = await auth();
  try {
    const { data, error } = await postgrest.from("chat").insert({
      ...payload,
      business_number: session?.user?.business_number,
      created_user_id: session?.user?.user_catalog_id,
      business_name: session?.user?.business_name,
      created_user_name: session?.user?.user_name,
      user_email: session?.user?.user_email,
      for_business_number: session?.user?.for_business_number,
      for_business_name: session?.user?.for_business_name,
    });
    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    throw error;
  }
}

export async function saveMessage(payload) {
  try {
    const { data, error } = await postgrest
      .asAdmin()
      .from("message")
      .insert(payload);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getMessagesByChatId(chatId: string) {
  const session = await auth();
  try {
    const { data, error } = await postgrest
      .asAdmin()
      .from("message")
      .select("*")
      .eq("chatId", chatId)
      .eq("user_id", session?.user?.user_catalog_id)
      .order("createdAt", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Failed to get messages:", error);
    throw error;
  }
}

export async function deleteChat(id: string) {
  try {
    const { error } = await postgrest
      .from("chat")
      .update({ status: "delete" })
      .eq("id", id);

    if (error) {
      throw new Error("Failed to delete chat");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
}

export async function updateMessageStatus({
  messageId,
  isLike,
  bookmark,
  favorite,
}: {
  messageId: string;
  isLike?: boolean;
  bookmark?: boolean;
  favorite?: boolean;
}) {
  try {
    const updateData: any = {};

    if (isLike !== undefined) {
      updateData.isLike = isLike;
    }
    if (bookmark !== undefined) {
      updateData.bookmark = bookmark;
    }
    if (favorite !== undefined) {
      updateData.favorite = favorite;
    }

    const { data, error } = await postgrest
      .asAdmin()
      .from("message")
      .update(updateData)
      .eq("id", messageId);

    if (error) throw error;

    return { data, success: true };
  } catch (error) {
    console.error("Error updating message status:", error);
    throw new Error("Failed to update message status");
  }
}

export async function getFormSetupData() {
  const session = await auth();
  try {
    const { data, error } = await postgrest
      .from("form_setup")
      .select("form_id,form_name,status,data_api_url,api_connection_json")
      .filter("users_json", "cs", `["${session?.user?.user_email}"]`);
    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function fetchFormSetupData(formId: string) {
  try {
    const { data, error } = await postgrest
      .from("form_setup")
      .select(
        "form_name, form_id, content, data_api_url,content,api_connection_json,db_connection_json,story_api"
      )
      .eq("form_id", formId);
    if (error) return error;
    return data;
  } catch (error) {
    throw error;
  }
}
