<template>
  <div v-if="show" class="modal-overlay">

    <div class="modal-card">

      <!-- TITLE -->
      <h2 class="title">
        {{ mode === 'login' ? 'Welcome Back' : 'Create Account' }}
      </h2>

      <p class="subtitle">
        {{ mode === 'login'
          ? 'Login to continue your journey'
          : 'Join us and start your experience' }}
      </p>

      <!-- FORM -->
      <div class="form">

        <input v-model="email" placeholder="Email" />

        <input v-model="password" type="password" placeholder="Password" />

        <input
          v-if="mode === 'register'"
          v-model="name"
          placeholder="Full Name"
        />

      </div>

      <!-- ACTION -->
      <button
        class="primary-btn"
        v-if="mode === 'login'"
        @click="login"
      >
        Login
      </button>

      <button
        class="primary-btn"
        v-else
        @click="register"
      >
        Create Account
      </button>

      <!-- SWITCH -->
      <p class="switch">
        <span
          v-if="mode === 'login'"
          @click="switchMode('register')"
        >
          Don’t have an account? <b>Register</b>
        </span>

        <span
          v-else
          @click="switchMode('login')"
        >
          Already have an account? <b>Login</b>
        </span>
      </p>

      <!-- CLOSE -->
      <button class="close-btn" @click="closeModal">
        ✕
      </button>

    </div>

  </div>
</template>

<script>
import axios from "axios";

export default {
  props: ["show", "mode"],

  data() {
    return {
      email: "",
      password: "",
      name: "",
      loading: false
    };
  },

  methods: {

    /* SWITCH MODE */
    switchMode(mode) {
      this.$emit("switch-mode", mode);
      this.clearForm();
    },

    /* CLOSE */
    closeModal() {
      this.clearForm();
      this.$emit("close");
    },

    /* CLEAR FORM */
    clearForm() {
      this.email = "";
      this.password = "";
      this.name = "";
    },

    /* REGISTER */
    async register() {
      try {
        this.loading = true;

        await axios.post("http://localhost:3000/register", {
          name: this.name,
          email: this.email,
          password: this.password
        });

        alert("Account created! Please login.");

        this.switchMode("login");

      } catch (err) {
        alert(err.response?.data?.message || "Register failed");
      } finally {
        this.loading = false;
      }
    },

    /* LOGIN */
    async login() {
      try {
        this.loading = true;

        const res = await axios.post("http://localhost:3000/login", {
          email: this.email,
          password: this.password
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userName", res.data.user.name);

        this.$emit("logged-in", res.data.user.name);
        this.closeModal();

      } catch (err) {
        alert(err.response?.data?.message || "Login failed");
      } finally {
        this.loading = false;
      }
    },
  }
};
</script>