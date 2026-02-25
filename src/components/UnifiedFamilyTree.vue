<template>
  <div class="unified-tree-container">
    <!-- Top Controls -->
    <header class="tree-header">
      <div class="header-left">
        <h2>Unified Family Tree Visualization</h2>
        <p>Interactive D3.js tree with advanced relationship mapping</p>
      </div>
      <div class="header-controls">
        <div class="search-group">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by name or ID..." 
            class="search-input"
            @input="handleSearch"
          />
          <button @click="clearSearch" class="btn btn-secondary btn-sm">Clear</button>
        </div>
        <div class="control-group">
          <button @click="fitToView" class="btn btn-sm btn-primary" title="Fit to view">
            <span class="btn-icon">🔍</span> Fit
          </button>
          <button @click="resetView" class="btn btn-sm btn-secondary" title="Reset view">
            <span class="btn-icon">🔄</span> Reset
          </button>
          <button @click="toggleExpandAll" class="btn btn-sm btn-info" title="Toggle expand all">
            <span class="btn-icon">{{ allExpanded ? '📁' : '📂' }}</span> {{ allExpanded ? 'Collapse' : 'Expand' }} All
          </button>
          <button @click="exportSVG" class="btn btn-sm btn-success" title="Export as SVG">
            <span class="btn-icon">⬇️</span> Export SVG
          </button>
          <button @click="exportPNG" class="btn btn-sm btn-success" title="Export as PNG">
            <span class="btn-icon">📷</span> Export PNG
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Left: D3.js Tree Visualization -->
      <section class="visualization-panel">
        <div class="viz-container" ref="vizContainer">
          <svg ref="treeSvg" class="tree-svg"></svg>
          
          <!-- Minimap -->
          <div class="minimap-container" v-if="showMinimap">
            <div class="minimap-header">
              <span>Minimap</span>
              <button @click="toggleMinimap" class="btn btn-xs btn-secondary">×</button>
            </div>
            <svg ref="minimapSvg" class="minimap-svg"></svg>
          </div>
          
          <!-- Legend -->
          <div class="legend">
            <h4>Legend</h4>
            <div class="legend-item">
              <div class="legend-color male"></div>
              <span>Male</span>
            </div>
            <div class="legend-item">
              <div class="legend-color female"></div>
              <span>Female</span>
            </div>
            <div class="legend-item">
              <div class="legend-color unknown"></div>
              <span>Unknown Gender</span>
            </div>
            <div class="legend-item">
              <div class="legend-color alive"></div>
              <span>Living</span>
            </div>
            <div class="legend-item">
              <div class="legend-color deceased"></div>
              <span>Deceased</span>
            </div>
            <div class="legend-item">
              <div class="legend-line marriage"></div>
              <span>Marriage</span>
            </div>
            <div class="legend-item">
              <div class="legend-line parent-child"></div>
              <span>Parent-Child</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Right: Side Panel with Person Details -->
      <aside class="side-panel" :class="{ collapsed: sidePanelCollapsed }">
        <div class="panel-header">
          <h3>Person Details</h3>
          <button @click="toggleSidePanel" class="btn btn-xs btn-secondary">
            {{ sidePanelCollapsed ? '→' : '←' }}
          </button>
        </div>
        
        <div class="panel-content" v-if="selectedPerson && !sidePanelCollapsed">
          <!-- Person Summary (Dashboard Style) -->
          <section class="person-summary">
            <div class="person-header">
              <div class="person-avatar" :class="getGenderClass(selectedPerson)">
                {{ getInitials(selectedPerson) }}
              </div>
              <div class="person-info">
                <h3 class="person-name">{{ selectedPerson.forenames }} {{ selectedPerson.surname }}</h3>
                <p class="person-id">ID: {{ selectedPerson.personalId }}</p>
                <div class="person-badges">
                  <span class="badge" :class="getGenderClass(selectedPerson)">
                    {{ getGenderDisplay(selectedPerson) }}
                  </span>
                  <span class="badge" :class="getStatusClass(selectedPerson)">
                    {{ getStatusDisplay(selectedPerson) }}
                  </span>
                  <span class="badge" :class="getMaritalClass(selectedPerson)">
                    {{ getMaritalStatus(selectedPerson) }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="person-details-grid">
              <div class="detail-card">
                <div class="detail-icon">📅</div>
                <div class="detail-content">
                  <h4>Life Span</h4>
                  <p>{{ getYearsDisplay(selectedPerson) }}</p>
                </div>
              </div>
              
              <div class="detail-card">
                <div class="detail-icon">👤</div>
                <div class="detail-content">
                  <h4>Generation</h4>
                  <p>{{ selectedPerson.generation || 'Not Available' }}</p>
                </div>
              </div>
              
              <div class="detail-card">
                <div class="detail-icon">💍</div>
                <div class="detail-content">
                  <h4>Marriage Year</h4>
                  <p>{{ getMarriageYearDisplay(selectedPerson) }}</p>
                </div>
              </div>
              
              <div class="detail-card">
                <div class="detail-icon">🎂</div>
                <div class="detail-content">
                  <h4>Age</h4>
                  <p>{{ calculateAge(selectedPerson) }}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Direct Relatives (Enhanced Family Tree Style) -->
          <section class="relationship-section" v-if="selectedPersonRelationships.length > 0">
            <h4>Direct Relatives</h4>
            
            <!-- Parents -->
            <div v-if="getRelativesByGroup('parents').length" class="relative-group">
              <h5>Parents</h5>
              <div v-for="parent in getRelativesByGroup('parents')" :key="parent.member.personalId" 
                   class="relative-item direct" @click="selectPersonById(parent.member.personalId)">
                <span class="name">{{ parent.member.forenames }} {{ parent.member.surname }}</span>
                <span class="relationship">{{ parent.relationship }}</span>
                <span class="years">{{ getYearsDisplay(parent.member) }}</span>
              </div>
            </div>
            
            <!-- Spouses -->
            <div v-if="getRelativesByGroup('spouses').length" class="relative-group">
              <h5>Spouses</h5>
              <div v-for="spouse in getRelativesByGroup('spouses')" :key="spouse.member.personalId" 
                   class="relative-item direct" @click="selectPersonById(spouse.member.personalId)">
                <span class="name">{{ spouse.member.forenames }} {{ spouse.member.surname }}</span>
                <span class="relationship">{{ spouse.relationship }}</span>
                <span class="years">{{ getYearsDisplay(spouse.member) }}</span>
              </div>
            </div>
            
            <!-- Children -->
            <div v-if="getRelativesByGroup('children').length" class="relative-group">
              <h5>Children</h5>
              <div v-for="child in getRelativesByGroup('children')" :key="child.member.personalId" 
                   class="relative-item direct" @click="selectPersonById(child.member.personalId)">
                <span class="name">{{ child.member.forenames }} {{ child.member.surname }}</span>
                <span class="relationship">{{ child.relationship }}</span>
                <span class="years">{{ getYearsDisplay(child.member) }}</span>
              </div>
            </div>
          </section>
          
          <!-- Extended Family (Enhanced Family Tree Style) -->
          <section class="relationship-section" v-if="selectedPersonRelationships.length > 0">
            <h4>Extended Family</h4>
            
            <!-- Grandparents -->
            <div v-if="getRelativesByGroup('grandparents').length" class="relative-group">
              <h5>Grandparents</h5>
              <div v-for="grandparent in getRelativesByGroup('grandparents')" :key="grandparent.member.personalId" 
                   class="relative-item collateral" @click="selectPersonById(grandparent.member.personalId)">
                <span class="name">{{ grandparent.member.forenames }} {{ grandparent.member.surname }}</span>
                <span class="relationship">{{ grandparent.relationship }}</span>
                <span class="years">{{ getYearsDisplay(grandparent.member) }}</span>
              </div>
            </div>
            
            <!-- Siblings -->
            <div v-if="getRelativesByGroup('siblings').length" class="relative-group">
              <h5>Siblings</h5>
              <div v-for="sibling in getRelativesByGroup('siblings')" :key="sibling.member.personalId" 
                   class="relative-item collateral" @click="selectPersonById(sibling.member.personalId)">
                <span class="name">{{ sibling.member.forenames }} {{ sibling.member.surname }}</span>
                <span class="relationship">{{ sibling.relationship }}</span>
                <span class="years">{{ getYearsDisplay(sibling.member) }}</span>
              </div>
            </div>
            
            <!-- Uncles -->
            <div v-if="getRelativesByGroup('uncles').length" class="relative-group">
              <h5>Uncles</h5>
              <div v-for="uncle in getRelativesByGroup('uncles')" :key="uncle.member.personalId" 
                   class="relative-item collateral" @click="selectPersonById(uncle.member.personalId)">
                <span class="name">{{ uncle.member.forenames }} {{ uncle.member.surname }}</span>
                <span class="relationship">{{ uncle.relationship }}</span>
                <span class="years">{{ getYearsDisplay(uncle.member) }}</span>
              </div>
            </div>
            
            <!-- Aunts -->
            <div v-if="getRelativesByGroup('aunts').length" class="relative-group">
              <h5>Aunts</h5>
              <div v-for="aunt in getRelativesByGroup('aunts')" :key="aunt.member.personalId" 
                   class="relative-item collateral" @click="selectPersonById(aunt.member.personalId)">
                <span class="name">{{ aunt.member.forenames }} {{ aunt.member.surname }}</span>
                <span class="relationship">{{ aunt.relationship }}</span>
                <span class="years">{{ getYearsDisplay(aunt.member) }}</span>
              </div>
            </div>
            
            <!-- Cousins -->
            <div v-if="getRelativesByGroup('cousins').length" class="relative-group">
              <h5>Cousins</h5>
              <div v-for="cousin in getRelativesByGroup('cousins')" :key="cousin.member.personalId" 
                   class="relative-item collateral" @click="selectPersonById(cousin.member.personalId)">
                <span class="name">{{ cousin.member.forenames }} {{ cousin.member.surname }}</span>
                <span class="relationship">{{ cousin.relationship }}</span>
                <span class="years">{{ getYearsDisplay(cousin.member) }}</span>
              </div>
            </div>
            
            <!-- Nephews/Nieces -->
            <div v-if="getRelativesByGroup('nephews').length || getRelativesByGroup('nieces').length" class="relative-group">
              <h5>Nephews & Nieces</h5>
              <div v-for="nephew in [...getRelativesByGroup('nephews'), ...getRelativesByGroup('nieces')]" :key="nephew.member.personalId" 
                   class="relative-item collateral" @click="selectPersonById(nephew.member.personalId)">
                <span class="name">{{ nephew.member.forenames }} {{ nephew.member.surname }}</span>
                <span class="relationship">{{ nephew.relationship }}</span>
                <span class="years">{{ getYearsDisplay(nephew.member) }}</span>
              </div>
            </div>
          </section>

          <!-- Tree Statistics -->
          <section class="tree-stats" v-if="treeStats">
            <h4>Tree Statistics</h4>
            <div class="stats-grid">
              <div class="stat">
                <div class="num">{{ treeStats.totalMembers || 0 }}</div>
                <div class="label">Total</div>
              </div>
              <div class="stat">
                <div class="num alive">{{ treeStats.livingMembers || 0 }}</div>
                <div class="label">Living</div>
              </div>
              <div class="stat">
                <div class="num deceased">{{ treeStats.deceasedMembers || 0 }}</div>
                <div class="label">Deceased</div>
              </div>
              <div class="stat">
                <div class="num">{{ treeStats.totalGenerations || 0 }}</div>
                <div class="label">Generations</div>
              </div>
            </div>
          </section>
        </div>
        
        <div class="panel-empty" v-else-if="!sidePanelCollapsed">
          <div class="empty-state">
            <div class="empty-icon">👤</div>
            <p>Click on a person in the tree to view details</p>
          </div>
        </div>
      </aside>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading family tree...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import * as d3 from 'd3'
import axios from 'axios'

// Props
const props = defineProps({
  personId: {
    type: String,
    required: true
  }
})

// Reactive data
const vizContainer = ref(null)
const treeSvg = ref(null)
const minimapSvg = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const searchQuery = ref('')
const selectedPerson = ref(null)
const selectedPersonRelationships = ref([])
const sidePanelCollapsed = ref(false)
const showMinimap = ref(true)
const allExpanded = ref(false)
const treeStats = ref(null)

// Simplified group mapping for right panel display order
const simplifiedGroups = {
  'Parents': 'parents',
  'Spouses': 'spouses',
  'Children': 'children',
  'Siblings': 'siblings',
  'Grandparents': 'grandparents',
  'Uncles': 'uncles',
  'Aunts': 'aunts',
  'Cousins': 'cousins',
  'Nephews': 'nephews',
  'Nieces': 'nieces'
}

// D3.js variables
let svg, g, zoom, tree, diagonal, root, nodes, links
let width = 1200
let height = 800
let nodeWidth = 120
let nodeHeight = 60
let nodeSpacing = 20
let levelHeight = 100

// Computed properties
const route = useRoute()

// Methods
const loadFamilyTreeData = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    
    const response = await axios.get(`/api/enhanced-tree/person/${props.personId}`)
    const data = response.data
    
    if (!data || !data.person) {
      throw new Error('No family tree data found')
    }
    
    // Store tree statistics
    treeStats.value = data.treeStats || null
    
    // Process the data for D3.js tree structure
    const treeData = processTreeData(data)
    renderTree(treeData)
    
  } catch (error) {
    console.error('Error loading family tree:', error)
    errorMessage.value = 'Failed to load family tree data'
  } finally {
    loading.value = false
  }
}

