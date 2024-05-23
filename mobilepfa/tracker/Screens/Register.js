import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { TextInput, Button, Snackbar, IconButton } from 'react-native-paper'; // Import IconButton
const chipex = require("../assets/a.png");

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [cin, setCin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // State to track password visibility

  const handleRegister = () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      setVisible(true);
      return;
    }
    // Implement registration logic here
    console.log('Registering with:', { email, password });
    // Redirect to HomeScreen (for now)
    navigation.navigate('Home');
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
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: '#2596be' } }}
        />
        <TextInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: '#2596be' } }}
        />
        <TextInput
          label="Cin"
          value={cin}
          onChangeText={setCin}
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: '#2596be' } }}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible} // Toggle secureTextEntry based on passwordVisible state
          style={styles.input}
          mode="outlined"
          theme={{ colors: { primary: '#2596be' } }}
          right={
            <TextInput.Icon
              name={passwordVisible ? 'eye-off' : 'eye'} // Change icon based on passwordVisible state
              onPress={() => setPasswordVisible(!passwordVisible)} // Toggle password visibility
            />
          }
        />
        <Button mode="contained" onPress={handleRegister} style={styles.button} color="#2596be">
          Register
        </Button>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.registerButton}>
          <Text style={styles.registerButtonText}>Already have an account? Login</Text>
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
    justifyContent: 'flex-start', // Align content at the top
    marginTop: -70, // Adjust the marginTop value as needed

  },
  logoContainer: {
    marginTop: 40, // Adjust the marginTop to create space at the top
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
    alignItems: 'center', // Centering the form items horizontally
  },
  input: {
    marginBottom: 20,
    width: '80%', // Adjusted width here
  },
  button: {
    marginTop: 20,
    width: '80%', // Adjusted width here
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

export default RegisterScreen;
