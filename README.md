🐺 WolfNLB Test Suite

Comprehensive testing suite for WolfNLB — a high-performance Layer-4 TCP Network Load Balancer built using Netty.

This repository contains:

🟢 Backend API servers (Node.js)

🔴 Client load testing tool (Node.js)

🧪 Structured test scenarios for correctness, failover, performance, and resilience

📁 Repository Structure
WolfNLB-Test-Suit/
│
├── backend-server/     # Node.js API backend servers
├── client-tool/        # Node.js load & stress testing tool
└── README.md
🎯 Purpose

This test suite is designed to validate:

✅ Load balancing correctness (RR / LC / Hash)

✅ Backend failover behavior

✅ Health check integration

✅ Backpressure handling

✅ Zero-copy forwarding stability

✅ Graceful shutdown behavior

✅ Performance & scalability

✅ Chaos & resilience testing

🧰 Prerequisites

Make sure you have:

Node.js v18+

npm

Your WolfNLB running locally (default: localhost:9000)

Java 17+ (for WolfNLB)

Optional tools:

wrk

k6

netstat

lsof

jvisualvm

🚀 Step 1 — Start Backend API Servers

Navigate to backend folder:

cd backend-server
npm install

Start 3 backend servers:

SERVER_ID=backend-1 PORT=3001 node backend.js
SERVER_ID=backend-2 PORT=3002 node backend.js
SERVER_ID=backend-3 PORT=3003 node backend.js

Each backend exposes:

Endpoint	Purpose
/	Basic response with server identity
/health	Health check endpoint
/slow?delay=ms	Simulates slow response
/cpu	CPU stress test
/large	Large payload test
/crash	Force backend crash
🚀 Step 2 — Start WolfNLB

Ensure WolfNLB is configured with:

localhost:3001
localhost:3002
localhost:3003

Run WolfNLB on:

localhost:9000
🚀 Step 3 — Run Load Testing Tool

Navigate to client tool:

cd client-tool
npm install

Basic load test:

CONCURRENCY=50 DURATION=20 TARGET=http://localhost:9000 node load-client.js

Environment variables:

Variable	Description
TARGET	NLB endpoint
CONCURRENCY	Number of concurrent workers
DURATION	Test duration in seconds
🧪 TESTING SCENARIOS
✅ 1. Basic Routing Test
curl http://localhost:9000

Expected:

Response alternates between backend-1, backend-2, backend-3

✅ 2. Round Robin Distribution
CONCURRENCY=20 DURATION=10 node load-client.js

Expected distribution:

backend-1 ≈ 33%
backend-2 ≈ 33%
backend-3 ≈ 33%
✅ 3. Least Connection Test

Modify target:

TARGET=http://localhost:9000/slow?delay=5000 CONCURRENCY=50 DURATION=20 node load-client.js

Expected:

New connections prefer backend with fewer active connections

✅ 4. Backend Crash Failover

Start load

Kill one backend:

Ctrl+C on backend-2

Expected:

Health checker marks backend DOWN

Traffic redistributed

Minimal request failures (<2%)

✅ 5. Health Recovery Test

Restart crashed backend

Wait for health threshold

Expected:

Backend re-added to active pool

Traffic resumes evenly

✅ 6. Slow Backend / Backpressure Test
TARGET=http://localhost:9000/slow?delay=10000 CONCURRENCY=100 DURATION=30 node load-client.js

Monitor:

Memory (jvisualvm)

CPU

No unbounded memory growth

✅ 7. CPU Stress Test
TARGET=http://localhost:9000/cpu CONCURRENCY=100 DURATION=20 node load-client.js

Expected:

Backend CPU spikes

NLB remains stable

✅ 8. Large Payload Test
TARGET=http://localhost:9000/large CONCURRENCY=20 DURATION=15 node load-client.js

Expected:

Stable memory

No OOM

Zero-copy forwarding working

✅ 9. NLB Graceful Shutdown Test

Start load test

Trigger NLB graceful shutdown

Expected:

No stuck connections

No FD leaks

Clean exit

Check:

netstat -an | grep 9000
lsof -p <nlb_pid>
🔥 10. Chaos Test

While load running:

Kill backend randomly

Restart backend

Restart NLB

Add artificial delay

Simulate packet loss (iptables)

Expected:

No deadlocks

No memory leaks

Proper failover

📊 Performance Metrics to Observe
Metric	Target
p95 latency	< 3x baseline
Memory growth	Stable
CPU	< 80% sustained
Connection leaks	0
Backend failover	Immediate reroute