const processTreeData = (data) => {
  // Create a hierarchical structure for D3.js
  const person = data.person
  const relatives = data.relativesByType || {}
  
  // Build the tree structure
  const treeNode = {
    id: person.personalId,
    name: `${person.forenames} ${person.surname}`,
    data: person,
    children: []
  }
  
  // Add parents
  const parents = relatives.parents || []
  if (parents.length > 0) {
    treeNode.children = parents.map(parent => ({
      id: parent.member.personalId,
      name: `${parent.member.forenames} ${parent.member.surname}`,
      data: parent.member,
      children: []
    }))
  }
  
  // Add spouse
  const spouses = relatives.spouses || []
  if (spouses.length > 0) {
    const spouse = spouses[0]
    treeNode.spouse = {
      id: spouse.member.personalId,
      name: `${spouse.member.forenames} ${spouse.member.surname}`,
      data: spouse.member,
      children: []
    }
  }
  
  // Add children
  const children = relatives.children || []
  if (children.length > 0) {
    const childrenNodes = children.map(child => ({
      id: child.member.personalId,
      name: `${child.member.forenames} ${child.member.surname}`,
      data: child.member,
      children: []
    }))
    
    if (treeNode.spouse) {
      treeNode.spouse.children = childrenNodes
    } else {
      treeNode.children = [...(treeNode.children || []), ...childrenNodes]
    }
  }
  
  return treeNode
}

