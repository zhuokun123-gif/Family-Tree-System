<template>
  <div class="enhanced-tree-container">
    <div v-if="loading" class="overlay">Loading Enhanced Family Tree...</div>
    <div v-else-if="errorMessage" class="overlay error">{{ errorMessage }}</div>
    <div v-else class="tree-content">
      <!-- Square Grid Tree Visualization -->
      <div class="tree-visualization" ref="viz">
        <div class="tree-controls">
          <button @click="goToAdminDashboard" class="admin-dashboard-btn" title="Go to Admin Dashboard">
            <span>⚙️</span> Admin Dashboard
          </button>
          <button @click="resetView" class="reset-btn" title="Reset View">
            <span>🔄</span> Reset View
          </button>
          <div class="zoom-info">
            Zoom: {{ Math.round(zoom * 100) }}%
          </div>
          <div class="gender-legend">
            <span class="legend-title">Gender Colors:</span>
            <div class="legend-items">
              <div class="legend-item">
                <div class="legend-color gender-male"></div>
                <span>Male</span>
              </div>
              <div class="legend-item">
                <div class="legend-color gender-female"></div>
                <span>Female</span>
              </div>
              <div class="legend-item">
                <div class="legend-color gender-unknown"></div>
                <span>Unknown</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Square Grid Family Tree -->
        <div class="grid-container" ref="gridContainer" :style="{ transform: `scale(${zoom}) translate(${panX}px, ${panY}px)` }">
          <!-- Generation Rows -->
          <div v-for="(generation, genIndex) in organizedGenerations" :key="genIndex" class="generation-row">
            <div class="generation-label">{{ generation.label }}</div>
            <div class="generation-content">
              <div 
                v-for="person in generation.members" 
                :key="person.personalId"
                :data-person-id="person.personalId"
                class="person-square"
                :class="{
                  'selected': selectedPerson?.personalId === person.personalId,
                  'homeperson': homeperson?.personalId === person.personalId,
                  'important': isImportantPerson(person),
                  'regular': !isImportantPerson(person),
                  'living': getStatusDisplay(person) === 'Living',
                  'deceased': getStatusDisplay(person) === 'Deceased',
                  'gender-male': getGenderDisplay(person) === 'Male',
                  'gender-female': getGenderDisplay(person) === 'Female',
                  'gender-unknown': getGenderDisplay(person) === 'Unknown'
                }"
                @click="handlePersonClick(person, $event)"
              >
                <div class="person-name">{{ getPersonDisplayName(person) }}</div>
                <div class="person-years">{{ getYearsDisplay(person) }}</div>
                <div class="person-status">{{ getStatusDisplay(person) }}</div>
                <div class="person-gender" v-if="person.computedGender">Gender: {{ person.computedGender }}</div>
                <div v-if="homeperson?.personalId === person.personalId" class="homeperson-icon" title="Homeperson">🏠</div>
              </div>
            </div>
          </div>
          
          <!-- Connection Lines -->
          <svg class="connection-lines" :width="gridWidth" :height="gridHeight">
            <g v-for="connection in connections" :key="connection.id">
              <line
                :x1="connection.x1"
                :y1="connection.y1"
                :x2="connection.x2"
                :y2="connection.y2"
                :class="connection.type"
                :stroke="connection.color"
                :stroke-width="connection.width"
                :stroke-dasharray="connection.dashed ? '5,5' : 'none'"
              />
            </g>
          </svg>
        </div>
      </div>
      Tree Statistics
      <!-- Relationship Information Panel -->
      <div class="relationship-panel">
        <h3>Family Relationships</h3>
        
        <!-- Person Details -->
        <div class="person-details" v-if="treeData.person">
          <h4>{{ getPersonDisplayName(treeData.person) }}</h4>
          <p><strong>ID:</strong> {{ treeData.person.personalId }}</p>
          <p><strong>Gender:</strong> {{ getGenderDisplay(treeData.person) }}</p>
          <p><strong>Years:</strong> {{ getYearsDisplay(treeData.person) }}</p>
          <p><strong>Status:</strong> 
            <span :class="getStatusClass(treeData.person)">
              {{ getStatusDisplay(treeData.person) }}
            </span>
          </p>
          <p><strong>Marriage Year:</strong> {{ getMarriageYearDisplay(treeData.person) }}</p>
          <p v-if="spouseInfo"><strong>Spouse:</strong> {{ getPersonDisplayName(spouseInfo) }} — {{ spouseInfo.role }}</p>
        </div>
        
        <!-- Direct Relatives -->
        <div class="relationship-section" v-if="treeData.relativesByType">
          <h4>Direct Relatives</h4>
          
          <!-- Parents -->
          <div v-if="treeData.relativesByType.parents?.length" class="relative-group">
            <h5>Parents</h5>
            <div v-for="parent in treeData.relativesByType.parents" :key="parent.member.personalId" 
                 class="relative-item direct">
              <span class="name">{{ parent.member.fullName }}</span>
              <span class="relationship">{{ parent.relationship }}</span>
              <span class="years">{{ parent.member.birthDeathYears }}</span>
            </div>
          </div>
          
          <!-- Spouses -->
          <div v-if="treeData.relativesByType.spouses?.length" class="relative-group">
            <h5>Spouses</h5>
            <div v-for="spouse in treeData.relativesByType.spouses" :key="spouse.member.personalId" 
                 class="relative-item direct">
              <span class="name">{{ spouse.member.fullName }}</span>
              <span class="relationship">{{ spouse.relationship }}</span>
              <span class="years">{{ spouse.member.birthDeathYears }}</span>
            </div>
          </div>
          
          <!-- Children -->
          <div v-if="treeData.relativesByType.children?.length" class="relative-group">
            <h5>Children</h5>
            <div v-for="child in treeData.relativesByType.children" :key="child.member.personalId" 
                 class="relative-item direct">
              <span class="name">{{ child.member.fullName }}</span>
              <span class="relationship">{{ child.relationship }}</span>
              <span class="years">{{ child.member.birthDeathYears }}</span>
            </div>
          </div>
        </div>
        
        <!-- Collateral Relatives -->
        <div class="relationship-section" v-if="treeData.relativesByType">
          <h4>Extended Family</h4>
          
          <!-- Grandparents -->
          <div v-if="treeData.relativesByType.grandparents?.length" class="relative-group">
            <h5>Grandparents</h5>
            <div v-for="grandparent in treeData.relativesByType.grandparents" :key="grandparent.member.personalId" 
                 class="relative-item collateral">
              <span class="name">{{ grandparent.member.fullName }}</span>
              <span class="relationship">{{ grandparent.relationship }}</span>
              <span class="years">{{ grandparent.member.birthDeathYears }}</span>
            </div>
          </div>
          
          <!-- Siblings -->
          <div v-if="treeData.relativesByType.siblings?.length" class="relative-group">
            <h5>Siblings</h5>
            <div v-for="sibling in treeData.relativesByType.siblings" :key="sibling.member.personalId" 
                 class="relative-item collateral">
              <span class="name">{{ sibling.member.fullName }}</span>
              <span class="relationship">{{ sibling.relationship }}</span>
              <span class="years">{{ sibling.member.birthDeathYears }}</span>
            </div>
          </div>
          
          <!-- Uncles -->
          <div v-if="treeData.relativesByType.uncles?.length" class="relative-group">
            <h5>Uncles</h5>
            <div v-for="uncle in treeData.relativesByType.uncles" :key="uncle.member.personalId" 
                 class="relative-item collateral">
              <span class="name">{{ uncle.member.fullName }}</span>
              <span class="relationship">{{ uncle.relationship }}</span>
              <span class="years">{{ uncle.member.birthDeathYears }}</span>
            </div>
          </div>
          
          <!-- Aunts -->
          <div v-if="treeData.relativesByType.aunts?.length" class="relative-group">
            <h5>Aunts</h5>
            <div v-for="aunt in treeData.relativesByType.aunts" :key="aunt.member.personalId" 
                 class="relative-item collateral">
              <span class="name">{{ aunt.member.fullName }}</span>
              <span class="relationship">{{ aunt.relationship }}</span>
              <span class="years">{{ aunt.member.birthDeathYears }}</span>
            </div>
          </div>
         
          <!-- Cousins -->
          <div v-if="treeData.relativesByType.cousins?.length" class="relative-group">
            <h5>Cousins</h5>
            <div v-for="cousin in treeData.relativesByType.cousins" :key="cousin.member.personalId" 
                 class="relative-item collateral">
              <span class="name">{{ cousin.member.fullName }}</span>
              <span class="relationship">{{ cousin.relationship }}</span>
              <span class="years">{{ cousin.member.birthDeathYears }}</span>
            </div>
          </div>
          
          <!-- Nephews/Nieces -->
          <div v-if="treeData.relativesByType.nephews?.length" class="relative-group">
            <h5>Nephews & Nieces</h5>
            <div v-for="nephew in treeData.relativesByType.nephews" :key="nephew.member.personalId" 
                 class="relative-item collateral">
              <span class="name">{{ nephew.member.fullName }}</span>
              <span class="relationship">{{ nephew.relationship }}</span>
              <span class="years">{{ nephew.member.birthDeathYears }}</span>
            </div>
          </div>
        </div>
        
        <!-- Tree Statistics -->
        
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import axios from 'axios'

