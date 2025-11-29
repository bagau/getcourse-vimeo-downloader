import express from "express";
import path from "path";
import { spawn } from "child_process";

const app = express();
const PORT = 3000;

const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR || "/downloads";

console.log(`Файлы будут сохраняться в: ${DOWNLOAD_DIR}`);

app.get("/download", (req, res) => {
  const url = req.query.url;
  const filename = req.query.filename || "video.mp4";
  const filepath = path.join(DOWNLOAD_DIR, filename);

  if (!url) {
    return res.status(400).send("Ошибка: не указан параметр url");
  }

  // Заголовки для "живого" текстового ответа
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Transfer-Encoding": "chunked",
  });

  res.write(`Начинаем скачивание файла "${filename}"...\n\n`);

  let lastUpdate = 0;
  let errorOutput = "";

  // Простое копирование потоков без перекодирования
  const ff = spawn("ffmpeg", ["-i", url, "-c", "copy", "-y", filepath]);

  ff.stderr.on("data", (data) => {
    const line = data.toString();
    errorOutput += line;
    console.log("ffmpeg:", line);

    const sizeMatch = line.match(/size=\s*([0-9.]+)kB/);
    const timeMatch = line.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);

    if (sizeMatch && timeMatch) {
      const sizeKB = parseFloat(sizeMatch[1]);
      const time = timeMatch[1];
      const now = Date.now();
      if (now - lastUpdate > 1000) {
        lastUpdate = now;
        res.write(`скачано: ${time} - ${sizeKB.toFixed(0)} кБ\n`);
      }
    }
  });

  ff.on("close", (code) => {
    if (code === 0) {
      res.write(`\n✅ Скачивание файла "${filename}" завершено успешно.\n`);
    } else {
      res.write(`\n❌ Ошибка: ffmpeg завершился с кодом ${code}.\n`);
      res.write(`\nВывод ffmpeg:\n${errorOutput}\n`);
      console.error("Полный вывод ffmpeg:", errorOutput);
    }
    res.end();
  });

  ff.on("error", (err) => {
    res.write(`\n⚠️ Ошибка запуска ffmpeg: ${err.message}\n`);
    res.end();
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});
