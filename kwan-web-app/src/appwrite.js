import { Client } from "appwrite";

const APPWRITE_ENDPOINT = import.meta.env?.VITE_APPWRITE_ENDPOINT || "https://fra.cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = import.meta.env?.VITE_APPWRITE_PROJECT_ID || "6aafb1c000071a227cda";

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

export { client };

client
  .ping()
  .then((res) => {
    console.log("[Appwrite] Ping response:", res);
  })
  .catch((err) => {
    console.error("[Appwrite] Ping failed:", err);
  });
