<script>
    import { currentRadioStation, favoriteStations } from "$lib/store";

    let sCurrentRadioStation = {};
    let sFavoriteStations = [];

    currentRadioStation.subscribe((value) => {
        sCurrentRadioStation = value;
    });

    favoriteStations.subscribe((value) => {
        sFavoriteStations = value;
    });

    const removeFavorite = (i) => {
        sFavoriteStations.splice(i, 1);
        sFavoriteStations = [...sFavoriteStations];

        favoriteStations.set(sFavoriteStations);
    };

    const playFavorite = (i) => {
        sCurrentRadioStation = sFavoriteStations[i];
        currentRadioStation.set(sCurrentRadioStation);
    };
</script>

<div class="station-list">
    <h2>Favorites</h2>
    {#if sFavoriteStations.length == 0}
        <div class="no-favorite">
            <div class="no-favorite-text">
                Add stations to your favorite list
            </div>
            <i class="fa-solid fa-heart-circle-plus"></i>
        </div>
    {/if}
    {#each sFavoriteStations as station, i}
        <div
            class="station-card"
            id={sCurrentRadioStation &&
            sCurrentRadioStation.name == station.name &&
            sCurrentRadioStation.geo_lat == station.geo_lat
                ? "favorite-playing"
                : ""}
        >
            <div on:click={() => playFavorite(i)} class="card-left">
                <div class="station-name">{station.name}</div>
                <div class="station-country">
                    <i class="fa-solid fa-location-dot"></i>
                    {station.country}
                </div>
            </div>
            <div class="card-right">
                <i
                    on:click={() => removeFavorite(i)}
                    class="fa-solid fa-trash-can"
                ></i>
            </div>
        </div>
    {/each}
</div>

<style>
    .station-list {
        padding: 1rem;
        width: 350px;
        max-height: 400px;
        background-color: #f5f5f5;
        border: 5px solid #ffcc00;
        border-radius: 3px;

        border: 5px solid transparent;
        border-radius: 10px;
        background-image: linear-gradient(white, white);
        background-origin: border-box;
        background-clip: content-box, border-box;
        animation: borderAnimation 5s infinite linear;
    }

    @keyframes borderAnimation {
        0% {
            border-image: linear-gradient(
                45deg,
                #ff0000,
                #ff7300,
                #fffb00,
                #00ff00,
                #0000ff,
                #8a2be2
            );
            border-image-slice: 1;
        }
        50% {
            border-image: linear-gradient(
                135deg,
                #ff0000,
                #ff7300,
                #fffb00,
                #00ff00,
                #0000ff,
                #8a2be2
            );
            border-image-slice: 1;
        }
        100% {
            border-image: linear-gradient(
                45deg,
                #ff0000,
                #ff7300,
                #fffb00,
                #00ff00,
                #0000ff,
                #8a2be2
            );
            border-image-slice: 1;
        }
    }

    .station-list h2 {
        margin-bottom: 1rem;
        text-align: center;
    }

    .no-favorite {
        margin-top: 2rem;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .no-favorite-text {
        margin-bottom: 1rem;
        font-size: 1.25rem;
        color: #797979;
    }

    .no-favorite i {
        font-size: 2rem;
    }

    .station-card {
        width: 100%;
        margin: 0.5rem 0;
        padding: 0.5rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #fff;
    }

    #favorite-playing {
        border-color: aqua;
    }

    .card-left {
        width: 75%;
        cursor: pointer;
    }

    .station-name {
        width: 100%;
        font-weight: bold;
        font-size: 0.9rem;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .station-country {
        margin-top: 0.2rem;
        font-size: 0.75rem;
        font-style: italic;
        color: #555;
    }

    .station-country i {
        margin-right: 0.5rem;
    }

    .card-right i {
        margin: 0 0.5rem;
        font-size: 1rem;
        cursor: pointer;
    }

    .card-right i:hover {
        color: #000;
    }
</style>
