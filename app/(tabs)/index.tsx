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

export default function LoginScreen() {
  const router = useRouter();
  const [nom, setNom] = useState('');
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
        router.push('/(tabs)/MainMenu/MainScreen');
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
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradientContainer}>
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

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 16 }}>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => {
              console.log('%cNavigate to Register screen', 'color: navy;');
              router.push('/(tabs)/RegisterScreen');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    color: '#fff',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    marginLeft: 4,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonText: {
    color: '#2575fc',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderWidth: 2,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
