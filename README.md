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
