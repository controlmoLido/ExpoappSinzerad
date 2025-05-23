import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../(tabs)/context/AuthContext';
import { loginUser } from '../(tabs)/services/authServices';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [nom, setNom] = useState('');
  const [password, setPassword] = useState('');
  const [nomError, setNomError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Logger object logging only to developer console
  const log = {
    success: (msg: string) => {
      console.log(`%c[SUCCESS]%c ${msg}`, 'color: green; font-weight: bold;', '');
    },
    warn: (msg: string) => {
      console.warn(`[WARNING] ${msg}`);
    },
    error: (msg: string) => {
      console.error(`[ERROR] ${msg}`);
    },
    info: (msg: string) => {
      console.info(`[INFO] ${msg}`);
    },
  };

  const handleLogin = async () => {
    if (loading) return;
    log.info('Login button pressed');
    setNomError('');
    setPasswordError('');
    setLoading(true);

    if (!nom) {
      setNomError('Username or Email is required');
      log.warn('Missing username or email');
      setLoading(false);
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      log.warn('Missing password');
      setLoading(false);
      return;
    }

    try {
      const user = await loginUser(nom, password, log);
      login(user);
      Alert.alert('Success', `Welcome, ${user.nom}`);
      setNom('');
      setPassword('');
      log.success('Login successful. Navigating to main menu...');
      router.push('/(tabs)/MainMenu/main');
    } catch (err: any) {
      log.error(`Login failed: ${err.message}`);
      if (err.message === 'Incorrect password') {
        setPasswordError('Password is incorrect.');
      } else if (err.message === 'User not found') {
        setNomError('Username or Email does not exist.');
      } else {
        Alert.alert('Login Failed', err.message || 'Unexpected error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#00416A', '#E4E5E6']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.title}>Login</Text>

          <TextInput
            style={[styles.input, nomError && styles.inputError]}
            placeholder="Username or Email"
            placeholderTextColor="#888"
            value={nom}
            onChangeText={text => {
              setNom(text);
              if (nomError) setNomError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {nomError ? <Text style={styles.errorText}>{nomError}</Text> : null}

          <TextInput
            style={[styles.input, passwordError && styles.inputError]}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={text => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <TouchableOpacity
            style={[styles.loginButton, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/explore')}>
            <Text style={styles.registerText}>Don't have an account? Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.87)',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      web: { boxShadow: '0 6px 12px rgba(0,0,0,0.2)' },
      android: { elevation: 6 },
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
