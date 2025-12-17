'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import LoginInput from './LoginInput';
import ErrorAlert from './ErrorAlert';
import LoginButton from './LoginButton';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (result?.ok) {
      router.push('/dashboard');
    } else {
      setError('Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <LoginInput
          id="username"
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
        />
        <LoginInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
        {error && <ErrorAlert message={error} />}
        <LoginButton loading={loading} text="Sign in" />
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          Default login credentials:{' '}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">dev</span> /{' '}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">dev</span>
        </p>
      </div>
    </div>
  );
}
