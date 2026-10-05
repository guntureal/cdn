(function () {
      "use strict";

      var root = document.getElementById("gw-password-tool");
      if (!root) return;

      var output = document.getElementById("gw-password-output");
      var copyButton = document.getElementById("gw-password-copy");
      var generateButton = document.getElementById("gw-password-generate");
      var clearButton = document.getElementById("gw-password-clear");

      var lengthInput = document.getElementById("gw-password-length");
      var lengthValue = document.getElementById("gw-password-length-value");

      var uppercase = document.getElementById("gw-uppercase");
      var lowercase = document.getElementById("gw-lowercase");
      var numbers = document.getElementById("gw-numbers");
      var symbols = document.getElementById("gw-symbols");
      var ambiguous = document.getElementById("gw-ambiguous");
      var noRepeat = document.getElementById("gw-no-repeat");
      var customCharacters = document.getElementById("gw-custom-characters");
      var autoGenerate = document.getElementById("gw-auto-generate");
      var everyType = document.getElementById("gw-every-type");

      var strengthLabel = document.getElementById("gw-password-strength");
      var strengthBars = root.querySelectorAll(".gw-strength-bar");

      var CHARSETS = {
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        numbers: "0123456789",
        symbols: "!@#$%^&*()-_=+[]{};:,.?/\\|~"
      };

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
        root.classList.toggle("gw-dark", isDarkMode());
      }

      syncTheme();

      if (window.MutationObserver) {
        var observer = new MutationObserver(syncTheme);

        if (document.body) {
          observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class", "data-theme", "theme"]
          });
        }

        if (document.documentElement) {
          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "data-theme", "theme"]
          });
        }
      }

      function uniqueCharacters(value) {
        var result = "";

        for (var i = 0; i < value.length; i++) {
          if (result.indexOf(value[i]) === -1) {
            result += value[i];
          }
        }

        return result;
      }

      function getRandomInt(max) {
        if (max <= 0) return 0;

        if (window.crypto && window.crypto.getRandomValues) {
          var array = new Uint32Array(1);
          var limit = Math.floor(4294967296 / max) * max;

          do {
            window.crypto.getRandomValues(array);
          } while (array[0] >= limit);

          return array[0] % max;
        }

        return Math.floor(Math.random() * max);
      }

      function randomCharacter(characters) {
        return characters.charAt(getRandomInt(characters.length));
      }

      function shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
          var j = getRandomInt(i + 1);
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
        }

        return array;
      }

      function getSelectedSets() {
        var sets = [];

        if (uppercase.checked) {
          sets.push(CHARSETS.uppercase);
        }

        if (lowercase.checked) {
          sets.push(CHARSETS.lowercase);
        }

        if (numbers.checked) {
          sets.push(CHARSETS.numbers);
        }

        if (symbols.checked) {
          sets.push(CHARSETS.symbols);
        }

        if (customCharacters.value) {
          sets.push(customCharacters.value);
        }

        return sets;
      }

      function removeAmbiguousCharacters(value) {
        return value.replace(/[O0Il1o|`'"]/g, "");
      }

      function buildCharacterPool(sets) {
        var pool = "";

        for (var i = 0; i < sets.length; i++) {
          pool += sets[i];
        }

        if (ambiguous.checked) {
          pool = removeAmbiguousCharacters(pool);
        }

        return uniqueCharacters(pool);
      }

      function canUseEveryType(length, sets) {
        return everyType.checked && sets.length <= length;
      }

      function animateGenerate() {
        generateButton.classList.remove("gw-generating");
        void generateButton.offsetWidth;
        generateButton.classList.add("gw-generating");
      }

      function generatePassword() {
        var length = parseInt(lengthInput.value, 10);
        var sets = getSelectedSets();

        if (!sets.length) {
          output.value = "";
          updateStrength("");
          return;
        }

        var pool = buildCharacterPool(sets);

        if (!pool) {
          output.value = "";
          updateStrength("");
          return;
        }

        if (noRepeat.checked && pool.length < length) {
          output.value = "";
          updateStrength("");
          return;
        }

        var characters = [];

        if (canUseEveryType(length, sets)) {
          for (var i = 0; i < sets.length; i++) {
            var set = ambiguous.checked
              ? removeAmbiguousCharacters(sets[i])
              : sets[i];

            set = uniqueCharacters(set);

            if (!set) {
              output.value = "";
              updateStrength("");
              return;
            }

            characters.push(randomCharacter(set));
          }
        }

        var attempts = 0;
        var maxAttempts = 10000;

        while (characters.length < length && attempts < maxAttempts) {
          var char = randomCharacter(pool);

          if (noRepeat.checked && characters.indexOf(char) !== -1) {
            attempts++;
            continue;
          }

          characters.push(char);
        }

        if (characters.length !== length) {
          output.value = "";
          updateStrength("");
          return;
        }

        shuffle(characters);

        output.value = characters.join("");
        updateStrength(output.value);
      }

      function calculateStrength(value) {
        if (!value) {
          return {
            score: 0,
            label: "-"
          };
        }

        var score = 0;
        var length = value.length;

        if (length >= 8) score++;
        if (length >= 12) score++;
        if (length >= 16) score++;

        if (/[a-z]/.test(value)) score++;
        if (/[A-Z]/.test(value)) score++;
        if (/[0-9]/.test(value)) score++;
        if (/[^A-Za-z0-9]/.test(value)) score++;

        if (length < 8) {
          score = Math.min(score, 1);
        }

        if (score <= 2) {
          return { score: 1, label: "Lemah" };
        }

        if (score <= 4) {
          return { score: 3, label: "Sedang" };
        }

        if (score <= 6) {
          return { score: 4, label: "Kuat" };
        }

        return { score: 5, label: "Sangat kuat" };
      }

      function updateStrength(value) {
        var result = calculateStrength(value);

        strengthLabel.textContent = result.label;

        for (var i = 0; i < strengthBars.length; i++) {
          strengthBars[i].classList.toggle(
            "gw-on",
            i < result.score
          );
        }
      }

      var copyIconTimer = null;

      function showCopySuccess() {
        copyButton.classList.add("gw-copied");
        copyButton.setAttribute("aria-label", "Password berhasil disalin");
        copyButton.setAttribute("title", "Password berhasil disalin");

        copyButton.innerHTML =
          '<svg viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="m4.5 12.5 4.2 4.2L19.5 6"></path>' +
          '</svg>';

        if (copyIconTimer) {
          clearTimeout(copyIconTimer);
        }

        copyIconTimer = setTimeout(function () {
          copyButton.classList.remove("gw-copied");
          copyButton.setAttribute("aria-label", "Salin password");
          copyButton.setAttribute("title", "Salin password");

          copyButton.innerHTML =
            '<svg viewBox="0 0 24 24" aria-hidden="true">' +
            '<rect x="8" y="8" width="11" height="12" rx="2"></rect>' +
            '<path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2"></path>' +
            '</svg>';
        }, 1600);
      }

      function copyPassword() {
        if (!output.value) {
          return;
        }

        if (
          navigator.clipboard &&
          typeof navigator.clipboard.writeText === "function"
        ) {
          navigator.clipboard.writeText(output.value)
            .then(function () {
              showCopySuccess();
            })
            .catch(function () {
              fallbackCopy();
            });
        } else {
          fallbackCopy();
        }
      }

      function fallbackCopy() {
        output.focus();
        output.select();

        try {
          document.execCommand("copy");
          showCopySuccess();
        } catch (error) {
        }
      }

      function clearAll() {
        clearButton.classList.remove("gw-clearing");
        void clearButton.offsetWidth;
        clearButton.classList.add("gw-clearing");
        window.setTimeout(function () {
          clearButton.classList.remove("gw-clearing");
        }, 220);
        output.value = "";
        updateStrength("");
        output.blur();
      }

      function syncLength() {
        lengthValue.textContent = lengthInput.value;

        if (autoGenerate.checked) {
          generatePassword();
        }
      }

      function settingChanged() {
        if (autoGenerate.checked) {
          generatePassword();
        }
      }

      lengthInput.addEventListener("input", syncLength);

      uppercase.addEventListener("change", settingChanged);
      lowercase.addEventListener("change", settingChanged);
      numbers.addEventListener("change", settingChanged);
      symbols.addEventListener("change", settingChanged);
      ambiguous.addEventListener("change", settingChanged);
      noRepeat.addEventListener("change", settingChanged);
      autoGenerate.addEventListener("change", settingChanged);
      everyType.addEventListener("change", settingChanged);

      customCharacters.addEventListener("input", settingChanged);

      generateButton.addEventListener("click", function () {
        animateGenerate();
        generatePassword();
      });
      copyButton.addEventListener("click", copyPassword);
      clearButton.addEventListener("click", clearAll);

      output.addEventListener("click", function () {
        if (output.value) {
          copyPassword();
        }
      });

      root.addEventListener("keydown", function (event) {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key === "Enter"
        ) {
          event.preventDefault();
          generatePassword();
        }
      });

      lengthValue.textContent = lengthInput.value;
      generatePassword();
    })();
