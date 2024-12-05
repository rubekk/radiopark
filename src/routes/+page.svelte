<script>
    import "./app.css";
    import { fade, scale } from "svelte/transition";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { ref, set, push, onValue, onDisconnect, child } from "firebase/database";
    import { favoriteStations, loadingRequest } from "$lib/store";
    import { app, db } from "$lib/firebaseConfig"; 
    import Map from "./../components/Map.svelte";
    import Title from "../components/Title.svelte";
    import Player from "../components/Player.svelte";
    import Favourites from "../components/Favourites.svelte";
    import SleepTimer from "../components/SleepTimer.svelte";
    import Loading from "../components/Loading.svelte";

    let showFavourites = false;
    let showSleep = false;
    let sFavoriteStations = [];
    let sLoadingRequest = true;
    let increasedUsers = false;
    let activeUsers = [];
    let totalActiveUsers = 0;

    const increaseActive = () => {
        if(!increasedUsers){
            const activeRef = ref(db, 'active');
            const newActiveRef = push(activeRef);
            
            
            set(newActiveRef, {
                uid: (Date.now() * Math.floor(Math.random() * 25) + 1)
            })
            
            let userId = newActiveRef.key;
            
            onDisconnect(ref(db,'active/' + userId)).set({
                uid: null
            })
        }
        
        increasedUsers = true;
    }

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

    onValue(ref(db, "active"), (snapshot) => {
        if(snapshot.val()){
            activeUsers = Object.values(snapshot.val());

            totalActiveUsers = activeUsers.length;

            console.log(totalActiveUsers)
        }
    });

    onMount(() => {
        if(browser) {
            sFavoriteStations = localStorage.getItem("favorite") ? JSON.parse(localStorage.getItem("favorite")) : [];
            favoriteStations.set(sFavoriteStations);
        }

        increaseActive();
    })
</script>

<div class="container">
    <Map />
    <div class="title">
        <Title />
    </div>
    <div class="total-listeners">
        <i class="fa-solid fa-headphones"></i> {totalActiveUsers} listening
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
    .total-listeners,
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

    .total-listeners {
        font-weight: bold;
        color: #fff;
        top: 5rem;
        left: .5rem;
    }

    .total-listeners i {
        margin-right: .25rem;
        color: rgb(215, 90, 90);
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

    /* media queries */
    @media (max-width: 450px) {
        .player {
            bottom: 0;
            left: 0;
        }

        .share {
            bottom: 9.5rem;
        }
    }
</style>
