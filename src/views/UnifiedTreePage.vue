<template>
  <div class="unified-tree-page">
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1>Unified Family Tree Visualization</h1>
          <p>Interactive D3.js tree with advanced relationship mapping and detailed person information</p>
        </div>
        <div class="header-actions">
          <router-link to="/search" class="btn btn-secondary">
            <span class="btn-icon">🔍</span>
            Search People
          </router-link>
          <router-link to="/admin/dashboard" class="btn btn-primary" v-if="userRole === 'admin'">
            <span class="btn-icon">⚙️</span>
            Admin Dashboard
          </router-link>
          <router-link to="/visitor/dashboard" class="btn btn-primary" v-else-if="userRole === 'visitor'">
            <span class="btn-icon">🏠</span>
            Visitor Dashboard
          </router-link>
          <button @click="logout" class="btn btn-outline">
            <span class="btn-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="page-content">
      <UnifiedFamilyTree :person-id="personId" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import UnifiedFamilyTree from '../components/UnifiedFamilyTree.vue'

const route = useRoute()
const router = useRouter()

const personId = computed(() => route.params.id)
const userRole = ref(localStorage.getItem('userRole'))

const logout = () => {
  localStorage.removeItem('adminToken')
  localStorage.removeItem('userRole')
  localStorage.removeItem('username')
  router.push('/')
}
</script>

<style scoped>
.unified-tree-page {
  min-height: 100vh;
  background: #f8fafc;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 28px;
  font-weight: 700;
}

.header-left p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 16px;
}

.page-content {
  height: calc(100vh - 100px);
  overflow: hidden;
}
</style>
