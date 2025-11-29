import express from "express";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

// Get current directory path (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
// Save videos to ../videos folder
const DOWNLOAD_DIR = path.join(__dirname, "..", "videos");

console.log(`Files will be saved to: ${DOWNLOAD_DIR}`);

app.get("/download", (req, res) => {
  const { url, filename = "video.mp4" } = req.query;

  if (!url) return res.status(400).send("Error: url parameter is missing");

  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.write(`Starting download of "${filename}"...\n\n`);

  let lastUpdate = 0;
  const filepath = path.join(DOWNLOAD_DIR, filename);
  // Copy video stream without re-encoding (faster)
  const ff = spawn("ffmpeg", ["-i", url, "-c", "copy", "-y", filepath]);

  // Parse ffmpeg progress output
  ff.stderr.on("data", (data) => {
    const line = data.toString();
    const progress = line.match(
      /time=(\d{2}:\d{2}:\d{2}\.\d{2}).*size=\s*([0-9.]+)kB/
    );

    // Update progress every 1 second
    if (progress && Date.now() - lastUpdate > 1000) {
      lastUpdate = Date.now();
      res.write(
        `downloaded: ${progress[1]} - ${parseFloat(progress[2]).toFixed(
          0
        )} kB\n`
      );
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

    // Verify video file integrity with ffprobe
    const probe = spawn("ffprobe", [
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
