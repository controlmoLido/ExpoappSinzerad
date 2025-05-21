import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const BACKEND_URL = 'http://127.0.0.1:5000'; // Your backend base URL here

export default function WelcomeScreen() {
  const router = useRouter();

  const [showSettings, setShowSettings] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // User data state
  const [userId, setUserId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Fetch logged-in user info when personal info modal opens
  useEffect(() => {
    if (showPersonalInfo) {
      fetch(`${BACKEND_URL}/me`, {
        method: 'GET',
        credentials: 'include',  // important for session cookies
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
          setPassword(''); // Don't pre-fill password for security
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
        router.push('/'); // navigate to login screen after logout
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

  // --- DELETE ACCOUNT HANDLERS ---
  const handleDeleteAccount = () => {
    setDeleteConfirmVisible(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteConfirmVisible(false);

    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please login again.');
      return;
    }

    fetch(`${BACKEND_URL}/user/${userId}`, {
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
        router.push('/'); // redirect to login screen or welcome after deletion
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
      <Text style={styles.welcomeText}>Welcome to Application</Text>

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

      {/* Personal Info Modal */}
      <Modal
        visible={showPersonalInfo}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPersonalInfo(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.personalInfoContainer}>
            <Text style={styles.modalTitle}>Edit Personal Information</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPersonalInfo(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Save Confirmation Modal */}
      <Modal
        visible={confirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.confirmationBox}>
            <Text style={styles.confirmText}>Are you sure you want to save changes?</Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleConfirmCancel}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleConfirmContinue}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={deleteConfirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.confirmationBox}>
            <Text style={[styles.confirmText, { color: '#e63946' }]}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleDeleteCancel}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteConfirm}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  /* Your existing styles here */
  container: {
    flex: 1,
    justifyContent: 'center', // vertically center
    alignItems: 'center', // horizontally center
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
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 20,
  },
  settingsPanel: {
    position: 'absolute',
    top: 80,
    right: 24,
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingsText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personalInfoContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#2a9d8f',
  },
  deleteButton: {
    backgroundColor: '#e63946',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  confirmationBox: {
    width: '75%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
});
