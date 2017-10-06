const fetch = require('node-fetch')

const wallet = '1GNDUySAr5qhGXPKyJAFsUmYdrVoCkrgQQ'

let algo = [
  'Scrypt',
  'SHA256',
  'ScryptNf',
  'X11',
  'X13',
  'Keccak',
  'X15',
  'Nist5',
  'NeoScrypt',
  'Lyra2RE',
  'WhirlpoolX',
  'Qubit',
  'Quark',
  'Axiom',
  'Lyra2REv2',
  'ScryptJaneNf16',
  'Blake256r8',
  'Blake256r14',
  'Blake256r8vnl',
  'Hodl',
  'DaggerHashimoto',
  'Decred',
  'CryptoNight',
  'Lbry',
  'Equihash',
  'Pascal',
  'X11Gost',
  'Sia',
  'Blake2s',
  'Skunk'
]

let currentStats = [],
  workers = [],
  delayTime = 0,
  intervalTime = 10000,
  worker = [],
  tempworker = [],
  tempAttachments = [],
  attachments = [],
  unpaidBalance = [],
  tempProfitability = []

let exchange = {
    usd: 0,
    myr: 0
  },
  balance = {
    usd: 0,
    myr: 0,
    btc: 0
  },
  profitability = {
    usd: 0,
    myr: 0,
    btc: 0
  }

let removeDuplicates = (arr, key) => {
  if (!(arr instanceof Array) || key && typeof key !== 'string') {
    return false
  }

  if (key && typeof key === 'string') {
    return arr.filter((obj, index, arr) => {
      return arr.map(mapObj => mapObj[key]).indexOf(obj[key]) === index
    })
  } else {
    return arr.filter(function (item, index, arr) {
      return arr.indexOf(item) == index
    })
  }
}

let sum = (a, b) => {
  return a + b
}

fetch('https://api.nicehash.com/api?method=stats.provider.ex&addr=1GNDUySAr5qhGXPKyJAFsUmYdrVoCkrgQQ')
  .then(res => {
    return res.json()
  })
  .then(res => {
    return res.result.current.map(item => {
      if (item.data[0].a !== undefined) {
        if (Number(item.data[0].a) > 0) {
          unpaidBalance.push(Number(item.data[1]))
          return currentStats.push(item)
        }
      }
    })
  })
  .then(() => {
    // get current BTC price
    return fetch('http://api.coindesk.com/v1/bpi/currentprice/MYR.json')
  })
  .then(res => res.json())
  .then(res => {
    // get balance to USD
    exchange.usd = Number(res.bpi.USD.rate.split(',').join('')).toFixed(2)
    // get balance in MYR
    exchange.myr = Number(res.bpi.MYR.rate.split(',').join('')).toFixed(2)
    return balance.btc = unpaidBalance.reduce(sum, 0)
  })
  .then(() => {
    currentStats.map((item, index) => {
      setTimeout(() => {
        fetch('https://api.nicehash.com/api?method=stats.provider.workers&addr=1GNDUySAr5qhGXPKyJAFsUmYdrVoCkrgQQ&algo=' + item.algo)
          .then(res => res.json())
          .then(res => {
            workers.push(res.result)
          })
      }, index * intervalTime)
    })
    return delayTime = (currentStats.length - 1) * intervalTime
  })
  .then(() => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('delayed')
      }, delayTime + 1000)
    })
  })
  .then(() => {
    return workers.map(item => {
      return item.workers.map(inner => {
        return tempworker.push({
          name: inner[0],
          data: []
        })
      })
    })
  })
  .then(() => {
    worker = removeDuplicates(tempworker, 'name')
  })
  .then(() => {
    let rig = worker.filter(item => item.name === '1060')

    if (rig.length == 0) {
      var arr = ['', '', '']

      return arr.map(() => {
        fetch('https://hooks.slack.com/services/XXX/XXX/XXXXXXXXXXXXXXXXXX', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: 'WARNING',
            icon_emoji: ':warning:',
            text: '<@USER.ID> 1060 NOT RUNNING'
          })
        })
      })
    }
  })
  .then(() => {
    return workers.map(item => {
      return item.workers.map(inner => {
        return worker.map((machine, index) => {
          if (machine.name === inner[0]) {
            worker[index].data.push({
              algo: algo[item.algo],
              speed: inner[1].a,
              elapsedTime: inner[2]
            })
          }
        })
      })
    })
  })
  .then(() => {
    balance.btc = Number(unpaidBalance.reduce(sum, 0))
    balance.usd = (balance.btc * Number(exchange.usd)).toFixed(2)
    balance.myr = (balance.btc * Number(exchange.myr)).toFixed(2)

    return attachments.push({
      color: '#1F2124',
      fields: [
        {
          title: 'Global BTC Rate',
          value: 'USD: ' + exchange.usd + '\n MYR: ' + exchange.myr,
          short: true
        },
        {
          title: 'Balance',
          value: 'USD: ' + balance.usd + '\n MYR: ' + balance.myr,
          short: true
        }
      ]
    })
  })
  .then(() => {
    let color = '#383A3F'

    return worker.map(item => {
      if (item.name === '1070') {
        color = '#F6B352'
      }
      if (item.name === '1060') {
        color = '#F68657'
      }

      return item.data.map(data => {
        return tempAttachments.push({
          color: color,
          author_name: item.name,
          fields: []
        })
      })
    })
  })
  .then(() => {
    return removeDuplicates(tempAttachments, 'author_name').map(item => {
      attachments.push(item)
    })
  })
  .then(() => {
    return worker.map(item => {
      return item.data.map(data => {
        return attachments.map((attachment, index) => {
          if (item.name === attachment.author_name) {
            attachments[index].fields.push({
              title: data.algo,
              value: 'speed: ' + data.speed + '\n uptime: ' + data.elapsedTime,
              short: true
            })
          }
        })
      })
    })
  })
  .then(() => {
    return slackMessage = {
      username: 'nicehash bot',
      icon_emoji: ':smiley:',
      text: 'workers: ' + worker.length,
      attachments: attachments
    }
  })
  .then(res => {
    return fetch('https://hooks.slack.com/services/XXX/XXX/XXXXXXXXXXXXXXXXXX', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(res)
    })
  })
  .catch(err => {
    console.log(err)
  })
