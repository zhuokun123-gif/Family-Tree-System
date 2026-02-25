<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Family Tree System Login</h2>
      
      <!-- Role Selection -->
      <div class="role-selection">
        <h3>Select Your Role</h3>
        <div class="role-buttons">
          <button 
            @click="selectRole('admin')" 
            :class="['role-btn', { active: selectedRole === 'admin' }]"
          >
            <span class="role-icon">👨‍💼</span>
            Login
          </button>
          <button 
            @click="selectRole('visitor')" 
            :class="['role-btn', { active: selectedRole === 'visitor' }]"
          >
            <span class="role-icon">👥</span>
            Visitor
          </button>
        </div>
      </div>

      <!-- Login Form -->
      <form v-if="selectedRole" @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            :placeholder="selectedRole === 'admin' ? 'Enter admin username' : 'Enter visitor username'"
          />
        </div>
        
        <div class="form-group" v-if="selectedRole === 'admin'">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter admin password"
          />
        </div>

        <div class="form-group" v-if="selectedRole === 'visitor'">
          <label for="visitorCode">Visitor Code</label>
          <input
            id="visitorCode"
            v-model="visitorCode"
            type="text"
            required
            placeholder="Enter visitor code (e.g., VISITOR)"
          />
        </div>

        <button type="submit" class="login-btn">
          {{ selectedRole === 'admin' ? 'Login' : 'Enter as Visitor' }}
        </button>
      </form>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Help Text -->
      <div class="help-text">
        <p v-if="selectedRole === 'admin'">
          <strong>Administrator Access:</strong> Full access to add, edit, delete, and view all family tree data.
        </p>
        <p v-if="selectedRole === 'visitor'">
          <strong>Visitor Access:</strong> Read-only access to search and view family tree information.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const selectedRole = ref('')
const username = ref('')
const password = ref('')
const visitorCode = ref('')
const errorMessage = ref('')

function selectRole(role) {
  selectedRole.value = role
  username.value = ''
  password.value = ''
  visitorCode.value = ''
  errorMessage.value = ''
}

async function handleLogin() {
  errorMessage.value = ''
  
  try {
    if (selectedRole.value === 'admin') {
      // Administrator login
      const response = await axios.post('/api/admin/login', {
        username: username.value,
        password: password.value
      })
      
      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.token)
        localStorage.setItem('userRole', 'admin')
        localStorage.setItem('username', username.value)
        router.push('/admin/dashboard')
      }
    } else if (selectedRole.value === 'visitor') {
      // Visitor login (simple code verification)
      if (visitorCode.value.toUpperCase() === 'VISITOR') {
        localStorage.setItem('userRole', 'visitor')
        localStorage.setItem('username', 'Visitor')
        router.push('/visitor/dashboard')
      } else {
        errorMessage.value = 'Invalid visitor code. Please enter "VISITOR".'
        return
      }
    }
  } catch (error) {
    console.error('Login error:', error)
    if (selectedRole.value === 'admin') {
      errorMessage.value = error.response?.data?.error || 'Login failed. Please check your credentials.'
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/polly-vacher.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 480px;
}

.login-card h2 {
  text-align: center;
  color: #1f2937;
  margin-bottom: 32px;
  font-size: 28px;
}

.role-selection {
  margin-bottom: 32px;
  text-align: center;
}

.role-selection h3 {
  color: #374151;
  margin-bottom: 20px;
  font-size: 18px;
}

.role-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.role-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.role-btn:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.role-btn.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.role-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-btn:hover {
  background: #2563eb;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.help-text {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.help-text p {
  margin: 8px 0;
}
</style>


