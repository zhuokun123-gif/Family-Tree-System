<template>
  <div class="page">
    <div class="page-header">
      <h2>Family Tree</h2>
      <div class="header-actions">
        <router-link 
          :to="{ name: 'enhanced-tree', params: { id: id } }" 
          class="enhanced-tree-link"
        >
          <span class="link-icon">🔍</span>
          View Enhanced Tree
        </router-link>
        <router-link 
          :to="{ name: 'unified-tree', params: { id: id } }" 
          class="enhanced-tree-link unified"
        >
          <span class="link-icon">🎯</span>
          View Unified Tree
        </router-link>
      </div>
    </div>
    
    <div class="canvas">
      <FamilyTree :rootId="id" @select="onSelect" />
    </div>
    <aside class="panel" v-if="selected">
      <h3>{{ selected.person?.['Forenames'] }} {{ selected.person?.['Surname'] }}</h3>
      <p><strong>Birth:</strong> {{ selected.person?.['Birth_Year'] || '-' }}</p>
      <p><strong>Death:</strong> {{ selected.person?.['Death_Year'] || '-' }}</p>
      <div>
        <strong>Parents:</strong>
        <ul>
          <li v-for="p in selected.parents" :key="p['Personal _ID']">
            {{ p['Forenames'] }} {{ p['Surname'] }}
          </li>
        </ul>
      </div>
      <div>
        <strong>Spouses:</strong>
        <ul>
          <li v-for="s in selected.spouses" :key="s['Personal _ID']">
            {{ s['Forenames'] }} {{ s['Surname'] }}
          </li>
        </ul>
      </div>
      <div>
        <strong>Children:</strong>
        <ul>
          <li v-for="c in selected.children" :key="c['Personal _ID']">
            {{ c['Forenames'] }} {{ c['Surname'] }}
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import FamilyTree from '../components/FamilyTree.vue'

const route = useRoute()
const id = route.params.id // ID is now a string
const selected = ref(null)

function onSelect(payload) {
  selected.value = payload
}
</script>

<style scoped>
.page { display: grid; grid-template-columns: 1fr 320px; gap: 12px; height: calc(100vh - 56px - 32px); }

.page-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.page-header h2 {
  margin: 0;
  color: #111827;
}

.enhanced-tree-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #8b5cf6;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid #7c3aed;
}

.enhanced-tree-link:hover {
  background: #7c3aed;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.enhanced-tree-link.unified {
  background: #3b82f6;
  border-color: #2563eb;
}

.enhanced-tree-link.unified:hover {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.link-icon {
  font-size: 16px;
}

.canvas { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; height: 100%; } /* Added height: 100% */
.panel { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; overflow: auto; }
ul { margin: 6px 0 12px; }
</style>


