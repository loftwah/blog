---
title: "Building an On-Hold Music Streaming Service with Spotify, Mopidy, and Icecast in Docker"
description: "A journey through the challenges and technical nuances of creating a streaming service for on-hold music, combining Spotify with Mopidy and Icecast, all within a Docker container."
pubDate: "Nov 13, 2024"
heroImage: "/images/on-hold-music-streaming.jpg"
author: "Dean Lofts (Loftwah)"
---

**Building an On-Hold Music Streaming Service with Spotify, Mopidy, and Icecast in Docker**

_From Ubuntu version challenges to authentication and performance tuning, here’s the technical journey of creating a reliable, Dockerized on-hold music streaming service._

---

When I was asked to build an on-hold music streaming service for a VoIP system, it started like many DevOps projects—a seemingly straightforward task that unfolded into a journey of technical discoveries, Docker troubleshooting, and insights about how music streaming actually works. Here’s the full story, complete with the technical hurdles, solutions, and lessons learned.

---

## The Initial Challenge

The request was clear: create a service that streams curated Spotify playlists for callers on hold. What made it interesting was realizing that on-hold music actually impacts customer experience more than expected—positive feedback was common. Not something I expected, but it added an extra incentive to get it right.

## First Attempts and Early Lessons

I started with **Ubuntu 24.04 LTS**, thinking the latest version would make installation smoother. That assumption hit a wall fast when I ran into compatibility issues with Mopidy and Icecast dependencies. Dropping back to **Ubuntu 22.04** solved these issues—a solid reminder that newer isn’t always better when stability and compatibility are top priorities.

## Understanding Mopidy and MPD

One of the biggest technical discoveries was understanding how Mopidy and MPD (Music Player Daemon) work together. Initially, I thought Mopidy was just MPD, but it turns out that **Mopidy acts like MPD** through the `mopidy-mpd` plugin. This realization was crucial; it meant I could use MPD commands to control Spotify playback:

```bash
mpc add spotify:playlist:63TTU7Wm4CuSSBfHeswCmR
mpc play
mpc status  # Check if Spotify is streaming correctly
```

## Docker Build: Trial, Error, and Iteration

Here’s what my terminal history looked like as I iterated through Docker builds, tests, and fixes:

```bash
# Initial build and run attempts
docker buildx build --platform linux/amd64 --progress=plain --load -t streaming-service .
docker run -d --name streaming-service -p 8000:8000 -p 6680:6680 streaming-service

# Debugging and log checking
docker logs streaming-service
docker exec -it streaming-service /bin/bash

# Service status verification
docker exec streaming-service service icecast2 status
docker exec streaming-service cat /var/log/icecast2/error.log
docker exec streaming-service journalctl -u mopidy
```

Every rebuild and test revealed something new about how Mopidy and Icecast needed to interact, refining my understanding of each component and how they integrated.

## Spotify Integration: The Authentication Challenge

Getting Spotify playback to work initially was simple enough, but _proper_ authentication required understanding Mopidy’s OAuth flow. I started with hardcoded credentials for speed, but moved to **environment variables** in the production setup:

```ini
[spotify]
client_id = ${SPOTIFY_CLIENT_ID}
client_secret = ${SPOTIFY_CLIENT_SECRET}
output = lamemp3enc ! shout2send mount=/stream ip=127.0.0.1 port=8000 password=password
```

With Mopidy handling OAuth refresh tokens automatically, this setup saved me a lot of manual token management headaches.

## Stream Testing and Verification

Testing the stream required a multi-step approach, using both direct commands and media players:

```bash
# Basic connection testing
curl -I http://localhost:8000/stream

# Playback testing with VLC
vlc http://localhost:8000/stream

# Port verification
docker exec streaming-service netstat -tulpn | grep 8000
```

## The Entrypoint Script Evolution

Getting services to start in the right order was key for reliability. The entrypoint script went through a few iterations before reaching a final, dependable setup:

```bash
#!/bin/bash
set -e

# Start Icecast first
service icecast2 start

# Wait for Icecast to be ready
echo "Waiting for Icecast..."
while ! nc -z localhost 8000; do
  sleep 1
done

# Start Mopidy and wait
mopidy &
echo "Waiting for Mopidy..."
while ! nc -z localhost 6680; do
  sleep 1
done

# Set up the playlist
mpc add spotify:playlist:63TTU7Wm4CuSSBfHeswCmR
mpc play
```

This sequence ensured the necessary services were live before initiating playback, reducing failed starts.

## Production Deployment and Performance Tuning

Once deployed, I learned just how resource-intensive streaming can be. Key monitoring points became essential for keeping it stable:

### Health Checks

Using health checks allowed me to quickly verify service health:

```yaml
healthcheck:
  test: ["CMD-SHELL", "nc -z localhost 8000 && nc -z localhost 6680"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Resource Monitoring

Tracking CPU, memory, and network bandwidth became critical for stable streaming, especially during peak usage. Prometheus and Grafana were valuable for monitoring:

- CPU usage patterns during peak streaming times
- Memory footprint with multiple listeners
- Bandwidth requirements for smooth playback

### Stream Quality Management

I adjusted bitrate to optimize the balance between quality and performance, and set buffer settings to prevent any playback glitches.

---

## Key Lessons and Takeaways

1. **Environment Matters**: Ubuntu 22.04 was a better choice than 24.04 for the specific needs of streaming services.
2. **Service Interaction**: Understanding Mopidy’s MPD compatibility was crucial for smooth playlist control.
3. **Resource Demands**: Streaming services need a tighter focus on resource management than typical web applications.
4. **Testing Tools**: Using curl, VLC, and netstat together provided confidence in the stream’s reliability.
5. **Startup Order**: Orchestrating services in the right order through the entrypoint script was key to reliable operation.

## Final Thoughts and Future Improvements

The final system reliably streams Spotify playlists for on-hold callers, with monitoring and performance checks in place. Future improvements could include:

- Automated playlist updates
- Enhanced health checks and monitoring dashboards
- Failover capabilities for added resilience

If you’re building a similar service, focus first on understanding the service integrations (Mopidy, MPD, Spotify), then scale up your monitoring. These technical challenges were worth it, knowing callers now have a better experience while waiting.

---
