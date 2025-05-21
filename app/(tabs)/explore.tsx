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

  // Colored & emoji-based logs for cross-platform safety
  const log = {
    success: (msg: any) => console.log('✅ [SUCCESS]', msg),
    warn: (msg: any) => console.warn('⚠️ [WARNING]', msg),
    error: (msg: any) => console.error('❌ [ERROR]', msg),
    info: (msg: any) => console.info('ℹ️ [INFO]', msg),
  };

  const handleRegister = async () => {
    log.info('Starting registration process...');
    setNomError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;

    if (!nom) {
      setNomError('Username is required');
      log.warn('Username is missing');
      hasError = true;
    }

    if (!email) {
      setEmailError('Email is required');
      log.warn('Email is missing');
      hasError = true;
    } else if (!email.includes('@')) {
      setEmailError('Email must contain "@"');
      log.warn('Email format is invalid (missing "@")');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      log.warn('Password is missing');
      hasError = true;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm Password is required');
      log.warn('Confirm password is missing');
      hasError = true;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      log.warn('Passwords do not match');
      hasError = true;
    }

    if (hasError) {
      log.error('Validation failed. Aborting registration.');
      return;
    }

    try {
      log.info('Sending POST request to backend...');
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, email, password }),
      });

      const data = await response.json();
      log.info(`Response received: ${JSON.stringify(data)}`);

      if (response.ok) {
        log.success('Registration successful!');
        Alert.alert('Success', 'Registration complete! Please log in.');
        setNom('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        router.push('/');
      } else {
        log.error(`Backend error: ${data.error}`);

        if (
          data.error?.toLowerCase().includes('username') &&
          data.error?.toLowerCase().includes('email')
        ) {
          setNomError('Username already exists');
          setEmailError('Email already exists');
        } else if (data.error?.toLowerCase().includes('username')) {
          setNomError('Username already exists');
        } else if (data.error?.toLowerCase().includes('email')) {
          setEmailError('Email already exists');
        } else {
          Alert.alert('Registration Failed', data.error || 'Unknown error');
        }
      }
    } catch (error) {
      log.error('Network error or backend not reachable');
      console.error(error);
      Alert.alert('Error', 'Network error or backend not running');
    }
  };

  return (
    <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradientContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>

        <TextInput
          style={[styles.input, nomError ? styles.inputError : null]}
          placeholder="Username"
          value={nom}
          onChangeText={text => {
            setNom(text);
            if (nomError) setNomError('');
          }}
        />
        {nomError ? <Text style={styles.errorText}>{nomError}</Text> : null}

        <TextInput
          style={[styles.input, emailError ? styles.inputError : null]}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={text => {
            setEmail(text);
            if (emailError) setEmailError('');
          }}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <TextInput
          style={[styles.input, passwordError ? styles.inputError : null]}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={text => {
            setPassword(text);
            if (passwordError) setPasswordError('');
          }}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

        <TextInput
          style={[styles.input, confirmPasswordError ? styles.inputError : null]}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={text => {
            setConfirmPassword(text);
            if (confirmPasswordError) setConfirmPasswordError('');
          }}
        />
        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.8}>
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 16 }}>
          <TouchableOpacity
            style={styles.goLoginButton}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <Text style={styles.goLoginButtonText}>Go to Login</Text>
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(0,0,0,0.3)',
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: '#2575fc',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  goLoginButton: {
    borderColor: '#2575fc',
    borderWidth: 2,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  goLoginButtonText: {
    color: '#2575fc',
    fontSize: 18,
    fontWeight: '600',
  },
});