const renderTree = (data) => {
  // Clear previous content
  d3.select(treeSvg.value).selectAll("*").remove()
  
  // Set up SVG
  svg = d3.select(treeSvg.value)
    .attr("width", width)
    .attr("height", height)
    .style("background", "#f8fafc")
  
  // Create main group
  g = svg.append("g")
  
  // Set up zoom behavior
  zoom = d3.zoom()
    .scaleExtent([0.1, 3])
    .on("zoom", (event) => {
      g.attr("transform", event.transform)
    })
  
  svg.call(zoom)
  
  // Set up tree layout with custom positioning
  tree = d3.tree()
    .size([width - 200, height - 100])
    .separation((a, b) => {
      // Custom separation for better spacing
      if (a.parent === b.parent) return 1
      return 2
    })
  
  // Process data for D3 hierarchy
  root = d3.hierarchy(data, d => d.children)
  
  // Calculate tree layout
  tree(root)
  
  // Center the root node (home person)
  const rootNode = root
  const centerX = width / 2
  const centerY = height / 2
  
  // Adjust all nodes relative to center
  root.each((d) => {
    d.x = centerX + (d.x - rootNode.x)
    d.y = centerY + (d.y - rootNode.y)
  })
  
  // Render nodes and links
  renderNodes()
  renderLinks()
  
  // Fit to view
  fitToView()
}

