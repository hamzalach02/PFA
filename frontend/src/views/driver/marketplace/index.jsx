import React, { useState, useEffect } from "react";
import { GoogleMap, DirectionsRenderer, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import axios from "axios"; // Import axios for making HTTP requests
import { jwtDecode } from "jwt-decode";

import Cookies from "js-cookie";
const containerStyle = {
  width: "70%",
  height: "85vh",
  marginTop: "70px"
};
const rightPanelStyle = {
  width: "30%",
  height: "100%",
  float: "right",
  padding: "20px",
  
  boxSizing: "border-box",
  background: "white",
  borderRadius: "10px",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  marginTop:"-600px", 
  marginRight:"-20px"
};

const inputStyle = {
  marginBottom: "10px",
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  width:"90%"
};

const buttonStyle = {
  backgroundColor: "green",
  color: "white",
  padding: "10px 20px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
  marginRight: "10px"
};

const center = {
  lat: 31.7917, // Approximate latitude for the center of Morocco
  lng: -7.0926, // Approximate longitude for the center of Morocco
};

const packages = [
  { id: 6, source: { lat: 34.6779, lng: -1.9282 }, destination: { lat: 47.3769, lng: 8.5417 }, weight: 4, articles: ["Toiletries", "Cosmetics"], photo: "https://i.pinimg.com/originals/0f/dc/ed/0fdcede729cb715f5715dd4a8a43ea7e.jpg" }, // Package in Oujda
  { id: 7, source: { lat: 48.8566, lng: 2.3522 }, destination: { lat: 31.6295, lng: -7.9811 }, weight: 9, articles: ["Jewelry", "Perfume"], photo: "https://i.pinimg.com/originals/0f/dc/ed/0fdcede729cb715f5715dd4a8a43ea7e.jpg" }, // Package in Paris
];

const Marketplace = () => {
  const [route, setRoute] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [startInput, setStartInput] = useState("");
  const [citiesInput, setCitiesInput] = useState("");
  const [cities, setCities] = useState([]);
  const [estimatedStartDate, setEstimatedStartDate] = useState("");
  const [estimatedArrivalDate, setEstimatedArrivalDate] = useState("");
  const [acceptedPackages, setAcceptedPackages] = useState([]);
  const [colis, setColis] = useState([]);
  const BASE_IMAGE_URL = "http://localhost:8000/colis_images"; // Base URL for package images
  const [driverId, setDriverId] = useState(null); // Add state for driver ID
  const [selectedColisIds, setSelectedColisIds] = useState([]);
  useEffect(() => {
    if (selectedPackage) {
      const ids = [...selectedColisIds, selectedPackage.id];
      setSelectedColisIds(ids);
    }
  }, [selectedPackage]);
  const handleEstimatedStartDateChange = (event) => {
    const startDate = event.target.value;
    console.log("Estimated Start Date:", startDate);
    setEstimatedStartDate(startDate);
  };

  const handleEstimatedArrivalDateChange = (event) => {
    const arrivalDate = event.target.value;
    console.log("Estimated Arrival Date:", arrivalDate);
    setEstimatedArrivalDate(arrivalDate);
  };
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAiAtl04BKVjttrmhf8QBvlU7i9C7S2YhE",
    region: "MA", // Specify the region (Morocco in this case)
  });

  const handleInputSubmit = async () => {
    const geocoder = new window.google.maps.Geocoder();
    const cityNames = citiesInput.split(",").map(city => city.trim());
    
    // Set the start point based on the first city in the CSV
    const startPoint = await getCityPosition(cityNames[0], geocoder);
  
    // Remove the startInput state setting
  console.log("clicked");
    const newCities = [];
    for (const cityName of cityNames) {
      const position = await getCityPosition(cityName, geocoder);
      newCities.push({ name: cityName, position: position });
    }
    setCities(newCities);
  
    // Call calculateRoute after setting newCities
    calculateRoute(startPoint, newCities);
  };
  
  
  useEffect(() => {
    const fetchColis = async () => {
      try {
        const token = Cookies.get('token');
        if (!token) {
          console.error('No token found in cookies');
          return;
        }
  
        const response = await axios.get("http://localhost:8000/api/drivercolislist", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("Colis data:", response.data); // Log the fetched colis data
        // Map colis data to match the structure of static packages
        const formattedColis = response.data.map(colis => ({
          id: colis.id,
          source: {
            lat: parseFloat(colis.source.lat), // Extract latitude from source
            lng: parseFloat(colis.source.lng), // Extract longitude from source
          },
          destination: {
            lat: parseFloat(colis.destination.lat),
            lng: parseFloat(colis.destination.lng),
          },
          weight: parseFloat(colis.total_weight),
          articles: colis.products.map(product => product.name),
          photo: colis.image,
        }));
        setColis(formattedColis);
      } catch (error) {
        console.error("Error fetching colis:", error);
      }
    };
  
    fetchColis();
  }, []);
  

  const fetchColis = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        console.error('No token found in cookies');
        return;
      }
  
      const response = await axios.get("http://localhost:8000/api/drivercolislist", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      console.log("Colis data:", response.data); // Log the fetched colis data
  
      // Geocode city names to obtain latitude and longitude
      const geocoder = new window.google.maps.Geocoder();
      const formattedColis = await Promise.all(response.data.map(async (colis) => {
        try {
          // Geocode source city name
          const sourceLocation = await geocodeCity(colis.source, geocoder);
          const packageImageUrl = `${BASE_IMAGE_URL}/${colis.image.split('/').pop()}`;
          return {
            id: colis.id,
            source: sourceLocation,
            destination: colis.destination, // Keep destination as a city name
            weight: parseFloat(colis.total_weight),
            articles: colis.products.map(product => product.description), // Map product descriptions to articles
            photo: packageImageUrl,
          };
        } catch (error) {
          console.error("Error geocoding city:", error);
          return null;
        }
      }));
  
      // Filter out null values
      const filteredColis = formattedColis.filter(colis => colis !== null);
  
      console.log("Colis:", filteredColis);
      setColis(filteredColis);
    } catch (error) {
      console.error("Error fetching colis:", error);
    }
  };
  
  const geocodeCity = (cityName, geocoder) => {
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: cityName }, (results, status) => {
        if (status === "OK" && results[0]) {
          const position = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };
          resolve(position);
        } else {
          console.error("Geocode was not successful for the following reason:", status);
          reject(status);
        }
      });
    });
  };
  
  
  
  


  useEffect(() => {
    fetchColis();
  }, []);
  
  useEffect(() => {
    console.log("Colis:", colis);
  }, [colis]);
  




  const handlePackageClick = (colisId) => {
    const clickedColis = colis.find(colis => colis.id === colisId);
    setSelectedPackage(clickedColis);
  };
  






  const getCityPosition = (cityName, geocoder) => {
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: cityName }, (results, status) => {
        if (status === "OK" && results[0]) {
          const position = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };
          resolve(position);
        } else {
          console.error("Geocode was not successful for the following reason:", status);
          reject(status);
        }
      });
    });
  };

  const calculateRoute = async (startPoint, cities) => {
    if (isLoaded && cities && cities.length > 0) { // Check if cities is not null and is an array with at least one element
      const sortedCities = [...cities];
      const selectedCities = [sortedCities.shift()]; // Start with Marrakech
  
      while (sortedCities.length > 0) {
        let closestCityIndex = -1;
        let closestDistance = Infinity;
  
        selectedCities.forEach((selectedCity, index) => {
          sortedCities.forEach((city, cityIndex) => {
            const distance = calculateDistance(selectedCity.position, city.position);
            if (distance < closestDistance) {
              closestDistance = distance;
              closestCityIndex = cityIndex;
            }
          });
        });
  
        const closestCity = sortedCities.splice(closestCityIndex, 1)[0];
        closestCity.label = (selectedCities.length + 1).toString();
        selectedCities.push(closestCity);
      }
  
      const waypoints = selectedCities.map(city => ({ location: city.position }));
      const origin = waypoints.shift().location;
      const destination = waypoints.pop().location;
  
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          optimizeWaypoints: true,
          travelMode: window.google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setRoute(result);
          } else {
            console.error("Directions request failed:", status);
          }
        }
      );
    } else {
      console.error("Cities array is empty or not iterable");
    }
  };
  

  useEffect(() => {
    calculateRoute();
  }, [isLoaded]); // Call calculateRoute whenever isLoaded changes

  const calculateDistance = (pos1, pos2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(pos2.lat - pos1.lat);
    const dLng = deg2rad(pos2.lng - pos1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(pos1.lat)) * Math.cos(deg2rad(pos2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = deg => {
    return deg * (Math.PI / 180);
  };


  const acceptedPackageStyle = {
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    marginBottom: "10px",
  };
  

  const handleDecline = () => {

    console.log("Package declined");
  };

  const filteredPackages = packages.filter(pkg => {
    return pkg.source && pkg.destination; 
  });
  const handleStartInputChange = (event) => {
    setStartInput(event.target.value);
  };

  const handleCitiesInputChange = (event) => {
    setCitiesInput(event.target.value);
    };

    const handleAccept = () => {
      console.log("Selected Colis IDs:", selectedColisIds);

      setAcceptedPackages(prevPackages => [...prevPackages, selectedPackage]);
    };
    
    
    const tripDetailLabelStyle = {
      fontWeight: "bold",
    };
    
    const estimatedDateStyle = {
      marginTop: "10px",
    };
    
    const TripDetails = ({ onEstimatedStartDateChange, onEstimatedArrivalDateChange }) => (
      <div style={tripDetailsStyle}>
     
        <div style={inputContainerStyle}>
          
  {/* Display accepted packages */}
{/* Display accepted packages */}
<div style={{ maxHeight: "200px", marginTop: "20px", marginBottom: "20px", border: "1px solid black", overflowY: "auto" }}>
  {acceptedPackages.map((acceptedPackage, index) => (
    <div key={index} style={acceptedPackageStyle}>
      <h4>Accepted Package {index + 1}</h4>
      
      <p>Articles: {acceptedPackage.articles.join(", ")}</p>
    </div>
  ))}
</div>


        </div>
      </div>
    );
    
    const tripDetailsStyle = {
      marginBottom: "20px",
    };
    
    const inputContainerStyle = {
      marginBottom: "10px",
    };
    
    const labelStyle = {
      marginRight: "10px",
      fontSize: "14px",
      color: "#333",
    };
    
    const inputStyle = {
      padding: "8px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      width: "100%",
    };
    
    const handleStartTrip = async () => {
      const token = Cookies.get('token');
      if (!token) {
        console.error('No token found in cookies');
        return;
      }
    
      try {
        const decodedToken = jwtDecode(token); // Decode the token
        const driverId = decodedToken.id; // Retrieve the driver ID from the token
        console.log("Driver ID:", driverId);
        const startDate = new Date(); // Get the current date
        const endDate = new Date(startDate); // Create a new Date object with the current date
        endDate.setDate(endDate.getDate() + 2); // Add 2 days to the current date

        const tripData = {
          driver_id: driverId,
          started: false,
          finished: false,
          current_place: "startInput",
          end_date: endDate.toISOString(), // Convert endDate to ISO 8601 format
          cities_to_visit: citiesInput,

          colis: selectedColisIds // Include selectedColisIds in the trip data

        };

      
    



    
        const response = await axios.post(
          'http://localhost:8000/api/createTrip',
          tripData
        );
    
        if (response.status === 201) {
          console.log('Trip created successfully');
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          // Display an alert if the error status is 400
          alert("You have an ongoing trip, wait");
        } else {
          console.error('Error creating trip:', error);
        }
      }
    };
    
    
    
    
    return (
    <div>
    {isLoaded ? (
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={6}>
      {/* Display red markers for cities */}
      {cities.map((city, index) => (
        <Marker
          key={index}
          position={city.position}
          label={city.name.charAt(0)}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new window.google.maps.Size(32, 32)
          }}
        />
      ))}
      {/* Display orange markers for package locations */}
      {colis.map(colis => (
        colis.source && (
          <Marker
            key={colis.id}
            position={colis.source}
            onClick={() => handlePackageClick(colis.id)}
            icon={{
              url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
              scaledSize: new window.google.maps.Size(32, 32)
            }}
          />
        )
      ))}
      {/* Display route between cities */}
      {route && <DirectionsRenderer directions={route} />}
      {/* Display info window for selected package */}
      {selectedPackage && (
        <InfoWindow
          position={selectedPackage.source}
          onCloseClick={() => setSelectedPackage(null)}
        >
           <div style={{ padding: '10px', maxWidth: '200px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>Package Details</h3>
        <p style={{ margin: '4px 0' }}><strong>Destination:</strong> {selectedPackage.destination}</p>
        <p style={{ margin: '4px 0' }}><strong>Weight:</strong> {selectedPackage.weight} kg</p>
        <p style={{ margin: '4px 0' }}><strong>Items:</strong> {selectedPackage.articles.join(", ")}</p>
        {selectedPackage.photo && (
          <img src={selectedPackage.photo} alt="Package" style={{ maxWidth: '100%', borderRadius: '8px', margin: '8px 0' }} />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '8px' }}>
          <button 
            onClick={() => handleAccept(selectedPackage.id)} 
            style={{ backgroundColor: '#4CAF50', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
            Accept
          </button>
          <button 
            onClick={() => handleDecline(selectedPackage.id)} 
            style={{ backgroundColor: '#f44336', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>
            Decline
          </button>
        </div>
      </div>
        </InfoWindow>
      )}
    </GoogleMap>
    
    ) : (
    <div>Loading...</div>
    )}
<div style={rightPanelStyle}>
<h3>Trip Details</h3>

<input type="text" style={inputStyle} placeholder="Cities input" value={citiesInput} onChange={handleCitiesInputChange} />

  <TripDetails 

  />
  <div>
    <button style={buttonStyle} onClick={handleInputSubmit}>View route</button>
    <button style={buttonStyle}  onClick={handleStartTrip}>Start trip</button>

  </div>
</div>
    </div>
    );
    };
    
    export default Marketplace;
