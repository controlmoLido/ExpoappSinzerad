import React from 'react';
import { AuthProvider } from './(tabs)/context/AuthContext'; // Adjust path if needed
import LoginScreen from './(tabs)/index'; // Adjust path

export default function App() {
  return (
    <AuthProvider>
      <LoginScreen />
    </AuthProvider>
  );
}