const renderNodes = () => {
  nodes = g.selectAll(".node")
    .data(root.descendants())
    .enter().append("g")
    .attr("class", d => d.depth === 0 ? "node root-node" : "node")
    .attr("transform", d => `translate(${d.x},${d.y})`)
    .on("click", handleNodeClick)
    .on("mouseover", handleNodeHover)
    .on("mouseout", handleNodeOut)
  
  // Add node rectangles with special styling for root node
  nodes.append("rect")
    .attr("width", nodeWidth)
    .attr("height", nodeHeight)
    .attr("x", -nodeWidth/2)
    .attr("y", -nodeHeight/2)
    .attr("rx", 8)
    .attr("ry", 8)
    .style("fill", d => getNodeColor(d.data))
    .style("stroke", d => d.depth === 0 ? "#3b82f6" : "#374151")
    .style("stroke-width", d => d.depth === 0 ? 4 : 2)
    .style("filter", d => d.depth === 0 ? "drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))" : "none")
  
  // Add gender indicator
  nodes.append("circle")
    .attr("cx", -nodeWidth/2 + 12)
    .attr("cy", -nodeHeight/2 + 12)
    .attr("r", 6)
    .style("fill", d => {
      const gender = d.data.gender || 'Unknown'
      if (gender === 'Male') return '#3b82f6'
      if (gender === 'Female') return '#ec4899'
      return '#6b7280'
    })
    .style("stroke", "white")
    .style("stroke-width", 2)
  
  // Add gender symbol
  nodes.append("text")
    .attr("x", -nodeWidth/2 + 12)
    .attr("y", -nodeHeight/2 + 16)
    .attr("text-anchor", "middle")
    .style("font-size", "8px")
    .style("font-weight", "bold")
    .style("fill", "white")
    .text(d => {
      const gender = d.data.gender || 'Unknown'
      if (gender === 'Male') return '♂'
      if (gender === 'Female') return '♀'
      return '?'
    })
  
  // Add home symbol for root node
  nodes.filter(d => d.depth === 0)
    .append("text")
    .attr("x", nodeWidth/2 - 12)
    .attr("y", -nodeHeight/2 + 16)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("fill", "#3b82f6")
    .text("🏠")
  
  // Add "HOME" label for root node
  nodes.filter(d => d.depth === 0)
    .append("text")
    .attr("x", 0)
    .attr("y", nodeHeight/2 + 15)
    .attr("text-anchor", "middle")
    .style("font-size", "8px")
    .style("font-weight", "bold")
    .style("fill", "#3b82f6")
    .text("HOME")
  
  // Add node text
  nodes.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", -8)
    .style("font-size", d => d.depth === 0 ? "14px" : "12px")
    .style("font-weight", d => d.depth === 0 ? "bold" : "600")
    .style("fill", d => d.depth === 0 ? "#1e40af" : "#1f2937")
    .text(d => d.data.name.split(' ')[0]) // First name only
  
  nodes.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", 8)
    .style("font-size", d => d.depth === 0 ? "11px" : "10px")
    .style("fill", d => d.depth === 0 ? "#1e40af" : "#6b7280")
    .text(d => d.data.name.split(' ').slice(1).join(' ')) // Last name
  
  nodes.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", 22)
    .style("font-size", "8px")
    .style("fill", "#9ca3af")
    .text(d => d.data.personalId)
}

