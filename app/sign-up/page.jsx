"use client"
import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [
    createUserWithEmailAndPassword,
    user,
    loading,
    authError
  ] = useCreateUserWithEmailAndPassword(auth);

  const handleSignUp = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }
    try {
      await createUserWithEmailAndPassword(email, password);
      console.log({ user });
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
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {authError && <p>Error: {authError.message}</p>}
      </div>
    </div>
  );
};

export default SignUp;