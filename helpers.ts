import { faker } from '@faker-js/faker';

import { PlainDate, NormalDate } from './schemas';

export async function seedDBPlainDate() {
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

export async function seedDBNormalDate() {
  const dataCount = 5_000_000

  const count = await NormalDate.estimatedDocumentCount()
  if (count >= dataCount) {
    console.log('DB already seeded')
    return
  }

  for (let i = 0; i < dataCount; i += 1) {
    const date = faker.date.between({ from: '2018-01-01T00:00:00', to: '2025-01-01T00:00:00' })
    await NormalDate.create({ date })

    if (i % 1000 === 0) {
      console.log(`Seeded ${i} records`)
    }
  }

  console.log('DB seeded!')
}