import React, { useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
    apiKey: process.env.ApiKey,
    authDomain: "typescript-7312a.firebaseapp.com",
    databaseURL: "https://typescript-7312a.firebaseio.com",
    projectId: "typescript-7312a",
    storageBucket: "typescript-7312a.appspot.com",
    messagingSenderId: "38087158690",
    appId: "1:38087158690:web:ba14150242628ad033e0fb",
    measurementId: "G-9QXG8P2XF3",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

export default function App() {
    const [user] = useAuthState(auth);

    return (
        <div className="App">
            <header>
                <h1>
                    My real-time-chat-app
                    <span role="img" aria-label="fiire">
                        🔥🔥
                    </span>
                </h1>
                <SignOut />
            </header>

            <section>{user ? <ChatRoom /> : <SignIn />}</section>
        </div>
    );
}

function SignIn() {
    const SignInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };

    return (
        <button className="sign-in" onClick={SignInWithGoogle}>
            Sign in with google
        </button>
    );
}
function SignOut() {
    return (
        auth.currentUser && (
            <button className="sign-out" onClick={() => auth.signOut()}>
                Sign Out
            </button>
        )
    );
}
function ChatRoom() {
    const dummy = useRef();
    const messagesRef = firestore.collection("messages");
    const query = messagesRef.orderBy("createdAt").limit(25);

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
        dummy.current.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <>
            <main>
                {messages &&
                    messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}

                <span ref={dummy}></span>
            </main>

            <form onSubmit={sendMessage}>
                <input
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="say something nice"
                />

                <button type="submit" disabled={!formValue}>
                    <span aria-label="tweet" role="img">
                        🕊️
                    </span>
                </button>
            </form>
        </>
    );
}
function ChatMessage({ message }) {
    const { uid, text, photoURL } = message;

    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

    return (
        <div className={`message ${messageClass}`}>
            <img alt="avatar" src={photoURL} />
            <p>{text}</p>
        </div>
    );
}
