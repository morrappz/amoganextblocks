"use server";

import { postgrest } from "@/lib/postgrest";
import IpAddress from "./IPAddress";
import getCurrentBrowser from "./getCurrentBrowser";
// import getUserOS from "./getCurrentOS";
// import getUserLocation from "./geoLocation";

export async function saveUserLogs(payload) {
  console.log("payload-----", payload);
  const payloadData = {
    ...payload,
    user_ip_address: await IpAddress(),
    browser: getCurrentBrowser(),
    // device: getUserOS(),
    // geo_location: await getUserLocation(),
    // operating_system: getUserOS(),
  };
  try {
    const { data, error } = await postgrest
      .from("user_log")
      .insert(payloadData);
    if (error) throw error;
    console.log("here==================", data);
    return { data, success: true };
  } catch (error) {
    console.error("error==============", error);
    throw error;
  }
}
