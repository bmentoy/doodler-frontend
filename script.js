document.addEventListener("DOMContentLoaded", () => {
  const logo = document.querySelector(".Logo"),
        navLinks = document.querySelectorAll(".nav-link"),
        loginBtn = document.querySelector(".btnLogin-popup"),
        signupBtn = document.querySelector(".btnSignup-popup"),
        loginPopup = document.getElementById("loginPopup"),
        signupPopup = document.getElementById("signupPopup"),
        closeModals = document.querySelectorAll(".close-modal-btn"),
        signupForm = document.getElementById("signupForm"),
        loginForm = document.getElementById("loginForm"),
        menuToggle = document.querySelector(".menu-toggle"),
        navLinksContainer = document.getElementById("nav-links"),
        scrollTopBtn = document.getElementById("scroll-top"),
        themeToggle = document.getElementById("theme-toggle"),
        darkThemeLink = document.getElementById("dark-theme"),
        aiChatToggle = document.getElementById("ai-chatbot-btn"),
        aiChatWindow = document.getElementById("ai-chat-window"),
        aiChatClose = document.getElementById("ai-chat-close-btn"),
        aiChatInput = document.getElementById("ai-chat-input"),
        aiChatSend = document.getElementById("ai-chat-send-btn"),
        aiChatMessages = document.getElementById("ai-chat-messages");

  // Theme Management
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("theme") || (systemPrefersDark ? "dark" : "light");

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    darkThemeLink.disabled = theme !== "dark";
    themeToggle.textContent = theme === "dark" ? "Light Mode☀️" : "Dark Mode🌙";
    themeToggle.setAttribute("aria-pressed", theme === "dark");
  }

  setTheme(savedTheme);

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(currentTheme);
  });

  // Section Navigation
  function showSection(id) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active-link"));
    const sec = document.querySelector(`#${id}`),
          link = document.querySelector(`.nav-link[href='#${id}']`);
    if (sec && link) {
      sec.classList.add("active");
      link.classList.add("active-link");
      sec.scrollIntoView({ behavior: "smooth" });
    }
    if (navLinksContainer.classList.contains("active")) {
      navLinksContainer.classList.remove("active");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  }

  [logo, ...navLinks].forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      showSection(e.target.getAttribute("href")?.substring(1) || "home");
    });
  });

  menuToggle.addEventListener("click", () => {
    navLinksContainer.classList.toggle("active");
    menuToggle.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", navLinksContainer.classList.contains("active"));
  });

  // Modal Management
  function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if (modal) {
      if (show) {
        modal.showModal();
        modal.querySelector("input").focus();
      } else {
        modal.close();
      }
      document.body.classList[show ? "add" : "remove"](`${id}-blur`);
    }
  }

  [loginBtn, signupBtn].forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.classList.contains("btnLogin-popup") ? "loginPopup" : "signupPopup";
      toggleModal(target, true);
    });
  });

  closeModals.forEach(btn => {
    btn.addEventListener("click", () => {
      const modal = btn.closest("dialog");
      if (modal) toggleModal(modal.id, false);
    });
  });

  // Close modals on backdrop click
  [loginPopup, signupPopup].forEach(modal => {
    modal.addEventListener("click", e => {
      if (e.target === modal) toggleModal(modal.id, false);
    });
  });

  // Password Toggle
  document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const input = e.target.previousElementSibling;
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = input.type === "password" ? "👁️" : "🙈";
      btn.setAttribute("aria-label", input.type === "password" ? "Show password" : "Hide password");
    });
  });

  // Scroll-to-Top
  window.addEventListener("scroll", () => {
    scrollTopBtn.classList.toggle("show", window.scrollY > 300);
  });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Form Validation and Submission
  const validatePass = p =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(p);

  signupForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = signupForm.querySelector("#signup-email").value.trim(),
          p1 = signupForm.querySelector("#signup-passphrase").value,
          p2 = signupForm.querySelector("#confirm-passphrase").value,
          err = signupForm.querySelector(".criteria-message");

    if (p1 !== p2) return (err.textContent = "Passphrases do not match.");
    if (!validatePass(p1)) return (err.textContent = "8–15 chars, number, lowercase, uppercase, special char required.");

    try {
      const { privateKey, publicKey } = await openpgp.generateKey({
        type: "rsa",
        rsaBits: 2048,
        userIDs: [{ email }],
        passphrase: p1
      });

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, publicKey })
      });

      if (!response.ok) throw new Error("Signup failed");

      alert("Signup successful! Please login.");
      toggleModal("signupPopup", false);
    } catch {
      err.textContent = "Error during signup. Try again.";
    }
  });

  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const email = loginForm.querySelector("#login-email").value.trim(),
          passphrase = loginForm.querySelector("#login-passphrase").value;
    try {
      const privateKey = await openpgp.readPrivateKey({ armoredKey: "placeholder" });
      await openpgp.decryptKey({ privateKey, passphrase });
      alert("Login successful!");
      window.location.href = "chat.html";
    } catch {
      alert("Invalid email or passphrase.");
    }
  });

  // AI Chat Logic
  const aiResponses = {
    "what is doodler": "Doodler is a secure messaging platform with end-to-end encryption.",
    "how to sign up": "Click 'Sign Up', enter email and a strong passphrase.",
    "how does encryption work": "Uses OpenPGP for end-to-end encryption.",
    "contact support": "Email support@doodler.com.",
    default: "Ask about features, signup, encryption, or support!"
  };

  function addMessage(text, type) {
    const msg = document.createElement("div");
    msg.classList.add("message", `${type}-message`);
    // Sanitize input if DOMPurify is available, otherwise use textContent directly
    if (typeof DOMPurify !== "undefined") {
      msg.innerHTML = DOMPurify.sanitize(text);
    } else {
      console.warn("DOMPurify not loaded; using textContent for safety.");
      msg.textContent = text;
    }
    aiChatMessages.appendChild(msg);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  }

  aiChatToggle.addEventListener("click", () => {
    aiChatWindow.classList.toggle("active");
    document.body.classList.toggle("ai-chat-active");
    if (aiChatWindow.classList.contains("active") && aiChatMessages.children.length === 0) {
      addMessage("Hi! I'm Doodler Assistant. Ask about encryption or account help.", "ai");
    }
    if (aiChatWindow.classList.contains("active")) {
      aiChatInput.focus();
    }
  });

  aiChatClose.addEventListener("click", () => {
    aiChatWindow.classList.remove("active");
    document.body.classList.remove("ai-chat-active");
  });

  aiChatSend.addEventListener("click", () => {
    const input = aiChatInput.value.trim().toLowerCase();
    if (!input) return;
    addMessage(input, "user");
    setTimeout(() => {
      const match = Object.keys(aiResponses).find(k => input.includes(k)) || "default";
      addMessage(aiResponses[match], "ai");
    }, 500);
    aiChatInput.value = "";
  });

  aiChatInput.addEventListener("keypress", e => {
    if (e.key === "Enter" && aiChatInput.value.trim()) {
      aiChatSend.click();
    }
  });

  showSection("home");
});

// Load DOMPurify for sanitizing AI chat input
const script = document.createElement("script");
script.src = "https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js";
script.async = true;
document.head.appendChild(script);
