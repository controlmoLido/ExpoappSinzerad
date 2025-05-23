import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://127.0.0.1:5000';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [showSettings, setShowSettings] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const [userId, setUserId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (showPersonalInfo) {
      fetch(`${BACKEND_URL}/me`, {
        method: 'GET',
        credentials: 'include',
      })
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Failed to fetch user data');
          }
          return res.json();
        })
        .then((data) => {
          setUserId(data.id);
          setName(data.nom || '');
          setEmail(data.email || '');
          setPassword('');
        })
        .catch((error) => {
          Alert.alert('Error', error.message);
          setShowPersonalInfo(false);
        });
    }
  }, [showPersonalInfo]);

  const handleSignOut = () => {
    fetch(`${BACKEND_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => {
        router.push('/');
      })
      .catch(() => {
        Alert.alert('Error', 'Failed to sign out');
      });
  };

  const handleSave = () => {
    setConfirmVisible(true);
  };

  const handleConfirmContinue = () => {
    setConfirmVisible(false);

    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please login again.');
      return;
    }

    fetch(`${BACKEND_URL}/user/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ nom: name, email, password }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to update user');
        }
        return res.json();
      })
      .then(() => {
        Alert.alert('Success', 'Your information has been updated.');
        setShowPersonalInfo(false);
        setShowSettings(false);
        setPassword('');
      })
      .catch((err) => {
        Alert.alert('Error', err.message || 'Failed to update user info');
      });
  };

  const handleConfirmCancel = () => {
    setConfirmVisible(false);
  };

  const handleDeleteAccount = () => {
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteConfirmVisible(false);

    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please login again.');
      return;
    }

    fetch(`${BACKEND_URL}/delete-account`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to delete account');
        }
        return res.json();
      })
      .then(() => {
        Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
        router.push('/');
      })
      .catch((err) => {
        Alert.alert('Error', err.message || 'Failed to delete account');
      });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        {user ? `Welcome, ${user.nom}! 👋` : 'Welcome to Application'}
      </Text>

      {user && (
        <Text style={styles.appIntroText}>
          Glad to have you here! Explore the app, update your info, or manage your account settings.
        </Text>
      )}

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setShowSettings(!showSettings)}
      >
        <MaterialIcons name="settings" size={28} color="#333" />
      </TouchableOpacity>

      {showSettings && !showPersonalInfo && (
        <View style={styles.settingsPanel}>
          <TouchableOpacity
            style={styles.settingsItem}
            onPress={() => setShowPersonalInfo(true)}
          >
            <MaterialIcons name="person" size={20} color="#333" />
            <Text style={styles.settingsText}>Personal Info</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={handleDeleteAccount}
          >
            <MaterialIcons name="delete" size={20} color="#e63946" />
            <Text style={[styles.settingsText, { color: '#e63946' }]}>Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem} onPress={handleSignOut}>
            <MaterialIcons name="logout" size={20} color="#e63946" />
            <Text style={[styles.settingsText, { color: '#e63946' }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* You can add modals for Personal Info, Save Confirmation, Delete Confirmation here */}
      {/* Skipped for brevity */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      },
    }),
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  appIntroText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    padding: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  settingsPanel: {
    position: 'absolute',
    top: 80,
    right: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingsText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
  },
});
