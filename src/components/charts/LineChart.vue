<template>
  <div class="line-chart">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
    default: 'label'
  },
  color: {
    type: String,
    default: '#3b82f6'
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
      label: props.title || 'Data',
      data: props.data.map(item => item[props.dataKey]),
      borderColor: props.color,
      backgroundColor: props.color + '20',
      tension: 0.1,
      fill: false
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: !!props.title,
      text: props.title
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}))
</script>

<style scoped>
.line-chart {
  width: 100%;
  height: 100%;
}
</style>






