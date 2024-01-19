import { Temporal, Intl, toTemporalInstant } from '@js-temporal/polyfill';
import mongoose from 'mongoose';

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

async function findOrCreatePlainDate(data) {
  const value = await PlainDate.findOne(data);
  return value || PlainDate.create(data)
}

async function find(name, query) {
  console.log(`Querying '${name}'`)
  const results = (await PlainDate.find(query)).map((x) => x.date)
  console.log(`Results: (${results.length}) ${results}\n`)
  return results
}

async function main() {
  await Promise.all([
    findOrCreatePlainDate({ date: temporal('2021-01-01') }),
    findOrCreatePlainDate({ date: temporal('2021-01-02') }),
    findOrCreatePlainDate({ date: temporal('2021-02-01') }),
    findOrCreatePlainDate({ date: temporal('2021-03-01') }),
    findOrCreatePlainDate({ date: temporal('2022-01-01') }),
    findOrCreatePlainDate({ date: temporal('2022-02-01') }),
    findOrCreatePlainDate({ date: temporal('2022-03-01') }),
    findOrCreatePlainDate({ date: temporal('2023-01-01') }),
    findOrCreatePlainDate({ date: temporal('2023-02-01') }),
    findOrCreatePlainDate({ date: temporal('2023-03-01') }),
    findOrCreatePlainDate({ date: temporal('2024-01-01') }),
    findOrCreatePlainDate({ date: temporal('2024-02-01') }),
    findOrCreatePlainDate({ date: temporal('2024-03-01') }),
  ])

  console.log('All records', (await PlainDate.find({})).map((x) => x.date))

  await find('querying specific year', { date: { $regex: /^2021.*/ } })
  await find('querying specific year, month', { date: { $regex: /^2021-01.*/ } })
  await find('querying specific year, month, date', { date: { $regex: /^2021-01-01.*/ } })
  await find('querying specific date time', { date: { $regex: /^2021-01-01T00:00:00*/ } })
  await find('querying date time range', { date: { $gte: '2024-01-01T00:00:00', $lte: '2024-02-01T00:00:00' } })
  // this following query doesn't work since we compare 2024-02-01T00:00:00 to 2024-02-01
  // 2024-02-01T00:00:00 is greater than 2024-02-01, hence it doesn't make it to the final query
  // the only way for this to work is we store the temporal as a plain date with yyyy-mm-dd format
  // await find('querying date range', { date: { $gte: '2024-01-01', $lte: '2024-02-01' } })

  // TODO: benchmark performance & compare with different approaches

  // @ts-ignore
  process.exit(0)
}

main()