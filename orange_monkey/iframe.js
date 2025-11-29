// ==UserScript==
// @name         Vimeo HLS Sender (2s delay, reliable)
// @namespace    https://example.com
// @version      1.4
// @description  Отправляет наружу ссылку на .m3u8 из player.vimeo.com после 2с задержки
// @match        *://player.vimeo.com/video/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  console.log(
    "[VimeoHLS Sender] injecting script into page context (2s delay)"
  );

  const injectedCode = `
    setTimeout(() => {
      console.log('[VimeoHLS injected] running after 2s delay');

      const cfg = window.playerConfig;
      const url = cfg?.request?.files?.hls?.cdns?.akfire_interconnect_quic?.url;

      if (url) {
        console.log('[VimeoHLS injected] ✅ found HLS URL:', url);
        window.parent.postMessage({
          type: 'VIMEO_HLS_FOUND',
          url,
          frameSrc: window.location.href
        }, '*');
      } else {
        console.warn('[VimeoHLS injected] ⚠️ playerConfig or HLS URL not found after 2s');
      }
    }, 2000);
  `;

  const s = document.createElement("script");
  s.textContent = injectedCode;
  document.documentElement.appendChild(s);
  s.remove();
})();
