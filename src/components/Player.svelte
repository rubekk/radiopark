<script>
    import { browser } from "$app/environment";
    import {
        radioStations,
        currentRadioStation,
        playRadio,
        favoriteStations,
        stationHistory,
        stationLocation,
        sleepTimer,
    } from "$lib/store";

    let sRadioStations = [];
    let sCurrentRadioStation = {};
    let sPlayRadio = false;
    let sFavoriteStations = [];
    let sStationHistory = [];
    let audioElem;
    let volume = 0.3;
    let volumeIcon = "fa-volume-low";
    let isFavorite = false;

    radioStations.subscribe((value) => {
        sRadioStations = value;
    });

    currentRadioStation.subscribe((value) => {
        sCurrentRadioStation = value;
    });

    playRadio.subscribe((value) => {
        sPlayRadio = value;
    });

    favoriteStations.subscribe((value) => {
        sFavoriteStations = value;
    });

    stationHistory.subscribe((value) => {
        sStationHistory = value;
    });

    const handlePlayPause = () => {
        if (!sCurrentRadioStation || !sCurrentRadioStation.name) return;

        sPlayRadio = !sPlayRadio;
        playRadio.set(sPlayRadio);
    };

    const handleShuffle = () => {
        let randomNumber = Math.floor(Math.random() * sRadioStations.length);

        sCurrentRadioStation = sRadioStations[randomNumber];
        currentRadioStation.set(sCurrentRadioStation);

        if (
            sStationHistory.length <= 0 ||
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
    };

    const handleVolume = () => {
        if (audioElem) audioElem.volume = volume;
    };

    const handleFavorite = () => {
        let i = sFavoriteStations.findIndex(
            (station) =>
                station.name == sCurrentRadioStation.name &&
                station.country == sCurrentRadioStation.country &&
                station.geo_lat == sCurrentRadioStation.geo_lat,
        );

        if (i >= 0) sFavoriteStations.splice(i, 1);
        else sFavoriteStations.push(sCurrentRadioStation);

        sFavoriteStations = [...sFavoriteStations];
        favoriteStations.set(sFavoriteStations);

        if(browser) localStorage.setItem("favorite", JSON.stringify(sFavoriteStations));
    };

    const handleUndo = () => {
        if (sStationHistory.length <= 1) return;

        sStationHistory.shift();
        stationHistory.set(sStationHistory);

        if (sStationHistory.length > 0)
            currentRadioStation.set(sStationHistory[0]);
    };

    const handleStationLocation = () => {
        if (sCurrentRadioStation && sCurrentRadioStation.geo_lat) {
            stationLocation.set({
                lat: sCurrentRadioStation.geo_lat,
                lon: sCurrentRadioStation.geo_long,
            });
        }
    };

    const checkIsFavorite = () => {
        let i = sFavoriteStations.findIndex(
            (station) =>
                station.name == sCurrentRadioStation.name &&
                station.country == sCurrentRadioStation.country &&
                station.geo_lat == sCurrentRadioStation.geo_lat,
        );

        return i >= 0;
    };

    $: {
        if (audioElem) {
            if (
                sPlayRadio &&
                sCurrentRadioStation &&
                sCurrentRadioStation.name
            ) {
                audioElem.setAttribute("src", sCurrentRadioStation.url);
                audioElem.volume = volume;
                audioElem.play();
            } else if (!sPlayRadio && sCurrentRadioStation.name) {
                audioElem.pause();
            }
        }
    }

    $: isFavorite = sFavoriteStations.some(
        (station) =>
            station.name === sCurrentRadioStation.name &&
            station.country === sCurrentRadioStation.country &&
            station.geo_lat === sCurrentRadioStation.geo_lat,
    );

    $:volumeIcon = volume == 0 ? "fa-volume-mute" : volume < 0.5 ? "fa-volume-low" : "fa-volume-high";
</script>

<div class={sPlayRadio ? "player anim" : "player"}>
    <div class="player-info">
        <p class="station-name">
            {sCurrentRadioStation.name
                ? sCurrentRadioStation.name
                : "Radio Live 91.5"}
        </p>
        <p class="country-name">
            <i class="fa-solid fa-location-dot"
            ></i>{sCurrentRadioStation.country
                ? sCurrentRadioStation.country
                : "Nepal"}
        </p>
    </div>
    <div class="player-btns">
        <i on:click={handleUndo} class="fa-solid fa-arrow-rotate-left"></i>
        <i
            on:click={handlePlayPause}
            class={sPlayRadio ? "fa-solid fa-pause" : "fa-solid fa-play"}
        ></i>
        <i
            on:click={handleFavorite}
            class={isFavorite
                ? "fa-solid fa-heart red-heart"
                : "fa-solid fa-heart"}
        ></i>
        <i on:click={handleShuffle} class="fa-solid fa-shuffle"></i>
        <i class={`fa-solid ${volumeIcon}`} id="volume-btn">
            <input
                on:change={handleVolume}
                bind:value={volume}
                type="range"
                min="0"
                max="1"
                step="0.1"
            />
        </i>
        <i on:click={handleStationLocation} class="fa-solid fa-location-dot"
        ></i>
    </div>
    <audio bind:this={audioElem}></audio>
</div>

<style>
    .player {
        padding: 1rem;
        width: 350px;
        background-color: #dcdcdc;
        color: #000;
        border: 5px solid #FFCC00;
        border-radius: 3px;
    }

    .player-info {
        margin-left: 0.5rem;
    }

    .station-name {
        font-weight: bold;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .country-name {
        margin-top: 0.2rem;
        font-size: 0.8rem;
        font-style: italic;
        color: #000;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .country-name i {
        margin-right: 0.5rem;
        color: #797979;
    }

    .player-btns {
        margin: 1.5rem 0 0 0.5rem;
        font-size: 1.2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
    }

    .player-btns i {
        padding: 0.5rem;
        color: #000;
        border-radius: 3px;
        transition: 0.3s;
        cursor: pointer;
    }

    .player-btns i:hover {
        background-color: #aaaaaa;
    }

    .red-heart {
        color: red !important;
    }

    #volume-btn:hover input[type="range"] {
        display: block;
    }

    input[type="range"] {
        padding: 0.5rem;
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        width: 5rem;
        display: none;
        transform: rotate(-90deg);
        position: absolute;
        bottom: 155%;
        right: 9.5%;
    }

    input[type="range"]:focus {
        outline: none;
    }

    input[type="range"]::-webkit-slider-runnable-track {
        background-color: #053a5f;
        height: 0.5rem;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        margin-top: -9px;
        background-color: #5cd5eb;
        height: 1.5rem;
        width: 0.5rem;
    }

    input[type="range"]:focus::-webkit-slider-thumb {
        border: none;
        outline: none;
    }

    input[type="range"]::-moz-range-track {
        background-color: #053a5f;
        border-radius: 0.5rem;
        height: 0.5rem;
    }

    input[type="range"]::-moz-range-thumb {
        border: none;
        border-radius: 0;
        background-color: #5cd5eb;
        height: 2rem;
        width: 1rem;
    }

    input[type="range"]:focus::-moz-range-thumb {
        border: 1px solid #053a5f;
        outline: 3px solid #053a5f;
        outline-offset: 0.125rem;
    }


    .anim {
        border-radius: 3px;
        box-shadow: 0 0 10px #ddff00;
        animation: borderAnimation 7s infinite linear;
    }

    @keyframes borderAnimation {
        0% {
            border-image: linear-gradient(
                45deg,
                #ffcc00, #dcdcdc, #ddff00
            );
            border-image-slice: 1;
        }
        50% {
            border-image: linear-gradient(
                -45deg,
                #ffcc00, #dcdcdc, #ddff00
            );
            border-image-slice: 1;
        }
        100% {
            border-image: linear-gradient(
                45deg,
                #ffcc00, #dcdcdc, #ddff00
            );
            border-image-slice: 1;
        }
    }

    /* media queries */
    @media (max-width: 450px) {
        .player {
            width: 100vw;
            border: none;
            border-top: 5px solid #FFCC00;
        }
    }
</style>
