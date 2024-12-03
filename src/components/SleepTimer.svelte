<script>
    import { playRadio, sleepTimer } from "$lib/store";

    const timerTimes = ["Keep playing", "15 min", "30 min", "1 hr", "2 hr"];
    let sSleepTimer = "Keep playing";
    let timer = null;

    sleepTimer.subscribe((value) => {
        sSleepTimer = value;
    });

    const handleSleepTimer = (time) => {
        sSleepTimer = time;
        sleepTimer.set(sSleepTimer);

        if(timer) clearTimeout(timer);

        switch(time) {
            case "Keep playing":
                return;
                break;
            case "15 min":
                timer = setTimeout(() => {
                    playRadio.set(false)

                    sSleepTimer = "Keep playing"
                    sleepTimer.set(sSleepTimer);
                }, 1000*30)
                break;
            case "30 min":
                timer = setTimeout(() => {
                    playRadio.set(false)

                    sSleepTimer = "Keep playing"
                    sleepTimer.set(sSleepTimer);
                }, 1000*60*30)
                break;
            case "1 hr":
                timer = setTimeout(() => {
                    playRadio.set(false)

                    sSleepTimer = "Keep playing"
                    sleepTimer.set(sSleepTimer);
                }, 1000*60*15)
                break;
            case "2 hr":
                timer = setTimeout(() => {
                    playRadio.set(false)

                    sSleepTimer = "Keep playing"
                    sleepTimer.set(sSleepTimer);
                }, 1000*60*120)
                break;
        }
    };
</script>

<div class="sleep-timer">
    <h2>Sleep timer</h2>
    <div class="timer-times">
        {#each timerTimes as time}
            <span on:click={() => handleSleepTimer(time)} class="timer-time" id={time == sSleepTimer ? 'anim' : ""}
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
        cursor: pointer;
    }

    #anim {
        border: 4px solid #FFCC00;
        border-radius: 3px;
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
</style>
