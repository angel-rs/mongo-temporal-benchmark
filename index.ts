import { Temporal } from '@js-temporal/polyfill';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

mongoose.connect('mongodb://127.0.0.1:27017/mongo-playground');

interface IPlainDate {
  date: string
}

const plainDateSchema = new mongoose.Schema<IPlainDate>({
  date: String
});

const PlainDate = mongoose.model<IPlainDate>('PlainDate', plainDateSchema);

function temporal(date: string) {
  if (date) {
    return Temporal.PlainDateTime.from(date).toString()
  }
  return Temporal.Now.plainDateTimeISO().toString()
}

// query name \ duration
const metrics: Record<string, number> = {}

async function benchmark(name: string, query, withIndex = false) {
  // TODO: run ten times & get the average duration
  if (withIndex) {
    plainDateSchema.index({ date: 1 })
  } else {
    plainDateSchema.clearIndexes()
  }

  const stats = await PlainDate.find(query).explain('executionStats')
  // @ts-expect-error
  metrics[name] = Number(stats?.executionStats?.executionTimeMillis || -1)
}

async function seedDB() {
  const dataCount = 5_000_000

  const count = await PlainDate.estimatedDocumentCount()
  if (count >= dataCount) {
    console.log('DB already seeded')
    return
  }

  for (let i = 0; i < dataCount; i += 1) {
    const date = faker.date.between({ from: '2018-01-01T00:00:00', to: '2025-01-01T00:00:00' }).toISOString().replace('Z', '')
    await PlainDate.create({ date })

    if (i % 1000 === 0) {
      console.log(`Seeded ${i} records`)
    }
  }

  console.log('DB seeded!')
}

async function main() {
  // await seedDB()

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

  // this following query doesn't work since we compare 2024-02-01T00:00:00 to 2024-02-01
  // 2024-02-01T00:00:00 is greater than 2024-02-01, hence it doesn't make it to the final query
  // the only way for this to work is we store the temporal as a plain date with yyyy-mm-dd format
  // await benchmark('querying date range', { date: { $gte: '2024-01-01', $lte: '2024-02-01' } })

  // TODO: benchmark performance & compare with different approaches
  // TODO: do the same for date ranges

  console.log('Results:\n')
  Object.keys(metrics).forEach((name) => {
    console.log(`Query: ${name}, Duration: ${metrics[name]}ms`)
  })

  // @ts-ignore
  process.exit(0)
}

main()