const props = defineProps({
  rootId: { type: [String, Number], required: true },
  debugMode: { type: Boolean, default: false },
  genderDerivation: { type: Function, default: null },
  spouseLookup: { type: Function, default: null }
})

const emit = defineEmits(['select', 'navigate'])
const container = ref(null)
const viz = ref(null)
const gridContainer = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const treeData = ref({})
const selectedPerson = ref(null)
const homeperson = ref(null)
const spouseInfo = ref(null)
const organizedGenerations = ref([])
const connections = ref([])
const gridWidth = ref(1200)
const gridHeight = ref(800)
let resizeObserver = null

// Click handling state
const clickTimeout = ref(null)
const clickCount = ref(0)
const lastClickTime = ref(0)
const CLICK_DELAY = 250 // ms - reduced for better responsiveness

// Zoom and pan state
const zoom = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const lastMouseX = ref(0)
const lastMouseY = ref(0)

function ensureGridSize() {
  if (!viz.value) return { w: 0, h: 0 }
  const rect = viz.value.getBoundingClientRect()
  const w = Math.max(1, Math.floor(rect.width))
  const h = Math.max(1, Math.floor(rect.height))
  
  gridWidth.value = w
  gridHeight.value = h
  
  return { w, h }
}

async function loadEnhancedTree() {
  if (!props.rootId) return
  
  loading.value = true
  errorMessage.value = ''
  
  try {
    console.log('Loading enhanced tree for ID:', props.rootId)
    // Load enhanced tree data
    const { data } = await axios.get(`/api/enhanced-tree/person/${encodeURIComponent(props.rootId)}`)
    
    console.log('Enhanced tree data received:', data)
    
    if (!data || !data.person) {
      throw new Error('No family tree available for this person.')
    }
    
    treeData.value = data
    
    // Set the homeperson (root person)
    homeperson.value = data.person
    
    // Find spouse information
    spouseInfo.value = findSpouse(data.person.personalId || data.person['Personal _ID'], data)
    
    // Debug relationship mapping if debug mode is enabled
    if (props.debugMode) {
      console.log('=== FAMILY RELATIONSHIP DEBUG ===')
      console.log('Root Person:', data.person)
      console.log('Families:', data.families)
      console.log('People:', data.people)
      
      // Debug gender assignment for all people
      if (data.people) {
        console.log('\n--- Gender Assignment Debug ---')
        data.people.forEach(person => {
          const gender = getPersonGender(person, data)
          console.log(`${person.forenames || person['Forenames']} ${person.surname || person['Surname']} (${person.personalId || person['Personal _ID']}) → ${gender}`)
        })
      }
      
      // Debug spouse detection
      console.log('\n--- Spouse Detection Debug ---')
      const spouse = findSpouse(data.person.personalId || data.person['Personal _ID'], data)
      if (spouse) {
        console.log(`Spouse found: ${spouse.forenames || spouse['Forenames']} ${spouse.surname || spouse['Surname']} (${spouse.role})`)
      } else {
        console.log('No spouse found for homeperson')
      }
      
      // Debug relationship classification
      if (data.relativesByType) {
        console.log('\n--- Relationship Classification Debug ---')
        Object.keys(data.relativesByType).forEach(relType => {
          const relatives = data.relativesByType[relType]
          if (relatives && relatives.length > 0) {
            console.log(`${relType}:`, relatives.map(r => `${r.member.forenames || r.member['Forenames']} ${r.member.surname || r.member['Surname']} (${r.relationship})`))
          }
        })
      }
    }
    
    // Wait a bit for DOM to be ready, then organize data
    setTimeout(() => {
      console.log('Organizing tree data for grid display...')
      organizeGenerations(data)
      generateConnections(data)
    }, 200)
    
    emit('select', data)
    
  } catch (e) {
    console.error('Error loading enhanced tree:', e)
    const errorMsg = e?.response?.data?.error || e?.message || 'Failed to load enhanced tree'
    errorMessage.value = errorMsg.includes('not found') || errorMsg.includes('No family tree') 
      ? 'No family tree available for this person.' 
      : errorMsg
  } finally {
    loading.value = false
  }
}