const renderLinks = () => {
  links = g.selectAll(".link")
    .data(root.links())
    .enter().append("path")
    .attr("class", d => {
      // Determine relationship type based on node depth and position
      const source = d.source
      const target = d.target
      
      if (source.depth === 0) {
        return "link parent-child" // From home person to children
      } else if (target.depth === 0) {
        return "link parent-child" // From parents to home person
      } else if (Math.abs(source.depth - target.depth) === 0) {
        return "link sibling" // Same generation
      } else {
        return "link parent-child" // Parent-child relationship
      }
    })
    .attr("d", d3.linkHorizontal()
      .x(d => d.x)
      .y(d => d.y))
    .style("fill", "none")
    .style("stroke", d => {
      const source = d.source
      const target = d.target
      
      // Highlight connections to/from home person
      if (source.depth === 0 || target.depth === 0) {
        return "#3b82f6" // Blue for connections to home person
      } else if (Math.abs(source.depth - target.depth) === 0) {
        return "#10b981" // Green for sibling relationships
      } else {
        return "#6b7280" // Gray for other relationships
      }
    })
    .style("stroke-width", d => {
      const source = d.source
      const target = d.target
      
      // Thicker lines for connections to home person
      if (source.depth === 0 || target.depth === 0) {
        return 3
      } else {
        return 2
      }
    })
    .style("stroke-dasharray", d => {
      const source = d.source
      const target = d.target
      
      // Dashed lines for sibling relationships
      if (Math.abs(source.depth - target.depth) === 0) {
        return "5,5"
      } else {
        return "none"
      }
    })
    .style("opacity", 0.8)
}

const handleNodeClick = (event, d) => {
  selectedPerson.value = d.data
  loadPersonRelationships(d.data.personalId)
}

const handleNodeHover = (event, d) => {
  d3.select(event.currentTarget)
    .select("rect")
    .style("stroke-width", 3)
    .style("stroke", "#3b82f6")
}

const handleNodeOut = (event, d) => {
  d3.select(event.currentTarget)
    .select("rect")
    .style("stroke-width", 2)
    .style("stroke", "#374151")
}

