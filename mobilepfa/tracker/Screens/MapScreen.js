import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import url from './url';

const chipex = require("../assets/a.png");

const primaryColor = '#2596be';
const primaryColorRGB = 'rgb(37, 150, 190)';
const backgroundColor = '#ffffff';
const shadowColor = 'rgba(0, 0, 0, 0.3)';

const MapScreen = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState(null);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
        console.log('Latitude:', location.coords.latitude, 'Longitude:', location.coords.longitude);

        let reverseGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        let city;
        if (reverseGeocode.length > 0) {
          city = reverseGeocode[0].city || 'Unknown City';
          setCityName(city);
          console.log('City:', city);
        } else {
          city = 'Unknown City';
          setCityName(city);
          console.log('City: Unknown City');
        }

        // Send location to server
        sendLocationToServer(location.coords, city);

      } catch (error) {
        setLoading(false);
        setErrorMsg('Error getting location');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const sendLocationToServer = async (coords, city) => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (!token) {
          console.log('JWT token not found');
          return;
        }

        const data = {
          current_place: [{
            Latitude: coords.latitude,
            Longitude: coords.longitude,
            City: city
          }]
        };

        await axios.post(`${url}/api/updatedriverplace`, data, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Location sent to server:', data);

      } catch (error) {
        console.error('Error sending location to server:', error);
      }
    };

    getLocation(); // Get the location immediately on mount

    const locationInterval = setInterval(() => {
      getLocation();
    }, 2000); // Update location every 2 seconds

    return () => clearInterval(locationInterval); // Clear interval on component unmount
  }, []);

  const openMaps = () => {
    if (currentLocation) {
      const { latitude, longitude } = currentLocation;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url);
    } else {
      alert('Location not available');
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={chipex} style={styles.backgroundImage}>
        {loading && <ActivityIndicator style={styles.loadingIndicator} size="large" color={primaryColor} />}
        {errorMsg && <Text style={styles.errorMsg}>{errorMsg}</Text>}
      </ImageBackground>
      <View style={styles.contentContainer}>
        <View style={styles.locationContainer}>
          <Text style={styles.header}>Get Location</Text>
          <Text style={styles.locationText}>City: {cityName ? cityName : 'Loading...'}</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={openMaps} disabled={!currentLocation || loading}>
          <Text style={styles.buttonText}>{loading ? 'Loading...' : (currentLocation ? 'Open Maps' : 'Location not available')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColor,
  },
  header: {
    fontSize: 28,
    marginBottom: 20,
    color: primaryColor,
    fontWeight: 'bold',
    textShadowColor: shadowColor,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: '60%', // Push the content below the image
  },
  locationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 30,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  locationText: {
    fontSize: 20,
    color: primaryColor,
  },
  button: {
    backgroundColor: primaryColor,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%', // Adjust height to occupy the top portion
    resizeMode: 'cover',
  },
  loadingIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%', // Center the loader within the image
  },
  errorMsg: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default MapScreen;
