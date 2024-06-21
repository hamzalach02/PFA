import React, { useEffect } from "react";
import { Flex, Button, Text, useColorModeValue } from "@chakra-ui/react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

function Map(props) {
    const textColor = useColorModeValue("navy.700", "white");

    useEffect(() => {
        mapboxgl.accessToken =
            "pk.eyJ1IjoiZW1pbHV2YW4iLCJhIjoiY2x1ZTBweHp1MHNrZjJqcGtoZ28zb3ViaCJ9.LglIlm-oln_deKlv8bHbVg";

        navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
            enableHighAccuracy: true
        });

        function successLocation(position) {
            setupMap([position.coords.longitude, position.coords.latitude]);
        }

        function errorLocation() {
            setupMap([-2.24, 53.48]);
        }

        function setupMap(center) {
            const map = new mapboxgl.Map({
                container: "map",
                style: "mapbox://styles/mapbox/streets-v11",
                center: center,
                zoom: 5
            });


            // Create directions control
            const directions = new MapboxDirections({
                accessToken: mapboxgl.accessToken,
                unit: "metric", // Use the metric system for directions
                profile: "mapbox/cycling", // Specify the profile for the directions (e.g., cycling, walking, driving)
                alternatives: true // Show alternative routes
            });
            // Create a custom container for the navigation control
            // Create a custom container for the navigation control
            const navContainer = document.createElement('div');
            navContainer.className = 'nav-container';

            // Add navigation control to the custom container
            const nav = new mapboxgl.NavigationControl();
            navContainer.appendChild(nav.onAdd(map));

            // Append the custom container to the map's main container
            map.getContainer().appendChild(navContainer);

            // Add CSS to position the custom container
            navContainer.style.position = 'absolute';
            navContainer.style.top = '10px'; // Adjust as needed
            navContainer.style.right = '10px'; // Adjust as needed
            navContainer.style.backgroundColor = 'red'; // Set background color to red

            navContainer.style.zIndex = '1000'; // Ensure it appears on top
            // Add directions control to the map
            map.addControl(directions, "top-left");

            // Adjust the CSS of the directions control container
            const directionsContainer = document.getElementsByClassName('mapboxgl-ctrl-top-left')[0];
            directionsContainer.style.position = 'absolute';
            directionsContainer.style.top = '150px';
            directionsContainer.style.left = '50px';

            // Add markers
            const locations = [
                { name: "Barcelona", coordinates: [36.8340,  2.4637] }
            ];

            locations.forEach(location => {
                new mapboxgl.Marker()
                    .setLngLat(location.coordinates)
                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${location.name}</h3>`))
                    .addTo(map);
            });
        }

    }, []); // Empty dependency array ensures this effect runs only once on component mount

    return (
        <>

                <div id="map" style={{ height: "75vh", width: "100%"  , marginTop:"7%" }}></div> {/* Adjust height as needed */}

        </>
    );
}

export default Map;