const loadPersonRelationships = async (personId) => {
  try {
    const response = await axios.get(`/api/enhanced-tree/person/${personId}`)
    const data = response.data
    selectedPersonRelationships.value = []
    
    // Process relationships
    const relatives = data.relativesByType || {}
    Object.keys(relatives).forEach(relationshipType => {
      relatives[relationshipType].forEach(rel => {
        selectedPersonRelationships.value.push({
          relationship: relationshipType,
          member: rel.member
        })
      })
    })
  } catch (error) {
    console.error('Error loading relationships:', error)
  }
}

const selectPersonById = (personId) => {
  // Find and select the person in the tree
  const node = nodes.filter(d => d.data.personalId === personId)
  if (!node.empty()) {
    const nodeData = node.datum()
    selectedPerson.value = nodeData.data
    loadPersonRelationships(personId)
    
    // Center on the selected node
    const transform = d3.zoomTransform(svg.node())
    svg.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity.translate(width/2 - nodeData.x, height/2 - nodeData.y).scale(1)
    )
  }
}

const getNodeColor = (data) => {
  if (!data) return '#e5e7eb'
  
  const gender = data.gender || 'Unknown'
  const isAlive = !data.deathYear || data.deathYear === null || data.deathYear === ''
  
  if (gender === 'Male') {
    return isAlive ? '#dbeafe' : '#93c5fd'
  } else if (gender === 'Female') {
    return isAlive ? '#fce7f3' : '#f9a8d4'
  } else {
    return isAlive ? '#f3f4f6' : '#d1d5db'
  }
}

const getGenderClass = (gender) => {
  switch (gender) {
    case 'Male': return 'gender-male'
    case 'Female': return 'gender-female'
    default: return 'gender-unknown'
  }
}

const getStatusClass = (person) => {
  const isAlive = !person.deathYear || person.deathYear === ''
  return isAlive ? 'status-alive' : 'status-deceased'
}

const getMaritalClass = (person) => {
  return person.spouseFamilyId ? 'marital-married' : 'marital-single'
}

const calculateAge = (person) => {
  if (!person.birthYear || !person.deathYear) return 'Unknown'
  const age = person.deathYear - person.birthYear
  return age > 130 ? 'Deceased' : `${age} years`
}

const getLifeStatus = (person) => {
  if (!person.birthYear || !person.deathYear) return 'Unknown'
  const age = person.deathYear - person.birthYear
  return age > 130 ? 'Deceased' : 'Living'
}

const getMaritalStatus = (person) => {
  return person.spouseFamilyId ? 'Married' : 'Single'
}

const getInitials = (person) => {
  const names = `${person.forenames} ${person.surname}`.split(' ')
  return names.map(n => n[0]).join('').toUpperCase()
}

// Enhanced Family Tree style helper functions
const getPersonGender = (person) => {
  return person.gender || 'Unknown'
}

const getGenderDisplay = (person) => {
  return person.gender || 'Unknown'
}

const getYearsDisplay = (person) => {
  if (!person.birthYear) return 'Unknown'
  const birth = person.birthYear
  const death = person.deathYear || 'Present'
  return `${birth} - ${death}`
}

const getStatusDisplay = (person) => {
  if (!person.birthYear || !person.deathYear) return 'Unknown'
  const age = person.deathYear - person.birthYear
  return age > 130 ? 'Deceased' : 'Living'
}

const getMarriageYearDisplay = (person) => {
  return person.marriageYear || 'Not Recorded'
}

const getRelativesByGroup = (groupKey) => {
  if (!selectedPersonRelationships.value.length) return []
  
  const groupMap = {
    'parents': ['Father', 'Mother', 'Parent'],
    'spouses': ['Spouse', 'Husband', 'Wife'],
    'children': ['Child', 'Son', 'Daughter'],
    'siblings': ['Sibling', 'Brother', 'Sister'],
    'grandparents': ['Paternal Grandfather', 'Paternal Grandmother', 'Maternal Grandfather', 'Maternal Grandmother', 'Grandfather', 'Grandmother'],
    'uncles': ['Paternal Uncle', 'Maternal Uncle', 'Uncle'],
    'aunts': ['Paternal Aunt', 'Maternal Aunt', 'Aunt'],
    'cousins': ['Cousin'],
    'nephews': ['Nephew'],
    'nieces': ['Niece']
  }
  
  const relationships = groupMap[groupKey] || []
  return selectedPersonRelationships.value.filter(rel => 
    relationships.some(relType => rel.relationship.includes(relType))
  )
}

