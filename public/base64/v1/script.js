(function () {
      "use strict";

      var root = document.getElementById("gw-base64-tool");
      if (!root) return;

      var input = document.getElementById("gw-base64-input");
      var output = document.getElementById("gw-base64-output");

      var processButton = document.getElementById("gw-base64-process");
      var processButtonLabel = document.getElementById("gw-base64-process-label");
      var swapButton = document.getElementById("gw-base64-swap");
      var clearButton = document.getElementById("gw-base64-clear");

      var inputTitle = document.getElementById("gw-base64-input-title");
      var outputTitle = document.getElementById("gw-base64-output-title");

      var inputCount = document.getElementById("gw-base64-input-count");
      var outputCount = document.getElementById("gw-base64-output-count");

      var status = document.getElementById("gw-base64-status");
      var statusText = document.getElementById("gw-base64-status-text");

      var tabs = root.querySelectorAll(".gw-tab");

      var currentMode = "encode";

      function isDarkMode() {
        var body = document.body;
        var html = document.documentElement;

        if (body) {
          if (
            body.classList.contains("drK") ||
            body.classList.contains("darkMode") ||
            body.classList.contains("dark-mode") ||
            body.classList.contains("dark") ||
            body.getAttribute("data-theme") === "dark" ||
            body.getAttribute("theme") === "dark"
          ) {
            return true;
          }
        }

        if (html) {
          return (
            html.classList.contains("drK") ||
            html.classList.contains("darkMode") ||
            html.classList.contains("dark-mode") ||
            html.classList.contains("dark") ||
            html.getAttribute("data-theme") === "dark" ||
            html.getAttribute("theme") === "dark"
          );
        }

        return false;
      }

      function syncTheme() {
        root.classList.toggle(
          "gw-dark",
          isDarkMode()
        );
      }

      syncTheme();

      if (window.MutationObserver) {
        var observer = new MutationObserver(
          syncTheme
        );

        observer.observe(document.body, {
          attributes: true,
          attributeFilter: [
            "class",
            "data-theme",
            "theme"
          ]
        });

        if (document.documentElement) {
          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: [
              "class",
              "data-theme",
              "theme"
            ]
          });
        }
      }

      function setStatus(message, type) {
        status.classList.remove(
          "gw-ok",
          "gw-error"
        );

        if (type) {
          status.classList.add(type);
        }

        statusText.textContent = message;
      }

      function updateCounts() {
        inputCount.textContent =
          input.value.length.toLocaleString("id-ID") +
          " karakter";

        outputCount.textContent =
          output.value.length.toLocaleString("id-ID") +
          " karakter";
      }

      function encodeBase64(value) {
        var bytes = new TextEncoder().encode(value);
        var binary = "";

        for (var i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(
            bytes[i]
          );
        }

        return btoa(binary);
      }

      function decodeBase64(value) {
        var cleaned = value.replace(/\s+/g, "");

        if (!cleaned) {
          return "";
        }

        if (cleaned.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
          throw new Error("Format Base64 tidak valid.");
        }

        var binary = atob(cleaned);
        var bytes = new Uint8Array(binary.length);

        for (var i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }

        var decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);

        /* Reject non-canonical Base64 (misalnya padding bit yang tidak valid). */
        if (encodeBase64(decoded) !== cleaned) {
          throw new Error("Format Base64 tidak valid.");
        }

        return decoded;
      }

      function processBase64() {
        var value = input.value;

        if (!value) {
          output.value = "";
          updateCounts();

          setStatus(
            "Masukkan data terlebih dahulu.",
            "error"
          );

          return;
        }

        try {
          if (currentMode === "encode") {
            output.value =
              encodeBase64(value);

            setStatus(
              "Teks berhasil di-encode ke Base64.",
              "gw-ok"
            );
          } else {
            output.value =
              decodeBase64(value);

            setStatus(
              "Base64 berhasil di-decode.",
              "gw-ok"
            );
          }

          updateCounts();
        } catch (error) {
          output.value = "";
          updateCounts();

          setStatus(
            currentMode === "decode"
              ? "Base64 tidak valid atau bukan UTF-8."
              : "Terjadi kesalahan saat melakukan encoding.",
            "error"
          );
        }
      }

      function setMode(mode) {
        currentMode = mode;

        for (var i = 0; i < tabs.length; i++) {
          tabs[i].classList.toggle(
            "gw-active",
            tabs[i].getAttribute("data-mode") === mode
          );
        }

        if (mode === "encode") {
          inputTitle.textContent =
            "Text Input";

          outputTitle.textContent =
            "Base64 Output";

          processButtonLabel.textContent = "Encode Base64";

          input.placeholder =
            "Masukkan teks yang ingin di-encode...";

          output.placeholder =
            "Hasil Base64 akan muncul di sini...";
        } else {
          inputTitle.textContent =
            "Base64 Input";

          outputTitle.textContent =
            "Decoded Text";

          processButtonLabel.textContent = "Decode Base64";

          input.placeholder =
            "Masukkan Base64 yang ingin di-decode...";

          output.placeholder =
            "Hasil decoded text akan muncul di sini...";
        }

        setStatus(
          "Mode " +
          (mode === "encode"
            ? "Encode"
            : "Decode") +
          " aktif."
        );

        if (input.value.trim()) {
          processBase64();
        }
      }

      function swapContent() {
        var oldInput = input.value;

        input.value = output.value;
        output.value = oldInput;

        updateCounts();

        setStatus(
          "Input dan output berhasil ditukar.",
          "gw-ok"
        );
      }

      function clearAll() {
        input.value = "";
        output.value = "";

        updateCounts();

        setStatus(
          "Semua data telah dibersihkan."
        );

        input.focus();
      }

      async function copyOutput() {
        if (!output.value) {
          setStatus(
            "Belum ada hasil untuk disalin.",
            "error"
          );

          return;
        }

        try {
          await navigator.clipboard.writeText(
            output.value
          );

          setStatus(
            "Hasil berhasil disalin ke clipboard.",
            "gw-ok"
          );
        } catch (error) {
          var copied = false;

          try {
            output.focus();
            output.select();
            copied = document.execCommand("copy");
            output.setSelectionRange(output.value.length, output.value.length);
          } catch (fallbackError) {
            copied = false;
          }

          setStatus(
            copied
              ? "Hasil berhasil disalin ke clipboard."
              : "Clipboard tidak tersedia di browser ini.",
            copied ? "gw-ok" : "error"
          );
        }
      }

      for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener(
          "click",
          function () {
            setMode(
              this.getAttribute("data-mode")
            );
          }
        );
      }

      processButton.addEventListener(
        "click",
        function () {
          processButton.classList.remove("gw-processing");
          void processButton.offsetWidth;
          processButton.classList.add("gw-processing");
          processBase64();
        }
      );

      processButton.addEventListener(
        "animationend",
        function () {
          processButton.classList.remove("gw-processing");
        }
      );

      swapButton.addEventListener(
        "click",
        swapContent
      );

      clearButton.addEventListener(
        "click",
        clearAll
      );

      input.addEventListener(
        "input",
        updateCounts
      );

      output.addEventListener(
        "click",
        copyOutput
      );

      input.addEventListener(
        "keydown",
        function (event) {
          if (
            (event.ctrlKey || event.metaKey) &&
            event.key === "Enter"
          ) {
            event.preventDefault();
            processButton.classList.remove("gw-processing");
            void processButton.offsetWidth;
            processButton.classList.add("gw-processing");
            processBase64();
          }
        }
      );

      updateCounts();
    })();
