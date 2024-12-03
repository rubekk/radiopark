<script>
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import {
        radioStations,
        currentRadioStation,
        playRadio,
        stationHistory,
        stationLocation,
    } from "$lib/store";

    let map;
    let leaflet;
    let markers = [];
    let userLocationMarker = "";
    let userLocation = [];
    let showingUserLocation = false;
    let sRadioStations = [];
    let sCurrentRadioStation = {};
    let sStationHistory = [];
    let sStationLocation = { lat: "", lon: "" };

    currentRadioStation.subscribe((value) => {
        sCurrentRadioStation = value;
    });

    stationHistory.subscribe((value) => {
        sStationHistory = value;
    });

    stationLocation.subscribe((value) => {
        sStationLocation = value;
    });

    const handleLocateMe = () => {
        if (!browser) return;

        showingUserLocation = !showingUserLocation;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = [
                        position.coords.latitude,
                        position.coords.longitude,
                    ];

                    if (showingUserLocation) {
                        leaflet
                            .circleMarker(userLocation, {
                                radius: 9,
                                color: "#797979",
                                fillColor: "#fff",
                                fillOpacity: 0.9,
                                weight: 5,
                            })
                            .addTo(userLocationMarker);

                        map.flyTo(userLocation, 11, {
                            duration: 2,
                            easeLinearity: 0.25,
                        });
                    } else {
                        userLocationMarker.clearLayers();
                    }
                },
                (error) => {
                    console.log(error);
                },
            );
        } else {
            console.log(error);
        }
    };

    const handleStataionHistory = () => {
        if (
            !sStationHistory.some((item) => {
                return (
                    item.name == sCurrentRadioStation.name &&
                    item.country == sCurrentRadioStation.country &&
                    item.url == sCurrentRadioStation.url
                );
            })
        ) {
            sStationHistory.unshift(sCurrentRadioStation);
            sStationHistory = [...sStationHistory];
            if (sStationHistory.length > 15) sStationHistory.splice(15, 1);
            sStationHistory = [...sStationHistory];

            stationHistory.set(sStationHistory);
        }

        if (sCurrentRadioStation && sCurrentRadioStation.geo_lat) {
            stationLocation.set({
                lat: sCurrentRadioStation.geo_lat,
                lon: sCurrentRadioStation.geo_long,
            });
        }
    };

    onMount(async () => {
        leaflet = await import("leaflet");

        map = leaflet
            .map("map", {
                minZoom: 2,
                zoomControl: false,
            })
            .setView([27.7172, 85.324], 5);

        leaflet.control.zoom({ position: "bottomright" }).addTo(map);
        leaflet
            .tileLayer(
                "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
                {
                    opacity: 0.8,
                },
            )
            .addTo(map);

        userLocationMarker = leaflet.layerGroup().addTo(map);

        const globalResponse = await fetch(
            "https://de1.api.radio-browser.info/json/stations?limit=7000",
        );
        const nepalResponse = await fetch(
            "https://de1.api.radio-browser.info/json/stations/bycountry/Nepal",
        );
        const globalStations = await globalResponse.json();
        const nepalStations = await nepalResponse.json();

        sRadioStations = [...globalStations, ...nepalStations].filter(
            (station) => station.geo_lat !== null && station.geo_long !== null,
        );
        radioStations.set(sRadioStations);

        let randomNumber = Math.floor(Math.random() * sRadioStations.length);

        sCurrentRadioStation = sRadioStations[randomNumber];
        currentRadioStation.set(sCurrentRadioStation);

        handleStataionHistory();

        sRadioStations.forEach((station, i) => {
            if (station.geo_lat && station.geo_long) {
                const marker = leaflet
                    .circleMarker([station.geo_lat, station.geo_long], {
                        radius: 3,
                        fillColor: "#fff",
                        fillOpacity: 0.9,
                        weight: 0,
                    })
                    .addTo(map);

                marker.name = station.name;
                marker.geo_lat = station.geo_lat;
                marker.geo_long = station.geo_long;

                markers.push(marker);

                marker.on("mouseover", (e) => {
                    if (
                        sCurrentRadioStation &&
                        station.name === sCurrentRadioStation.name &&
                        station.geo_lat === sCurrentRadioStation.geo_lat &&
                        station.geo_long === sCurrentRadioStation.geo_long
                    ) {
                        return;
                    }

                    marker.setRadius(9);

                    const popup = leaflet
                        .popup()
                        .setLatLng(e.latlng)
                        .setContent(
                            `
                            <strong>${station.name}</strong><br>
                            Country: ${station.country}
                        `,
                        )
                        .openOn(map);
                });

                marker.on("mouseout", () => {
                    if (
                        sCurrentRadioStation &&
                        station.name === sCurrentRadioStation.name &&
                        station.geo_lat === sCurrentRadioStation.geo_lat &&
                        station.geo_long === sCurrentRadioStation.geo_long
                    ) {
                        return;
                    }

                    marker.setRadius(3);
                    map.closePopup();
                });

                marker.on("click", () => {
                    currentRadioStation.set({
                        name: station.name,
                        country: station.country,
                        geo_lat: station.geo_lat,
                        geo_long: station.geo_long,
                        tags: station.tags,
                        url: station.url,
                    });

                    handleStataionHistory();
                    playRadio.set(true);
                });
            }
        });
    });

    $: {
        if (map && sStationLocation.lat && sStationLocation.lon) {
            map.flyTo(
                [
                    parseFloat(sStationLocation.lat),
                    parseFloat(sStationLocation.lon),
                ],
                6,
                {
                    duration: 2,
                    easeLinearity: 0.25,
                },
            );
        }

        if (markers && sCurrentRadioStation && sCurrentRadioStation.name) {
            markers.forEach((item) => {
                if (
                    item.name === sCurrentRadioStation.name &&
                    item.geo_lat === sCurrentRadioStation.geo_lat &&
                    item.geo_long === sCurrentRadioStation.geo_long
                ) {
                    item.setStyle({
                        radius: 9,
                        fillColor: "#ffcc00",
                        fillOpacity: 0.9,
                        color: "#797979",
                        weight: 5,
                    });

                    item.bringToFront();
                } else {
                    item.setStyle({
                        radius: 3,
                        fillColor: "#fff",
                        fillOpacity: 0.9,
                        color: "#000",
                        weight: 0,
                    });

                    item.bringToBack();
                }
            });
        }
    }
</script>

<div class="map-container">
    <div id="map"></div>

    <div on:click={handleLocateMe} class="locate-me" id={showingUserLocation ? "gradient" : ""}>
        <i class="fa-solid fa-location-crosshairs"></i>
    </div>
</div>

<style>
    @import "leaflet/dist/leaflet.css";

    .map-container {
        height: 100vh;
        width: 100vw;
        position: relative;
    }

    #map {
        height: 100%;
        width: 100%;
    }

    .locate-me {
        padding: 0.5rem 0.75rem;
        width: 45px;
        font-size: 1.25rem;
        text-align: center;
        background-color: #ffcc00;
        color: #fff;
        border-radius: 3px;
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        cursor: pointer;
        z-index: 500;
    }

    #gradient {
        animation: borderAnimation 7s infinite linear;
    }

    @keyframes borderAnimation {
        0% {
            background: linear-gradient(
                45deg,
                #ffcc00, #ddff00
            );
        }
        50% {
            background: linear-gradient(
                -45deg,
                #ffcc00, #ddff00
            );
        }
        100% {
            background: linear-gradient(
                45deg,
                #ffcc00, #ddff00
            );
        }
    }
</style>

