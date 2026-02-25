<template>
  <div>
    <h2>Search People</h2>
    <div class="search-row">
      <input v-model="query" placeholder="Enter name or ID" @keyup.enter="search" />
      <button @click="search">Search</button>
    </div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <!-- Results count -->
      <div class="results-info">
        Showing {{ startIndex + 1 }}-{{ endIndex }} of {{ filtered.length }} results
      </div>
      
      <!-- People list -->
      <ul class="people-list">
        <li v-for="p in paginatedResults" :key="p['Personal _ID']" class="person-item">
          <div class="person-info">
            <span class="person-name">{{ fullName(p) }}</span>
            <span class="person-id">{{ p['Personal _ID'] }}</span>
            <span class="person-years">{{ p['Birth_Year'] || 'Unknown' }} - {{ p['Death_Year'] || 'Present' }}</span>
          </div>
          <div class="person-actions">
            <router-link :to="{ name: 'tree', params: { id: p['Personal _ID'] } }" class="tree-link basic">
              Basic Tree
            </router-link>
            <router-link :to="{ name: 'enhanced-tree', params: { id: p['Personal _ID'] } }" class="tree-link enhanced">
              Enhanced Tree
            </router-link>
            <router-link :to="{ name: 'unified-tree', params: { id: p['Personal _ID'] } }" class="tree-link unified">
              Unified Tree
            </router-link>
          </div>
        </li>
      </ul>
      
      <!-- Pagination controls -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          Previous
        </button>
        
        <div class="pagination-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="{ active: page === currentPage }"
            class="pagination-number"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

const people = ref([])
const loading = ref(false)
const query = ref('')
const currentPage = ref(1)
const itemsPerPage = 25

async function fetchPeople() {
	loading.value = true
	try {
		const { data } = await axios.get('/api/people')
		people.value = Array.isArray(data) ? data : []
	} finally {
		loading.value = false
	}
}

function search() {
	// Reset to first page when searching
	currentPage.value = 1
}

const filtered = computed(() => {
	const q = query.value.trim().toLowerCase()
	if (!q) return people.value
	return people.value.filter(p => {
		const id = String(p['Personal _ID'] || '').toLowerCase()
		const forenames = String(p['Forenames'] || '').toLowerCase()
		const surname = String(p['Surname'] || '').toLowerCase()
		return id.includes(q) || forenames.includes(q) || surname.includes(q)
	})
})

// Pagination computed properties
const totalPages = computed(() => Math.ceil(filtered.value.length / itemsPerPage))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filtered.value.length))

const paginatedResults = computed(() => {
	return filtered.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
	const total = totalPages.value
	const current = currentPage.value
	const delta = 2 // Number of pages to show on each side of current page
	
	let start = Math.max(1, current - delta)
	let end = Math.min(total, current + delta)
	
	// Adjust if we're near the beginning or end
	if (current <= delta) {
		end = Math.min(total, 2 * delta + 1)
	}
	if (current + delta >= total) {
		start = Math.max(1, total - 2 * delta)
	}
	
	const pages = []
	for (let i = start; i <= end; i++) {
		pages.push(i)
	}
	return pages
})

function goToPage(page) {
	if (page >= 1 && page <= totalPages.value) {
		currentPage.value = page
		// Scroll to top of results
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}
}

function fullName(p) {
	const fn = p['Forenames'] || ''
	const sn = p['Surname'] || ''
	return `${fn} ${sn}`.trim()
}

// Reset to first page when search query changes
watch(query, () => {
	currentPage.value = 1
})

onMounted(fetchPeople)
</script>

<style scoped>
.search-row { display: flex; gap: 8px; margin-bottom: 12px; }
input { padding: 8px; flex: 1; }
button { padding: 8px 12px; }

.results-info {
  margin-bottom: 16px;
  color: #6b7280;
  font-size: 14px;
}

.people-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.person-item {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.person-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.person-name {
  font-weight: 600;
  color: #111827;
  font-size: 16px;
}

.person-id {
  color: #6b7280;
  font-size: 14px;
  font-family: monospace;
}

.person-years {
  color: #9ca3af;
  font-size: 12px;
}

.person-actions {
  display: flex;
  gap: 8px;
}

.tree-link {
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.tree-link.basic {
  background: #3b82f6;
  color: white;
}

.tree-link.basic:hover {
  background: #2563eb;
}

.tree-link.enhanced {
  background: #8b5cf6;
  color: white;
}

.tree-link.enhanced:hover {
  background: #7c3aed;
}

.tree-link.unified {
  background: #10b981;
  color: white;
}

.tree-link.unified:hover {
  background: #059669;
}

/* Pagination styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 16px 0;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 4px;
}

.pagination-number {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 40px;
  text-align: center;
}

.pagination-number:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.pagination-number.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.pagination-number.active:hover {
  background: #2563eb;
  border-color: #2563eb;
}
</style>


