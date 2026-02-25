<template>
  <div class="pie-chart">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  dataKey: {
    type: String,
    default: 'value'
  },
  labelKey: {
    type: String,
    default: 'name'
  },
  title: {
    type: String,
    default: ''
  }
})

const chartData = computed(() => ({
  labels: props.data.map(item => item[props.labelKey]),
  datasets: [
    {
      data: props.data.map(item => item[props.dataKey]),
      backgroundColor: props.data.map(item => item.color || '#3b82f6'),
      borderColor: props.data.map(item => item.color || '#3b82f6'),
      borderWidth: 1
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    },
    title: {
      display: !!props.title,
      text: props.title
    }
  }
}))
</script>

<style scoped>
.pie-chart {
  width: 100%;
  height: 100%;
}
</style>






