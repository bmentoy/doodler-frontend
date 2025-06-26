// ✅ ai-chatbot.js – Full AI Assistant Logic

// Wait for DOM to load
window.addEventListener("DOMContentLoaded", () => {
  const aiChatToggle = document.getElementById("ai-chatbot-btn"),
        aiChatWindow = document.getElementById("ai-chat-window"),
        aiChatClose = document.getElementById("ai-chat-close-btn"),
        aiChatInput = document.getElementById("ai-chat-input"),
        aiChatSend = document.getElementById("ai-chat-send-btn"),
        aiChatMessages = document.getElementById("ai-chat-messages");

  if (!aiChatToggle || !aiChatWindow || !aiChatClose || !aiChatInput || !aiChatSend || !aiChatMessages) {
    console.error("AI Chatbot elements missing.");
    return;
  }

  // ✅ AI Response Knowledge Base
  const aiResponses = {
    "hello": "Hi there! I'm Doodler Assistant. How can I help you today?",
    "hi": "Hello! Ask me about signing up, logging in, or encryption.",
    "doodler": "Doodler is a free, secure messaging platform with end-to-end encryption, ensuring your messages stay private.",
    "sign up": "To sign up, click the 'Sign Up' button, enter your email, and create a strong passphrase (8–15 characters including uppercase, lowercase, number, and special character).",
    "signup": "Use the 'Sign Up' button at the top to register for free with your email and a strong passphrase.",
    "login": "Click 'Login', enter your registered email and passphrase to access your account.",
    "forgot passphrase": "Please contact support@doodler.com for passphrase recovery assistance.",
    "encryption": "Doodler uses OpenPGP encryption for end-to-end privacy. Only you and your recipient can read messages.",
    "security": "We secure your data with end-to-end encryption, passwordless login, and zero message metadata.",
    "owner": "Doodler is a privacy-first passion project built by an independent dev team.",
    "support": "Reach us at support@doodler.com or check the Help section in the menu.",
    "help": "For help, click on 'Help & Support' in the navigation bar.",
    "services": "Doodler offers encrypted messaging, secure logins, and private real-time chat – all for free.",
    "cost": "Doodler is completely free. No hidden fees or subscriptions.",
    "free": "Yes, Doodler is 100% free to use.",
    "privacy": "Your messages and data are yours alone. Doodler stores only public keys and minimal info.",
    "contact": "Email us anytime at support@doodler.com.",
    "about": "Doodler is a secure, user-friendly messaging service focusing on privacy and accessibility.",
    "google login": "Google login is under development. Please use email and passphrase to sign up.",
    "chat": "After logging in, go to chat.html to start messaging securely with others.",
    "features": "Features include: strong encryption, no tracking, responsive UI, and user-owned private keys.",
    "default": "I'm here to help! Try asking about signup, login, encryption, or Doodler's features."
  };

  // ✅ Add Message to Chat
  function addMessage(text, type) {
    const msg = document.createElement("div");
    msg.classList.add("message", `${type}-message`);
    msg.innerHTML = typeof DOMPurify !== "undefined" ? DOMPurify.sanitize(text) : text;
    aiChatMessages.appendChild(msg);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  }

  // ✅ Handle User Message
  function handleUserMessage(input) {
    const text = input.trim().toLowerCase();
    if (!text) return;
    addMessage(input, "user");

    setTimeout(() => {
      const key = Object.keys(aiResponses).find(k => text.includes(k)) || "default";
      const reply = aiResponses[key];
      addMessage(reply, "ai");
    }, 400);
  }

  // ✅ Toggle Chat
  aiChatToggle.addEventListener("click", () => {
    const isOpen = aiChatWindow.classList.toggle("active");
    document.body.classList.toggle("ai-chat-active", isOpen);
    if (isOpen && aiChatMessages.children.length === 0) {
      addMessage("👋 Hi! I'm your AI Assistant. Ask me anything about Doodler.", "ai");
    }
    if (isOpen) aiChatInput.focus();
  });

  // ✅ Close Chat
  aiChatClose.addEventListener("click", () => {
    aiChatWindow.classList.remove("active");
    document.body.classList.remove("ai-chat-active");
  });

  // ✅ Send Message on Click
  aiChatSend.addEventListener("click", () => {
    handleUserMessage(aiChatInput.value);
    aiChatInput.value = "";
  });

  // ✅ Send on Enter
  aiChatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && aiChatInput.value.trim()) {
      e.preventDefault();
      aiChatSend.click();
    }
  });
});
