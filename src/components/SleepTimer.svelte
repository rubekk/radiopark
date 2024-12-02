<script>
    import { sleepTimer } from "$lib/store";

    const timerTimes = ["Keep playing", "15 min", "30 min", "1 hr", "2 hr"];
    let sSleepTimer = "Keep playing";

    sleepTimer.subscribe((value) => {
        sSleepTimer = value;
    });

    const handleSleepTimer = (time) => {
        sleepTimer.set(sSleepTimer);
    };

</script>

<div class="sleep-timer">
    <h2>Sleep timer</h2>
    <div class="timer-times">
        {#each timerTimes as time}
            <span on:click={() => handleSleepTimer(time)} class="timer-time"
                >{time}</span
            >
        {/each}
    </div>
</div>

<style>
    .sleep-timer {
        padding: 1rem;
        width: 350px;
        background-color: #f5f5f5;
        border: 5px solid #FFCC00;
        border-radius: 3px;
    }
    
    .sleep-timer h2 {
        margin-bottom: 1rem;
        text-align: center;
    }

    .timer-times {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .timer-time {
        padding: 0.5rem 0.75rem;
        text-align: center;
        color: #fff;
        background-color: #797979;
        border-radius: 3px;
    }
</style>
