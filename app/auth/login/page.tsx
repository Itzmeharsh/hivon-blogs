'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert('Login successful');
  };

  return (
    <div className="p-10">
      <h1>Login</h1>
      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 m-2"
      />
      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 m-2"
      />
      <button onClick={handleLogin} className="bg-green-500 text-white p-2">
        Login
      </button>
    </div>
  );
}