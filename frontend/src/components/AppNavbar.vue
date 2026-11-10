<template>
  <div class="navbar">

    <!-- LEFT -->
    <div class="left">
      <img :src="sunflower" class="icon" alt="sunflower" />
    </div>

    <!-- RIGHT -->
    <div class="nav-right">

      <span v-if="userName" class="user">
        👤 {{ userName }}
      </span>

      <!-- LOGIN / LOGOUT -->
      <button
        class="auth-btn"
        v-if="!userName"
        @click="$emit('open-auth', 'login')"
      >
        🔐 Login
      </button>

      <button
        class="auth-btn"
        v-else
        @click="logout"
      >
        🚪 Logout
      </button>

      <!-- REGISTER -->
      <button
        class="auth-btn register"
        v-if="!userName"
        @click="$emit('open-auth', 'register')"
      >
        ✍️ Register
      </button>

    </div>

  </div>
</template>

<script>
import sunflower from "@/assets/svg/sunflower.svg";

export default {
  props: ["userName"],

  data() {
    return {
      sunflower
    };
  },

  methods: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      this.$emit("logout");
    }
  }
};
</script>


<style scoped>
/* 🌈 FULL WIDTH MODERN NAVBAR */
.navbar {
  width: 100%;
  height: 64px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 0 24px;

  /* 🌿 glass effect */
  background: rgba(19, 40, 32, 0.85);
  backdrop-filter: blur(10px);

  color: white;

  position: sticky;
  top: 0;
  z-index: 1000;

  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

/* LEFT SIDE */
.left {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 🌻 SUNFLOWER ICON */
.icon {
  width: 34px;
  height: 34px;
  object-fit: contain;

  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
  animation: float 4s ease-in-out infinite;
}

/* LOGO TEXT */
.logo {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* RIGHT SIDE */
.nav-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

/* USER */
.user {
  font-size: 14px;
  opacity: 0.9;
  padding: 6px 10px;
  border-radius: 20px;
  background: rgba(255,255,255,0.08);
}

/* LOGIN BUTTON */
.auth-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;

  border: 1px solid rgba(255,255,255,0.15);

  padding: 7px 10px;
  border-radius: 10px;

  cursor: pointer;

  transition: all 0.25s ease;
}

.auth-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* 🌿 subtle animation */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}
</style>