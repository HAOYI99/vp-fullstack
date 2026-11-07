import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Database } from "@template/db";
import { createTodoSchema, updateTodoSchema } from "@template/shared";
import { createTodoService } from "./todos.service";

type TodoRoutesOptions = {
  db: Database | null;
};

export function createTodoRoutes({ db }: TodoRoutesOptions) {
  const todoService = createTodoService(db);

  return new Hono()
    .get("/", async (c) => {
      const todoList = await todoService.list();
      return c.json(todoList);
    })
    .post("/", zValidator("json", createTodoSchema), async (c) => {
      const input = c.req.valid("json");
      const created = await todoService.create(input);
      return c.json(created, 201);
    })
    .patch("/:id", zValidator("json", updateTodoSchema), async (c) => {
      const id = c.req.param("id");
      const input = c.req.valid("json");
      const updated = await todoService.update(id, input);

      if (!updated) {
        return c.json({ error: "Todo not found" }, 404);
      }

      return c.json(updated);
    });
}
