import { describe, expect, it } from "vite-plus/test";
import { createTodoSchema, todoSchema } from "../src/todos/todos.contracts";

describe("todoSchema", () => {
  it("validates a valid todo item", () => {
    const valid = {
      id: "123",
      title: "Buy milk",
      completed: false,
      createdAt: Date.now(),
    };
    expect(todoSchema.parse(valid)).toEqual(valid);
  });

  it("rejects invalid input for createTodoSchema", () => {
    expect(() => createTodoSchema.parse({ title: "   " })).toThrow("Title is required");
  });
});
