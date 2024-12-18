import React, { useState } from 'react';


// "Todo" 型の定義をコンポーネント外で行います
type Todo = {
  title: string;
  readonly id: number;
};


// Todo コンポーネントの定義
const Todo: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]); // Todo配列として初期化
  const [text, setText] = useState(''); // テキスト入力用
  const [nextId, setNextId] = useState(1); // 次のTodoのIDを保持するステート

  // todos ステートを更新する関数
  const handleSubmit = () => {
    // 何も入力されていなかったらリターン
    if (!text) return;



    // 新しい Todo を作成
    const newTodo: Todo = {
      title: text, // text ステートの値を content プロパティへ
      id: nextId,
    };

    setTodos((prevTodos) => [newTodo, ...prevTodos]);
    setNextId(nextId + 1); // 次の ID を更新


    // フォームへの入力をクリアする
    setText('');
  };

  const handleEdit = (id: number, value: string) => {
    console.log('handleEdit called:', id, value);
    setTodos((prevTodos) => {
      const newTodos = prevTodos.map((todo) => {
        if (todo.id === id) {
          console.log('Updating todo:', todo);
          return { ...todo, title: value };
        }
        return todo;
      });
      return newTodos;
    });
  };

  // const handleEdit = (id: number, value: string) => {
  //   console.log('handleEdit called:', id, value);
  //   setTodos((todos) => {
  //     /**
  //      * 引数として渡された todo の id が一致する
  //      * 更新前の todos ステート内の
  //      * value(プロパティ)を引数 value (= e.target.value) に書き換える
  //      */
  //     const newTodos = todos.map((todo) => {
  //       if (todo.id === id) {
  //         console.log('Updating todo:', todo);
  //         todo.title = value;
  //       }
  //       return todo;
  //     });


  //     // todos ステートを更新
  //     return newTodos;
  //   });
  // };


  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault(); // フォームのデフォルト動作を防ぐ
          handleSubmit(); // handleSubmit 関数を呼び出す
        }}
      >
        <input
          type="text"
          value={text} // フォームの入力値をステートにバインド
          onChange={(e) => setText(e.target.value)} // 入力値が変わった時にステートを更新
        />
        <button className="insert-btn" type="submit">追加</button>
      </form>
      <ul>
        {todos.map((todo) => {
          return (
            <li key={todo.id}>
              <input
                type="text"
                value={todo.title}
                onChange={(e) => handleEdit(todo.id, e.target.value)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Todo;