(function () {
      "use strict";

      var root = document.getElementById("gw-hljs-tool");
      if (!root || root.getAttribute("data-gw-initialized") === "true") return;

      function startTool() {
        if (!window.hljs) return;
        root.setAttribute("data-gw-initialized", "true");

      var input = root.querySelector("#gw-hljs-input");
      var output = root.querySelector("#gw-hljs-output");
      var language = root.querySelector("#gw-hljs-language");
      var indent = root.querySelector("#gw-hljs-indent");
      var parseButton = root.querySelector("#gw-hljs-parse");
      var swapButton = root.querySelector("#gw-hljs-swap");
      var clearButton = root.querySelector("#gw-hljs-clear");
      var inputCount = root.querySelector("#gw-hljs-input-count");
      var outputCount = root.querySelector("#gw-hljs-output-count");
      var status = root.querySelector("#gw-hljs-status");
      var statusText = root.querySelector("#gw-hljs-status-text");

      var tokenIndex = 0;
      var tokens = [];

      function isDarkMode() {
        var html = document.documentElement;
        var body = document.body;

        if (!html && !body) return false;

        function hasDark(el) {
          return !!el && (
            el.classList.contains("drK") ||
            el.classList.contains("darkMode") ||
            el.classList.contains("dark-mode") ||
            el.classList.contains("dark") ||
            el.getAttribute("data-theme") === "dark" ||
            el.getAttribute("theme") === "dark"
          );
        }

        return hasDark(html) || hasDark(body);
      }

      function syncTheme() {
        root.classList.toggle("gw-dark", isDarkMode());
      }

      syncTheme();

      if (window.MutationObserver) {
        var observer = new MutationObserver(syncTheme);

        if (document.documentElement) {
          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme", "theme"]
          });
        }

        if (document.body) {
          observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class", "data-theme", "theme"]
          });
        }
      }

      function setStatus(message, type) {
        status.classList.remove("gw-ok", "gw-error");

        if (type) {
          status.classList.add(type);
        }

        statusText.textContent = message;
      }

      function updateCounts() {
        inputCount.textContent = input.value.length.toLocaleString("id-ID") + " karakter";
        outputCount.textContent = output.value.length.toLocaleString("id-ID") + " karakter";
      }

      function normalizeLineEndings(value) {
        return String(value).replace(/\r\n?/g, "\n");
      }

      function detectSourceIndentUnit(source) {
        var lines = normalizeLineEndings(source).split("\n");
        var values = [];
        var hasTab = false;
        lines.forEach(function (line) {
          var match = line.match(/^[\t ]+/);
          if (!match) return;
          var leading = match[0];
          if (leading.indexOf("\t") !== -1) hasTab = true;
          var visual = 0;
          for (var i = 0; i < leading.length; i++) visual += leading[i] === "\t" ? 4 : 1;
          if (visual > 0) values.push(visual);
        });
        if (!values.length) return hasTab ? 4 : 2;
        var gcd = values[0];
        function gcdOf(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
        for (var g = 1; g < values.length; g++) gcd = gcdOf(gcd, values[g]);
        return gcd >= 1 && gcd <= 8 ? gcd : 2;
      }

      function normalizeIndent(source, selectedLanguage) {
        var mode = indent.value;
        var targetSize = mode === "tab" ? 4 : parseInt(mode, 10);
        if (!targetSize || targetSize < 1) targetSize = 2;
        var text = normalizeLineEndings(source);
        var sourceSize = detectSourceIndentUnit(text);
        var targetUnit = mode === "tab" ? "\t" : new Array(targetSize + 1).join(" ");
        var lines = text.split("\n");
        var protectedString = false;

        function updateProtectedState(line) {
          if (selectedLanguage === "python") {
            var triple = line.match(/("""|''')/g);
            if (triple && triple.length) protectedString = !protectedString;
          } else if (selectedLanguage === "javascript") {
            var backticks = 0;
            for (var i = 0; i < line.length; i++) if (line[i] === "`" && line[i - 1] !== "\\") backticks++;
            if (backticks % 2 === 1) protectedString = !protectedString;
          } else if (selectedLanguage === "java") {
            var blocks = (line.match(/"""/g) || []).length;
            if (blocks % 2 === 1) protectedString = !protectedString;
          }
        }

        return lines.map(function (line) {
          var wasProtected = protectedString;
          updateProtectedState(line);
          if (wasProtected) return line;
          var match = line.match(/^[\t ]+/);
          if (!match) return line;
          var leading = match[0], visual = 0;
          for (var i = 0; i < leading.length; i++) visual += leading[i] === "\t" ? sourceSize : 1;
          var level = Math.max(0, Math.round(visual / sourceSize));
          return targetUnit.repeat(level) + line.slice(leading.length);
        }).join("\n");
      }

      var languageNames = {
        javascript: "JavaScript", html: "HTML / XML", css: "CSS", json: "JSON",
        python: "Python", php: "PHP", java: "Java", sql: "SQL", bash: "Bash / Shell", plaintext: "Plain Text"
      };

      var hljsLanguages = ["javascript", "xml", "css", "json", "python", "php", "java", "sql", "bash", "plaintext"];

      function mapLanguage(value) { return value === "html" ? "xml" : value; }

      function detectLanguage(source) {
        var result = window.hljs.highlightAuto(String(source), hljsLanguages);
        var languageId = result.language || "plaintext";
        if (languageId === "xml") languageId = "html";
        if (!languageNames[languageId]) languageId = "plaintext";
        return { language: languageId, detail: languageNames[languageId] };
      }

      function detectionMessage(detected) {
        return "Format terdeteksi: " + (detected.detail || "Plain Text") + ".";
      }

      function highlightWithLanguage(source, selectedLanguage) {
        return window.hljs.highlight(String(source), {
          language: mapLanguage(selectedLanguage),
          ignoreIllegals: true
        }).value;
      }

      function parseSource() {
        var source = input.value;
        if (!source.trim()) {
          output.value = ""; updateCounts(); setStatus("Masukkan source code terlebih dahulu.", "error"); return;
        }
        animateProcess();
        try {
          var detected = language.value === "auto"
            ? detectLanguage(source)
            : { language: language.value, detail: languageNames[language.value] || "Plain Text" };
          var normalized = normalizeIndent(source, mapLanguage(detected.language));
          output.value = highlightWithLanguage(normalized, detected.language);
          updateCounts();
          setStatus(language.value === "auto"
            ? "Berhasil membuat markup HTML Highlight.js. Format: " + detected.detail + "."
            : "Berhasil membuat markup HTML Highlight.js. Bahasa: " + detected.detail + ".", "gw-ok");
        } catch (error) {
          output.value = ""; updateCounts();
          setStatus(error && error.message ? error.message : "Terjadi kesalahan saat memproses source code.", "error");
        }
      }

      function stripHtmlHighlightMarkup(source) {
        var container = document.createElement("div");
        container.innerHTML = String(source);
        var elements = container.querySelectorAll("[class]");
        for (var i = 0; i < elements.length; i++) {
          var element = elements[i];
          var classes = String(element.getAttribute("class") || "").split(/\s+/);
          var isHighlightWrapper = classes.some(function (className) {
            return /^hljs(?:-|$)/.test(className) || /^language-/.test(className);
          });
          if (isHighlightWrapper && element.parentNode) {
            var parent = element.parentNode;
            while (element.firstChild) parent.insertBefore(element.firstChild, element);
            parent.removeChild(element);
          }
        }
        return container.textContent || container.innerText || "";
      }

      function unparseSource() {
        var source = input.value;
        if (!source.trim()) {
          output.value = ""; updateCounts(); setStatus("Masukkan markup HTML Highlight.js terlebih dahulu.", "error"); return;
        }
        animateProcess();
        try {
          output.value = stripHtmlHighlightMarkup(source);
          updateCounts(); setStatus("Berhasil menghapus markup Highlight.js dan mengembalikan source code.", "gw-ok");
        } catch (error) {
          output.value = ""; updateCounts(); setStatus("Terjadi kesalahan saat melakukan Unparse.", "error");
        }
      }

      function processSource() { if (currentMode === "unparse") unparseSource(); else parseSource(); }

      function animateProcess() {
        if (!processIcon) return;
        processIcon.classList.remove("gw-processing");
        void processIcon.offsetWidth;
        processIcon.classList.add("gw-processing");
      }

      function resetCopyState() {
        if (!copyButton) return;
        copyButton.classList.remove("gw-copied");
        var icon = copyButton.querySelector("svg");
        var label = copyButton.querySelector(".gw-copy-label");
        if (icon) {
          icon.innerHTML = '<rect x="8" y="8" width="11" height="11" rx="1.5"></rect><path d="M16 8V6.5A1.5 1.5 0 0 0 14.5 5h-8A1.5 1.5 0 0 0 5 6.5v8A1.5 1.5 0 0 0 6.5 16H8"></path>';
        }
        if (label) label.textContent = "Salin";
        copyButton.setAttribute("aria-label", "Salin");
        copyButton.setAttribute("title", "Salin hasil");
      }

      function showCopySuccess() {
        if (!copyButton) return;
        if (copyTimer) clearTimeout(copyTimer);
        copyButton.classList.add("gw-copied");
        var icon = copyButton.querySelector("svg");
        var label = copyButton.querySelector(".gw-copy-label");
        if (icon) icon.innerHTML = '<path d="m5 12.5 4.2 4.2L19 7"></path>';
        if (label) label.textContent = "Tersalin";
        copyButton.setAttribute("aria-label", "Berhasil disalin");
        copyButton.setAttribute("title", "Berhasil disalin");
        copyTimer = setTimeout(function () {
          resetCopyState();
          copyTimer = null;
        }, 1500);
      }

      function fallbackCopy(value) {
        var area = document.createElement("textarea");
        area.value = value;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.left = "-9999px";
        area.style.top = "0";
        document.body.appendChild(area);
        area.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (ignore) { ok = false; }
        document.body.removeChild(area);
        if (ok) {
          showCopySuccess();
          setStatus("Output berhasil disalin ke clipboard.", "gw-ok");
        } else {
          setStatus("Gagal menyalin output ke clipboard.", "error");
        }
      }

      function copyOutput() {
        if (!output.value) {
          setStatus("Belum ada output untuk disalin.", "error");
          return;
        }

        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(output.value).then(function () {
            showCopySuccess();
            setStatus("Output berhasil disalin ke clipboard.", "gw-ok");
          }, function () {
            fallbackCopy(output.value);
          });
        } else {
          fallbackCopy(output.value);
        }
      }

      function downloadOutput() {
        if (!output.value) {
          setStatus("Belum ada output untuk diunduh.", "error");
          return;
        }

        var filename = currentMode === "parse" ? "hljs-parse.html" : "hljs-unparse.txt";
        var blob = new Blob([output.value], { type: "text/plain;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        setStatus("Output berhasil diunduh.", "gw-ok");
      }

      function setMode(mode) {
        currentMode = mode === "unparse" ? "unparse" : "parse";
        modeButtons.forEach(function (button) {
          var active = button.getAttribute("data-mode") === currentMode;
          button.classList.toggle("gw-active", active);
          button.setAttribute("aria-selected", active ? "true" : "false");
          button.setAttribute("aria-pressed", active ? "true" : "false");
        });

        var isParse = currentMode === "parse";
        root.querySelector("#gw-hljs-input-title").textContent = isParse ? "Source Code" : "HTML Highlight.js";
        root.querySelector("#gw-hljs-output-title").textContent = isParse ? "HTML Highlight.js" : "Source Code";
        input.placeholder = isParse ? "Masukkan source code di sini..." : "Masukkan markup HTML Highlight.js di sini...";
        output.placeholder = isParse ? "Hasil markup Highlight.js akan muncul di sini..." : "Hasil source code akan muncul di sini...";
        root.querySelector("#gw-hljs-process-label").textContent = isParse ? "Parse HTML" : "Unparse HTML";
        parseButton.setAttribute("aria-label", isParse ? "Parse HTML Highlight.js" : "Unparse HTML Highlight.js");
        setStatus(isParse ? "Mode Parse aktif. Siap memproses source code." : "Mode Unparse aktif. Siap mengembalikan source code.");
        input.focus();
      }

      function swapContent() {
        var oldInput = input.value;
        input.value = output.value;
        output.value = oldInput;
        setMode(currentMode === "parse" ? "unparse" : "parse");
        updateCounts();
        resetCopyState();
        setStatus(currentMode === "parse" ? "Input dan output ditukar. Mode Parse aktif." : "Input dan output ditukar. Mode Unparse aktif.", "gw-ok");
        input.focus();
      }

      function clearAll() {
        input.value = "";
        output.value = "";
        resetTokens();
        resetCopyState();
        if (copyTimer) { clearTimeout(copyTimer); copyTimer = null; }
        language.value = "auto";
        updateCounts();
        clearButton.classList.remove("gw-reset-triggered");
        void clearButton.offsetWidth;
        clearButton.classList.add("gw-reset-triggered");
        setStatus("Semua data telah dibersihkan.");
        input.focus();
      }

      modeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          setMode(button.getAttribute("data-mode"));
        });
      });

      parseButton.addEventListener("click", processSource);
      swapButton.addEventListener("click", swapContent);
      clearButton.addEventListener("click", clearAll);
      if (copyButton) copyButton.addEventListener("click", copyOutput);
      if (downloadButton) downloadButton.addEventListener("click", downloadOutput);

      input.addEventListener("input", function () {
        updateCounts();
        resetCopyState();
        if (language.value === "auto" && input.value.trim()) {
          var detected = detectLanguage(input.value);
          setStatus(detectionMessage(detected));
        }
      });

      language.addEventListener("change", function () {
        if (currentMode === "parse" && input.value.trim()) {
          if (language.value === "auto") {
            setStatus(detectionMessage(detectLanguage(input.value)));
          } else {
            setStatus("Bahasa manual dipilih: " + (languageNames[language.value] || "Plain Text") + ".");
          }
          parseSource();
        }
      });

      indent.addEventListener("change", function () {
        if (currentMode === "parse" && input.value.trim()) parseSource();
      });

      input.addEventListener("keydown", function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          event.preventDefault();
          processSource();
        }
      });

      setMode("parse");
      updateCounts();
      resetCopyState();
      }

      function loadHighlightJs() {
        if (window.hljs && /^11\./.test(String(window.hljs.versionString || ""))) { startTool(); return; }
        var currentScript = document.currentScript;
        var src = currentScript && currentScript.src ? currentScript.src : "";
        var base = src.replace(/\/script(?:\.min)?\.js(?:[?#].*)?$/, "/");
        if (!base) return;
        var loader = document.createElement("script");
        loader.src = base + "highlight.min.js";
        loader.async = false;
        loader.onload = startTool;
        loader.onerror = function () {
          root.removeAttribute("data-gw-initialized");
          root.setAttribute("data-gw-load-error", "true");
          var statusNode = root.querySelector("#gw-hljs-status-text");
          if (statusNode) statusNode.textContent = "Highlight.js gagal dimuat dari CDN.";
        };
        document.head.appendChild(loader);
      }

      loadHighlightJs();
    })();
