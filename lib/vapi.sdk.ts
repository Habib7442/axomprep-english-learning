import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

export const getVapi = (): Vapi => {
  if (typeof window === "undefined") {
    throw new Error("Vapi can only be used in the browser");
  }
  if (!vapiInstance) {
    const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
    if (!token) {
      throw new Error("NEXT_PUBLIC_VAPI_WEB_TOKEN is not configured");
    }
    vapiInstance = new Vapi(token);
  }
  return vapiInstance;
};