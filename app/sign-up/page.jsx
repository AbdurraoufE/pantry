"use client"
import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);

  const handleSignUp = async (event) => {
    event.preventDefault();
    try {
      const res = await createUserWithEmailAndPassword(email, password);
      console.log({ res });
      setEmail("");
      setPassword("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="sign-up-container">
      <div className="sign-up-box">
        <h2 className="sign-up-title">Create an account</h2>
        <form className="sign-up-form" onSubmit={handleSignUp}>
          <input
            type="email"
            placeholder="Email address"
            className="sign-up-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="sign-up-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="sign-up-button">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