// Organize family members into generations for grid display
function organizeGenerations(data) {
  if (!data || !data.person) return
  
  const generations = []
  
  // Great Grandparents (Generation -2)
  if (data.relativesByType?.grandparents?.length) {
    const greatGrandparents = data.relativesByType.grandparents.filter(gp => 
      gp.member.generation && gp.member.generation <= (data.person.generation - 2)
    )
    if (greatGrandparents.length > 0) {
      greatGrandparents.forEach(gp => {
        gp.member.gender = getPersonGender(gp.member, data)
      })
      generations.push({
        label: 'Great Grandparents',
        level: -2,
        members: greatGrandparents.map(gp => gp.member)
      })
    }
  }
  
  // Grandparents (Generation -1)
  if (data.relativesByType?.grandparents?.length) {
    const grandparents = data.relativesByType.grandparents.filter(gp => 
      !gp.member.generation || gp.member.generation === (data.person.generation - 1)
    )
    if (grandparents.length > 0) {
      grandparents.forEach(gp => {
        gp.member.gender = getPersonGender(gp.member, data)
      })
      generations.push({
        label: 'Grandparents',
        level: -1,
        members: grandparents.map(gp => gp.member)
      })
    }
  }
  
  // Parents (Generation 0)
  if (data.relativesByType?.parents?.length) {
    data.relativesByType.parents.forEach(parent => {
      // Assign gender based on family relationships
      parent.member.gender = getPersonGender(parent.member, data)
    })
    generations.push({
      label: 'Parents',
      level: 0,
      members: data.relativesByType.parents.map(p => p.member)
    })
  }
  
  // Current Generation (Generation 1) - Include homeperson and their spouse(s)
  const currentGen = [data.person]
  
  // Add spouse to the same generation as homeperson
  if (spouseInfo.value) {
    // Assign gender based on family relationships
    spouseInfo.value.gender = getPersonGender(spouseInfo.value, data)
    currentGen.push(spouseInfo.value)
  }
  
  // Also add any spouses from relativesByType for backward compatibility
  if (data.relativesByType?.spouses?.length) {
    data.relativesByType.spouses.forEach(spouse => {
      // Check if this spouse is not already added
      const alreadyAdded = currentGen.some(p => 
        (p.personalId || p['Personal _ID']) === (spouse.member.personalId || spouse.member['Personal _ID'])
      )
      if (!alreadyAdded) {
        // Assign gender based on family relationships
        spouse.member.gender = getPersonGender(spouse.member, data)
        currentGen.push(spouse.member)
      }

    })
  }
  
  // Add siblings to the same generation
  if (data.relativesByType?.siblings?.length) {
    data.relativesByType.siblings.forEach(sibling => {
      // Assign gender based on family relationships
      sibling.member.gender = getPersonGender(sibling.member, data)
      currentGen.push(sibling.member)
    })
  }
  
  // Assign gender to homeperson
  data.person.gender = getPersonGender(data.person, data)
  
  generations.push({
    label: 'Current Generation',
    level: 1,
    members: currentGen
  })
  
  // Children (Generation 2)
  if (data.relativesByType?.children?.length) {
    data.relativesByType.children.forEach(child => {
      // Assign gender based on family relationships
      child.member.gender = getPersonGender(child.member, data)
    })
    generations.push({
      label: 'Children',
      level: 2,
      members: data.relativesByType.children.map(c => c.member)
    })
  }
  
  // Grandchildren (Generation 3)
  if (data.relativesByType?.nephews?.length) {
    const grandchildren = data.relativesByType.nephews.filter(n => 
      n.member.generation && n.member.generation >= (data.person.generation + 2)
    )
    if (grandchildren.length > 0) {
      generations.push({
        label: 'Grandchildren',
        level: 3,
        members: grandchildren.map(n => n.member)
      })
    }
  }
  
  organizedGenerations.value = generations
}

