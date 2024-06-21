import mapboxgl from "mapbox-gl";


mapboxgl.accessToken =
    "pk.eyJ1IjoiZW1pbHV2YW4iLCJhIjoiY2x1ZTBweHp1MHNrZjJqcGtoZ28zb3ViaCJ9.LglIlm-oln_deKlv8bHbVg"

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
    enableHighAccuracy: true
})

function successLocation(position) {
    setupMap([position.coords.longitude, position.coords.latitude])
}

function errorLocation() {
    setupMap([-2.24, 53.48])
}

function setupMap(center) {
    const map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        center: center,
        zoom: 15
    })

    const nav = new mapboxgl.NavigationControl()
    map.addControl(nav)

    // eslint-disable-next-line no-undef
    var directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken
    })

    map.addControl(directions, "top-left")


    const locations = [
        { name: "Paris", coordinates: [2.28574,48.84313] },

        { name: "Barcelona", coordinates: [2.08628,41.44634] }
    ];


    locations.forEach(location => {
        new mapboxgl.Marker()
            .setLngLat(location.coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${location.name}</h3>`))
            .addTo(map);
    });
}
