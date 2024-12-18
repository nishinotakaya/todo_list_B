import React, { useState, useEffect } from 'react';
import localforage from 'localforage';


// "Todo" 型の定義をコンポーネント外で行います
type Todo = {
  title: string;
  readonly id: number;
  completed_flg: boolean;
  delete_flg: boolean, // <-- 追加
};

type Filter = 'all' | 'completed' | 'unchecked' | 'delete'; // <-- 追加

// Todo コンポーネントの定義
const Todo: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]); // Todoの配列を保持するステート
  const [text, setText] = useState(''); // フォーム入力のためのステート
  const [nextId, setNextId] = useState(1); // 次のTodoのIDを保持するステート
  // 追加
  const [filter, setFilter] = useState<Filter>('all');

  const isFormDisabled = filter === 'completed' || filter === 'delete';
  
  const handleFilterChange = (filter: Filter) => {
    setFilter(filter);
  };

  // todos ステートを更新する関数
  const handleSubmit = () => {
    // 何も入力されていなかったらリターン
    if (!text) return;


    const newTodo: Todo = {
      title: text, // text ステートの値を title プロパティへ
      id: nextId,
      // 初期値は false
      completed_flg: false,
      delete_flg: false, // <-- 追加
    };

    setTodos((prevTodos) => [newTodo, ...prevTodos]);
    setNextId(nextId + 1); // 次の ID を更新


    // フォームへの入力をクリアする
    setText('');
  };

  const updateTodo = <T extends keyof Todo>(todos: Todo[], id: number, key: T, value: Todo[T]): Todo[] => {
    return todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, [key]: value };
      }
      return todo;
    });
  };

   // フィルタリングされたタスクリストを取得する関数
 const getFilteredTodos = () => {
  switch (filter) {
    case 'completed':
      // 完了済み **かつ** 削除されていないタスクを返す
      return todos.filter((todo) => todo.completed_flg && !todo.delete_flg);
    case 'unchecked':
      // 未完了 **かつ** 削除されていないタスクを返す
      return todos.filter((todo) => !todo.completed_flg && !todo.delete_flg);
    case 'delete':
      // 削除されたタスクを返す
      return todos.filter((todo) => todo.delete_flg);
    default:
      // 削除されていないすべてのタスクを返す
      return todos.filter((todo) => !todo.delete_flg);
  }
};

// 物理的に削除する関数
const handleEmpty = () => {
  setTodos((todos) => todos.filter((todo) => !todo.delete_flg));
};

const handleTodo = <K extends keyof Todo, V extends Todo[K]>(
  id: number,
  key: K,
  value: V
) => {
  setTodos((todos) => {
    const newTodos = todos.map((todo) => {
      if (todo.id === id) {
        return { ...todo, [key]: value };
      } else {
        return todo;
      }
    });

    return newTodos;
  });
};


// useEffect フックを使ってコンポーネントのマウント時にデータを取得
useEffect(() => {
  localforage.getItem('todo-20240622').then((values) => {
    if (values) {
      setTodos(values as Todo[]);
    }
  });
}, []);


// useEffect フックを使って todos ステートが更新されるたびにデータを保存
useEffect(() => {
  localforage.setItem('todo-20240622', todos);
}, [todos]);

return (
  <div className="todo-container">
    <select
      defaultValue="all"
      onChange={(e) => handleFilterChange(e.target.value as Filter)}
    >
      <option value="all">すべてのタスク</option>
      <option value="completed">完了したタスク</option>
      <option value="unchecked">現在のタスク</option>
      <option value="delete">ごみ箱</option>
    </select>
    {/* フィルターが `delete` のときは「ごみ箱を空にする」ボタンを表示 */}
    {filter === 'delete' ? (
      <button onClick={handleEmpty}>
        ごみ箱を空にする
      </button>
    ) : (
      // フィルターが `completed` でなければ Todo 入力フォームを表示
      filter !== 'completed' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <input
            type="text"
            value={text} // フォームの入力値をステートにバインド
            onChange={(e) => setText(e.target.value)} // 入力値が変わった時にステートを更新
          />
          <button type="submit">追加</button>
        </form>
      )
    )}
    <ul>
      {getFilteredTodos().map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            disabled={todo.delete_flg}
            checked={todo.completed_flg}
            onChange={() => handleTodo(todo.id, 'completed_flg', !todo.completed_flg)}
          />
          <input
            type="text"
            disabled={todo.completed_flg || todo.delete_flg}
            value={todo.title}
            onChange={(e) => handleTodo(todo.id, 'title', e.target.value)}
          />
          <button onClick={() => handleTodo(todo.id, 'delete_flg', !todo.delete_flg)}>
            {todo.delete_flg ? '復元' : '削除'}
          </button>
        </li>
      ))}
    </ul>
  </div>
);
};

export default Todo;