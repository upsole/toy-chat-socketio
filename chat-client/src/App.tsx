import styles from "./styles/App.module.css";
import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

const Messages: React.FC<{ children: React.ReactNode[] }> = ({ children }) => {
  if (children.length > 0) {
    return (
      <div className={`${styles.messages} ${styles.highlight}`}>{children}</div>
    );
  }
  return <div className={`${styles.messages}`}></div>;
};

type ChatMsg = {
  user: string;
  text: string;
};

function App() {
  const [user, setUser] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    if (user) {
      let sckt = io("http://localhost:5040/");
      setSocket(sckt);
    }
  }, [user]);

  if (!user) {
    return (
      <div className={styles.login_container}>
        <form
          action=""
          className={styles.login_form}
          onSubmit={(e) => {
            e.preventDefault();
            if (inputVal) {
              setUser(inputVal);
              setInputVal("");
            }
          }}
        >
          <h3>Log In</h3>
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type your username"
          />
        </form>
      </div>
    );
  }

  if (socket) {
    socket.on("chat message", (msg) => {
      setMessages([...messages, msg]);
    });
  }

  return (
    <main>
      <form
        action=""
        className={styles.chat_input}
        onSubmit={(e) => {
          e.preventDefault();
          if (inputVal && user && socket) {
            socket.emit("chat message", { user, text: inputVal });
            setInputVal("");
          }
        }}
      >
        <input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type and enter"
        />
        <button type="submit">Send</button>
      </form>
      <Messages>
        {messages.map((e, id) => (
          <div key={id}>
            <span>{e.user}: </span>
            <div>{e.text}</div>
          </div>
        ))}
      </Messages>
    </main>
  );
}

export default App;
