import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './Screens/Home';
import LoginScreen from './Screens/Login';
import RegisterScreen from './Screens/Register';


const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (token) {
          setInitialRoute('Map');
        } else {
          setInitialRoute('Login');
        }
      } catch (error) {
        console.error('Error checking token:', error);
        setInitialRoute('Login');
      }
    };

    checkToken();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
   
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
