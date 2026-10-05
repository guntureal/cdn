(function () {
      "use strict";

      var root = document.getElementById("gw-css-tool");
      if (!root) return;

      var input = document.getElementById("gw-css-input");
      var output = document.getElementById("gw-css-output");

      var processButton = document.getElementById("gw-css-process");
      var swapButton = document.getElementById("gw-css-swap");
      var clearButton = document.getElementById("gw-css-clear");

      var inputTitle = document.getElementById("gw-css-input-title");
      var outputTitle = document.getElementById("gw-css-output-title");

      var inputCount = document.getElementById("gw-css-input-count");
      var outputCount = document.getElementById("gw-css-output-count");

      var status = document.getElementById("gw-css-status");
      var statusText = document.getElementById("gw-css-status-text");

      var tabs = root.querySelectorAll(".gw-tab");

      var currentMode = "minify";
      var tokenIndex = 0;
      var tokens = [];

      function isDarkMode() {
        var body = document.body;
        var html = document.documentElement;

        if (!body && !html) return false;

        if (body && (
          body.classList.contains("drK") ||
          body.classList.contains("darkMode") ||
          body.classList.contains("dark-mode") ||
          body.classList.contains("dark") ||
          body.getAttribute("data-theme") === "dark" ||
          body.getAttribute("theme") === "dark"
        )) {
          return true;
        }

        return !!(
          html &&
          (
            html.classList.contains("drK") ||
            html.classList.contains("darkMode") ||
            html.classList.contains("dark-mode") ||
            html.classList.contains("dark") ||
            html.getAttribute("data-theme") === "dark" ||
            html.getAttribute("theme") === "dark"
          )
        );
      }

      function syncTheme() {
        root.classList.toggle("gw-dark", isDarkMode());
      }

      syncTheme();

      if (window.MutationObserver) {
        var observer = new MutationObserver(syncTheme);

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
        status.classList.remove("gw-ok", "gw-error");

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

      function resetTokens() {
        tokens = [];
        tokenIndex = 0;
      }

      function protect(value) {
        var id = tokenIndex++;

        var marker =
          "__GW_CSS_TOKEN_" +
          id +
          "__";

        tokens[id] = {
          marker: marker,
          value: value
        };

        return marker;
      }

      function restoreTokens(value) {
        var result = value;

        for (var i = 0; i < tokens.length; i++) {
          if (!tokens[i]) continue;

          result = result
            .split(tokens[i].marker)
            .join(tokens[i].value);
        }

        return result;
      }

      function protectStringsAndComments(css) {
        resetTokens();

        var value = css;

        value = value.replace(
          /\/\*[\s\S]*?\*\//g,
          function (match) {
            return protect(match);
          }
        );

        value = value.replace(
          /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/g,
          function (match) {
            return protect(match);
          }
        );

        value = value.replace(
          /url\(\s*(?:"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|[^)]*)\s*\)/gi,
          function (match) {
            return protect(match);
          }
        );

        return value;
      }

      function cleanSpaces(value) {
        return value
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .replace(/\t/g, " ")
          .replace(/[ \n]+/g, " ");
      }

      function minifyCss(css) {
        var value = protectStringsAndComments(css);

        value = value
          .replace(/\s+/g, " ")
          .replace(/\s*([{}:;,>+~])\s*/g, "$1")
          .replace(/;\}/g, "}")
          .replace(/\s*!important/gi, "!important")
          .trim();

        value = restoreTokens(value);

        return value;
      }

      function beautifyCss(css) {
        var value = protectStringsAndComments(css);

        value = cleanSpaces(value);

        var result = "";
        var indentLevel = 0;
        var buffer = "";

        var inBlock = false;

        function indentText(level) {
          return "  ".repeat(level);
        }

        function flushDeclaration() {
          var declaration = buffer.trim();

          if (!declaration) {
            buffer = "";
            return;
          }

          declaration = declaration
            .replace(/\s*:\s*/g, ": ")
            .replace(/\s*!important/gi, " !important")
            .replace(/\s*,\s*/g, ", ");

          result +=
            indentText(indentLevel) +
            declaration +
            ";\n";

          buffer = "";
        }

        for (var i = 0; i < value.length; i++) {
          var char = value.charAt(i);

          if (char === "{") {
            var selector = buffer.trim();

            selector = selector
              .replace(/\s*,\s*/g, ",\n" + indentText(indentLevel))
              .replace(/\s*>\s*/g, " > ")
              .replace(/\s*\+\s*/g, " + ")
              .replace(/\s*~\s*/g, " ~ ");

            result +=
              indentText(indentLevel) +
              selector +
              " {\n";

            buffer = "";

            indentLevel++;
            inBlock = true;
          } else if (char === "}") {
            if (buffer.trim()) {
              flushDeclaration();
            }

            indentLevel = Math.max(0, indentLevel - 1);

            result +=
              indentText(indentLevel) +
              "}";

            if (value.charAt(i + 1) !== "}") {
              result += "\n";
            }

            buffer = "";
            inBlock = indentLevel > 0;
          } else if (char === ";") {
            if (inBlock) {
              flushDeclaration();
            } else {
              buffer += char;
            }
          } else {
            buffer += char;
          }
        }

        if (buffer.trim()) {
          var remaining = buffer.trim();

          if (inBlock) {
            remaining = remaining
              .replace(/\s*:\s*/g, ": ")
              .replace(/\s*!important/gi, " !important");

            result +=
              indentText(indentLevel) +
              remaining +
              ";\n";
          } else {
            result += remaining;
          }
        }

        result = result
          .replace(/\n{3,}/g, "\n\n")
          .replace(/[ \t]+\n/g, "\n")
          .trim();

        return restoreTokens(result);
      }

      function validateCssSource(css) {
        var value = css.trim();

        if (!value) return false;

        if (/<\/?(?:html|head|body|style|script|div|span|section|main|button|input)\b/i.test(value)) {
          return false;
        }

        if (/^<!doctype\b/i.test(value) || /^(?:const|let|var|function)\b/i.test(value)) {
          return false;
        }

        if (/(?:=>|\b(?:document|window|console)\s*\.|\b(?:import|export)\s+(?:default\s+)?)/.test(value)) {
          return false;
        }

        if (/^\s*[\[{].*[\]}]\s*$/s.test(value) && /["']\s*:/.test(value)) {
          return false;
        }

        var stripped = value
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, "");

        var opens = (stripped.match(/\{/g) || []).length;
        var closes = (stripped.match(/\}/g) || []).length;

        if (opens !== closes || opens === 0) {
          return false;
        }

        if (!/[^{}]+\{[\s\S]*:[^{}]+\}/.test(stripped)) {
          return false;
        }

        return true;
      }

      function animateProcess() {
        processButton.classList.remove("gw-processing");
        void processButton.offsetWidth;
        processButton.classList.add("gw-processing");
      }

      function processCss() {
        var value = input.value;

        if (!value.trim()) {
          output.value = "";
          updateCounts();

          setStatus(
            "Masukkan kode CSS terlebih dahulu.",
            "error"
          );

          return;
        }

        if (!validateCssSource(value)) {
          output.value = "";
          updateCounts();
          setStatus(
            "Format tidak valid. Masukkan source CSS saja.",
            "error"
          );
          return;
        }

        try {
          if (currentMode === "minify") {
            output.value = minifyCss(value);

            setStatus(
              "CSS berhasil di-minify.",
              "gw-ok"
            );
          } else {
            output.value = beautifyCss(value);

            setStatus(
              "CSS berhasil di-beautify.",
              "gw-ok"
            );
          }

          updateCounts();
        } catch (error) {
          output.value = "";
          updateCounts();

          setStatus(
            "Terjadi kesalahan saat memproses CSS.",
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

        if (mode === "minify") {
          inputTitle.textContent = "CSS Source";
          outputTitle.textContent = "Minified CSS";

          processButton.innerHTML =
            '<span class="gw-action-icon"><svg viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="m12 3 1.35 4.65L18 9l-4.65 1.35L12 15l-1.35-4.65L6 9l4.65-1.35L12 3Z"></path>' +
            '<path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z"></path>' +
            "</svg></span>" +
            "Minify CSS";

          input.placeholder =
            "Masukkan kode CSS yang ingin di-minify...";

          output.placeholder =
            "Hasil CSS minified akan muncul di sini...";
        } else {
          inputTitle.textContent = "CSS Source";
          outputTitle.textContent = "Beautified CSS";

          processButton.innerHTML =
            '<span class="gw-action-icon"><svg viewBox="0 0 24 24" aria-hidden="true">' +
            '<path d="m12 3 1.35 4.65L18 9l-4.65 1.35L12 15l-1.35-4.65L6 9l4.65-1.35L12 3Z"></path>' +
            '<path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z"></path>' +
            "</svg></span>" +
            "Beautify CSS";

          input.placeholder =
            "Masukkan kode CSS yang ingin dirapikan...";

          output.placeholder =
            "Hasil CSS beautified akan muncul di sini...";
        }

        setStatus(
          "Mode " +
          (mode === "minify" ? "Minify" : "Beautify") +
          " aktif."
        );

        if (input.value.trim()) {
          processCss();
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

        resetTokens();
        updateCounts();

        setStatus("Semua data telah dibersihkan.");

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
          await navigator.clipboard.writeText(output.value);

          setStatus(
            "Hasil berhasil disalin ke clipboard.",
            "gw-ok"
          );
        } catch (error) {
          output.focus();
          output.select();
          document.execCommand("copy");

          setStatus(
            "Hasil berhasil disalin ke clipboard.",
            "gw-ok"
          );
        }
      }

      for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener("click", function () {
          setMode(
            this.getAttribute("data-mode")
          );
        });
      }

      processButton.addEventListener(
        "click",
        function () {
          animateProcess();
          processCss();
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
            animateProcess();
            processCss();
          }
        }
      );

      updateCounts();
    })();
