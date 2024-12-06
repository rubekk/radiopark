<script>
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { fade, scale } from "svelte/transition";
    import {
        radioStations,
        currentRadioStation,
        playRadio,
        stationHistory,
        stationLocation,
        loadingRequest,
        darkMode,
    } from "$lib/store";
    import Loading from "./Loading.svelte";

    let map;
    let leaflet;
    let markers = [];
    let userLocationMarker = "";
    let userLocation = [];
    let showingUserLocation = false;
    let sRadioStations = [];
    let plottedRadioStations = [];
    let sCurrentRadioStation = {};
    let sStationHistory = [];
    let sStationLocation = { lat: "", lon: "" };
    let sLoadingRequest = true;
    let sDarkMode = false;
    let mapDetails = {
        map: sDarkMode
            ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png",
        fillColor: sDarkMode ? "#fff" : "#000",
        color: "#797979",
    };

    currentRadioStation.subscribe((value) => {
        sCurrentRadioStation = value;
    });

    stationHistory.subscribe((value) => {
        sStationHistory = value;
    });

    stationLocation.subscribe((value) => {
        sStationLocation = value;
    });

    loadingRequest.subscribe((value) => {
        sLoadingRequest = value;
    });

    darkMode.subscribe((value) => {
        sDarkMode = value;
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

    const loadMap = () => {
        if(!leaflet) return;

        map = leaflet
            .map("map", {
                minZoom: 2,
                zoomControl: false,
            })
            .setView([27.7172, 85.324], 5);

        leaflet.control.zoom({ position: "bottomright" }).addTo(map);
        leaflet
            .tileLayer(mapDetails.map, {
                opacity: 0.9,
            })
            .addTo(map);

        userLocationMarker = leaflet.layerGroup().addTo(map);
    };

    const plotLocationOnMap = () => {
        if(!leaflet || !map) return;

        sRadioStations.forEach((station, i) => {
            const stationId = `${station.name}-${station.geo_lat}-${station.geo_long}`;

            if (
                plottedRadioStations &&
                !plottedRadioStations.includes(stationId) &&
                station.geo_lat &&
                station.geo_long
            ) {
                const marker = leaflet
                    .circleMarker([station.geo_lat, station.geo_long], {
                        radius: 3,
                        fillColor: mapDetails.fillColor,
                        fillOpacity: 0.9,
                        weight: 0,
                    })
                    .addTo(map);

                marker.name = station.name;
                marker.geo_lat = station.geo_lat;
                marker.geo_long = station.geo_long;

                markers.push(marker);
                plottedRadioStations.push(stationId);

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
                    playRadio.set(false);
                    
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
    };

    onMount(async () => {
        leaflet = await import("leaflet");

        loadMap();

        const globalResponse = await fetch(
            "https://de1.api.radio-browser.info/json/stations?limit=1000",
        );
        const nepalResponse = await fetch(
            "https://de1.api.radio-browser.info/json/stations/bycountry/Nepal",
        );
        let globalStations = await globalResponse.json();
        const nepalStations = await nepalResponse.json();

        sRadioStations = [...globalStations, ...nepalStations].filter(
            (station) => station.geo_lat !== null && station.geo_long !== null,
        );
        radioStations.set(sRadioStations);

        const fLength = sRadioStations.length;
        let randomNumber = Math.floor(Math.random() * fLength);

        sCurrentRadioStation = sRadioStations[randomNumber];
        currentRadioStation.set(sCurrentRadioStation);

        handleStataionHistory();
        plotLocationOnMap();

        setTimeout(() => loadingRequest.set(false), 1000);

        const secondBatchResponse = await fetch(
            "https://de1.api.radio-browser.info/json/stations?limit=9000&offset=1000",
        );
        const secondBatch = await secondBatchResponse.json();

        const newStations = secondBatch.filter(
            (station) => station.geo_lat !== null && station.geo_long !== null,
        );
        sRadioStations = [...sRadioStations, ...newStations];

        plotLocationOnMap();
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
    }

    $: {
        if (markers && sCurrentRadioStation && sCurrentRadioStation.name) {
            markers.forEach((item) => {
                if (
                    item.name === sCurrentRadioStation.name &&
                    item.geo_lat === sCurrentRadioStation.geo_lat &&
                    item.geo_long === sCurrentRadioStation.geo_long
                ) {
                    item.setStyle({
                        radius: 9,
                        fillColor: "#FFCC00",
                        fillOpacity: 0.9,
                        color: mapDetails.color,
                        weight: 5,
                    });

                    item.bringToFront();
                } else {
                    item.setStyle({
                        radius: 3,
                        fillColor: mapDetails.fillColor,
                        fillOpacity: 0.9,
                        color: mapDetails.color,
                        weight: 0,
                    });

                    item.bringToBack();
                }
            });
        }
    }

    $: {
        mapDetails = {
            map: sDarkMode
                ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png",
            fillColor: sDarkMode ? "#fff" : "#000",
            color: "#797979",
        };

        if(map) map.remove();

        loadMap();
        plottedRadioStations = [];
        plotLocationOnMap();
    }
</script>

<div class="map-container">
    <div id="map"></div>

    <div
        on:click={handleLocateMe}
        class="locate-me"
        id={showingUserLocation ? "gradient" : ""}
    >
        <i class="fa-solid fa-location-crosshairs"></i>
    </div>

    {#if sLoadingRequest}
        <div
            class="loading-container"
            in:scale={{ duration: 300 }}
            out:fade={{ duration: 300 }}
        >
            <Loading />
        </div>
    {/if}
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

    .loading-container {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1000;
    }

    #gradient {
        animation: borderAnimation 7s infinite linear;
    }

    @keyframes borderAnimation {
        0% {
            background: linear-gradient(45deg, #ffcc00, #ddff00);
        }
        50% {
            background: linear-gradient(-45deg, #ffcc00, #ddff00);
        }
        100% {
            background: linear-gradient(45deg, #ffcc00, #ddff00);
        }
    }
</style>
