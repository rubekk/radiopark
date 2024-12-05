import { writable } from "svelte/store";

export const radioStations = writable([]);

export const currentRadioStation = writable({});

export const playRadio = writable(false);

export const favoriteStations = writable([]);

export const stationHistory = writable([]);

export const stationLocation = writable({lat: "", lon: ""});

export const sleepTimer = writable("Keep playing");

export const loadingRequest = writable(true);
