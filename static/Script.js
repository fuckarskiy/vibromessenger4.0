"";

document.addEventListener("DOMContentLoaded", () => {
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const chatMenu = document.getElementById("chatMenu");
  const profileMenu = document.getElementById("profileMenu");

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const nextBtn = document.getElementById("nextBtn");
  const confirmBtn = document.getElementById("confirmBtn");

  const profileBtn = document.getElementById("profileBtn");
  const backChat = document.getElementById("backChat");

  const userSelect = document.getElementById("userSelect");
  const msgInput = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");
  const messagesDiv = document.getElementById("messages");

  const avatarImg = document.getElementById("avatar");
  const userLabel = document.getElementById("userLabel");
  const avatarFile = document.getElementById("avatarFile");
  const updateAvatar = document.getElementById("updateAvatar");

  // STEP1 → STEP2
  nextBtn.addEventListener("click", () => {
    const u = usernameInput.value.trim();
    if (!u) return alert("Введите имя или номер");
    currentUser = u;
    step1.classList.remove("active");
    step2.classList.add("active");
  });

  // STEP2 → CHAT
  confirmBtn.addEventListener("click", async () => {
    const p = passwordInput.value.trim();
    if (!p) return alert("Введите пароль");

    // Попытка регистрации
    let res = await fetch("/register", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({username: currentUser, password: p})
    });
    let data = await res.json();

    // Если существует → логин
    if (data.error) {
      res = await fetch("/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({username: currentUser, password: p})
      });
      data = await res.json();
    }

    if (data.ok) {
      step2.classList.remove("active");
      chatMenu.classList.add("active");
      loadProfile();
      loadUsers();
    } else {
      alert("Неверные данные");
    }
  });

  async function loadProfile() {
    const r = await fetch("/profile");
    const d = await r.json();
    userLabel.textContent = d.username;
    avatarImg.src = d.avatar || "static/avatars/default.png";
  }

  async function loadUsers() {
    const r = await fetch("/search?q=");
    const users = await r.json();
    userSelect.innerHTML = `<option value="">Выберите пользователя</option>`;
    users.forEach(u => {
      if (u !== currentUser) {
        const opt = document.createElement("option");
        opt.value = u;
        opt.textContent = u;
        userSelect.appendChild(opt);
      }
    });
  }

  sendBtn.addEventListener("click", async () => {
    const msg = msgInput.value.trim();
    const to = userSelect.value;
    if (!msg || !to) return alert("Выберите пользователя и напишите сообщение");

    await fetch("/dm/send", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({to, text: msg})
    });
    msgInput.value = "";
    loadDM(to);
  });

  async function loadDM(to) {
    if (!to) return;
    const r = await fetch(`/dm/history?with=${to}`);
    const messages = await r.json();
    messagesDiv.innerHTML = "";
    messages.forEach(m => {
      const div = document.createElement("div");
      div.textContent = `${m.sender === currentUser ? "Вы" : m.sender}: ${m.text}`;
      div.className = m.sender === currentUser ? "me" : "other";
      messagesDiv.appendChild(div);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  profileBtn.addEventListener("click", () => {
    chatMenu.classList.remove("active");
    profileMenu.classList.add("active");
  });
  backChat.addEventListener("click", () => {
    profileMenu.classList.remove("active");
    chatMenu.classList.add("active");
  });

  updateAvatar.addEventListener("click", async () => {
    const f = avatarFile.files[0];
    if (!f) return alert("Выберите файл");
    const form = new FormData();
    form.append("avatar", f);
    const r = await fetch("/profile/avatar", {method:"POST", body: form});
    const d = await r.json();
    if (d.ok) avatarImg.src = d.avatar;
  });

  userSelect.addEventListener("change", () => loadDM(userSelect.value));
});
