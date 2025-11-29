import express from "express";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync } from "fs";

// Get current directory path (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const PROGRESS_UPDATE_INTERVAL = 1000; // milliseconds

// Save videos to ../videos folder
const DOWNLOAD_DIR = path.join(__dirname, "..", "videos");

// Create videos folder if it doesn't exist
if (!existsSync(DOWNLOAD_DIR)) {
  mkdirSync(DOWNLOAD_DIR, { recursive: true });
  console.log(`Created directory: ${DOWNLOAD_DIR}`);
}

console.log(`Files will be saved to: ${DOWNLOAD_DIR}`);

// Validate downloaded file with ffprobe
function validateFile(filepath, res) {
  // Try snap version first, then standard ffprobe
  const ffprobeCmd = existsSync("/snap/bin/ffmpeg.ffprobe")
    ? "ffmpeg.ffprobe"
    : "ffprobe";
  const probe = spawn(ffprobeCmd, [
    "-v",
    "error",
    "-show_entries",
    "format=duration,size,bit_rate:stream=codec_name,width,height",
    "-of",
    "default=noprint_wrappers=1",
    filepath,
  ]);

  let probeOutput = "";

  probe.stdout.on("data", (data) => {
    probeOutput += data.toString();
  });

  probe.stderr.on("data", (data) => {
    probeOutput += data.toString();
  });

  probe.on("close", (probeCode) => {
    if (probeCode === 0) {
      res.write(`\nVALIDATION_SUCCESS: File is valid and playable\n`);
      res.write(`\nFile information:\n${probeOutput}\n`);
    } else {
      res.write(`\nVALIDATION_FAILED: File is corrupted or invalid\n`);
      res.write(`\nValidation error:\n${probeOutput}\n`);
    }
    res.end();
  });

  probe.on("error", (err) => {
    res.write(
      `\n⚠️ Warning: ffprobe not found. Install ffmpeg to enable validation.\n`
    );
    res.write(`Download completed but file validation skipped.\n`);
    res.end();
  });
}

app.get("/download", (req, res) => {
  const { url, filename = "video.mp4" } = req.query;

  if (!url) {
    return res.status(400).send("Error: url parameter is missing");
  }

  const filepath = path.join(DOWNLOAD_DIR, filename);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Send padding to force browser to start rendering (most browsers need ~1KB)
  res.write(" ".repeat(2048));

  res.write(`Starting download of "${filename}"...\n\n`);

  let lastUpdate = 0;

  // Copy video stream without re-encoding (faster)
  const ff = spawn("ffmpeg", ["-i", url, "-c", "copy", "-y", filepath]);

  // Clean up process if client disconnects
  res.on("close", () => {
    if (!ff.killed) {
      ff.kill("SIGTERM");
    }
  });

  // Parse ffmpeg progress output
  ff.stderr.on("data", (data) => {
    const line = data.toString();

    // Match both time and size (they might be on same or different lines)
    const timeMatch = line.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
    const sizeMatch = line.match(/size=\s*(\d+)kB/);

    // Update progress at defined interval
    if (
      (timeMatch || sizeMatch) &&
      Date.now() - lastUpdate > PROGRESS_UPDATE_INTERVAL
    ) {
      lastUpdate = Date.now();
      const timeStr = timeMatch ? timeMatch[1] : "N/A";
      const sizeKB = sizeMatch ? sizeMatch[1] : "0";
      const progressMsg = `downloaded: ${timeStr} - ${sizeKB} kB\n`;

      res.write(progressMsg);
    }
  });

  // Handle ffmpeg completion
  ff.on("close", (code) => {
    if (code !== 0) {
      res.write(`\n❌ Error: ffmpeg exited with code ${code}\n`);
      return res.end();
    }

    res.write(`\n✅ Download of "${filename}" completed successfully\n`);
    res.write(`\nValidating file with ffprobe...\n`);

    validateFile(filepath, res);
  });

  // Handle ffmpeg execution errors
  ff.on("error", (err) => {
    res.write(`\n⚠️ Error starting ffmpeg: ${err.message}\n`);
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server started: http://localhost:${PORT}`);
});
