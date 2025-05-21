import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [nom, setNom] = useState(''); // username or email
  const [password, setPassword] = useState('');

  const [nomError, setNomError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    console.log('%chandleLogin triggered', 'color: blue; font-weight: bold;');
    setNomError('');
    setPasswordError('');

    let hasError = false;
    if (!nom) {
      setNomError('Username or Email is required');
      console.log('%cValidation failed: nom is empty', 'color: orange; font-weight: bold;');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Password is required');
      console.log('%cValidation failed: password is empty', 'color: orange; font-weight: bold;');
      hasError = true;
    }
    if (hasError) return;

    try {
      const isEmail = nom.includes('@');
      const body = isEmail
        ? { email: nom, password }
        : { username: nom, password };

      console.log('%cSending login request with body:', 'color: purple;', body);

      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      console.log('%cResponse status:', 'color: teal;', response.status);

      const data = await response.json();
      console.log('%cResponse data:', 'color: teal;', data);

      if (response.ok) {
        Alert.alert('Success', `Welcome, ${data.user.nom}`);
        console.log('%cLogin successful for user:', 'color: green;', data.user.nom);
        setNom('');
        setPassword('');
        router.push('/(tabs)/MainMenu/Main');
      } else {
        console.log('%cLogin failed:', 'color: red;', data.error);
        if (data.error === 'Incorrect password') {
          setPasswordError('Password is incorrect.');
        } else if (
          data.error === 'User not found' ||
          data.error === 'Username or Email does not exist'
        ) {
          setNomError('Username or Email does not exist.');
        } else {
          Alert.alert('Login Failed', data.error || 'Invalid credentials');
        }
      }
    } catch (error) {
      console.error('%cLogin error:', 'color: red; font-weight: bold;', error);
      Alert.alert('Error', 'Network error or backend not running');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={[styles.input, nomError ? styles.inputError : null]}
        placeholder="Username or Email"
        value={nom}
        onChangeText={text => {
          setNom(text);
          if (nomError) setNomError('');
          console.log('%cNom input changed:', 'color: brown;', text);
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {nomError ? <Text style={styles.errorText}>{nomError}</Text> : null}

      <TextInput
        style={[styles.input, passwordError ? styles.inputError : null]}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={text => {
          setPassword(text);
          if (passwordError) setPasswordError('');
          console.log('%cPassword input changed', 'color: brown;');
        }}
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <Button title="Login" onPress={handleLogin} />

      <View style={{ marginTop: 16 }}>
        <Button title="Register" onPress={() => {
          console.log('%cNavigate to Register screen', 'color: navy;');
          router.push('/explore');
        }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
      },
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    marginLeft: 4,
  },
});
