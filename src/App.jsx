import "./App.css";
// import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
// import { collection, getFirestore } from "firebase/firestore";
// import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useEffect, useRef, useState } from "react";

firebase.initializeApp({
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: import.meta.env.VITE_messagingSenderId,
  appId: import.meta.env.VITE_appId,
  measurementId: import.meta.env.VITE_measurementId,
});
const auth = firebase.auth();
const firestore = firebase.firestore();

// const auth = getAuth(app);
// const firestore = getFirestore(app);
function App() {
  // console.log(import.meta.env.VITE_config);
  const [user] = useAuthState(auth);
  return (
    <>
      <div className="App">
        <header>
          <h1>⚛️🔥💬</h1>
          <SignOut />
        </header>
        <section>{user ? <ChatRoom /> : <SignIn />}</section>
      </div>
    </>
  );
}

function ChatRoom() {
  const dummy = useRef(null);
  useEffect(() => {
    dummy.current && dummy.current.scrollIntoView({ behaviour: "smooth" });
  });
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt");
  const [messages] = useCollectionData(query, { idField: "id" });
  const [formValue, setFormValue] = useState("");
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });
    setFormValue("");
    dummy.current.scrollIntoView({ behaviour: "smooth" });
  };
  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => (
            <ChatMessage key={msg.createdAt} message={msg} />
          ))}
        <div ref={dummy} id={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
        />
        <button>🕊️</button>
      </form>
    </>
  );
}
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <div className={`message ${messageClass}`}>
      {/* {console.log(photoURL)} */}
      {photoURL ? (
        <img src={photoURL} />
      ) : (
        <img
          src={"https://cdn-icons-png.flaticon.com/512/3763/3763430.png"}
          width={96}
          height={96}
        />
      )}
      <p>{text}</p>
    </div>
  );
}

// function SignIn() {
//   const signInWithGoogle = () => {
//     const provider = new GithubAuthProvider();
//     signInWithPopup(auth, provider);
//   };
//   return <button onClick={signInWithGoogle}>Sign in with Google</button>;
// }
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
  return (
    auth.currentUser && <button onClick={() => auth.signOut()}>SignOut</button>
  );
}

export default App;
