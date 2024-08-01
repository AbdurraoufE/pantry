"use client"
import { useState } from 'react';
import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [
    signInWithEmailAndPassword,
    user,
    loading,
    authError
  ] = useSignInWithEmailAndPassword(auth);

  //redirect to pantry app/UI screen
  const router = useRouter();

  const handleSignIn = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }
    try {
      const res = signInWithEmailAndPassword(email, password);
      console.log({ res });
      sessionStorage.setItem("user", true);
      setEmail("");
      setPassword("");
      router.push("/")
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="sign-in-container">
      <div className="sign-in-box">
        <h2 className="sign-in-title">Sign In to Your Account</h2>
        <form className="sign-in-form" onSubmit={handleSignIn}>
          <input
            type="email"
            placeholder="Email address"
            className="sign-in-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="sign-in-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="sign-in-button">Sign In</button>
          <p className="already-account" onClick={() => router.push("/sign-up")}> Don't have an account?</p>
        </form>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        {authError && <p>Error: {authError.message}</p>}
      </div>
    </div>
  );
};

export default SignIn;
