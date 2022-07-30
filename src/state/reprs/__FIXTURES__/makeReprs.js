const moment = require('moment')
const fs = require('fs')
const preData = require('./preData')

const MAX_DAYS_AGO = 60
const MAX_PRACTICED = 20

const FILENAME = 'generatedReprs.json'

const randomFloatInRange = (max, min = 0) => Math.random() * (max - min) + min
const randomIntInRange = (max, min = 0) =>
  Math.floor(Math.random() * (max - min) + min)

const now = moment()

const newData = preData.map((d, idx) => {
  const secondsAgoCreated = randomFloatInRange(MAX_DAYS_AGO) * 24 * 60 * 60

  const dateCreated = now.subtract(secondsAgoCreated, 'seconds').utc().valueOf()

  const numPracticed = randomIntInRange(MAX_PRACTICED)

  const datesPracticed = new Array(numPracticed).fill(null).map(() => {
    const secondsAgoThisPracticed = randomFloatInRange(
      secondsAgoCreated - 10,
      10
    )
    return now.subtract(secondsAgoThisPracticed, 'seconds').utc().valueOf()
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
