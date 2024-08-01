"use client"
import { useState } from 'react';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Email:', email);
    console.log('Password:', password);
    // Add your sign-up logic here
  };

  return (
    <div className="sign-up-container">
      <div className="sign-up-box">
        <h2 className="sign-up-title">Create an account</h2>
        <form className="sign-up-form" onSubmit={handleSubmit}>
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