// Generate connection lines between family members
function generateConnections(data) {
  const newConnections = []
  let connectionId = 0
  
  // Parent-child connections (vertical lines)
  if (data.relativesByType?.parents?.length) {
    data.relativesByType.parents.forEach(parent => {
      newConnections.push({
        id: connectionId++,
        type: 'parent-child',
        x1: 0, y1: 0, x2: 0, y2: 0, // Will be calculated by CSS positioning
        color: '#4a5568',
        width: 2,
        dashed: false
      })
    })
  }
  
  // Spouse connections (horizontal lines) - Connect homeperson to their spouse(s)
  if (spouseInfo.value) {
    newConnections.push({
      id: connectionId++,
      type: 'spouse-horizontal',
      x1: 0, y1: 0, x2: 0, y2: 0, // Will be calculated by CSS positioning
      color: '#e53e3e',
      width: 2,
      dashed: true
    })
  }
  
  // Also add connections for any spouses from relativesByType for backward compatibility
  if (data.relativesByType?.spouses?.length) {
    data.relativesByType.spouses.forEach(spouse => {
      newConnections.push({
        id: connectionId++,
        type: 'spouse-horizontal',
        x1: 0, y1: 0, x2: 0, y2: 0, // Will be calculated by CSS positioning
        color: '#e53e3e',
        width: 2,
        dashed: true
      })
    })
  }
  
  // Child connections - Connect both parents to children
  if (data.relativesByType?.children?.length) {
    data.relativesByType.children.forEach(child => {
      // Connect to homeperson
      newConnections.push({
        id: connectionId++,
        type: 'parent-child',
        x1: 0, y1: 0, x2: 0, y2: 0, // Will be calculated by CSS positioning
        color: '#4a5568',
        width: 2,
        dashed: false
      })
      
      // Connect to spouse if exists
      if (data.relativesByType?.spouses?.length) {
        newConnections.push({
          id: connectionId++,
          type: 'parent-child',
          x1: 0, y1: 0, x2: 0, y2: 0, // Will be calculated by CSS positioning
          color: '#4a5568',
          width: 2,
          dashed: false
        })
      }
    })
  }
  
  connections.value = newConnections
}

