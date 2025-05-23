import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nomError, setNomError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const log = {
    success: (msg: string) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
    warn: (msg: string) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
    error: (msg: string) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
    info: (msg: string) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  };

  const handleRegister = async () => {
    log.info('Register button pressed');
    console.log('Current input values:', { nom, email, password, confirmPassword });

    setNomError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    let hasError = false;

    if (!nom) {
      setNomError('Username is required');
      log.warn('Missing username');
      hasError = true;
    }

    if (!email) {
      setEmailError('Email is required');
      log.warn('Missing email');
      hasError = true;
    } else if (!email.includes('@')) {
      setEmailError('Invalid email format');
      log.warn('Email format is incorrect');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      log.warn('Missing password');
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      log.warn('Missing confirm password');
      hasError = true;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      log.warn('Password mismatch');
      hasError = true;
    }

    if (hasError) {
      log.error('Validation failed. Aborting registration.');
      return;
    }

    try {
      log.info('Sending registration request...');
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, email, password }),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        log.success('User registered successfully!');
        Alert.alert('Success', 'Account created. Please log in.');
        setNom('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        router.push('/');
      } else {
        log.warn(`Registration failed: ${data.error}`);
        if (data.error?.toLowerCase().includes('username')) {
          setNomError('Username already exists');
        }
        if (data.error?.toLowerCase().includes('email')) {
          setEmailError('Email already exists');
        } else {
          Alert.alert('Registration Failed', data.error || 'Unknown error');
        }
      }
    } catch (error) {
      log.error('Registration failed due to network or server error');
      console.error('Register error:', error);
      Alert.alert('Error', 'Network error or backend not running');
    }
  };

  return (
    <LinearGradient colors={['#00416A', '#E4E5E6']} style={styles.gradient}>
      <View style={styles.card}>
        <Text style={styles.title}>Register</Text>

        <TextInput
          style={[styles.input, nomError && styles.inputError]}
          placeholder="Username"
          placeholderTextColor="#888"
          value={nom}
          onChangeText={text => {
            setNom(text);
            if (nomError) setNomError('');
          }}
          autoCapitalize="none"
        />
        {nomError ? <Text style={styles.errorText}>{nomError}</Text> : null}

        <TextInput
          style={[styles.input, emailError && styles.inputError]}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={text => {
            setEmail(text);
            if (emailError) setEmailError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <TextInput
          style={[styles.input, passwordError && styles.inputError]}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          secureTextEntry
          onChangeText={text => {
            setPassword(text);
            if (passwordError) setPasswordError('');
          }}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <TextInput
          style={[styles.input, confirmPasswordError && styles.inputError]}
          placeholder="Confirm Password"
          placeholderTextColor="#888"
          value={confirmPassword}
          secureTextEntry
          onChangeText={text => {
            setConfirmPassword(text);
            if (confirmPasswordError) setConfirmPasswordError('');
          }}
        />
        {confirmPasswordError ? (
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        ) : null}

        <TouchableOpacity style={styles.loginButton} onPress={handleRegister}>
          <Text style={styles.loginButtonText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            console.log('Navigating to login screen...');
            router.push('/');
          }}
        >
          <Text style={styles.registerText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#ffffffdd',
    borderRadius: 12,
    padding: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
      },
      android: {
        elevation: 6,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#00416A',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#f7f7f7',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 8,
  },
  loginButton: {
    backgroundColor: '#00416A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerText: {
    marginTop: 16,
    color: '#00416A',
    textAlign: 'center',
  },
});
