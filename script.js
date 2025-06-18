document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const logoElement = document.querySelector(".Logo");
  const homeLink = document.querySelector(".nav-link:nth-child(1)");
  const aboutLink = document.querySelector(".nav-link:nth-child(2)");
  const servicesLink = document.querySelector(".nav-link:nth-child(3)");
  const helpLink = document.querySelector(".nav-link:nth-child(4)");
  const loginButton = document.querySelector(".btnLogin-popup");
  const signupButton = document.querySelector(".btnSignup-popup");
  const loginPopup = document.getElementById("loginPopup");
  const signupPopup = document.getElementById("signupPopup");
  const closeLoginButton = document.querySelector(".login-popup .close");
  const closeSignupButton = document.querySelector(".signup-popup .close");
  const signupForm = document.getElementById("signupForm");
  const loginForm = document.getElementById("loginForm");
  const landingContent = document.getElementById("landing-content");
  const messagingContent = document.getElementById("messaging-content");
  const contactList = document.getElementById("contact-list");
  const addContactButton = document.getElementById("add-contact");
  const chatHeader = document.getElementById("chat-header");
  const chatMessages = document.getElementById("chat-messages");
  const messageInput = document.getElementById("message-input");
  const sendMessageButton = document.getElementById("send-message");

  // WebSocket Connection (Replace with your backend URL after deployment)
  let ws = null;
  const WS_URL = "ws://localhost:8080"; // Update to your deployed WebSocket URL

  // Current User and Chat State
  let currentUser = null;
  let currentChatContact = null;
  let contacts = [];

  // Navigation Functions
  function goToHome() {
    if (currentUser) {
      landingContent.style.display = "none";
      messagingContent.style.display = "block";
    } else {
      const homeSection = document.querySelector("#home");
      if (homeSection) {
        homeSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  logoElement.addEventListener("click", goToHome);
  homeLink.addEventListener("click", goToHome);

  aboutLink.addEventListener("click", function (e) {
    e.preventDefault();
    const aboutSection = document.querySelector("#about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  });

  servicesLink.addEventListener("click", function (e) {
    e.preventDefault();
    const servicesSection = document.querySelector("#services");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    }
  });

  helpLink.addEventListener("click", function (e) {
    e.preventDefault();
    const helpSection = document.querySelector("#help");
    if (helpSection) {
      helpSection.scrollIntoView({ behavior: "smooth" });
    }
  });

  // Popup Handlers
  loginButton.addEventListener("click", function () {
    loginPopup.style.display = "block";
    document.body.classList.add("login-blur");
  });

  signupButton.addEventListener("click", function () {
    signupPopup.style.display = "block";
    document.body.classList.add("signup-blur");
  });

  closeLoginButton.addEventListener("click", function () {
    loginPopup.style.display = "none";
    document.body.classList.remove("login-blur");
  });

  closeSignupButton.addEventListener("click", function () {
    signupPopup.style.display = "none";
    document.body.classList.remove("signup-blur");
  });

  window.addEventListener("click", function (event) {
    if (event.target === loginPopup) {
      loginPopup.style.display = "none";
      document.body.classList.remove("login-blur");
    }
    if (event.target === signupPopup) {
      signupPopup.style.display = "none";
      document.body.classList.remove("signup-blur");
    }
  });

  // Passphrase Validation
  function validatePassphrase(passphrase) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
    return regex.test(passphrase);
  }

  // Signup Handler
  signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("signup-email").value;
    const passphrase = document.getElementById("signup-passphrase").value;
    const confirmPassphrase = document.getElementById("confirm-passphrase").value;
    const passphraseError = document.getElementById("passphraseError");

    if (passphrase !== confirmPassphrase) {
      passphraseError.textContent = "Passphrases do not match.";
      return;
    }

    if (!validatePassphrase(passphrase)) {
      passphraseError.textContent = "Passphrase must be 8-15 characters with a number, lowercase, uppercase, and special character.";
      return;
    }

    // Generate Key Pair
    try {
      const { privateKey, publicKey } = await openpgp.generateKey({
        type: "rsa",
        rsaBits: 2048,
        userIDs: [{ email }],
        passphrase,
      });

      // Store private key locally (encrypted with passphrase)
      localStorage.setItem(`privateKey_${email}`, privateKey);
      // Send public key to server
      await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, publicKey }),
      });

      alert("Signup successful! Please login.");
      signupPopup.style.display = "none";
      document.body.classList.remove("signup-blur");
    } catch (error) {
      passphraseError.textContent = "Error during signup. Try again.";
      console.error(error);
    }
  });

  // Login Handler
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value;
    const passphrase = document.getElementById("login-passphrase").value;

    try {
      // Retrieve and decrypt private key
      const privateKeyArmored = localStorage.getItem(`privateKey_${email}`);
      if (!privateKeyArmored) {
        alert("No account found. Please sign up.");
        return;
      }

      const privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
      await openpgp.decryptKey({
        privateKey: privateKey,
        passphrase,
      });

      // Initialize WebSocket
      ws = new WebSocket(WS_URL);
      ws.onopen = async () => {
        // Authenticate with server
        ws.send(JSON.stringify({ type: "auth", email }));
        currentUser = email;
        landingContent.style.display = "none";
        messagingContent.style.display = "block";
        loginPopup.style.display = "none";
        document.body.classList.remove("login-blur");
        await fetchContacts();
      };

      ws.onmessage = handleWebSocketMessage;
      ws.onclose = () => {
        alert("Connection lost. Please reload.");
      };
    } catch (error) {
      alert("Invalid passphrase or email.");
      console.error(error);
    }
  });

  // Fetch Contacts
  async function fetchContacts() {
    try {
      const response = await fetch("http://localhost:3000/users");
      contacts = await response.json();
      contactList.innerHTML = "";
      contacts.forEach(contact => {
        if (contact.email !== currentUser) {
          const li = document.createElement("li");
          li.textContent = contact.email;
          li.addEventListener("click", () => selectContact(contact));
          contactList.appendChild(li);
        }
      });
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }

  // Select Contact
  function selectContact(contact) {
    currentChatContact = contact;
    chatHeader.textContent = `Chatting with ${contact.email}`;
    chatMessages.innerHTML = "";
    document.querySelectorAll(".contact-list li").forEach(li => li.classList.remove("active"));
    event.target.classList.add("active");
  }

  // Add Contact
  addContactButton.addEventListener("click", async () => {
    const email = prompt("Enter contact email:");
    if (email && email !== currentUser) {
      try {
        const response = await fetch(`http://localhost:3000/user/${email}`);
        const contact = await response.json();
        if (contact) {
          contacts.push(contact);
          const li = document.createElement("li");
          li.textContent = contact.email;
          li.addEventListener("click", () => selectContact(contact));
          contactList.appendChild(li);
        } else {
          alert("User not found.");
        }
      } catch (error) {
        alert("Error adding contact.");
        console.error(error);
      }
    }
  });

  // Send Message
  sendMessageButton.addEventListener("click", async () => {
    if (!currentChatContact) {
      alert("Select a contact to chat.");
      return;
    }

    const message = messageInput.value.trim();
    if (!message) return;

    try {
      // Encrypt Message
      const publicKey = await openpgp.readKey({ armoredKey: currentChatContact.publicKey });
      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: message }),
        encryptionKeys: publicKey,
      });

      // Send via WebSocket
      ws.send(JSON.stringify({
        type: "message",
        to: currentChatContact.email,
        from: currentUser,
        encrypted,
      }));

      // Display Sent Message
      const messageElement = document.createElement("div");
      messageElement.classList.add("message", "sent");
      messageElement.textContent = message;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      messageInput.value = "";
    } catch (error) {
      alert("Error sending message.");
      console.error(error);
    }
  });

  // Handle WebSocket Messages
  async function handleWebSocketMessage(event) {
    const data = JSON.parse(event.data);
    if (data.type === "message" && data.to === currentUser) {
      try {
        // Decrypt Message
        const privateKeyArmored = localStorage.getItem(`privateKey_${currentUser}`);
        const privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
        const decryptedKey = await openpgp.decryptKey({
          privateKey,
          passphrase: document.getElementById("login-passphrase").value, // Assumes passphrase is still in input
        });

        const message = await openpgp.readMessage({ armoredMessage: data.encrypted });
        const { data: decrypted } = await openpgp.decrypt({
          message,
          decryptionKeys: decryptedKey,
        });

        // Display Received Message
        if (data.from === currentChatContact?.email) {
          const messageElement = document.createElement("div");
          messageElement.classList.add("message", "received");
          messageElement.textContent = decrypted;
          chatMessages.appendChild(messageElement);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      } catch (error) {
        console.error("Error decrypting message:", error);
      }
    }
  }
});