/* 
  할 일 목록을 관리하고 렌더링하는 주요 컴포넌트입니다.
  상태 관리를 위해 `useState` 훅을 사용하여 할 일 목록과 입력값을 관리합니다.
  할 일 목록의 추가, 삭제, 완료 상태 변경 등의 기능을 구현하였습니다.
*/
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import TodoItem from "@/components/TodoItem";
import styles from "@/styles/TodoList.module.css";

//firebase 모듈 불러오기 
import { db } from "@/firebase";
import {
  collection,
  query,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  where,
} from "firebase/firestore";

//db의 todos 컬렉션 참조 만들기. 잘못된 컬렉션 이름 사용 방지
const todoCollection = collection(db, "todos");


// TodoList 컴포넌트를 정의합니다.
const TodoList = () => {
  // 상태를 관리하는 useState 훅을 사용하여 할 일 목록과 입력값을 초기화합니다.
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const { data } = useSession();
  //----- const [selectedDate, setSelectedDate] = useState(null);


  //+++++
  const getTodos = async () => {
    //const q = query(todoCollection);
    // const q = query(collection(db, "todos"), where("user", "==", user.uid));
    //const q = query(todoCollection, orderBy("date", "desc"));

     // const q = query(todoCollection, orderBy("datetime", "asc"));
     if (!data?.user?.name) return;

     const q = query(
       todoCollection,
       where("userId", "==", data?.user?.id),
       orderBy("datetime", "asc")
     );

    //firestore에서 할일 목록 조회
    const results = await getDocs(q);
    const newTodos = [];

    //가져온 할일 목록 newTodos 에 넣기
    results.docs.forEach((doc) => {
      //console.log(Date(todo.timestamp));
      // id 값을 Firestore 에 저장한 값으로 지정하고, 나머지 데이터를 newTodos 배열에 담기
      newTodos.push({ id: doc.id, ...doc.data() });

    });

    setTodos(newTodos);
  }

  useEffect(() => {
    getTodos();
}, [data]);


  // addTodo 함수는 입력값을 이용하여 새로운 할 일을 목록에 추가하는 함수입니다.


  const addTodo = async () => {
    // 입력값이 비어있는 경우 함수를 종료합니다.
    if (input.trim() === "") return;

    const date = new Date();
    const docRef = await addDoc(todoCollection, {
      userId: data?.user?.id,
      text: input,
      completed: false,
      date: date,
    });


    //id 값을 firestore 에 저장한 값으로 지정
    setTodos([...todos, { id: docRef.id, text: input, completed: false, date: date}]);
    setInput("");
    //console.log(Date(addDoc.datet));
  };


  // toggleTodo 함수는 체크박스를 눌러 할 일의 완료 상태를 변경하는 함수입니다.
  const toggleTodo = (id) => {
    // 할 일 목록에서 해당 id를 가진 할 일의 완료 상태를 반전시킵니다.

    
  
      const newTodos = todos.map((todo) => {
        if (todo.id === id) {
          // Firestore 에서 해당 id를 가진 할 일을 찾아 완료 상태 업데이트.
        const todoDoc = doc(todoCollection, id);
        updateDoc(todoDoc, { completed: !todo.completed});
        // ...todo => id: 1, text: "할일1", completed: false
        return { ...todo, completed: !todo.completed};
      } else {
        return todo;
      }  
    });

    setTodos(newTodos);
  };

  // deleteTodo 함수는 할 일을 목록에서 삭제하는 함수입니다.
  const deleteTodo = (id) => {

    //++++
    // Firestore 에서 해당 id를 가진 할 일을 삭제
    const todoDoc = doc(todoCollection, id);
    deleteDoc(todoDoc);


    // 해당 id를 가진 할 일을 제외한 나머지 목록을 새로운 상태로 저장합니다.
    // setTodos(todos.filter((todo) => todo.id !== id));
    setTodos(
      todos.filter((todo) => {
        return todo.id !== id;
      })
    );
  };


 // 컴포넌트를 렌더링합니다.
  return (
    <div className={styles.container}>
      <h1 className="text-xl mb-4 font-bold underline underline-offset-4 decoration-wavy">
      {data?.user?.name}'s Todo List
      </h1>
      {/* 할 일을 입력받는 텍스트 필드입니다. */}
      <input
        type="text"
 
        className="w-full p-1 mb-4 border border-gray-300 rounded"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {/* 할 일을 추가하는 버튼입니다. */}
      <div className="grid">
        <button
     
          className={`w-40
                      justify-self-end
                      p-1 mb-4
                    bg-blue-500 text-white
                      border border-blue-500 rounded
                    hover:bg-white hover:text-blue-500`}
          onClick={addTodo}
        >
          Add Todo
        </button>
        
      </div>
      {/* 할 일 목록을 렌더링합니다. */}
      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={() => toggleTodo(todo.id)}
            onDelete={() => deleteTodo(todo.id)}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;