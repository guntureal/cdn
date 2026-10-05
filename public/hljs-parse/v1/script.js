(function () {
      "use strict";

      var root = document.getElementById("gw-hljs-tool");
      if (!root || root.getAttribute("data-gw-initialized") === "true") return;
      root.setAttribute("data-gw-initialized", "true");

      var input = document.getElementById("gw-hljs-input");
      var output = document.getElementById("gw-hljs-output");
      var language = document.getElementById("gw-hljs-language");
      var indent = document.getElementById("gw-hljs-indent");
      var parseButton = document.getElementById("gw-hljs-parse");
      var swapButton = document.getElementById("gw-hljs-swap");
      var clearButton = document.getElementById("gw-hljs-clear");
      var copyButton;
      var inputCount = document.getElementById("gw-hljs-input-count");
      var outputCount = document.getElementById("gw-hljs-output-count");
      var status = document.getElementById("gw-hljs-status");
      var statusText = document.getElementById("gw-hljs-status-text");

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

      function escapeCodeHtml(value) {
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }

      function resetTokens() {
        tokens = [];
        tokenIndex = 0;
      }

      function protect(value, className) {
        var id = tokenIndex++;
        var marker = "__GW_HLJS_TOKEN_" + id + "__";

        tokens[id] = {
          marker: marker,
          value: '<span class="' + className + '">' +
            escapeCodeHtml(value) +
            "</span>"
        };

        return marker;
      }

      function restoreTokens(value) {
        var result = value;

        for (var i = 0; i < tokens.length; i++) {
          if (tokens[i]) {
            result = result.split(tokens[i].marker).join(tokens[i].value);
          }
        }

        return result;
      }

      function protectPattern(value, regex, className) {
        return value.replace(regex, function (match) {
          return protect(match, className);
        });
      }

      function highlightJavascript(source) {
        resetTokens();

        var code = source;

        code = protectPattern(
          code,
          /(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
          "hljs-comment"
        );

        code = protectPattern(
          code,
          /(["'`])(?:\\[\s\S]|(?!\1)[^\\])*\1/g,
          "hljs-string"
        );

        code = escapeCodeHtml(code);

        code = code.replace(
          /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|from|export|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|this|delete|void|yield)\b/g,
          '<span class="hljs-keyword">$&</span>'
        );

        code = code.replace(
          /\b(?:true|false|null|undefined|NaN|Infinity)\b/g,
          '<span class="hljs-literal">$&</span>'
        );

        code = code.replace(
          /\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/gi,
          '<span class="hljs-number">$&</span>'
        );

        code = code.replace(
          /\b[A-Za-z_$][\w$]*(?=\s*\()/g,
          '<span class="hljs-title function_">$&</span>'
        );

        return restoreTokens(code);
      }

      function highlightHtml(source) {
        resetTokens();

        var code = source;

        code = protectPattern(
          code,
          /<!--[\s\S]*?-->/g,
          "hljs-comment"
        );

        code = escapeCodeHtml(code);

        code = code.replace(
          /(&lt;\/?)([A-Za-z][\w:-]*)([^&]*?)(\/?&gt;)/g,
          function (match, open, tag, attrs, close) {
            var result = open;
            result += '<span class="hljs-name">' + tag + "</span>";

            if (attrs) {
              attrs = attrs.replace(
                /([A-Za-z_:][\w:.-]*)(=)("[^"]*"|'[^']*'|[^\s>]+)/g,
                '<span class="hljs-attr">$1</span>$2<span class="hljs-string">$3</span>'
              );

              result += attrs;
            }

            result += close;

            return '<span class="hljs-tag">' + result + "</span>";
          }
        );

        return restoreTokens(code);
      }

      function highlightCss(source) {
        resetTokens();

        var code = source;

        code = protectPattern(
          code,
          /\/\*[\s\S]*?\*\//g,
          "hljs-comment"
        );

        code = protectPattern(
          code,
          /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/g,
          "hljs-string"
        );

        code = escapeCodeHtml(code);

        code = code.replace(
          /([.#]?[A-Za-z_-][\w-]*)(?=\s*\{)/g,
          '<span class="hljs-selector-class">$1</span>'
        );

        code = code.replace(
          /(--?[A-Za-z_-][\w-]*|[A-Za-z-]+)(?=\s*:)/g,
          '<span class="hljs-attribute">$1</span>'
        );

        code = code.replace(
          /#[0-9a-fA-F]{3,8}\b/g,
          '<span class="hljs-number">$&</span>'
        );

        code = code.replace(
          /\b\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|s|ms|deg|fr)?\b/g,
          '<span class="hljs-number">$&</span>'
        );

        return restoreTokens(code);
      }

      function highlightJson(source) {
        resetTokens();

        var code = source;

        code = protectPattern(
          code,
          /"(?:\\.|[^"\\])*"/g,
          "hljs-string"
        );

        code = escapeCodeHtml(code);

        code = code.replace(
          /"(?:\\.|[^"\\])*"(?=\s*:)/g,
          '<span class="hljs-attr">$&</span>'
        );

        code = code.replace(
          /\b(?:true|false|null)\b/g,
          '<span class="hljs-literal">$&</span>'
        );

        code = code.replace(
          /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/g,
          '<span class="hljs-number">$&</span>'
        );

        return restoreTokens(code);
      }

      function highlightPython(source) {
        resetTokens();

        var code = source;

        code = protectPattern(
          code,
          /(?:#[^\n]*|"""[\s\S]*?"""|'''[\s\S]*?''')/g,
          "hljs-comment"
        );

        code = protectPattern(
          code,
          /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/g,
          "hljs-string"
        );

        code = escapeCodeHtml(code);

        code = code.replace(
          /\b(?:and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g,
          '<span class="hljs-keyword">$&</span>'
        );

        code = code.replace(
          /\b(?:True|False|None)\b/g,
          '<span class="hljs-literal">$&</span>'
        );

        code = code.replace(
          /\b\d+(?:\.\d+)?\b/g,
          '<span class="hljs-number">$&</span>'
        );

        code = code.replace(
          /\b[A-Za-z_]\w*(?=\s*\()/g,
          '<span class="hljs-title function_">$&</span>'
        );

        return restoreTokens(code);
      }

      function highlightPhp(source) {
        resetTokens();

        var code = source;

        code = protectPattern(
          code,
          /(?:\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)/g,
          "hljs-comment"
        );

        code = protectPattern(
          code,
          /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/g,
          "hljs-string"
        );

        code = escapeCodeHtml(code);

        code = code.replace(
          /\b(?:function|return|if|else|elseif|foreach|for|while|do|class|interface|trait|extends|implements|public|private|protected|static|abstract|final|new|try|catch|finally|throw|use|namespace|echo|print|include|require)\b/g,
          '<span class="hljs-keyword">$&</span>'
        );

        code = code.replace(
          /\b(?:true|false|null)\b/gi,
          '<span class="hljs-literal">$&</span>'
        );

        code = code.replace(
          /\b\d+(?:\.\d+)?\b/g,
          '<span class="hljs-number">$&</span>'
        );

        code = code.replace(
          /\b[A-Za-z_]\w*(?=\s*\()/g,
          '<span class="hljs-title function_">$&</span>'
        );

        return restoreTokens(code);
      }

      function highlightJava(source) {
        resetTokens();

        var code = source;

        code = protectPattern(
          code,
          /(?:\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,
          "hljs-comment"
        );

        code = protectPattern(
          code,
          /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/g,
          "hljs-string"
        );

        code = escapeCodeHtml(code);

        code = code.replace(
          /\b(?:class|interface|extends|implements|public|private|protected|static|final|abstract|void|int|long|double|float|boolean|char|byte|short|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|import|package|this|super)\b/g,
          '<span class="hljs-keyword">$&</span>'
        );

        code = code.replace(
          /\b(?:true|false|null)\b/g,
          '<span class="hljs-literal">$&</span>'
        );

        code = code.replace(
          /\b\d+(?:\.\d+)?[fFdDlL]?\b/g,
          '<span class="hljs-number">$&</span>'
        );

        code = code.replace(
          /\b[A-Za-z_]\w*(?=\s*\()/g,
          '<span class="hljs-title function_">$&</span>'
        );

        return restoreTokens(code);
      }

      function highlightSql(source) {
        resetTokens();

        var code = source;

        code = protectPattern(
          code,
          /(?:--[^\n]*|\/\*[\s\S]*?\*\/)/g,
          "hljs-comment"
        );

        code = protectPattern(
          code,
          /'(?:''|[^'])*'/g,
          "hljs-string"
        );

        code = escapeCodeHtml(code);

        code = code.replace(
          /\b(?:SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|ALTER|DROP|TABLE|DATABASE|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|AS|AND|OR|NOT|NULL|IS|IN|LIKE|BETWEEN|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|PRIMARY|KEY|FOREIGN|REFERENCES)\b/gi,
          '<span class="hljs-keyword">$&</span>'
        );

        code = code.replace(
          /\b(?:TRUE|FALSE|NULL)\b/gi,
          '<span class="hljs-literal">$&</span>'
        );

        code = code.replace(
          /\b\d+(?:\.\d+)?\b/g,
          '<span class="hljs-number">$&</span>'
        );

        return restoreTokens(code);
      }

      function highlightBash(source) {
        resetTokens();

        var code = source;

        code = protectPattern(
          code,
          /#[^\n]*/g,
          "hljs-comment"
        );

        code = protectPattern(
          code,
          /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/g,
          "hljs-string"
        );

        code = escapeCodeHtml(code);

        code = code.replace(
          /\b(?:if|then|else|elif|fi|for|while|do|done|case|esac|in|function|return|export|local|readonly)\b/g,
          '<span class="hljs-keyword">$&</span>'
        );

        code = code.replace(
          /\b(?:true|false)\b/g,
          '<span class="hljs-literal">$&</span>'
        );

        code = code.replace(
          /\b\d+(?:\.\d+)?\b/g,
          '<span class="hljs-number">$&</span>'
        );

        return restoreTokens(code);
      }

      function highlightPlainText(source) {
        resetTokens();
        return escapeCodeHtml(source);
      }

      var modeButtons = Array.prototype.slice.call(root.querySelectorAll(".gw-mode"));
      var currentMode = "parse";
      var copyButton = document.getElementById("gw-hljs-copy");
      var downloadButton = document.getElementById("gw-hljs-copy-download");
      var processIcon = parseButton ? parseButton.querySelector(".gw-action-icon") : null;
      var copyTimer = null;

      var languageNames = {
        javascript: "JavaScript",
        html: "HTML / XML",
        css: "CSS",
        json: "JSON",
        python: "Python",
        php: "PHP",
        java: "Java",
        sql: "SQL",
        bash: "Bash / Shell",
        plaintext: "Plain Text"
      };

      function detectLanguage(source) {
        var code = String(source || "").replace(/^\uFEFF/, "").trim();
        if (!code) return { language: "plaintext", detail: "Plain Text" };

        var scores = {
          javascript: 0,
          html: 0,
          css: 0,
          json: 0,
          python: 0,
          php: 0,
          java: 0,
          sql: 0,
          bash: 0,
          plaintext: 0
        };

        function add(name, points) { scores[name] += points; }

        // Format yang benar-benar eksplisit diberi prioritas agar tidak kalah
        // oleh pola bahasa lain yang kebetulan muncul di dalam source.
        if (/^<\?php\b/i.test(code)) add("php", 40);
        if (/^\s*<!doctype\s+html\b/i.test(code) || /^\s*<html(?:\s|>)/i.test(code)) add("html", 40);

        try {
          var parsed = JSON.parse(code);
          if ((code[0] === "{" || code[0] === "[") && parsed !== null && typeof parsed === "object") {
            add("json", 40);
          }
        } catch (ignoreJson) {}

        if (/^\s*(?:SELECT|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|CREATE\s+(?:TABLE|DATABASE|VIEW)|ALTER\s+TABLE|DROP\s+TABLE)\b/i.test(code)) {
          add("sql", 30);
        }

        if (/^\s*#!\/.*\b(?:bash|sh|zsh)\b/i.test(code)) add("bash", 35);
        if (/^\s*#\s*\!?\/?.*\b(?:bash|shell|sh|zsh)\b/i.test(code)) add("bash", 20);

        if (/^\s*(?:from\s+\w+\s+import|import\s+\w+|def\s+\w+\s*\(|class\s+\w+\s*(?:\([^)]*\))?\s*:)/m.test(code)) add("python", 28);
        if (/\b(?:elif|except|lambda|None|True|False|async\s+def)\b/.test(code)) add("python", 8);
        if (/^\s*@\w+(?:\([^\n]*\))?\s*$/m.test(code)) add("python", 4);

        if (/\b(?:public|private|protected)\s+(?:static\s+)?(?:final\s+)?(?:class|interface|enum|void|int|long|double|float|boolean|char|byte|short)\b/.test(code)) add("java", 24);
        if (/\bSystem\.out\.(?:println|print)\s*\(/.test(code) || /\bpackage\s+[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\s*;/.test(code)) add("java", 14);
        if (/\b(?:new\s+[A-Z]\w*\s*\(|@Override|throws\s+\w+)\b/.test(code)) add("java", 7);

        if (/^\s*(?:[.#]?[A-Za-z_-][\w-]*)(?:\s*,\s*[.#]?[A-Za-z_-][\w-]*)*\s*\{[\s\S]*:[\s\S]*\}/.test(code)) add("css", 24);
        if (/[A-Za-z-]+\s*:\s*(?:#[0-9a-f]{3,8}|[\w.-]+|\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\s*;?/.test(code) && /\{[\s\S]*\}/.test(code)) add("css", 9);
        if (/@(?:media|keyframes|supports|font-face|import)\b/.test(code)) add("css", 12);

        if (/(?:^|[\s;(])(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=/.test(code)) add("javascript", 18);
        if (/(?:=>|\b(?:console\.|document\.|window\.|require\s*\(|module\.exports|export\s+default|import\s+.+\s+from)\b)/.test(code)) add("javascript", 16);
        if (/\b(?:function|async|await|Promise|JSON\.parse|JSON\.stringify)\b/.test(code)) add("javascript", 8);
        if (/<script\b/i.test(code) && /\b(?:const|let|var|function)\b/.test(code)) add("javascript", 6);

        if (/<\/?(?:html|head|body|div|section|main|script|style|a|p|h[1-6]|ul|ol|li|table|form|input|button)(?:\s|>)/i.test(code) || /<\/?[A-Za-z][^>]*>/.test(code)) {
          add("html", 24);
        }
        if (/<\?xml\b/i.test(code)) add("html", 30);

        if (/\b(?:SELECT|FROM|WHERE|JOIN|GROUP\s+BY|ORDER\s+BY|HAVING|UNION|INSERT\s+INTO|VALUES)\b/i.test(code)) add("sql", 7);
        if (/--[^\n]*|\/\*[\s\S]*?\*\//.test(code) && /\b(?:SELECT|FROM|WHERE|TABLE|VARCHAR|INT)\b/i.test(code)) add("sql", 4);

        if (/\b(?:fi|done|esac)\b|\$\{?[A-Za-z_][A-Za-z0-9_]*\}?|\b(?:chmod|mkdir|grep|awk|sed|curl|wget|apt|npm|git)\s+[-\w]/.test(code)) add("bash", 7);
        if (/^\s*(?:if|for|while)\s+.*;\s*then\b/m.test(code)) add("bash", 10);

        // Ambang rendah hanya dipakai untuk memilih Plain Text ketika tidak
        // ada pola sintaks yang cukup spesifik.
        var best = "plaintext";
        var bestScore = 0;
        Object.keys(scores).forEach(function (name) {
          if (name !== "plaintext" && scores[name] > bestScore) {
            best = name;
            bestScore = scores[name];
          }
        });

        return {
          language: bestScore > 0 ? best : "plaintext",
          detail: languageNames[bestScore > 0 ? best : "plaintext"] || "Plain Text"
        };
      }

      function detectionMessage(detected) {
        return "Format terdeteksi: " + (detected.detail || languageNames[detected.language] || "Plain Text") + ".";
      }

      function detectSourceIndentUnit(source) {
        var lines = String(source).replace(/\r\n?/g, "\n").split("\n");
        var values = [];
        var hasTab = false;

        lines.forEach(function (line) {
          var match = line.match(/^[\t ]+/);
          if (!match) return;
          var leading = match[0];
          if (leading.indexOf("\t") !== -1) hasTab = true;
          var visual = 0;
          for (var i = 0; i < leading.length; i++) {
            visual += leading[i] === "\t" ? 4 : 1;
          }
          if (visual > 0) values.push(visual);
        });

        if (!values.length) return hasTab ? 4 : 2;
        if (hasTab && values.some(function (v) { return v % 4 === 0; })) return 4;

        var candidates = [2, 4];
        for (var c = 0; c < candidates.length; c++) {
          var candidate = candidates[c];
          if (values.some(function (v) { return v === candidate; }) && values.every(function (v) { return v % candidate === 0; })) {
            return candidate;
          }
        }

        var gcd = values[0];
        function gcdOf(a, b) {
          while (b) {
            var t = a % b;
            a = b;
            b = t;
          }
          return a;
        }
        for (var g = 1; g < values.length; g++) gcd = gcdOf(gcd, values[g]);
        return gcd >= 1 && gcd <= 8 ? gcd : 2;
      }

      function normalizeIndent(source) {
        var mode = indent.value;
        var targetSize = mode === "tab" ? 4 : parseInt(mode, 10);
        if (!targetSize || targetSize < 1) targetSize = 2;

        var text = String(source).replace(/\r\n?/g, "\n");
        var sourceSize = detectSourceIndentUnit(text);
        var targetUnit = mode === "tab" ? "\t" : " ".repeat(targetSize);

        return text.split("\n").map(function (line) {
          var match = line.match(/^[\t ]+/);
          if (!match) return line;

          var leading = match[0];
          var visual = 0;
          for (var i = 0; i < leading.length; i++) {
            visual += leading[i] === "\t" ? sourceSize : 1;
          }

          var level = Math.max(0, Math.round(visual / sourceSize));
          return targetUnit.repeat(level) + line.slice(leading.length);
        }).join("\n");
      }

      function highlightWithLanguage(source, selectedLanguage) {
        switch (selectedLanguage) {
          case "javascript": return highlightJavascript(source);
          case "html": return highlightHtml(source);
          case "css": return highlightCss(source);
          case "json": return highlightJson(source);
          case "python": return highlightPython(source);
          case "php": return highlightPhp(source);
          case "java": return highlightJava(source);
          case "sql": return highlightSql(source);
          case "bash": return highlightBash(source);
          default: return highlightPlainText(source);
        }
      }

      function animateProcess() {
        if (!processIcon) return;
        processIcon.classList.remove("gw-processing");
        void processIcon.offsetWidth;
        processIcon.classList.add("gw-processing");
      }

      function parseSource() {
        var source = input.value;
        if (!source.trim()) {
          output.value = "";
          updateCounts();
          setStatus("Masukkan source code terlebih dahulu.", "error");
          return;
        }

        animateProcess();

        try {
          var detected = language.value === "auto"
            ? detectLanguage(source)
            : { language: language.value, detail: languageNames[language.value] || "Plain Text" };

          source = normalizeIndent(source);
          output.value = highlightWithLanguage(source, detected.language);
          updateCounts();

          var name = languageNames[detected.language] || "Plain Text";
          setStatus(
            language.value === "auto"
              ? "Berhasil membuat markup HTML Highlight.js. Format: " + name + "."
              : "Berhasil membuat markup HTML Highlight.js. Bahasa: " + name + ".",
            "gw-ok"
          );
        } catch (error) {
          output.value = "";
          updateCounts();
          setStatus(
            error && error.message ? error.message : "Terjadi kesalahan saat memproses source code.",
            "error"
          );
        }
      }

      function stripHtmlHighlightMarkup(source) {
        var container = document.createElement("div");
        container.innerHTML = String(source);

        // Hanya lepaskan wrapper Highlight.js. Tag lain tidak dihapus,
        // sehingga Unparse tidak membuang bagian source yang valid.
        var elements = container.querySelectorAll("[class]");
        for (var i = 0; i < elements.length; i++) {
          var element = elements[i];
          var classes = String(element.getAttribute("class") || "").split(/\s+/);
          var isHighlightWrapper = classes.some(function (className) {
            return /^hljs(?:-|$)/.test(className) || /^language-/.test(className);
          });

          if (isHighlightWrapper) {
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
          output.value = "";
          updateCounts();
          setStatus("Masukkan markup HTML Highlight.js terlebih dahulu.", "error");
          return;
        }

        animateProcess();
        try {
          output.value = stripHtmlHighlightMarkup(source);
          updateCounts();
          setStatus("Berhasil menghapus markup Highlight.js dan mengembalikan source code.", "gw-ok");
        } catch (error) {
          output.value = "";
          updateCounts();
          setStatus("Terjadi kesalahan saat melakukan Unparse.", "error");
        }
      }

      function processSource() {
        if (currentMode === "unparse") unparseSource();
        else parseSource();
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
        document.getElementById("gw-hljs-input-title").textContent = isParse ? "Source Code" : "HTML Highlight.js";
        document.getElementById("gw-hljs-output-title").textContent = isParse ? "HTML Highlight.js" : "Source Code";
        input.placeholder = isParse ? "Masukkan source code di sini..." : "Masukkan markup HTML Highlight.js di sini...";
        output.placeholder = isParse ? "Hasil markup Highlight.js akan muncul di sini..." : "Hasil source code akan muncul di sini...";
        document.getElementById("gw-hljs-process-label").textContent = isParse ? "Parse HTML" : "Unparse HTML";
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

    })();