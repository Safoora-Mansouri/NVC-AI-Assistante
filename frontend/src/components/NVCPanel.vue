<template>
  <div class="app">

    <!-- ================= NAV + AUTH ================= -->
<Navbar
  :userName="userName"
  @open-auth="openAuth"
  @logout="logout"
/>


<AuthModal
  :show="showAuth"
  :mode="authMode"
  @close="showAuth = false"
  @logged-in="setUser"
 @switch-mode="authMode = $event"
/>

  
     <!-- ================= IDENTITY INPUT (GUEST USER) ================= -->
<div v-if="!userName && !hasIdentity" class="name-gate">

  <h3>May i Know your name?</h3>

  <input class="input-name"
    v-model="tempName"
    placeholder="Your name (optional)" 
  />

  <!-- buttons row -->
  <div class="gate-actions">
    <button @click="saveTempName">
      Continue
    </button>

    <button @click="skipName">
      Skip
    </button>
  </div>

</div>
  <!-- ================= CHAT ================= -->
    <div class="chat-box" v-if="viewMode === 'chat'" ref="chatBox">

      <div v-if="!hasChat" class="landing-center">
        <img :src="sunflower" class="sunflower-icon" alt="sunflower" />
        <p class="landing-text">Ready to hear you...</p>
      </div>

      <div v-for="(m, i) in messages" :key="i" class="msg-row">

        <!-- AI -->
        <div v-if="m.role === 'assistant'" class="ai-row">
          <div class="ai-input">
            <img :src="sunflower" class="ai-avatar" alt="AI" />
            <div class="ai-bubble">{{ m.content }}</div>
          </div>
        </div>

        <!-- USER -->
        <div v-else class="user-bubble">
          {{ m.content }}
        </div>

      </div>
    </div>

    <!-- ================= INPUT ================= -->
    <div class="input-zone" :class="{ active: hasChat }">

      <div class="input-wrapper">
        <textarea
          v-model="text"
          placeholder="Write your message..."
          @keydown.enter.prevent="send"
        />

        <button class="send-btn" @click="send" :disabled="!text.trim()">
          ➤
        </button>
      </div>

      <!-- ================= ANALYSIS ================= -->
      <div v-if="viewMode === 'analysis'" class="analysis">

        <!-- FEELINGS -->
            <div class="strategy-header">
          <img :src="feelingIndicator" class="strategy-icon" />
          <h3>Needs</h3>
        </div>

        <div class="tags">
          <span v-for="f in feelings" :key="f" class="tag">
            {{ f }}
          </span>
        </div>

        <!-- NEEDS -->
        
     <div class="strategy-header">
          <img :src="water" class="strategy-icon" />
          <h3>Essential Needs</h3>
        </div>
        <div class="tags">
          <span
            v-for="n in needs"
            :key="n"
            class="tag need"
            @click="selectNeed(n)"
          >
            {{ n }}
          </span>
        </div>

        <!-- STRATEGY -->
        <div class="strategy-header">
          <img :src="manToGuide" class="strategy-icon" />
          <h3>Strategy</h3>
        </div>

        <div class="tags">
          <span
            v-for="s in strategy"
            :key="s"
            class="tag strategy"
          >
            {{ s }}
          </span>
        </div>

      </div>
    </div>

    <!-- ================= FOOTER ================= -->
    <div class="footer">

      <button
        class="footer-btn"
        :disabled="!hasChat"
        @click="analyze"
        v-if="viewMode === 'chat'"
      >
        Analyze
      </button>

      <button
        class="footer-btn secondary"
        v-if="viewMode === 'analysis'"
        @click="continueChat"
      >
        💬 Continue Chat
      </button>

    </div>

  </div>
</template>

<script>
import axios from "axios";

/* ================= COMPONENTS ================= */

import AuthModal from "./AuthModal.vue";
import Navbar from "./AppNavbar.vue";

/* ================= ASSETS ================= */
import sunflower from "@/assets/svg/sunflower.svg";
import manToGuide from "@/assets/svg/man-to-guide.svg";
import water from "@/assets/svg/water.svg";
import feelingIndicator from "@/assets/svg/feeling-indicator.svg";

export default {
  components: {
   Navbar,
    AuthModal
  },

  data() {
    return {
      /* assets */
 authMode: "login",
      sunflower,
      manToGuide,
      water,
      feelingIndicator,

      /* chat */
      text: "",
      messages: [],
      viewMode: "chat",
      result: null,
      hasIdentity: !!localStorage.getItem("userName"),

      /* ================= AUTH STATE ================= */
      showAuth: false,


      userName: localStorage.getItem("userName") || "",

      /* optional unused */
      tempName: "",
      animatedText: [],
      currentIndex: -1
    };
  },

  computed: {
    hasChat() {
      return this.messages.length > 0;
    },

    feelings() {
      return this.result
        ? [
            ...(this.result.feelings?.primary || []),
            ...(this.result.feelings?.secondary || [])
          ]
        : [];
    },

    needs() {
      return this.result
        ? [
            ...(this.result.needs?.emotional || []),
            ...(this.result.needs?.relational || []),
            ...(this.result.needs?.physical || [])
          ]
        : [];
    },

    strategy() {
      return this.result
        ? [
            ...(this.result.strategy?.first || []),
            ...(this.result.strategy?.second || [])
          ]
        : [];
    }
  },

  methods: {
openAuth(mode = "login") {
  this.authMode = mode;
  this.showAuth = true;
},
    saveTempName() {
  if (!this.tempName.trim()) return;

  this.userName = this.tempName.trim();
  localStorage.setItem("userName", this.userName);

  this.hasIdentity = true;
},

skipName() {
  this.userName = "";
  this.hasIdentity = true; // allow chat without name
},

    /* ================= AUTH ================= */
    setUser(name) {
      this.userName = name;
      localStorage.setItem("userName", name);
      this.showAuth = false;
    },

    /* ================= CHAT ================= */
    async send() {
      if (!this.text.trim()) return;

      this.messages.push({
        role: "user",
        content: this.text
      });

      const res = await axios.post("http://localhost:3000/chat", {
        messages: this.messages,
        userName: this.userName
      });

      let reply = res.data.reply;

      /* emotional naming logic */
      const emotionalTriggers = ["feel", "sad", "angry", "hurt", "lonely"];

      const isEmotional = emotionalTriggers.some(w =>
        this.text.toLowerCase().includes(w)
      );

      if (this.userName && isEmotional) {
        reply = `${this.userName}, ${reply}`;
      }

      this.messages.push({
        role: "assistant",
        content: reply
      });

      this.text = "";
    },
logout() {
  this.userName = "";
  localStorage.removeItem("userName");
  localStorage.removeItem("token");
},
    /* ================= ANALYSIS ================= */
    async analyze() {
      const fullText = this.messages
        .map(m => m.content)
        .join(" ");

      const res = await axios.post("http://localhost:3000/analyze", {
        text: fullText,
        userName: this.userName
      });

      this.result = res.data;
      this.viewMode = "analysis";
    },

    continueChat() {
      this.viewMode = "chat";
    },

    selectNeed(n) {
      console.log("selected need:", n);
    }
  }
};
</script>