// Check if a person is important (root person, spouse, or has many connections)
function isImportantPerson(person) {
  if (!treeData.value) return false
  
  // Root person is always important
  if (person.personalId === treeData.value.person?.personalId) return true
  
  // Spouses are important
  if (treeData.value.relativesByType?.spouses?.some(s => s.member.personalId === person.personalId)) return true
  
  // People with many children are important
  const childrenCount = treeData.value.relativesByType?.children?.filter(c => 
    c.member.personalId === person.personalId
  ).length || 0
  
  return childrenCount > 2
}

// Handle person click with single/double-click detection
function handlePersonClick(person, event) {
  event.preventDefault()
  event.stopPropagation()
  
  const currentTime = Date.now()
  
  // Clear any existing timeout
  if (clickTimeout.value) {
    clearTimeout(clickTimeout.value)
    clickTimeout.value = null
  }
  
  // Check if this is a double-click
  if (currentTime - lastClickTime.value < CLICK_DELAY) {
    clickCount.value++
    if (clickCount.value === 2) {
      // Double-click detected - cancel single-click and navigate
      console.log('Double-click detected for person:', person.personalId)
      handleDoubleClick(person)
      clickCount.value = 0
      lastClickTime.value = 0
      return
    }
  } else {
    clickCount.value = 1
  }
  
  lastClickTime.value = currentTime
  
  // Set timeout for single-click
  clickTimeout.value = setTimeout(() => {
    if (clickCount.value === 1) {
      // Single-click detected - show person info
      console.log('Single-click detected for person:', person.personalId)
      handleSingleClick(person)
    }
    clickCount.value = 0
    clickTimeout.value = null
  }, CLICK_DELAY)
}

// Handle single-click action
function handleSingleClick(person) {
  console.log('Single-click: Showing info for', person.fullName || person.personalId)
  selectPerson(person)
}

// Handle double-click action
function handleDoubleClick(person) {
  console.log('Double-click: Navigating to tree for', person.fullName || person.personalId)
  
  // Add visual feedback
  const personElement = document.querySelector(`[data-person-id="${person.personalId}"]`)
  if (personElement) {
    personElement.classList.add('double-click-hint')
    setTimeout(() => {
      personElement.classList.remove('double-click-hint')
    }, 600)
  }
  
  // Navigate to the person's family tree page
  navigateToPersonTree(person.personalId)
}

// Select a person and update the information panel
function selectPerson(person) {
  selectedPerson.value = person
  emit('select', person)
}

// Navigate to person's family tree page
function navigateToPersonTree(personId) {
  console.log('Navigating to family tree for person:', personId)
  
  // Emit event for parent component to handle navigation
  emit('navigate', `/family-tree/${personId}`)
  
  // Use Vue Router if available
  if (typeof window !== 'undefined' && window.location) {
    const newPath = `/family-tree/${personId}`
    try {
      window.location.href = newPath
    } catch (error) {
      console.error('Navigation error:', error)
      // Show friendly message instead of blank page
      errorMessage.value = 'No family tree available for this person.'
    }
  }
}

// Mouse event handlers for zoom and pan
function handleMouseDown(event) {
  isDragging.value = true
  lastMouseX.value = event.clientX
  lastMouseY.value = event.clientY
  if (viz.value) viz.value.style.cursor = 'grabbing'
}

function handleMouseMove(event) {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - lastMouseX.value
  const deltaY = event.clientY - lastMouseY.value
  
  panX.value += deltaX
  panY.value += deltaY
  
  lastMouseX.value = event.clientX
  lastMouseY.value = event.clientY
}

