<script>
    import Title from "./Title.svelte";
</script>

<div class="loading" >
    <div class="title">
        <h1 class="title-h1">Radio Park</h1>
        <p>Live Sound, All Around</p>
    </div>
    <div class="loading-text">Getting radio stations</div>
    <div class="loader">
        <div></div>
        <div></div>
        <div></div>
    </div>
</div>

<style>
    .loading {
        width: 100vw;
        height: 100vh;
        background-color: #ffcc00;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .title {
        padding: 0.5rem;
        color: #fff;
        background-color: #ffcc00;
        border-radius: 3px;
    }

    .title h1 {
        font-size: 2rem;
    }

    .title p {
        margin-top: -0.1rem;
        font-size: 1rem;
        font-weight: bold;
        font-style: italic;
        color: #797979;
    }

    .loading-text {
        margin-top: 2rem;
        font-weight: bold;
        color: #797979;
    }

    .loader {
        margin-top: 1rem;
        display: flex;
        gap: 10px;
    }

    .loader div {
        width: 15px;
        height: 15px;
        background-color: #5cd00f;
        border-radius: 50%;
        animation: bounce 1.5s infinite ease-in-out;
    }

    .loader div:nth-child(2) {
        animation-delay: 0.2s;
    }

    .loader div:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes bounce {
        0%,
        80%,
        100% {
            transform: scale(0);
        }
        40% {
            transform: scale(1.1);
        }
    }
</style>
