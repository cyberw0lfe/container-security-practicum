import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js'
import { ChartJSNodeCanvas } from 'chartjs-node-canvas'
import * as fs from 'fs'

interface GraphOptions {
  showLegend?: boolean
  largeXLabels?: boolean
  extraWide?: boolean
  showDataLabels?: boolean
}

const limitOrMax = (isPie: boolean, chart: Chart) =>
  isPie
    ? (chart.data.datasets
        .map(dataset =>
          dataset.data.reduce((sum: number, value: number) => sum + value, 0),
        )
        .reduce((sum: number, value: number) => sum + value, 0) as number)
    : (chart.data.datasets
        .map(dataset => dataset.data)
        .reduce((acc, val) => acc.concat(val, []))
        .reduce((max: number, val: number) => Math.max(max, val), -1) as number)

const dataLabelPlugin = (chartType: string) => {
  const isPie = chartType === 'pie'
  return {
    id: 'dataLabelPlugin',
    afterDatasetsDraw(chart: Chart) {
      const limitDenominator = limitOrMax(isPie, chart)
      const ctx = chart.ctx
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i)
        if (!meta.hidden) {
          meta.data.forEach((element, index) => {
            ctx.fillStyle = 'rgb(0, 0, 0)'
            const fontSize = 48
            const fontStyle = 'normal'
            const fontFamily = 'Arial'
            ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`

            const value = Number.parseInt(dataset.data[index].toString())
            const valueProportion = (value / limitDenominator) * 100
            const limit = 5 // in percent
            const label = isPie
              ? `${valueProportion.toPrecision(2).toString()}%`
              : dataset.data[index].toString()
            const dataString = () => {
              return valueProportion > limit ? label : ''
            }

            //@ts-ignore
            const position = element.getCenterPoint()
            const x = position.x - (isPie ? fontSize : fontSize / 2)
            const y = position.y + (isPie ? 0 : fontSize / 2)
            ctx.fillText(dataString(), x, y)
          })
        }
      })
    },
  }
}

const createStackedBarChart = async (
  data: ChartData<'bar', number[], string>,
  title: string,
  logger,
  options: GraphOptions,
): Promise<void> => {
  const canvasConfig = {
    width: options.extraWide ? 6400 : 3200,
    height: 2400,
    backgroundColor: 'white',
  }

  const chartJSNodeCanvas = new ChartJSNodeCanvas(canvasConfig)

  const config: ChartConfiguration<'bar', number[], string> = {
    type: 'bar',
    data: data,
    options: {
      scales: {
        x: {
          stacked: true,
          ticks: {
            font: { size: options.largeXLabels ? 48 : 24 },
            maxRotation: 90,
            minRotation: 30,
          },
        },
        y: { stacked: true, ticks: { font: { size: 48 } } },
      },
      plugins: {
        legend: {
          display: options.showLegend ? true : false,
          labels: { font: { size: 36 } },
        },
        title: {
          display: true,
          text: title,
          font: { size: 64 },
        },
      },
    },
    plugins: options.showDataLabels ? [dataLabelPlugin('bar')] : [],
  }

  const buffer = await chartJSNodeCanvas.renderToBuffer(config)
  fs.writeFileSync(
    `./final_graphs/${title.replace(/ /g, '_').toLowerCase()}.png`,
    buffer,
  )
  logger(`Chart image saved as ${title}.png`)
}

const createPieChart = async (
  data: ChartData<'pie', number[], string>,
  title: string,
  logger,
  options: GraphOptions,
): Promise<void> => {
  const canvasConfig = {
    width: 3200,
    height: 1600,
    backgroundColor: 'white',
  }

  const chartJSNodeCanvas = new ChartJSNodeCanvas(canvasConfig)

  const config: ChartConfiguration<'pie', number[], string> = {
    type: 'pie',
    data: data,
    options: {
      plugins: {
        legend: {
          display: options.showLegend ? true : false,
          labels: { font: { size: 36 } },
        },
        title: {
          display: true,
          text: title,
          font: { size: 64 },
        },
      },
    },
    plugins: options.showDataLabels ? [dataLabelPlugin('pie')] : [],
  }

  const buffer = await chartJSNodeCanvas.renderToBuffer(config as any)
  fs.writeFileSync(
    `./final_graphs/${title.replace(/ /g, '_').toLowerCase()}.png`,
    buffer,
  )
  logger(`Pie chart image saved as ${title}.png`)
}

const pieChart = (
  data: ChartData<'pie', number[], string>,
  title: string,
  logger,
  options: GraphOptions,
) =>
  createPieChart(data, title, logger, options)
    .then(() => logger('Pie chart created successfully.'))
    .catch(error => logger('Error creating pie chart:', error))

const barChart = (
  data: ChartData<'bar', number[], string>,
  title: string,
  logger,
  options: GraphOptions,
) =>
  createStackedBarChart(data, title, logger, options)
    .then(() => logger('Stacked bar chart created successfully.'))
    .catch(error => logger('Error creating stacked bar chart:', error))

export default { pieChart, barChart }
