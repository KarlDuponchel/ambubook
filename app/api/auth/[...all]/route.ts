import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Route API catch-all pour Better Auth
 */
export const { GET, POST } = toNextJsHandler(auth);