function handleMouseUp() {
  isDragging.value = false
  if (viz.value) viz.value.style.cursor = 'grab'
}

function handleWheel(event) {
  event.preventDefault()
  
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  const newZoom = Math.max(0.1, Math.min(3, zoom.value * delta))
  
  // Zoom towards mouse position
  const rect = viz.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top
  
  const zoomFactor = newZoom / zoom.value
  panX.value = mouseX - (mouseX - panX.value) * zoomFactor
  panY.value = mouseY - (mouseY - panY.value) * zoomFactor
  
  zoom.value = newZoom
}

function resetView() {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
}

function goToAdminDashboard() {
  window.location.href = '/admin/dashboard'
}

// Helper function to find spouse information
function findSpouse(personId, familyData = null) {
  // Use the passed spouse lookup function if available
  if (props.spouseLookup && familyData) {
    const spouses = props.spouseLookup(personId, familyData.families || [], familyData.people || [])
    return spouses.length > 0 ? spouses[0] : null // Return first spouse
  }
  
  // Fallback to original logic
  if (!familyData || !familyData.families) return null
  
  const personIdStr = personId.toString()
  
  // Find families where person is Father_ID and get Mother_ID as spouse
  const fatherFamilies = familyData.families.filter(family => 
    family.Father_ID === personIdStr || family['Father ID'] === personIdStr
  )
  
  for (const family of fatherFamilies) {
    const motherId = family.Mother_ID || family['Mother ID']
    if (motherId) {
      const spouse = familyData.people?.find(p => 
        (p.personalId || p['Personal _ID']) === motherId
      )
      if (spouse) {
        return { ...spouse, role: 'Wife', relationship: 'Wife' }
      }
    }
  }
  
  // Find families where person is Mother_ID and get Father_ID as spouse
  const motherFamilies = familyData.families.filter(family => 
    family.Mother_ID === personIdStr || family['Mother ID'] === personIdStr
  )
  
  for (const family of motherFamilies) {
    const fatherId = family.Father_ID || family['Father ID']
    if (fatherId) {
      const spouse = familyData.people?.find(p => 
        (p.personalId || p['Personal _ID']) === fatherId
      )
      if (spouse) {
        return { ...spouse, role: 'Husband', relationship: 'Husband' }
      }
    }
  }
  
  // Fallback to Spouse_ID if available
  const person = familyData.people?.find(p => 
    (p.personalId || p['Personal _ID']) === personIdStr
  )
  
  if (person && person.Spouse_ID) {
    const spouse = familyData.people?.find(p => 
      (p.personalId || p['Personal _ID']) === person.Spouse_ID
    )
    if (spouse) {
      return { ...spouse, role: 'Spouse', relationship: 'Spouse' }
    }
  }
  
  return null
}

// Helper function to determine person's gender based on family relationships
function getPersonGender(person, familyData = null) {
  // Use the passed gender derivation function if available
  if (props.genderDerivation && familyData) {
    return props.genderDerivation(person, familyData.families || [])
  }
  
  // Fallback to original logic
  const personId = person.personalId || person['Personal _ID']
  
  // First check if gender is already explicitly set
  if (person.gender) return person.gender
  if (person.Gender) return person.Gender
  
  // If we have family data, determine gender based on relationships
  if (familyData && familyData.families) {
    // Check if person is listed as Father_ID in any family
    const isFather = familyData.families.some(family => 
      family.Father_ID === personId || family['Father ID'] === personId
    )
    if (isFather) {
      if (props.debugMode) {
        console.log(`Person ${personId} (${person.forenames || person['Forenames']} ${person.surname || person['Surname']}) → Classified as Male (Father_ID)`)
      }
      return 'Male'
    }
    
    // Check if person is listed as Mother_ID in any family
    const isMother = familyData.families.some(family => 
      family.Mother_ID === personId || family['Mother ID'] === personId
    )
    if (isMother) {
      if (props.debugMode) {
        console.log(`Person ${personId} (${person.forenames || person['Forenames']} ${person.surname || person['Surname']}) → Classified as Female (Mother_ID)`)
      }
      return 'Female'
    }
  }
  
  if (props.debugMode) {
    console.log(`Person ${personId} (${person.forenames || person['Forenames']} ${person.surname || person['Surname']}) → Unknown (no family relationship found)`)
  }
  
  return 'Unknown'
}


// Helper function to get person display name
function getPersonDisplayName(person) {
  if (!person) return 'Unknown'
  
  const forenames = person.forenames || person['Forenames'] || ''
  const surname = person.surname || person['Surname'] || ''
  
  if (forenames && surname) {
    return `${forenames} ${surname}`
  } else if (forenames) {
    return forenames
  } else if (surname) {
    return surname
  }
  
  return person.personalId || person['Personal _ID'] || 'Unknown'
}

