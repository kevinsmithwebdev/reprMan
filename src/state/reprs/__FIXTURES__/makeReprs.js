const moment = require('moment')
const fs = require('fs')
const preData = require('./preData')

const MAX_DAYS_AGO = 45
const MAX_PRACTICED = 10

const FILENAME = 'generatedReprs.json'

const randomFloatInRange = (max, min = 0) => Math.random() * (max - min) + min
const randomIntInRange = (max, min = 0) =>
  Math.floor(Math.random() * (max - min) + min)

const now = moment()

const newData = preData.map((d, idx) => {
  const daysAgo = randomFloatInRange(MAX_DAYS_AGO)

  const dateCreated = now.subtract(daysAgo, 'days').utc().valueOf()

  const numPracticed = randomIntInRange(MAX_PRACTICED)

  const datesPracticed = new Array(numPracticed).fill(null).map(() => {
    const daysAgoThisPracticed = randomFloatInRange(daysAgo - 0.01, 0.01)
    return now.subtract(daysAgoThisPracticed, 'days').utc().valueOf()
  })

  return {
    ...d,
    id: `id-${idx}`,
    dateCreated,
    datesPracticed,
  }
})

fs.writeFile(FILENAME, JSON.stringify(newData, null, 2), (err) => {
  if (err) {
    console.error(err)
  } else {
    console.info('Success, written to:', FILENAME)
  }
})
