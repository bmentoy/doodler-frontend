document.addEventListener("DOMContentLoaded", () => {
  const logo = document.querySelector("#logo-link"),
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
        ctaButtons = document.querySelectorAll(".cta-button"),
        chatbotBtn = document.getElementById("ai-chatbot-btn"),
        chatbotWindow = document.querySelector(".ai-chat-window"),
        chatInput = document.getElementById("ai-chat-input"),
        chatSendBtn = document.getElementById("ai-chat-send-btn"),
        chatMessages = document.querySelector(".ai-chat-messages");

  // Theme Toggle
  const themeToggle = document.getElementById("theme-toggle");
  const lightThemeLink = document.getElementById("light-theme");
  const darkThemeLink = document.getElementById("dark-theme");
  let isDarkMode = false;

  themeToggle.addEventListener("click", () => {
    isDarkMode = !isDarkMode;
    document.documentElement.setAttribute("data-theme", isDarkMode ? "dark" : "light");
    lightThemeLink.disabled = isDarkMode;
    darkThemeLink.disabled = !isDarkMode;
    themeToggle.textContent = isDarkMode ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-label", isDarkMode ? "Toggle Light Mode" : "Toggle Dark Mode");
  });

  // Section Navigation
  function showSection(id) {
    document.querySelectorAll(".section").forEach(s => {
      s.classList.remove("active");
      s.classList.remove("fade-in");
    });

    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active-link"));
    const sec = document.querySelector(`#${id}`);
    const link = document.querySelector(`.nav-link[href='#${id}']`);
    
    if (sec && link) {
      sec.classList.add("active");
      sec.classList.add("fade-in");
      link.classList.add("active-link");
      sec.scrollIntoView({ behavior: "smooth" });
    }

    if (navLinksContainer.classList.contains("active")) {
      navLinksContainer.classList.remove("active");
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  }

  logo.addEventListener("click", e => {
    e.preventDefault();
    showSection("home");
  });

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      showSection(e.target.getAttribute("href").substring(1));
    });
  });

  menuToggle.addEventListener("click", () => {
    navLinksContainer.classList.toggle("active");
    menuToggle.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", navLinksContainer.classList.contains("active"));
  });

  // Fade Navbar on Scroll Down/Up
  let lastScrollY = window.scrollY;
  const navbar = document.querySelector("header"); // assuming header is the nav container

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      navbar.classList.add("fade-out");
      navbar.classList.remove("fade-in");
    } else {
      navbar.classList.add("fade-in");
      navbar.classList.remove("fade-out");
    }
    lastScrollY = currentScrollY;

    scrollTopBtn.classList.toggle("show", window.scrollY > 300);
  });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Modal Management
  function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if (modal) {
      if (show) {
        modal.showModal();
        modal.querySelector("input").focus();
        document.body.classList.add(`${id}-blur`);
      } else {
        modal.close();
        document.body.classList.remove(`${id}-blur`);
      }
    }
  }

  [loginBtn, signupBtn].forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.classList.contains("btnLogin-popup") ? "loginPopup" : "signupPopup";
      toggleModal(target, true);
    });
  });

  ctaButtons.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      toggleModal("signupPopup", true);
    });
  });

  closeModals.forEach(btn => {
    btn.addEventListener("click", () => {
      const modal = btn.closest("dialog");
      if (modal) toggleModal(modal.id, false);
    });
  });

  [loginPopup, signupPopup].forEach(modal => {
    modal.addEventListener("click", e => {
      if (e.target === modal) toggleModal(modal.id, false);
    });
  });

  // Password Toggle
  document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", e => {
      const container = e.target.closest(".password-wrapper");
      const input = container.querySelector("input");
      input.type = input.type === "password" ? "text" : "password";
      btn.textContent = input.type === "password" ? "👁️" : "🙈";
      btn.setAttribute("aria-label", input.type === "password" ? "Show password" : "Hide password");
    });
  });

  // Signup Logic
  signupForm.addEventListener("submit", async e => {
    e.preventDefault();
    const submitBtn = signupForm.querySelector(".signup-button");
    const email = signupForm.querySelector("#signup-email").value.trim();
    const p1 = signupForm.querySelector("#signup-passphrase").value;
    const p2 = signupForm.querySelector("#confirm-passphrase").value;
    const err = signupForm.querySelector(".criteria-message");

    submitBtn.disabled = true;
    submitBtn.textContent = "Signing up...";

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      err.textContent = "Invalid email format.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign Up";
      return;
    }
    if (p1 !== p2) {
      err.textContent = "Passphrases do not match.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign Up";
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(p1)) {
      err.textContent = "8–15 chars, number, lowercase, uppercase, special char required.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign Up";
      return;
    }

    try {
      if (typeof openpgp === "undefined") throw new Error("Encryption library not loaded");
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

      if (!response.ok) throw new Error(`Signup failed: ${response.statusText}`);
      alert("Signup successful! Please login.");
      toggleModal("signupPopup", false);
    } catch (error) {
      err.textContent = `Error: ${error.message || "Signup failed. Try again."}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign Up";
    }
  });

  // Login Logic
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const submitBtn = loginForm.querySelector(".login-button");
    const email = loginForm.querySelector("#login-email").value.trim();
    const passphrase = loginForm.querySelector("#login-passphrase").value;
    const err = loginForm.querySelector(".criteria-message");

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      err.textContent = "Invalid email format.";
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
      return;
    }

    try {
      if (typeof openpgp === "undefined") throw new Error("Encryption library not loaded");
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const { encryptedPrivateKey } = await res.json();
      const privateKey = await openpgp.readPrivateKey({ armoredKey: encryptedPrivateKey });
      await openpgp.decryptKey({ privateKey, passphrase });

      alert("Login successful!");
      window.location.href = "chat.html";
    } catch (error) {
      err.textContent = `Error: ${error.message || "Login failed. Try again."}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });

  // Google Auth (Placeholder)
  document.querySelectorAll(".signup-google, .login-google").forEach(btn => {
    btn.addEventListener("click", () => {
      alert("Google login not yet implemented.");
    });
  });

  // Default Section Load
  showSection("home");
});
