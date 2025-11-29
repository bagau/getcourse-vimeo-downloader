// ==UserScript==
// @name         GetCourse Vimeo HLS Receiver (insert in .standard-page-content)
// @namespace    https://example.com
// @version      1.2
// @description  Получает HLS ссылки из Vimeo iframe и вставляет все блоки в начало контента
// @match        *://*.getcourse.ru/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  console.log("[VimeoDL Receiver] started");

  const iframes = Array.from(
    document.querySelectorAll('iframe[src*="player.vimeo.com/video/"]')
  );
  if (!iframes.length) {
    console.warn("[VimeoDL Receiver] Vimeo iframes not found");
    return;
  }

  const container = document.querySelector(".standard-page-content");
  if (!container) {
    console.warn("[VimeoDL Receiver] .standard-page-content not found");
    return;
  }

  // создаём общий блок для всех ссылок
  const listBox = document.createElement("div");
  listBox.style.cssText = `
    background:#0056b3;
    color:white;
    padding:14px;
    border-radius:8px;
    font-family:sans-serif;
    margin-bottom:20px;
  `;
  container.prepend(listBox);

  function getLessonTitle() {
    const el = document.querySelector(".lesson-title-value");
    return el?.textContent.trim() || "video";
  }

  const extractId = (src) => src.match(/video\/(\d+)/)?.[1] || null;

  iframes.forEach((f, i) => {
    console.log(`[VimeoDL Receiver] iframe #${i + 1}:`, f.src);
  });

  window.addEventListener("message", (event) => {
    if (!event.data || event.data.type !== "VIMEO_HLS_FOUND") return;

    const { url, frameSrc } = event.data;
    const incomingId = extractId(frameSrc);
    const iframe = iframes.find((f) => extractId(f.src) === incomingId);
    if (!iframe) {
      console.warn(
        "[VimeoDL Receiver] ⚠️ Could not find matching iframe for",
        frameSrc
      );
      return;
    }

    const idx = iframes.indexOf(iframe);
    const title = getLessonTitle();
    const suffix = iframes.length > 1 ? ` - ${idx + 1}` : "";
    const filename = encodeURIComponent(title + suffix + ".mp4");
    const encodedURL = encodeURIComponent(url);
    const localhostLink = `http://localhost:3000/download?url=${encodedURL}&filename=${filename}`;

    console.log(
      `[VimeoDL Receiver] ✅ Adding link for iframe #${idx + 1}:`,
      localhostLink
    );

    const linkBlock = document.createElement("div");
    linkBlock.innerHTML = `
      <div style="font-weight:bold;margin-top:8px;">🎬 Видео ${
        idx + 1
      }${suffix}</div>
      <div style="font-family:monospace;word-break:break-all;">
        <a href="${localhostLink}" target="_blank" style="color:#fff;text-decoration:underline;">
          ${localhostLink}
        </a>
      </div>
    `;

    listBox.appendChild(linkBlock);
  });
})();
