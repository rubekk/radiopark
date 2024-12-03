<script>
    import "./app.css";
    import { fade, scale } from "svelte/transition";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { favoriteStations } from "$lib/store";
    import Map from "./../components/Map.svelte";
    import Title from "../components/Title.svelte";
    import Player from "../components/Player.svelte";
    import Favourites from "../components/Favourites.svelte";
    import SleepTimer from "../components/SleepTimer.svelte";

    let showFavourites = false;
    let showSleep = false;
    let sFavoriteStations = [];

    const handleShowFavourites = () => {
        showSleep = false;
        showFavourites = !showFavourites;
    };

    const handleShowSleep = () => {
        showFavourites = false;
        showSleep = !showSleep;
    };

    const handleFavouritesOuterClick = (e) => {
        if (e.target.classList.contains("favourites-container"))
            showFavourites = false;
    };

    const handleSleepOuterClick = (e) => {
        if (e.target.classList.contains("sleep-container"))
            showSleep = false;
    };

    onMount(() => {
        if(browser) {
            sFavoriteStations = localStorage.getItem("favorite") ? JSON.parse(localStorage.getItem("favorite")) : [];
            favoriteStations.set(sFavoriteStations);
        }
    })
</script>

<div class="container">
    <Map />
    <div class="title">
        <Title />
    </div>
    <div class="player">
        <Player />
    </div>
    <div on:click={handleShowFavourites} class="favourites">
        <i class="fa-solid fa-heart red-heart"></i>
    </div>
    <div on:click={handleShowSleep} class="sleep">
        <i class="fa-solid fa-moon"></i>
    </div>
    <div class="share">
        <i class="fa-solid fa-share"></i>
    </div>
</div>

{#if showFavourites}
    <div
        on:click={handleFavouritesOuterClick}
        class="favourites-container"
        out:fade={{ duration: 300 }}
    >
        <div
            class="favourites-container-inner"
            in:scale={{ duration: 300 }}
            out:fade={{ duration: 300 }}
        >
            <Favourites />
        </div>

        <button on:click={() => showFavourites = false} class="close-btn" in:scale={{ duration: 300 }}
        out:fade={{ duration: 300 }}>Close</button>
    </div>
{/if}

{#if showSleep}
    <div
        on:click={handleSleepOuterClick}
        class="sleep-container"
        out:fade={{ duration: 300 }}
    >
        <div
            class="sleep-container-inner"
            in:scale={{ duration: 300 }}
            out:fade={{ duration: 300 }}
        >
            <SleepTimer />
        </div>

        <button on:click={() => showSleep = false} class="close-btn" in:scale={{ duration: 300 }}
        out:fade={{ duration: 300 }}>Close</button>
    </div>
{/if}

<style>
    .container {
        position: relative;
    }

    .title,
    .player,
    .favourites,
    .sleep,
    .share {
        position: absolute;
        z-index: 500;
    }

    .title {
        top: .5rem;
        left: .5rem;
    }

    .favourites {
        top: 3.5rem;
        right: .5rem;
    }

    .player {
        bottom: .5rem;
        left: .5rem;
    }

    .favourites,
    .sleep,
    .share {
        padding: 0.5rem;
        width: 45px;
        font-size: 1.25rem;
        text-align: center;
        color: #fff;
        background-color: #FFCC00;
        border-radius: 3px;
        cursor: pointer;
    }

    .sleep {
        top: 6.5rem;
        right: .5rem;
    }

    .share {
        bottom: 6rem;
        right: .5rem;
    }

    .favourites-container,
    .sleep-container {
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        position: absolute;
        top: 0%;
        left: 0%;
        z-index: 5000;
    }

    .red-heart {
        color: red;
    }

    .close-btn {
        padding: .5rem 1rem;
        margin-top: 1rem;
        background-color: #fff;
        color: #000;
        border: none;
        border-radius: 3px;
        outline: navajowhite;
        cursor: pointer;
    }
</style>
