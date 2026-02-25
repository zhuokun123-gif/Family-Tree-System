<template>
  <div ref="container" class="tree-container">
    <div v-if="loading" class="overlay">Loading...</div>
    <div v-else-if="errorMessage" class="overlay error">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as d3 from 'd3'
import axios from 'axios'

const props = defineProps({
	rootId: { type: [String, Number], required: true }
})
const emit = defineEmits(['select'])

const container = ref(null)
const loading = ref(false)
const errorMessage = ref('')
let svg, g, width, height

async function fetchPerson(id) {
	const { data } = await axios.get(`/api/person/${encodeURIComponent(id)}`)
	return data
}

function toD3Hierarchy(rootData) {
	// Build a very simple 2-level tree: person -> parents + children
	const children = [
		...(rootData.parents || []).map(p => ({
			id: p['Personal _ID'],
			name: `${p['Forenames'] || ''} ${p['Surname'] || ''}`.trim(),
			relation: 'parent'
		})),
		...(rootData.children || []).map(c => ({
			id: c['Personal _ID'],
			name: `${c['Forenames'] || ''} ${c['Surname'] || ''}`.trim(),
			relation: 'child'
		}))
	]
	return {
		id: rootData.person['Personal _ID'],
		name: `${rootData.person['Forenames'] || ''} ${rootData.person['Surname'] || ''}`.trim(),
		children
	}
}

function render(root) {
	if (!container.value) return
	width = container.value.clientWidth || 800
	height = container.value.clientHeight || 600

	if (!svg) {
		svg = d3.select(container.value).append('svg').attr('width', width).attr('height', height)
		g = svg.append('g').attr('transform', 'translate(40,40)')
	} else {
		svg.attr('width', width).attr('height', height)
	}

	const treeLayout = d3.tree().size([height - 80, width - 160])
	const rootHierarchy = d3.hierarchy(root)
	treeLayout(rootHierarchy)

	// links
	const links = g.selectAll('path.link').data(rootHierarchy.links(), d => d.target.data.id)
	links.enter().append('path')
		.attr('class', 'link')
		.attr('fill', 'none')
		.attr('stroke', '#cbd5e1')
		.attr('stroke-width', 2)
		.merge(links)
		.attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x))
	links.exit().remove()

	// nodes
	const nodes = g.selectAll('g.node').data(rootHierarchy.descendants(), d => d.data.id)
	const nodesEnter = nodes.enter().append('g')
		.attr('class', 'node')
		.attr('transform', d => `translate(${d.y},${d.x})`)
		.style('cursor', 'pointer')
		.on('click', (_, d) => emit('select', { person: d.data, parents: [], spouses: [], children: [] }))

	nodesEnter.append('circle').attr('r', 16).attr('fill', '#3b82f6').attr('stroke', '#1e40af').attr('stroke-width', 2)
	nodesEnter.append('text').attr('dy', 5).attr('x', 22).text(d => d.data.name || `ID ${d.data.id}`).style('font-size', '12px')

	nodes.merge(nodesEnter).attr('transform', d => `translate(${d.y},${d.x})`)
	nodes.exit().remove()
}

async function load() {
	if (!props.rootId) return
	loading.value = true
	errorMessage.value = ''
	try {
		const data = await fetchPerson(props.rootId)
		if (!data || !data.person) {
			throw new Error('Person not found')
		}
		const root = toD3Hierarchy(data)
		render(root)
		emit('select', data)
	} catch (e) {
		console.error(e)
		errorMessage.value = e?.response?.data?.error || e?.message || 'Failed to load person'
	} finally {
		loading.value = false
	}
}

onMounted(() => {
	const ro = new ResizeObserver(() => load())
	if (container.value) ro.observe(container.value)
	load()
	container.value.__ro = ro
})

onBeforeUnmount(() => {
	if (container.value?.__ro) container.value.__ro.disconnect()
})

watch(() => props.rootId, () => load())
</script>

<style scoped>
.tree-container { width: 100%; height: 100%; position: relative; }
text { user-select: none; }
.overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.6); color: #111827; font-weight: 600; }
.overlay.error { color: #b91c1c; }
</style>


