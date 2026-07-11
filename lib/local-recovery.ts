import { z } from "zod";

const storedRecordSchema = z.object({
  id: z.string().min(1),
  updatedAt: z.string().optional(),
}).passthrough();

const canvasSchema = storedRecordSchema.extend({
  content: z.object({ nodes: z.array(z.unknown()), edges: z.array(z.unknown()) }),
});

export const localRecoveryArchiveSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  origin: z.string(),
  projects: z.array(storedRecordSchema),
  canvases: z.array(canvasSchema),
  images: z.array(storedRecordSchema),
  customers: z.array(storedRecordSchema),
  suppliers: z.array(storedRecordSchema),
  products: z.array(storedRecordSchema),
});

export type LocalRecoveryArchive = z.infer<typeof localRecoveryArchiveSchema>;

export const RECOVERY_KEYS = {
  projects: "ica:projects",
  canvases: "ica:canvases",
  images: "ica:images",
  customers: "ica:workspace:customers",
  suppliers: "ica:workspace:suppliers",
  products: "ica:workspace:products",
} as const;

type RecoverableCollection = keyof typeof RECOVERY_KEYS;

function parseCollection(raw: string | null): z.infer<typeof storedRecordSchema>[] {
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  return z.array(storedRecordSchema).parse(parsed);
}

function newerRecord<T extends z.infer<typeof storedRecordSchema>>(left: T, right: T): T {
  const leftTime = left.updatedAt ? Date.parse(left.updatedAt) : 0;
  const rightTime = right.updatedAt ? Date.parse(right.updatedAt) : 0;
  return rightTime > leftTime ? right : left;
}

export function mergeRecoveryRecords<T extends z.infer<typeof storedRecordSchema>>(
  current: T[],
  incoming: T[],
): T[] {
  const merged = new Map(current.map((record) => [record.id, record]));
  for (const record of incoming) {
    const existing = merged.get(record.id);
    merged.set(record.id, existing ? newerRecord(existing, record) : record);
  }
  return [...merged.values()];
}

async function readIndexedCanvasContent(id: string): Promise<unknown | null> {
  return new Promise((resolve) => {
    const request = indexedDB.open("ica:local-store", 1);
    request.onerror = () => resolve(null);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("canvasContent")) {
        db.close();
        resolve(null);
        return;
      }
      const transaction = db.transaction("canvasContent", "readonly");
      const readRequest = transaction.objectStore("canvasContent").get(id);
      readRequest.onerror = () => resolve(null);
      readRequest.onsuccess = () => {
        db.close();
        resolve(readRequest.result ?? null);
      };
    };
  });
}

export async function createLocalRecoveryArchive(): Promise<LocalRecoveryArchive> {
  const collections = Object.fromEntries(
    Object.entries(RECOVERY_KEYS).map(([name, key]) => [name, parseCollection(localStorage.getItem(key))]),
  ) as Record<RecoverableCollection, z.infer<typeof storedRecordSchema>[]>;

  const canvases = await Promise.all(
    collections.canvases.map(async (canvas) => {
      const indexedContent = await readIndexedCanvasContent(canvas.id);
      return indexedContent ? { ...canvas, content: indexedContent } : canvas;
    }),
  );

  return localRecoveryArchiveSchema.parse({
    version: 1,
    exportedAt: new Date().toISOString(),
    origin: window.location.origin,
    ...collections,
    canvases,
  });
}

export async function importLocalRecoveryArchive(value: unknown): Promise<LocalRecoveryArchive> {
  const archive = localRecoveryArchiveSchema.parse(value);
  for (const name of Object.keys(RECOVERY_KEYS) as RecoverableCollection[]) {
    const current = parseCollection(localStorage.getItem(RECOVERY_KEYS[name]));
    const incoming = archive[name];
    localStorage.setItem(RECOVERY_KEYS[name], JSON.stringify(mergeRecoveryRecords(current, incoming)));
  }
  return archive;
}
