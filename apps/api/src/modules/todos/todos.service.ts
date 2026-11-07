import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { todos, type Database } from "@template/db";
import type { CreateTodoInput, Todo, UpdateTodoInput } from "@template/shared";

type TodoRecord = typeof todos.$inferSelect;

export function createTodoService(db: Database | null) {
  // In-memory demo store if DATABASE_URL is not set
  const inMemoryStore = new Map<string, Todo>([
    [
      "todo-1",
      {
        id: "todo-1",
        title: "Welcome to VitePlus Full Stack!",
        completed: false,
        createdAt: Date.now() - 3600000,
      },
    ],
    [
      "todo-2",
      {
        id: "todo-2",
        title: "Explore shadcn/ui components in packages/ui",
        completed: true,
        createdAt: Date.now() - 1800000,
      },
    ],
  ]);

  return {
    async list(): Promise<Todo[]> {
      if (!db) {
        return Array.from(inMemoryStore.values()).sort((a, b) => b.createdAt - a.createdAt);
      }
      const records: TodoRecord[] = await db.select().from(todos).orderBy(desc(todos.createdAt));
      return records.map((r: TodoRecord) => ({
        id: r.id,
        title: r.title,
        completed: r.completed,
        createdAt: r.createdAt.getTime(),
      }));
    },

    async create(input: CreateTodoInput): Promise<Todo> {
      const id = randomUUID();
      const createdAt = Date.now();

      if (!db) {
        const item: Todo = {
          id,
          title: input.title,
          completed: false,
          createdAt,
        };
        inMemoryStore.set(id, item);
        return item;
      }

      const [record] = await db
        .insert(todos)
        .values({
          id,
          title: input.title,
          completed: false,
          createdAt: new Date(createdAt),
        })
        .returning();

      if (!record) {
        throw new Error("Failed to insert record");
      }

      return {
        id: record.id,
        title: record.title,
        completed: record.completed,
        createdAt: record.createdAt.getTime(),
      };
    },

    async update(id: string, input: UpdateTodoInput): Promise<Todo | null> {
      if (!db) {
        const existing = inMemoryStore.get(id);
        if (!existing) return null;
        const updated: Todo = { ...existing, ...input };
        inMemoryStore.set(id, updated);
        return updated;
      }

      const [record] = await db.update(todos).set(input).where(eq(todos.id, id)).returning();

      if (!record) return null;

      return {
        id: record.id,
        title: record.title,
        completed: record.completed,
        createdAt: record.createdAt.getTime(),
      };
    },
  };
}
