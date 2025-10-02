// Deno KV database connection
// This module provides a singleton KV instance for the application

let kv: Deno.Kv | null = null;

/**
 * Get the KV database instance
 * Creates a new connection if one doesn't exist
 */
export async function getKv(): Promise<Deno.Kv> {
  if (!kv) {
    kv = await Deno.openKv();
    console.log("✅ Deno KV connected");
  }
  return kv;
}

/**
 * Close the KV database connection
 * Useful for cleanup in tests or graceful shutdown
 */
export async function closeKv(): Promise<void> {
  if (kv) {
    kv.close();
    kv = null;
    console.log("🔌 Deno KV disconnected");
  }
}

// Example key patterns for organizing data:
// ["users", userId] - User records
// ["posts", postId] - Blog posts or notes
// ["sessions", sessionId] - User sessions
// ["cache", cacheKey] - Temporary cached data
