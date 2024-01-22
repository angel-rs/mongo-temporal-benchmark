import mongoose from 'mongoose';

import { plainDateSchema, PlainDate, normalDateSchema, NormalDate } from './schemas';
// import { seedDBNormalDate, seedDBPlainDate } from './helpers';

mongoose.connect('mongodb://127.0.0.1:27017/mongo-playground');

// query name \ duration
let metrics: Record<string, number> = {}
let allMetrics: Record<string, typeof metrics> = {}

function createBenchmark(model, schema) {
  async function benchmark(name: string, query, withIndex = false) {
    if (withIndex) {
      schema.index({ date: 1 })
    } else {
      schema.clearIndexes()
    }

    const stats = await model.find(query).explain('executionStats')
    metrics[name] = Number(stats?.executionStats?.executionTimeMillis || -1)
  }

  return benchmark
}

function logAllMetrics() {
  console.log('\n-----------\nAll metrics:\n')
  let data: any[] = []

  Object.keys(allMetrics).forEach((schema) => {
    const metrics = allMetrics[schema]
    Object.keys(metrics).forEach((query) => {
      data.push({
        schema,
        query,
        duration: metrics[query]
      })
    })
  })

  data = data.map((entry) => {
    const otherSchemaDataEntry = data.find((otherEntry) => otherEntry.query === entry.query && otherEntry.schema !== entry.schema)

    const diff = otherSchemaDataEntry ? entry.duration - otherSchemaDataEntry.duration : 0
    const percentage = otherSchemaDataEntry ? `${((diff / entry.duration) * 100).toFixed(2)}%` : 'N/A'

    return {
      ...entry,
      diff,
      percentage
    }
  })

  console.table(data)
}

function logMetrics(title: string) {
  console.log(`Results ${title}:\n`)
  Object.keys(metrics).forEach((name) => {
    console.log(`Query: ${name}, Duration: ${metrics[name]}ms`)
  })
  allMetrics[title] = metrics
  metrics = {}
  console.log('\n')
}

async function benchmarkPlainDate() {
  const benchmark = createBenchmark(PlainDate, plainDateSchema)

  await benchmark('querying specific year', { date: { $regex: /^2021.*/ } })
  await benchmark('querying specific year (with date index)', { date: { $regex: /^2021.*/ } }, true)

  await benchmark('querying specific year, month', { date: { $regex: /^2021-01.*/ } })
  await benchmark('querying specific year, month', { date: { $regex: /^2021-01.*/ } }, true)

  await benchmark('querying specific year, month, date', { date: { $regex: /^2021-01-01.*/ } })
  await benchmark('querying specific year, month, date', { date: { $regex: /^2021-01-01.*/ } }, true)

  await benchmark('querying specific date time', { date: { $regex: /^2021-01-01T00:00:00*/ } })
  await benchmark('querying specific date time', { date: { $regex: /^2021-01-01T00:00:00*/ } }, true)

  await benchmark('querying date time range', { date: { $gte: '2024-01-01T00:00:00', $lte: '2024-02-01T00:00:00' } })
  await benchmark('querying date time range', { date: { $gte: '2024-01-01T00:00:00', $lte: '2024-02-01T00:00:00' } }, true)

  logMetrics("Plain Date")
}

async function benchmarkNormalDate() {
  const benchmark = createBenchmark(NormalDate, normalDateSchema)

  await benchmark('querying specific year', {
    date: {
      $gte: new Date("2021-01-01T00:00:00.000Z"),
      $lt: new Date("2022-01-01T00:00:00.000Z"),
    }
  })
  await benchmark('querying specific year (with date index)', {
    date: {
      $gte: new Date("2021-01-01T00:00:00.000Z"),
      $lt: new Date("2022-01-01T00:00:00.000Z"),
    }
  }, true)

  await benchmark('querying specific year, month', {
    date: {
      $gte: new Date("2021-01-01T00:00:00.000Z"),
      $lt: new Date("2021-02-01T00:00:00.000Z"),
    }
  })
  await benchmark('querying specific year, month', {
    date: {
      $gte: new Date("2021-01-01T00:00:00.000Z"),
      $lt: new Date("2021-02-01T00:00:00.000Z"),
    }
  }, true)

  await benchmark('querying specific year, month, date', {
    date: {
      $gte: new Date("2021-01-01T00:00:00.000Z"),
      $lt: new Date("2021-01-02T00:00:00.000Z"),
    }
  })
  await benchmark('querying specific year, month, date', {
    date: {
      $gte: new Date("2021-01-01T00:00:00.000Z"),
      $lt: new Date("2021-01-02T00:00:00.000Z"),
    }
  }, true)

  await benchmark('querying specific date time', { date: new Date("2021-01-01T00:00:00.000Z") })
  await benchmark('querying specific date time', { date: new Date("2021-01-01T00:00:00.000Z") }, true)

  await benchmark('querying date time range', {
    date: {
      $gte: new Date("2021-01-01T00:00:00.000Z"),
      $lt: new Date("2021-02-01T00:00:00.000Z"),
    }
  })
  await benchmark('querying date time range', {
    date: {
      $gte: new Date("2021-01-01T00:00:00.000Z"),
      $lt: new Date("2021-02-01T00:00:00.000Z"),
    }
  }, true)

  logMetrics("Normal Date")
}

async function main() {
  // await seedDBPlainDate()
  // await seedDBNormalDate()

  await benchmarkPlainDate()
  await benchmarkNormalDate()

  logAllMetrics()


  // TODO: benchmark plain date range
  // TODO: benchmark normal date
  // TODO: benchmark normal date range

  // this following query doesn't work since we compare 2024-02-01T00:00:00 to 2024-02-01
  // 2024-02-01T00:00:00 is greater than 2024-02-01, hence it doesn't make it to the final query
  // the only way for this to work is we store the temporal as a plain date with yyyy-mm-dd format
  // await benchmark('querying date range', { date: { $gte: '2024-01-01', $lte: '2024-02-01' } })

  // TODO: do the same thing with name JS Date & compare performance
  // TODO: benchmark performance & compare with different approaches
  // TODO: do the same for date ranges

  // @ts-ignore
  process.exit(0)
}

main()