// Helper functions for displaying person information
function getGenderDisplay(person) {
  // Check if person has gender field from processed data
  if (person.gender) {
    return person.gender
  }
  
  // Fallback to Unknown if no gender information
  return 'Unknown'
}


function getYearsDisplay(person) {
  const birthYear = person.birthYear || person['Birth_Year']
  const deathYear = person.deathYear || person['Death_Year']
  
  if (birthYear) {
    const deathDisplay = deathYear ? deathYear : 'Not Recorded'
    return `${birthYear} - ${deathDisplay}`
  }
  
  return 'Not Recorded'
}

function getStatusDisplay(person) {
  // Check if person has life status from processed data
  if (person.lifeStatus) {
    return person.lifeStatus
  }
  
  // Check if person has isAlive field
  if (person.isAlive !== undefined) {
    return person.isAlive ? 'Living' : 'Deceased'
  }
  
  // Check if person has death year
  const deathYear = person.deathYear || person['Death_Year']
  if (deathYear) {
    return 'Deceased'
  }
  
  // Check birth year to determine if likely deceased (historical data)
  const birthYear = person.birthYear || person['Birth_Year']
  if (birthYear && birthYear < 1900) {
    return 'Deceased'
  }
  
  return 'Unknown'
}

function getStatusClass(person) {
  const status = getStatusDisplay(person)
  return status.toLowerCase() === 'living' ? 'alive' : 'deceased'
}

function getMarriageYearDisplay(person) {
  const marriageYear = person.marriageYear || person['Marriage_Year']
  return marriageYear ? marriageYear : 'Not Recorded'
}

onMounted(() => {
  // Wait for DOM to be fully rendered
  setTimeout(() => {
    // Observe visualization container for size changes
    resizeObserver = new ResizeObserver(() => {
      const { w, h } = ensureGridSize()
      if (w && h) {
        gridWidth.value = w
        gridHeight.value = h
      }
    })
    if (viz.value) resizeObserver.observe(viz.value)
    
    // Add mouse event listeners for zoom and pan
    if (viz.value) {
      viz.value.addEventListener('mousedown', handleMouseDown)
      viz.value.addEventListener('mousemove', handleMouseMove)
      viz.value.addEventListener('mouseup', handleMouseUp)
      viz.value.addEventListener('wheel', handleWheel)
      viz.value.style.cursor = 'grab'
    }
    
    // Initial sizing and load
    ensureGridSize()
    loadEnhancedTree()
  }, 100)
})

watch(() => props.rootId, () => loadEnhancedTree())

onBeforeUnmount(() => {
  if (resizeObserver && viz.value) resizeObserver.unobserve(viz.value)
  
  // Clean up click timeout
  if (clickTimeout.value) {
    clearTimeout(clickTimeout.value)
    clickTimeout.value = null
  }
})
</script>

<style scoped>
.enhanced-tree-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.tree-content {
  display: flex;
  flex: 1;
  gap: 16px;
}

.tree-visualization {
  flex: 1;
  background: #f8fafc;
  background-image: 
    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
  background-size: 25px 25px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  min-height: 500px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.tree-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  max-width: 400px;
}

.reset-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background-color 0.2s;
}

.reset-btn:hover {
  background: #2563eb;
}

.admin-dashboard-btn {
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background-color 0.2s;
  font-weight: 500;
}

.admin-dashboard-btn:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.zoom-info {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #374151;
  font-weight: 500;
}

.grid-container {
  width: 100%;
  height: 100%;
  position: relative;
  transform-origin: center;
  transition: transform 0.1s ease-out;
}

.generation-row {
  display: flex;
  align-items: center;
  margin: 20px 0;
  min-height: 120px;
}

.generation-label {
  width: 150px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-right: 20px;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.generation-content {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  flex: 1;
  align-items: center;
}

.person-square {
  width: 140px;
  height: 100px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  user-select: none;
}

.person-square:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #9ca3af;
}

.person-square:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.person-square.selected {
  border-color: #f59e0b;
  background: #fef3c7 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  border-width: 3px;
}

.person-square.homeperson {
  border-color: #ffb366;
  background: #fff5e6 !important;
  border-width: 3px;
  box-shadow: 0 4px 12px rgba(255, 179, 102, 0.3);
  position: relative;
}

.person-square.homeperson::before {
  content: "🏠 Homeperson";
  background: rgba(255, 179, 102, 0.9);
  color: #8b4513;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  opacity: 1;
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(255, 179, 102, 0.3);
}

