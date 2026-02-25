<template>
  <div id="app">
    <header class="topbar">
      <div class="topbar-content">
        <h1>Family Tree Visualization and Exploration</h1>
        <nav class="main-nav" v-if="userRole">
          <router-link to="/search" class="nav-link">Search</router-link>
          <router-link to="/enhanced-tree/I122593541807" class="nav-link">Enhanced Tree</router-link>
        </nav>
        <div class="user-info" v-if="userRole">
          <span class="username">{{ username }}</span>
          <span class="role-badge" :class="userRole">{{ userRole }}</span>
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
      </div>
    </header>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userRole = ref('')
const username = ref('')

onMounted(() => {
  // Check if user is logged in
  const storedRole = localStorage.getItem('userRole')
  const storedUsername = localStorage.getItem('username')
  
  if (storedRole && storedUsername) {
    userRole.value = storedRole
    username.value = storedUsername
  }
})

function logout() {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('userRole')
  localStorage.removeItem('username')
  userRole.value = ''
  username.value = ''
  router.push('/')
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%);
  color: white;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
}

.topbar h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.main-nav {
  display: flex;
  gap: 8px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  color: white;
  background: rgba(255, 255, 255, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.admin {
  background: rgba(239, 68, 68, 0.8);
  color: white;
}

.role-badge.visitor {
  background: rgba(16, 185, 129, 0.8);
  color: white;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.main-content {
  flex: 1;
  background: #f8fafc;
}

@media (max-width: 768px) {
  .topbar-content {
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
  }
  
  .main-nav {
    order: 2;
  }
  
  .user-info {
    order: 3;
    flex-direction: column;
    gap: 8px;
  }
  
  .topbar h1 {
    font-size: 20px;
  }
}
</style>

<style>
/* Global styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #f8fafc;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
}
</style>


