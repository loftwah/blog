---
title: "Building an On-Hold Music Streaming Service with Spotify, Mopidy, and Icecast in Docker"
description: "A journey through the challenges and technical nuances of creating a streaming service for on-hold music, combining Spotify with Mopidy and Icecast, all within a Docker container."
pubDate: "Nov 13, 2024"
heroImage: "/images/on-hold-music-streaming.jpg"
author: "Dean Lofts (Loftwah)"
---

**Building an On-Hold Music Streaming Service with Spotify, Mopidy, and Icecast in Docker**

*Exploring the setup, integration, and deployment of an on-hold music solution using open-source tools and Docker.*

---

As a DevOps engineer, I’m no stranger to handling complex builds. When the opportunity came to develop an on-hold music streaming solution, combining Spotify playlists with Icecast streaming in Docker, I was intrigued. It seemed straightforward—stream some music via a Dockerized service—but what followed was a deep dive into dependencies, real-time troubleshooting, and a battle with stream quality. Here’s the journey, the setup, and some insights into overcoming technical hurdles.

---

## System Architecture

To give you a sense of the setup, here’s a high-level overview of the components and how they interact in this Dockerized streaming environment:

1. **Spotify**: Our streaming source, providing the curated playlist for the on-hold music.
2. **Mopidy**: Acts as the main music server, interfacing with Spotify to pull in the audio and stream it locally within the container.
3. **Icecast**: Relays the stream from Mopidy to the outside world, accessible via a public URL that our VoIP system (OnSIP) can use.
4. **Docker Container**: Encapsulates the entire system, ensuring all dependencies and configurations are packaged together, simplifying deployment and portability.

The entire setup runs within a Docker container, which allows us to keep the system modular and easily deployable on any compatible infrastructure, like AWS. This design keeps each component isolated, making it easy to replace or update individual parts (e.g., swapping Mopidy with another streaming server if needed).

---

## Building the System: Docker, Mopidy, and Icecast Configuration

### Setting Up the Docker Environment

To containerize the project, I started by setting up a Dockerfile that could manage Mopidy and Icecast along with the necessary dependencies. Here’s the Dockerfile setup:

```dockerfile
FROM ubuntu:22.04

# Set up environment and install dependencies
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    wget gnupg2 gstreamer1.0-plugins-base gstreamer1.0-plugins-good \
    python3-pip icecast2 ffmpeg mpc netcat \
    && wget -q -O /etc/apt/keyrings/mopidy.gpg https://apt.mopidy.com/mopidy.gpg \
    && apt-get update && apt-get install -y mopidy

# Copy configuration files and set entrypoint
COPY mopidy.conf /root/.config/mopidy/mopidy.conf
COPY icecast.xml /etc/icecast2/icecast.xml
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose Icecast and Mopidy ports
EXPOSE 8000 6680
ENTRYPOINT ["/entrypoint.sh"]
```

This configuration supports both Mopidy and Icecast, installing necessary plugins for Spotify integration.

### Stream Management and Entrypoint

The `entrypoint.sh` file orchestrates the start of each service (Icecast and Mopidy), waits until each is running, and then initiates playback from the configured Spotify playlist. Here’s the script’s basic structure:

```bash
#!/bin/bash
set -e
service icecast2 start
mopidy &
mpc add spotify:playlist:63TTU7Wm4CuSSBfHeswCmR
mpc play
```

This script handles service initiation, ensuring that the on-hold music starts as soon as both Icecast and Mopidy are ready.

---

## Key Configuration Files

### Mopidy Configuration

For Mopidy to stream Spotify playlists, I added the necessary configuration in `mopidy.conf`. Credentials were initially hardcoded for testing, but production required environment variables for security.

```ini
[spotify]
client_id = <YOUR_CLIENT_ID>
client_secret = <YOUR_CLIENT_SECRET>
output = lamemp3enc ! shout2send mount=schoolstatus-jams ip=127.0.0.1 port=8000 password=password
```

This setup ensures Mopidy streams directly to Icecast, allowing real-time playback on the on-hold line.

### Icecast Configuration

Configuring Icecast to listen on port `8000` and relay Mopidy’s output required a custom `icecast.xml` file. Here’s the critical part:

```xml
<icecast>
    <limits>
        <clients>100</clients>
    </limits>
    <authentication>
        <source-password>password</source-password>
        <admin-password>password</admin-password>
    </authentication>
    <mount>
        <mount-name>/schoolstatus-jams</mount-name>
    </mount>
</icecast>
```

This file sets the streaming limit, authentication, and mount point, which is accessible to OnSIP.

---

## Monitoring and Alerts

For real-time monitoring, setting up health checks and alerts on both Icecast and Mopidy is crucial, especially as streaming services demand high availability. Here’s how I plan to implement monitoring in the next phases of this setup:

1. **Health Checks**: Basic health checks on ports `8000` (Icecast) and `6680` (Mopidy) will confirm the availability of each service.
   - For Docker Compose, we can use the following YAML configuration:
     ```yaml
     healthcheck:
       test: ["CMD-SHELL", "nc -z localhost 8000 && nc -z localhost 6680"]
       interval: 30s
       timeout: 10s
       retries: 3
     ```

2. **System Resource Monitoring**: Using tools like Prometheus and Grafana to monitor CPU, memory, and network bandwidth. Streaming can be resource-intensive, so alerts based on high CPU/memory usage would be set up to preemptively address performance issues.

3. **Log Monitoring and Alerting**: Both Mopidy and Icecast logs can be monitored for specific error patterns using services like ELK Stack (Elasticsearch, Logstash, and Kibana) or a lightweight alternative like Fluentd.
   - Key metrics to track include:
     - Error rates for connection drops
     - Stream interruptions
     - Unauthorized access attempts on the admin interfaces

---

## Expected Performance Metrics

In production, some key performance metrics to assess include:

1. **Latency**: Minimal delay between Spotify playback and the Icecast stream. We aim for latency under 1 second to ensure callers experience seamless playback without noticeable lag.

2. **Uptime**: A minimum uptime of 99.9% for both services. High availability is essential, given that on-hold music directly impacts customer experience.

3. **Stream Quality**: Bitrate consistency (target: 320 kbps) and low buffer rates, ensuring smooth playback. Stream quality checks will ensure that the bitrate matches Spotify’s high-quality setting.

4. **Resource Utilization**: Monitoring that CPU and memory usage remains within reasonable limits (e.g., CPU < 70% and memory < 60%) to avoid server overloads, particularly during peak usage.

These metrics will be critical for refining the system’s resilience and identifying performance bottlenecks in production.

---

## Final Thoughts and Lessons Learned

This project pushed me to rethink how we package and deliver audio services within Docker. Here’s what I’d recommend for anyone facing a similar challenge:

1. **Docker Is Powerful but Test Early in Production Environments**: Resource constraints differ vastly between local and cloud environments, so plan to test for production early.
2. **Security Matters**: Credentials should never be hardcoded. Use environment variables or secure secrets management to keep sensitive data safe.
3. **User Experience**: Surprisingly, on-hold music plays a big role in customer perception—investing time in creating a seamless experience is well worth it.

Creating a streaming service may not have been the straightforward task I envisioned, but the result was a robust, Dockerized solution that handles on-hold music securely and reliably. If you’re considering a similar setup, know that while there will be challenges, each solution learned is an asset you can carry forward.

Got questions about setting up streaming services? Drop a comment below, and I’ll be happy to share more details on configurations, troubleshooting, or DevOps strategies.

---

**Dean Lofts (Loftwah)**  
DevOps Engineer, Music Producer, and Author

---