.person-square.double-click-hint {
  animation: doubleClickPulse 0.6s ease-in-out;
}

@keyframes doubleClickPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.person-square.important {
  background: #fed7aa;
  border-color: #f97316;
}

.person-square.regular {
  background: #f9fafb;
  border-color: #d1d5db;
}

.person-square.living {
  border-left: 4px solid #10b981;
}

.person-square.deceased {
  border-left: 4px solid #ef4444;
  opacity: 0.8;
}

/* Gender-based colors - Male=Blue, Female=Red */
.person-square.gender-male {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
}

.person-square.gender-female {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #dc2626;
}

.person-square.gender-unknown {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-color: #9ca3af;
}

/* Gender colors with status combinations */
.person-square.gender-male.living {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
}

.person-square.gender-female.living {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #dc2626;
}

.person-square.gender-male.deceased {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
  opacity: 0.8;
}

.person-square.gender-female.deceased {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #dc2626;
  opacity: 0.8;
}


/* Gender Legend Styles */
.gender-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
}

.legend-title {
  font-weight: 600;
  color: #374151;
}

.legend-items {
  display: flex;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid #d1d5db;
}

.legend-color.gender-male {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-color: #3b82f6;
}

.legend-color.gender-female {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #dc2626;
}

.legend-color.gender-unknown {
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-color: #9ca3af;
}

.person-name {
  font-weight: 600;
  font-size: 12px;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.2;
  word-break: break-word;
}

.person-years {
  font-size: 10px;
  color: #6b7280;
  margin-bottom: 2px;
}

.person-status {
  font-size: 9px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.person-gender {
  font-size: 8px;
  color: #6b7280;
  margin-top: 2px;
  font-weight: 500;
}

.person-square.living .person-status {
  background: #d1fae5;
  color: #065f46;
}

.person-square.deceased .person-status {
  background: #fee2e2;
  color: #991b1b;
}

.homeperson-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.connection-lines {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

.connection-lines line.parent-child {
  stroke: #4a5568;
  stroke-width: 2;
  stroke-linecap: round;
}

.connection-lines line.spouse {
  stroke: #e53e3e;
  stroke-width: 2;
  stroke-dasharray: 5,5;
  stroke-linecap: round;
}

.connection-lines line.spouse-horizontal {
  stroke: #e53e3e;
  stroke-width: 2;
  stroke-dasharray: 3,3;
  stroke-linecap: round;
}

/* Double-click hint tooltip */
.person-square::after {
  content: "Double-click to view tree";
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.person-square:hover::after {
  opacity: 1;
}

/* Single-click hint */
.person-square::before {
  content: "Click for details";
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(59, 130, 246, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.person-square:hover::before {
  opacity: 1;
}

.relationship-panel {
  width: 350px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
  max-height: 100%;
}

.relationship-panel h3 {
  margin: 0 0 16px 0;
  color: #111827;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 8px;
}

.person-details {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.person-details h4 {
  margin: 0 0 8px 0;
  color: #1f2937;
}

.person-details p {
  margin: 4px 0;
  font-size: 14px;
}

.relationship-section {
  margin-bottom: 20px;
}

.relationship-section h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 16px;
}

.relative-group {
  margin-bottom: 12px;
}

.relative-group h5 {
  margin: 0 0 8px 0;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
}

.relative-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 6px;
  font-size: 13px;
}

.relative-item.direct {
  background: #dbeafe;
  border-left: 4px solid #3b82f6;
}

.relative-item.collateral {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
}

.relative-item .name {
  font-weight: 600;
  color: #1f2937;
  flex: 1;
}

.relative-item .relationship {
  color: #6b7280;
  margin: 0 8px;
  font-size: 12px;
}

.relative-item .years {
  color: #9ca3af;
  font-size: 12px;
}

.tree-stats {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;
  padding: 12px;
  margin-top: 16px;
}

.tree-stats h4 {
  margin: 0 0 12px 0;
  color: #0369a1;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 14px;
}

.stat-item .label {
  color: #374151;
}

.stat-item .value {
  font-weight: 600;
}

.stat-item .value.alive {
  color: #059669;
}

.stat-item .value.deceased {
  color: #dc2626;
}

.stat-item .value.birthday {
  color: #7c3aed;
}

.alive {
  color: #059669;
  font-weight: 600;
}

.deceased {
  color: #dc2626;
  font-weight: 600;
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.9);
  color: #111827;
  font-weight: 600;
  font-size: 18px;
}

.overlay.error {
  color: #b91c1c;
}
</style> I hope you can help me redesign the UI of this page, especially the "Family Tree Visualization" section. Please keep the "Family Relationships" function of the right status bar. 


