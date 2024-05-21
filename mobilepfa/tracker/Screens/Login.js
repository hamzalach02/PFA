import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { TextInput, Button, Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import url from './url';

const chipex = require("../assets/a.png");

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      setVisible(true);
      return;
    }

    try {
      const response = await axios.post(`${url}/api/login`, { email, password });

      if (response.status === 200) {
        const { jwt: token } = response.data;

        // Save the token to local storage
        await AsyncStorage.setItem('jwt', token);
        console.log(token);

        // Redirect to HomeScreen
        navigation.navigate('Home');
      } else {
        setError('Login failed. Please try again.');
        setVisible(true);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An error occurred. Please try again.');
      }
      setVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={chipex} style={styles.logo} />
      </View>
      <View style={styles.formContainer}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { width: '80%' }]}
          mode="outlined"
          theme={{ colors: { primary: '#2596be' } }}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
          style={[styles.input, { width: '80%' }]}
          mode="outlined"
          theme={{ colors: { primary: '#2596be' } }}
          right={
            <TextInput.Icon
              name={passwordVisible ? 'eye-off' : 'eye'}
              onPress={() => setPasswordVisible(!passwordVisible)}
            />
          }
        />
        <Button mode="contained" onPress={handleLogin} style={[styles.button, { width: '80%' }]} color="#2596be">
          Login
        </Button>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Don't have an account? Register</Text>
        </TouchableOpacity>
        <Snackbar
          visible={visible}
          onDismiss={() => setVisible(false)}
          duration={3000}
        >
          {error}
        </Snackbar>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-start',
  },
  logoContainer: {
    marginTop: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 250,
    height: 250,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    marginBottom: 20,
    width: '100%',
  },
  button: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#2596be',
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#2596be',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
