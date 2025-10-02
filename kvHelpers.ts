import { getKv } from "./kv.ts";

/**
 * Generic helper for creating records with auto-generated IDs
 */
export async function createRecord<T>(
  prefix: string,
  data: T,
): Promise<{ id: string; data: T }> {
  const kv = await getKv();
  const id = crypto.randomUUID();
  const record = { ...data, createdAt: Date.now() };

  await kv.set([prefix, id], record);

  return { id, data: record as T };
}

/**
 * Get a single record by ID
 */
export async function getRecord<T>(
  prefix: string,
  id: string,
): Promise<T | null> {
  const kv = await getKv();
  const result = await kv.get<T>([prefix, id]);
  return result.value;
}

/**
 * Update a record
 */
export async function updateRecord<T>(
  prefix: string,
  id: string,
  data: Partial<T>,
): Promise<boolean> {
  const kv = await getKv();
  const existing = await kv.get<T>([prefix, id]);

  if (!existing.value) {
    return false;
  }

  const updated = { ...existing.value, ...data, updatedAt: Date.now() };
  await kv.set([prefix, id], updated);

  return true;
}

/**
 * Delete a record
 */
export async function deleteRecord(
  prefix: string,
  id: string,
): Promise<boolean> {
  const kv = await getKv();
  const existing = await kv.get([prefix, id]);

  if (!existing.value) {
    return false;
  }

  await kv.delete([prefix, id]);
  return true;
}

/**
 * List all records with a given prefix
 * Returns array of {id, value} objects
 */
export async function listRecords<T>(
  prefix: string,
  options?: { limit?: number; reverse?: boolean },
): Promise<Array<{ id: string; value: T }>> {
  const kv = await getKv();
  const entries = kv.list<T>({ prefix: [prefix] }, {
    limit: options?.limit,
    reverse: options?.reverse,
  });

  const results: Array<{ id: string; value: T }> = [];

  for await (const entry of entries) {
    const id = entry.key[entry.key.length - 1] as string;
    results.push({ id, value: entry.value });
  }

  return results;
}

/**
 * Count total records with a given prefix
 */
export async function countRecords(prefix: string): Promise<number> {
  const kv = await getKv();
  let count = 0;

  const entries = kv.list({ prefix: [prefix] });
  for await (const _entry of entries) {
    count++;
  }

  return count;
}

/**
 * Atomic increment - useful for counters, likes, views, etc.
 */
export async function incrementCounter(
  key: string[],
  amount = 1,
): Promise<bigint> {
  const kv = await getKv();
  const result = await kv.atomic()
    .sum(key, amount)
    .commit();

  if (!result.ok) {
    throw new Error("Failed to increment counter");
  }

  const current = await kv.get<Deno.KvU64>(key);
  return current.value?.value ?? 0n;
}
