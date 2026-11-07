import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTodo, listTodos, updateTodo } from "./api";

export const todosQueryOptions = queryOptions({
  queryKey: ["todos"],
  queryFn: listTodos,
});

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: async (data) => {
      toast.success(`Created "${data.title}"`);
      await queryClient.invalidateQueries({ queryKey: todosQueryOptions.queryKey });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    },
  });
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTodo(id, { completed }),
    onSuccess: async (data) => {
      toast.success(data.completed ? "Task completed" : "Task marked active");
      await queryClient.invalidateQueries({ queryKey: todosQueryOptions.queryKey });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update task");
    },
  });
}
