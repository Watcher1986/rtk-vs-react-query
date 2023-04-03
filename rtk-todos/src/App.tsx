import React, { useRef, useCallback } from 'react';
import { ApiProvider } from '@reduxjs/toolkit/query/react';

import { todoApi, Todo } from './store';

function TodoApp() {
  const { data: todos } = todoApi.useGetAllQuery();
  const [addTodo] = todoApi.useAddTodoMutation();
  const [updateTodo] = todoApi.useUpdateTodoMutation();
  const [deleteTodo] = todoApi.useDeleteTodoMutation();

  const textRef = useRef<HTMLInputElement>(null);

  const onAddTodo = useCallback(() => {
    const text = textRef!.current?.value;
    if (text && text?.length < 3) return;

    addTodo(text ?? '');
    textRef.current!.value = '';
  }, [addTodo]);

  const onToggle = useCallback(
    (todo: Todo) => updateTodo({ ...todo, done: !todo.done }),
    [updateTodo]
  );

  const onDelete = useCallback((todo: Todo) => deleteTodo(todo), [deleteTodo]);

  return (
    <div className='App'>
      <div className='todos'>
        {todos?.map((todo) => (
          <React.Fragment key={todo.id}>
            <div className='todo-item'>
              <input
                type='checkbox'
                checked={todo.done}
                onChange={() => onToggle(todo)}
              />
              <span>{todo.text}</span>
            </div>

            <button onClick={() => onDelete(todo)}>Delete</button>
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

function App() {
  return (
    <ApiProvider api={todoApi}>
      <TodoApp />
    </ApiProvider>
  );
}

export default App;
