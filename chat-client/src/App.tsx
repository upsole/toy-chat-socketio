import styles from "./styles/App.module.css";
import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const Messages: React.FC<{ children: React.ReactNode[] }> = ({ children }) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ref is undefined before first render
    // children as dependency makes sure it will reapply after every msg
    if (divRef.current) {
      divRef.current.scrollTop = divRef.current?.scrollHeight;
    }
  }, [children]);

  if (children.length > 0) {
    return (
      <div className={`${styles.messages} ${styles.highlight}`} ref={divRef}>
        {children}
      </div>
    );
  }
  return <div className={`${styles.messages}`}></div>;
};

type ChatMsg = {
  user: string;
  text: string;
};

function App() {
  const [user, setUser] = useState(localStorage.getItem("username") || "");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [socket, setSocket] = useState<Socket>();

  // useEffect(() => {
  //   if (messages.length < 1) {
  //     return;
  //   }
  //   let timer = setInterval(() => {
  //     console.log("Timer called");
  //     const arr = messages.splice(1, 1);
  //     setMessages(arr);
  //   }, 2000);
  //   return () => clearInterval(timer);
  // });

  useEffect(() => {
    // useEffect triggers twice thanks to StrictMode in dev. So I use the useEffect
    // callback to close connection imperatively on unmount
    if (user) {
      let sckt = io("http://localhost:5040/");
      sckt.emit("connection", { user });
      setSocket(sckt);
      return () => sckt.disconnect() as any;
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
              localStorage.setItem("username", inputVal);
              setUser(inputVal);
              setInputVal("");
            }
          }}
        >
          <h3>Log In</h3>
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Choose your username"
          />
        </form>
      </div>
    );
  }

  if (socket) {
    socket.on("chat message", (msg) => {
      setMessages([...messages, msg]);
    });
    socket.on("disconnect", () => {
      socket.emit("")
    })
  }

  return (
    <main>
      <div className={styles.logoff}>
        <h5>
          Logged in as <span>{user}</span>
        </h5>
        <button
          onClick={() => {
            localStorage.removeItem("username");
            setUser("");
          }}
        >
          Log off
        </button>
      </div>
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
