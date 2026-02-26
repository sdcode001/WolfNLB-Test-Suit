const axios = require('axios');

const TARGET = process.env.TARGET || 'http://localhost:9000';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || 50);
const DURATION = parseInt(process.env.DURATION || 20); //seconds

let totalRequests = 0;
let failures = 0;
let latencies = [];
let backendDistribution = {};

let running = true;

function recordBackend(server) {
    backendDistribution[server] = (backendDistribution[server] || 0) + 1;
}

//This continiously sends requests and calculates performance matrics variables
async function worker() {
    while (running) {
        const start = Date.now();
        try {
            const res = await axios.get(TARGET);
            const latency = Date.now() - start;

            latencies.push(latency);
            totalRequests++;

            if (res.data.server) {
                recordBackend(res.data.server);
            }
        } catch (err) {
            failures++;
        }
    }
}

// Calculates the pth percentile value from an array of numbers.
// It sorts the array in ascending order, then finds the value
// below which p% of the data points fall.
function percentile(arr, p) {
    const sorted = [...arr].sort((a,b)=>a-b);
    const index = Math.floor((p/100) * sorted.length);
    return sorted[index];
}

/* 
It creates multiple concurrent async workers that continuously send HTTP requests for a fixed 
duration and then calculates performance metrics like RPS and latency percentiles.
*/
async function run() {
    console.log(`Target: ${TARGET}`);
    console.log(`Concurrency: ${CONCURRENCY}`);
    console.log(`Duration: ${DURATION}s`);

    //This starts multiple async workers in parallel.x
    for (let i = 0; i < CONCURRENCY; i++) {
        worker();
    }

    //This stops async workers after DURATION seconds by setting running=false
    setTimeout(() => {
        running = false;
    }, DURATION * 1000);

    setTimeout(() => {
        console.log('\n=== RESULTS ===');
        console.log('Total Requests:', totalRequests);
        console.log('Failures:', failures);
        console.log('RPS:', Math.round(totalRequests / DURATION));
        console.log('p50:', percentile(latencies, 50),' ms');
        console.log('p95:', percentile(latencies, 95),' ms');
        console.log('p99:', percentile(latencies, 99),' ms');
        console.log('\nBackend Distribution:', backendDistribution);
        process.exit(0);
    }, DURATION * 1000 + 2000);
}

run();


// Command to start this load-client: CONCURRENCY=<20> DURATION=<15> TARGET=<target endpoint> node load-client.js