const fitToView = () => {
  if (!root) return
  
  const bounds = g.node().getBBox()
  const fullWidth = width
  const fullHeight = height
  const widthScale = fullWidth / bounds.width
  const heightScale = fullHeight / bounds.height
  const scale = Math.min(widthScale, heightScale) * 0.8
  const translate = [fullWidth / 2 - scale * (bounds.x + bounds.width / 2), fullHeight / 2 - scale * (bounds.y + bounds.height / 2)]
  
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
  )
}

const resetView = () => {
  svg.transition().duration(750).call(
    zoom.transform,
    d3.zoomIdentity
  )
}

const toggleExpandAll = () => {
  allExpanded.value = !allExpanded.value
  // Implementation for expand/collapse all nodes
  // This would require modifying the tree data structure
}

const toggleSidePanel = () => {
  sidePanelCollapsed.value = !sidePanelCollapsed.value
}

const toggleMinimap = () => {
  showMinimap.value = !showMinimap.value
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // Find and highlight matching nodes
    const matchingNodes = nodes.filter(d => 
      d.data.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      d.data.personalId.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    
    if (!matchingNodes.empty()) {
      const firstMatch = matchingNodes.datum()
      selectPersonById(firstMatch.data.personalId)
    }
  }
}

const clearSearch = () => {
  searchQuery.value = ''
  // Clear highlights
  nodes.select("rect").style("stroke", "#374151").style("stroke-width", 2)
}

