/**
 * AuraEmotion - Frontend Logic & Neural Interaction Engine
 */

document.addEventListener("DOMContentLoaded", () => {
  // Emotion Taxonomy Configuration & Meta
  const EMOTIONS = {
    joy: {
      name: "Joy",
      emoji: "😄",
      color: "#fbbf24",
      glow: "rgba(251, 191, 36, 0.35)",
      bgGradient: "radial-gradient(circle, rgba(251, 191, 36, 0.22) 0%, rgba(245, 158, 11, 0.12) 40%, transparent 70%)",
      desc: "Expressing optimism, elation, delight, and positive mental resonance."
    },
    love: {
      name: "Love",
      emoji: "❤️",
      color: "#fb7185",
      glow: "rgba(251, 113, 133, 0.4)",
      bgGradient: "radial-gradient(circle, rgba(251, 113, 133, 0.25) 0%, rgba(244, 63, 94, 0.12) 40%, transparent 70%)",
      desc: "Deep affection, emotional warmth, gratitude, and heartfelt connection."
    },
    surprise: {
      name: "Surprise",
      emoji: "😲",
      color: "#c084fc",
      glow: "rgba(192, 132, 252, 0.4)",
      bgGradient: "radial-gradient(circle, rgba(192, 132, 252, 0.25) 0%, rgba(168, 85, 247, 0.12) 40%, transparent 70%)",
      desc: "Sudden astonishment, heightened arousal, curiosity, or unexpected wonder."
    },
    sadness: {
      name: "Sadness",
      emoji: "😢",
      color: "#38bdf8",
      glow: "rgba(56, 189, 248, 0.35)",
      bgGradient: "radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, rgba(14, 165, 233, 0.12) 40%, transparent 70%)",
      desc: "Melancholy, grief, longing, or subdued emotional vulnerability."
    },
    fear: {
      name: "Fear",
      emoji: "😨",
      color: "#818cf8",
      glow: "rgba(129, 140, 248, 0.35)",
      bgGradient: "radial-gradient(circle, rgba(129, 140, 248, 0.22) 0%, rgba(99, 102, 241, 0.12) 40%, transparent 70%)",
      desc: "Heightened apprehension, anxiety, suspense, or perceived vulnerability."
    },
    anger: {
      name: "Anger",
      emoji: "😡",
      color: "#f87171",
      glow: "rgba(248, 113, 113, 0.4)",
      bgGradient: "radial-gradient(circle, rgba(248, 113, 113, 0.25) 0%, rgba(239, 68, 68, 0.12) 40%, transparent 70%)",
      desc: "Intensity, frustration, righteous indignation, or heated resentment."
    }
  };

  // DOM Element Selectors
  const textInput = document.getElementById("textInput");
  const charCounter = document.getElementById("charCounter");
  const wordCounter = document.getElementById("wordCounter");
  const clearBtn = document.getElementById("clearBtn");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const btnContent = document.getElementById("btnContent");
  const btnSpinner = document.getElementById("btnSpinner");
  const presetChips = document.querySelectorAll(".preset-chip");
  const ambientGlow = document.getElementById("ambientGlow");

  // Health & Navigation
  const healthStatus = document.getElementById("healthStatus");
  const healthLabel = document.getElementById("healthLabel");
  const sfxToggle = document.getElementById("sfxToggle");

  // Results Elements
  const emptyState = document.getElementById("emptyState");
  const resultContent = document.getElementById("resultContent");
  const resultActions = document.getElementById("resultActions");
  const heroEmoji = document.getElementById("heroEmoji");
  const avatarHalo = document.getElementById("avatarHalo");
  const heroEmotionName = document.getElementById("heroEmotionName");
  const heroDescription = document.getElementById("heroDescription");
  const dialFill = document.getElementById("dialFill");
  const dialPercent = document.getElementById("dialPercent");
  const barsContainer = document.getElementById("barsContainer");
  const quoteText = document.getElementById("quoteText");
  const copyResultBtn = document.getElementById("copyResultBtn");
  const copyJsonBtn = document.getElementById("copyJsonBtn");

  // History Drawer Elements
  const historyToggle = document.getElementById("historyToggle");
  const historyDrawer = document.getElementById("historyDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  const closeDrawerBtn = document.getElementById("closeDrawerBtn");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const historyList = document.getElementById("historyList");
  const historyBadge = document.getElementById("historyBadge");
  const toastContainer = document.getElementById("toastContainer");

  // State Management
  let soundEnabled = localStorage.getItem("aura_sfx") !== "false";
  let currentResult = null;
  let history = [];

  try {
    const savedHistory = localStorage.getItem("aura_history");
    if (savedHistory) history = JSON.parse(savedHistory);
  } catch (e) {
    history = [];
  }

  // Web Audio Synthesizer for tactile micro-feedback
  let audioCtx = null;
  function playSynthSound(type = "click") {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === "click") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (err) {
      // Audio not permitted or supported
    }
  }

  // Toast Notification System
  function showToast(message, icon = "ℹ️", duration = 3200) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("removing");
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  // Update Character & Word Counters
  function updateCounters() {
    const text = textInput.value;
    const charCount = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    charCounter.textContent = `${charCount} / 2000 chars`;
    wordCounter.textContent = `${wordCount} word${wordCount === 1 ? "" : "s"}`;
    analyzeBtn.disabled = charCount === 0;
  }

  // Check Backend Health
  async function checkApiHealth() {
    try {
      const response = await fetch("/health", { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        healthStatus.className = "status-pill online";
        if (data.model_loaded) {
          healthLabel.textContent = "Model Online";
        } else {
          healthLabel.textContent = "Server Ready (Model Standby)";
        }
      } else {
        throw new Error("Bad status");
      }
    } catch (err) {
      healthStatus.className = "status-pill offline";
      healthLabel.textContent = "API Offline";
    }
  }

  // Predict Emotion via Backend API
  async function performPrediction(textToAnalyze) {
    const trimmed = (textToAnalyze || textInput.value).trim();
    if (!trimmed) {
      showToast("Please provide a sentence to analyze.", "⚠️");
      textInput.focus();
      return;
    }

    playSynthSound("click");
    setLoadingState(true);

    try {
      const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server returned error (${response.status})`);
      }

      const result = await response.json();
      currentResult = result;
      renderResult(result);
      addToHistory(result);
      playSynthSound("success");
      showToast(`Emotion identified: ${result.predicted_emotion.toUpperCase()}`, "✨");
    } catch (err) {
      console.error("Prediction error:", err);
      showToast(err.message || "Failed to analyze emotion. Please verify the backend.", "❌", 4000);
    } finally {
      setLoadingState(false);
    }
  }

  // Loading UI Toggle
  function setLoadingState(loading) {
    analyzeBtn.disabled = loading;
    if (loading) {
      btnContent.style.display = "none";
      btnSpinner.style.display = "block";
    } else {
      btnContent.style.display = "flex";
      btnSpinner.style.display = "none";
    }
  }

  // Render Result to DOM
  function renderResult(result) {
    const emotionKey = result.predicted_emotion.toLowerCase();
    const meta = EMOTIONS[emotionKey] || {
      name: emotionKey,
      emoji: "✨",
      color: "#a855f7",
      glow: "rgba(168, 85, 247, 0.4)",
      bgGradient: "radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)",
      desc: "Complex emotional combination detected by neural sequence."
    };

    // Transition Ambient Aura
    if (ambientGlow) {
      ambientGlow.style.background = meta.bgGradient;
    }

    // Switch Cards
    emptyState.style.display = "none";
    resultContent.style.display = "block";
    resultActions.style.display = "flex";

    // Update Hero Card
    heroEmoji.textContent = meta.emoji;
    heroEmotionName.textContent = meta.name;
    heroEmotionName.style.color = meta.color;
    heroDescription.textContent = meta.desc;
    avatarHalo.style.background = meta.color;

    // Animate Circular Confidence Dial
    const confidencePct = Math.round((result.confidence || 0) * 100);
    dialPercent.textContent = `${confidencePct}%`;
    const circumference = 2 * Math.PI * 40; // 251.32
    const offset = circumference * (1 - (result.confidence || 0));
    dialFill.style.stroke = meta.color;
    dialFill.style.strokeDashoffset = offset;

    // Render Probability Spectrum Bars
    const probs = result.all_probabilities || result.all_probabilites || {};
    barsContainer.innerHTML = "";

    // Sort emotions descending by probability
    const sortedEmotions = Object.entries(probs).sort((a, b) => b[1] - a[1]);

    sortedEmotions.forEach(([label, prob], index) => {
      const isTop = index === 0;
      const emMeta = EMOTIONS[label.toLowerCase()] || { emoji: "•", color: "#64748b" };
      const pct = (prob * 100).toFixed(1);

      const barRow = document.createElement("div");
      barRow.className = `bar-row ${isTop ? "top-rank" : ""}`;

      barRow.innerHTML = `
        <div class="bar-meta">
          <div class="bar-label-group">
            <span class="bar-emoji">${emMeta.emoji}</span>
            <span class="bar-label">${label}</span>
          </div>
          <span class="bar-percent">${pct}%</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="background: ${emMeta.color}; width: 0%;"></div>
        </div>
      `;

      barsContainer.appendChild(barRow);

      // Trigger width animation on next animation frame
      requestAnimationFrame(() => {
        setTimeout(() => {
          const fill = barRow.querySelector(".bar-fill");
          if (fill) fill.style.width = `${pct}%`;
        }, 60 * index);
      });
    });

    // Quote preview
    quoteText.textContent = result.text;
  }

  // History Management
  function addToHistory(item) {
    const historyItem = {
      id: Date.now(),
      text: item.text,
      predicted_emotion: item.predicted_emotion,
      confidence: item.confidence,
      all_probabilities: item.all_probabilities || item.all_probabilites,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    history.unshift(historyItem);
    if (history.length > 25) history.pop();

    try {
      localStorage.setItem("aura_history", JSON.stringify(history));
    } catch (e) {}

    renderHistoryUI();
  }

  function renderHistoryUI() {
    historyBadge.textContent = history.length;
    historyList.innerHTML = "";

    if (history.length === 0) {
      historyList.innerHTML = `<div class="history-empty"><p>No recent predictions recorded yet.</p></div>`;
      return;
    }

    history.forEach((entry) => {
      const meta = EMOTIONS[entry.predicted_emotion.toLowerCase()] || { emoji: "•", color: "#818cf8" };
      const pct = Math.round((entry.confidence || 0) * 100);

      const card = document.createElement("div");
      card.className = "history-item";
      card.innerHTML = `
        <div class="history-top">
          <span class="history-badge" style="color: ${meta.color}">
            <span>${meta.emoji}</span>
            <span>${entry.predicted_emotion}</span>
          </span>
          <span class="history-conf">${pct}% • ${entry.timestamp}</span>
        </div>
        <p class="history-snippet">${escapeHtml(entry.text)}</p>
      `;

      card.addEventListener("click", () => {
        textInput.value = entry.text;
        updateCounters();
        renderResult(entry);
        closeDrawer();
        playSynthSound("click");
      });

      historyList.appendChild(card);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function openDrawer() {
    historyDrawer.classList.add("open");
    drawerBackdrop.classList.add("active");
    playSynthSound("click");
  }

  function closeDrawer() {
    historyDrawer.classList.remove("open");
    drawerBackdrop.classList.remove("active");
  }

  // Event Listeners
  textInput.addEventListener("input", updateCounters);

  textInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      performPrediction();
    }
  });

  clearBtn.addEventListener("click", () => {
    textInput.value = "";
    updateCounters();
    textInput.focus();
    playSynthSound("click");
  });

  analyzeBtn.addEventListener("click", () => performPrediction());

  // Preset Chips
  presetChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const sampleText = chip.getAttribute("data-text");
      textInput.value = sampleText;
      updateCounters();
      performPrediction(sampleText);
    });
  });

  // Copy Actions
  copyResultBtn.addEventListener("click", () => {
    if (!currentResult) return;
    const summary = `Text: "${currentResult.text}"\nPredicted Emotion: ${currentResult.predicted_emotion.toUpperCase()} (${Math.round(currentResult.confidence * 100)}% confidence)`;
    navigator.clipboard.writeText(summary).then(() => {
      showToast("Result summary copied to clipboard!", "📋");
      playSynthSound("click");
    });
  });

  copyJsonBtn.addEventListener("click", () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(JSON.stringify(currentResult, null, 2)).then(() => {
      showToast("JSON payload copied to clipboard!", "📦");
      playSynthSound("click");
    });
  });

  // Sound Toggle
  sfxToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem("aura_sfx", soundEnabled);
    sfxToggle.style.opacity = soundEnabled ? "1" : "0.45";
    showToast(`Audio feedback ${soundEnabled ? "enabled" : "muted"}`, soundEnabled ? "🔊" : "🔇");
    if (soundEnabled) playSynthSound("click");
  });

  // History Drawer Triggers
  historyToggle.addEventListener("click", openDrawer);
  closeDrawerBtn.addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);

  clearHistoryBtn.addEventListener("click", () => {
    history = [];
    localStorage.removeItem("aura_history");
    renderHistoryUI();
    showToast("History cleared.", "🗑️");
    playSynthSound("click");
  });

  // Initialize
  updateCounters();
  renderHistoryUI();
  checkApiHealth();
  if (!soundEnabled) sfxToggle.style.opacity = "0.45";
});
