# GetCourse Vimeo Downloader

A simple video downloader that uses ffmpeg to download and validate video files.

## Disclaimer

This tool is intended for downloading purchased course content for personal offline access. It only works with publicly accessible video streams from courses you have already paid for and have legitimate access to. This is not a hacking tool - it simply automates downloading of content you are authorized to view.

## What it does

- Downloads videos from m3u8 streams using ffmpeg
- Shows download progress in real-time
- Validates downloaded files with ffprobe to ensure they work
- Saves videos to the `videos/` folder

## Files

- `spawn/server.js` - Express server that handles video downloads
- `videos/` - Folder where downloaded videos are saved
- `orange_monkey/host.js` - Userscript that runs on GetCourse pages and extracts video URLs
- `orange_monkey/iframe.js` - Userscript that runs inside Vimeo iframes to capture m3u8 stream links

## Run with Docker

- Build image from repo root: `docker build -t getcourse-vimeo .`
- Run (Linux/macOS, recommended for permissions): `docker run --rm --user "$(id -u):$(id -g)" -p 3000:3000 -v "$(pwd)/videos:/app/videos" getcourse-vimeo`
- Run (Linux/macOS, alternate port): `docker run --rm --user "$(id -u):$(id -g)" -p 3001:3000 -v "$(pwd)/videos:/app/videos" getcourse-vimeo`
- Run (Windows PowerShell): `docker run --rm -p 3000:3000 -v "${PWD}\\videos:/app/videos" getcourse-vimeo`
- Optional: change host port with `-p 8080:3000` or set `-e PORT=3000` to align server port.
- Downloads will appear in the repo `videos/` folder because it is bind-mounted into the container.

## Start Scripts

- One-time init (Linux/macOS): `./scripts/init-docker.sh`
- Start downloader every time (Linux/macOS): `./scripts/start-docker.sh`
- One-time init (Windows PowerShell): `.\scripts\init-docker.ps1`
- Start downloader every time (Windows PowerShell): `.\scripts\start-docker.ps1`
- The start scripts use fixed defaults (image `getcourse-vimeo`, port `3000`, volume `./videos:/app/videos`) and require no parameters.

## ffmpeg/ffprobe command usage

- The server now uses exact command names: `ffmpeg` and `ffprobe`.
- `ffmpeg` and `ffprobe` are installed in the Docker image and resolved from container `PATH`.
- No host installation is required on Windows/macOS/Linux when running through Docker.
- This keeps runtime behavior OS-independent.

## Docker Desktop GUI

- Yes, it can run from Docker Desktop GUI.
- Build image once (CLI): `docker build -t getcourse-vimeo .`
- In Docker Desktop, open `Images`, find `getcourse-vimeo`, click `Run`.
- Set port mapping: host `3000` to container `3000` (or host `3001` to container `3000`).
- Add volume mapping: host `<repo>/videos` to container `/app/videos`.

## Permission fix (existing files)

- If earlier runs created root-owned files, fix once on Linux: `sudo chown -R "$USER:$USER" videos`
