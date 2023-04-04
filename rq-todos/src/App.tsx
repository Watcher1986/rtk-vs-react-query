import React, { useCallback, useRef } from 'react';
import {
  useQuery,
  useMutation,
  QueryClientProvider,
  QueryClient,
} from 'react-query';
import axios from 'axios';
import { ReactQueryDevtools } from 'react-query/devtools';

import { getTodos, Todo, updateTodo, deleteTodo, createTodo } from './lib/api';

export const axiosClient = axios.create({
  baseURL: 'http://localhost:4000',
});

const queryClient = new QueryClient();

function TodoApp() {
  // const { data: todos } = useQuery<Todo[]>('todos', getTodos, {
  //   initialData: [],
  // });
  const { data: todos } = useQuery<Todo[]>(
    'todos',
    async () => (await axiosClient.get<Todo[]>('/todos')).data,
    {
      initialData: [],
    }
  );
  // const updateMutation = useMutation(updateTodo, {
  //   onSuccess: () => queryClient.invalidateQueries('todos'),
  // });
  const updateMutation = useMutation<Response, unknown, Todo>(
    (todo) => axiosClient.put(`/todos/${todo.id}`, todo),
    {
      onSettled: () => queryClient.invalidateQueries('todos'),
    }
  );
  // const deleteMutation = useMutation(deleteTodo, {
  //   onSuccess: () => queryClient.invalidateQueries('todos'),
  // });
  const deleteMutation = useMutation<Response, unknown, Todo>(
    ({ id }) => axiosClient.delete(`/todos/${id}`),
    {
      onSettled: () => queryClient.invalidateQueries('todos'),
    }
  );
  // const createMutation = useMutation(createTodo, {
  //   onSuccess: () => queryClient.invalidateQueries('todos'),
  // });
  const createMutation = useMutation<Response, unknown, { text: string }>(
    (data) => axiosClient.post('/todos', data),
    {
      onSettled: () => {
        queryClient.invalidateQueries('todos');
        textRef.current!.value = '';
      },
    }
  );

  const textRef = useRef<HTMLInputElement>(null);

  const onAddTodo = useCallback(() => {
    const text = textRef!.current?.value;
    if (text && text?.length < 3) return;

    createMutation.mutate({ text: text ?? '' });
    textRef.current!.value = '';
  }, [createMutation]);

  return (
    <div className='App'>
      <div className='todos'>
        {todos?.map((todo) => (
          <React.Fragment key={todo.id}>
            <div className='todo-item'>
              <input
                type='checkbox'
                checked={todo.done}
                onChange={() => {
                  updateMutation.mutate({ ...todo, done: !todo.done });
                }}
              />
              <span>{todo.text}</span>
            </div>

            <button
              onClick={() => {
                deleteMutation.mutate(todo);
              }}
            >
              Delete
            </button>
          </React.Fragment>
        ))}
      </div>
      <div className='add'>
        <input type='text' ref={textRef} />
        <button onClick={onAddTodo}>Add</button>
      </div>
    </div>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TodoApp />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};

export default App;
