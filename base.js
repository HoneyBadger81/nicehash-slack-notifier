//donations : 1GNDUySAr5qhGXPKyJAFsUmYdrVoCkrgQQ

const fetch = require('node-fetch');

//change your wallet here
const wallet = '1GNDUySAr5qhGXPKyJAFsUmYdrVoCkrgQQ';

//algorithms
let algorithms = [
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
    'Blake2s'
];

let statsProvider = {
        list: [],
        accepted: []
    }, balance = {
        seperate: [],
        btc: '',
        usd: '',
        myr: ''
    }, exchangeRate = {
        usd: 0,
        myr: 0
    };

let workingAlgo = [],
    numOfWorkers = [],
    slackMessage = {};

function sum(total, num) {
    return total + num;
}

//retrieve data from nicehash api stats.provider
let getStatsProvider = (addr) => {
    return fetch('https://api.nicehash.com/api?method=stats.provider.ex&addr=' + addr)
        .then(res => res.json())
        .then(res => {
            //current overall data
            statsProvider.list = res.result.current;
            res.result.current.map(item => {
                if (Object.keys(item.data[0]).length > 0) {
                    //data with accepted speed(currently mining)
                    statsProvider.accepted.push({
                        speed: item.data[0].a,
                        algo: item.algo,
                        name: algorithms[item.algo]
                    });
                }
            });
            return res.result.stats;
        });
};

//retrieve data from nicehash api stats.provider.worker
let getStatsProviderWorkers = (addr, algo) => {
    return fetch('https://api.nicehash.com/api?method=stats.provider.workers&addr=' + wallet + '&algo=' + algo)
        .then(res => res.json())
        .then(res => {
            var tempWorkers = [];
            var process1 = res.result.workers.map(item => {
                if (item[0] === '') {
                    item[0] = 'unknown';
                }
                if (!item[1].a) {
                    item[1].a = 0;
                }
                if (item[2] === '') {
                    item[2] = 0;
                }
                //push each worker into an array
                tempWorkers.push({
                    workername: item[0],
                    workerspeed: item[1].a,
                    workertime: item[2]
                });
            });

            return Promise.all([process1])
                .then(() => {
                    //push each mining algorithm with workers into array
                    workingAlgo.push({
                        code: res.result.algo,
                        name: algorithms[res.result.algo],
                        workers: tempWorkers
                    });
                });
        });
};

Promise.resolve(getStatsProvider(wallet))
    .then(() => {
        //extract balance from each algo
        statsProvider.list.map(item => {
            balance.seperate.push(JSON.parse(item.data[1]));
        });
        //sum up all seperate balance for total
        balance.btc = balance.seperate.reduce(sum);
    })
    .then(() => {
        //get current exchange rate from BTC to USD directly from nicehash website since there is no website
        return fetch('http://api.coindesk.com/v1/bpi/currentprice/MYR.json')
            .then(res => res.json())
            .then(res => {
                // get balance to USD
                exchangeRate.usd = Number(res.bpi.USD.rate.split(',').join('')).toFixed(2);
                //get balance in MYR
                exchangeRate.myr = Number(res.bpi.MYR.rate.split(',').join('')).toFixed(2);
            });
    }).then(() => {
        //get balance in USD
        balance.usd = 'USD' + (balance.btc * exchangeRate.usd).toFixed(2);
        //get balance in MYR
        balance.myr = 'MYR' + (balance.btc * exchangeRate.myr).toFixed(2);

        var processes = statsProvider.accepted.map(item => {
            return getStatsProviderWorkers(wallet, item.algo);
        });
        return Promise.all(processes)
            .then(() => {
                workingAlgo.map(item => {
                    numOfWorkers.push(item.workers.length);
                });
            });
    }).then(() => {
        //slack incoming webhook message attachments
        let attachments = [];
        workingAlgo.map(item => {
            //construct attachment message {text: <algo-name>: <workername> <speed> <uptime>}
            item.workers.map(single => {
                attachments.push({'text': item.name + ': ' + single.workername + ', speed(' + single.workerspeed + '), uptime(' + single.workertime + ')'});
            });
        });
        //get sum of current mining workers
        let sumOfWorkers = numOfWorkers.reduce(sum);
        //construct full slack message
        return slackMessage = {
            'username': 'nicehash bot',
            'icon_emoji': ':smiley:',
            'text': 'workers: ' + sumOfWorkers + ', Rate: ' + 'USD' + exchangeRate.usd + '/MYR' + exchangeRate.myr + ', Balance: ' + balance.usd + '/' + balance.myr,
            'attachments': attachments
        };
    }).then(() => {
        //output slack message into .json file for php to exec
        fetch('https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXX', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(slackMessage)
        }).then(() => {
            console.log('done!');
        });
    });
