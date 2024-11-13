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

As a DevOps engineer, I’m no stranger to handling complex builds. When the opportunity came to develop an on-hold music streaming solution—combining Spotify playlists with Icecast streaming in Docker—I was intrigued. It seemed straightforward at first, but what followed was a deep dive into dependencies, troubleshooting, and quality control. Here’s the journey, the setup, and insights on overcoming technical hurdles.

---

## System Architecture

To give a high-level overview of the setup:

1. **Spotify**: Provides the curated playlist for on-hold music.
2. **Mopidy**: Acts as the main music server, interfacing with Spotify to pull in the audio and stream it locally within the container.
3. **Icecast**: Relays the stream from Mopidy to a public URL accessible to our VoIP system (OnSIP).
4. **Docker Container**: Encapsulates everything, simplifying deployment on compatible infrastructure (e.g., AWS).

This setup runs within Docker, which keeps the system modular and portable. Each component is isolated, making it easy to replace or update parts without overhauling the entire system.

---

## Building the System: Docker, Mopidy, and Icecast Configuration

### Setting Up the Docker Environment

To containerize the project, I created a Dockerfile to manage Mopidy and Icecast along with their dependencies:

```dockerfile
FROM ubuntu:22.04

# Install dependencies
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    wget gnupg2 gstreamer1.0-plugins-base gstreamer1.0-plugins-good \
    python3-pip icecast2 ffmpeg mpc netcat \
    && wget -q -O /etc/apt/keyrings/mopidy.gpg https://apt.mopidy.com/mopidy.gpg \
    && apt-get update && apt-get install -y mopidy

# Copy config files and set entrypoint
COPY mopidy.conf.template /root/.config/mopidy/mopidy.conf
COPY icecast.xml /etc/icecast2/icecast.xml
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose Icecast and Mopidy ports
EXPOSE 8000 6680
ENTRYPOINT ["/entrypoint.sh"]
```

This configuration installs Mopidy and Icecast with all necessary plugins for Spotify integration, creating a containerized music server ready for deployment.

### Stream Management and Entrypoint

The `entrypoint.sh` file orchestrates service startup, checking that Icecast and Mopidy are running before streaming the configured Spotify playlist. Here’s the structure:

```bash
#!/bin/bash
set -e
service icecast2 start
mopidy &

# Wait and start the playlist
mpc add spotify:playlist:63TTU7Wm4CuSSBfHeswCmR
mpc play
```

This script ensures both services are live before streaming the playlist, with Mopidy managing the Spotify connection.

---

## Key Configuration Files

### Mopidy Configuration

To link Mopidy to Spotify, `mopidy.conf.template` includes the necessary Spotify client ID and secret. Initially, I tested with hardcoded credentials, but production-ready setup uses environment variables for security:

```ini
[spotify]
client_id = ${SPOTIFY_CLIENT_ID}
client_secret = ${SPOTIFY_CLIENT_SECRET}
output = lamemp3enc ! shout2send mount=loftwah-jams ip=127.0.0.1 port=8000 password=password
```

This setup directs Mopidy’s output to Icecast, where it can be accessed via the public mount point.

### Icecast Configuration

Icecast is configured to listen on port `8000` and relay Mopidy’s stream. The `icecast.xml` file specifies mount points, streaming limits, and authentication:

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
        <mount-name>/loftwah-jams</mount-name>
    </mount>
</icecast>
```

The public mount point lets the VoIP system access the stream, delivering Spotify’s music directly to callers.

---

## Monitoring and Alerts

For high availability, I integrated health checks and alerting into the system’s configuration. Here’s what’s in place:

1. **Health Checks**: Regular checks on ports `8000` (Icecast) and `6680` (Mopidy) to confirm service availability.
   - With Docker Compose, here’s a sample configuration:
     ```yaml
     healthcheck:
       test: ["CMD-SHELL", "nc -z localhost 8000 && nc -z localhost 6680"]
       interval: 30s
       timeout: 10s
       retries: 3
     ```

2. **Resource Monitoring**: Using Prometheus and Grafana to track CPU, memory, and network usage, alerting on potential performance issues due to high load or network congestion.

3. **Log Monitoring**: Icecast and Mopidy logs are monitored with the ELK Stack, detecting errors such as stream drops, unauthorized access, or disconnections.

---

## Expected Performance Metrics

In production, several performance metrics are tracked to maintain a seamless caller experience:

1. **Latency**: Spotify playback to Icecast stream delay kept under 1 second for smooth playback.
2. **Uptime**: Ensuring 99.9% uptime for both services, as on-hold music affects customer perception.
3. **Stream Quality**: Targeting 320 kbps bitrate with minimal buffering, ensuring high-quality audio for callers.
4. **Resource Utilization**: CPU < 70% and memory < 60% are aimed to prevent overloads during peak hours.

These metrics ensure the system remains reliable and performant in production.

---

## Final Thoughts and Lessons Learned

This project challenged me to consider new ways to package and deliver audio services within Docker. Here are my main takeaways:

1. **Early Production Testing is Key**: There’s often a gap between local and production environments, especially for resource-heavy streaming services.
2. **Credential Security is Crucial**: Hardcoding credentials is convenient for testing but should be replaced with environment variables or secrets management in production.
3. **Optimizing User Experience**: On-hold music contributes significantly to customer perception. Small improvements in stream quality and availability make a big difference.

Creating this streaming service required deeper troubleshooting than anticipated, but it resulted in a resilient, Dockerized solution that securely manages on-hold music playback. If you’re interested in setting up something similar or have questions on configurations, hit me up on socials—I'm happy to share insights on streaming services, Docker, or DevOps strategies.

---

**Dean Lofts (Loftwah)**  
DevOps Engineer, Music Producer, and Author

---