const exportSVG = () => {
  const svgData = new XMLSerializer().serializeToString(treeSvg.value)
  const blob = new Blob([svgData], { type: "image/svg+xml" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "family-tree.svg"
  link.click()
  URL.revokeObjectURL(url)
}

const exportPNG = () => {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  const img = new Image()
  
  const svgData = new XMLSerializer().serializeToString(treeSvg.value)
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(svgBlob)
  
  img.onload = () => {
    canvas.width = width
    canvas.height = height
    ctx.fillStyle = "#f8fafc"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    
    const link = document.createElement("a")
    link.download = "family-tree.png"
    link.href = canvas.toDataURL()
    link.click()
    URL.revokeObjectURL(url)
  }
  
  img.src = url
}

// Lifecycle
onMounted(() => {
  loadFamilyTreeData()
})

// Watch for personId changes
watch(() => props.personId, () => {
  loadFamilyTreeData()
})
</script>

<style scoped>
.unified-tree-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left h2 {
  margin: 0 0 5px 0;
  color: #1f2937;
  font-size: 24px;
}

.header-left p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.header-controls {
  display: flex;
  gap: 20px;
  align-items: center;
}

.search-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  width: 250px;
  font-size: 14px;
}

.control-group {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.btn-primary { background: #3b82f6; color: white; }
.btn-secondary { background: #6b7280; color: white; }
.btn-info { background: #06b6d4; color: white; }
.btn-success { background: #10b981; color: white; }

.btn:hover { opacity: 0.9; transform: translateY(-1px); }

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.visualization-panel {
  flex: 1;
  position: relative;
  background: #f8fafc;
}

.viz-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.tree-svg {
  width: 100%;
  height: 100%;
}

.minimap-container {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 200px;
  height: 150px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.minimap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
  font-weight: 500;
}

.minimap-svg {
  width: 100%;
  height: calc(100% - 32px);
}

.legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 12px;
}

.legend h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #1f2937;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.male { background: #dbeafe; }
.legend-color.female { background: #fce7f3; }
.legend-color.unknown { background: #f3f4f6; }
.legend-color.alive { background: #dcfce7; }
.legend-color.deceased { background: #fecaca; }

.legend-line {
  width: 20px;
  height: 2px;
  background: #6b7280;
}

.side-panel {
  width: 350px;
  background: white;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.side-panel.collapsed {
  width: 50px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.person-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.person-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.person-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
  color: white;
}

.person-avatar.gender-male { background: #3b82f6; }
.person-avatar.gender-female { background: #ec4899; }
.person-avatar.gender-unknown { background: #6b7280; }

.person-info h4 {
  margin: 0 0 5px 0;
  color: #1f2937;
  font-size: 18px;
}

.person-id {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
}

.detail-group {
  margin-bottom: 20px;
}

.detail-group h5 {
  margin: 0 0 10px 0;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #6b7280;
  font-size: 13px;
}

.value {
  font-weight: 600;
  color: #1f2937;
  font-size: 13px;
}

.value.gender-male { color: #3b82f6; }
.value.gender-female { color: #ec4899; }
.value.gender-unknown { color: #6b7280; }
.value.status-alive { color: #10b981; }
.value.status-deceased { color: #ef4444; }
.value.marital-married { color: #8b5cf6; }
.value.marital-single { color: #6b7280; }

.relationships-list {
  max-height: 200px;
  overflow-y: auto;
}

.relationship-item {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.relationship-item:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.relationship-type {
  font-weight: 600;
  color: #3b82f6;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.relationship-person {
  font-weight: 500;
  color: #1f2937;
  font-size: 13px;
  margin: 2px 0;
}

.relationship-id {
  color: #6b7280;
  font-size: 11px;
}

.panel-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Enhanced Family Tree Style CSS */
.person-summary {
  background: #fbfdff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #eef2f7;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.person-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.person-avatar {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  color: #0f172a;
  flex-shrink: 0;
}

.person-avatar.Male {
  background: linear-gradient(135deg, #e6f0ff, #dbeafe);
  border: 2px solid #3b82f6;
}

.person-avatar.Female {
  background: linear-gradient(135deg, #fff0f6, #ffe6f0);
  border: 2px solid #ec4899;
}

.person-avatar.Unknown {
  background: #eef2f7;
  border: 2px solid #6b7280;
}

.person-info {
  flex: 1;
}

.person-name {
  font-weight: 700;
  font-size: 18px;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.person-id {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 12px 0;
}

.person-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.Male {
  background: #e6f0ff;
  color: #1e40af;
  border: 1px solid #3b82f6;
}

.badge.Female {
  background: #fff0f6;
  color: #be185d;
  border: 1px solid #ec4899;
}

.badge.Unknown {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #6b7280;
}

.badge.Living {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #22c55e;
}

.badge.Deceased {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #ef4444;
}

.badge.Married {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
}

.badge.Single {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #9ca3af;
}

.person-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-icon {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  border-radius: 6px;
}

.detail-content h4 {
  margin: 0 0 4px 0;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-content p {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

/* Enhanced Family Tree Relationship Sections */
.relationship-section {
  margin-bottom: 20px;
}

.relationship-section h4 {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.relative-group {
  margin-bottom: 16px;
}

.relative-group h5 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.relative-item {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.relative-item:hover {
  background: #f1f5f9;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.relative-item.direct {
  border-left: 4px solid #3b82f6;
}

.relative-item.collateral {
  border-left: 4px solid #10b981;
}

.relative-item .name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.relative-item .relationship {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.relative-item .years {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
}

.relatives .group {
  margin-bottom: 14px;
}

.relatives h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #0f172a;
  font-weight: 600;
}

.relatives ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.relatives li {
  padding: 8px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  border: 1px solid #f1f5f9;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.relatives li:hover {
  background: #fbfdff;
  border-color: #3b82f6;
}

.member-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 13px;
}

.member-meta {
  color: #6b7280;
  font-size: 12px;
}

.tree-stats {
  margin-top: 10px;
}

.tree-stats h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #0f172a;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat {
  background: #f8fbff;
  border-radius: 6px;
  padding: 8px;
  text-align: center;
  border: 1px solid #eef2f7;
}

.stat .num {
  font-weight: 800;
  font-size: 16px;
  color: #1f2937;
}

.stat .label {
  color: #6b7280;
  font-size: 12px;
}

.stat .num.alive {
  color: #059669;
}

.stat .num.deceased {
  color: #dc2626;
}

/* D3.js styles */
:deep(.node) {
  cursor: pointer;
}

:deep(.node rect) {
  transition: all 0.2s;
}

:deep(.node:hover rect) {
  filter: brightness(1.1);
}

:deep(.root-node rect) {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

:deep(.link) {
  fill: none;
  stroke: #6b7280;
  stroke-width: 2;
  transition: all 0.2s;
}

:deep(.link:hover) {
  stroke: #3b82f6;
  stroke-width: 3;
}

:deep(.link.parent-child) {
  stroke: #3b82f6;
  stroke-width: 3;
}

:deep(.link.sibling) {
  stroke: #10b981;
  stroke-width: 2;
  stroke-dasharray: 5,5;
}
</style>
