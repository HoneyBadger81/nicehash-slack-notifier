const algo = [1, 2, 3]

const delay = (ms = 10000) => new Promise(resolve => setTimeout(resolve, ms))

const fetchJSON = (namespace, data) => fetch(namespace, data).then(res => res.json())

(async () => {
    await Promise.all(
        // algo.map(async a => {
        //     const data = await fetchJSON(a)

        //     await delay()
        // })

        for (let i = 0; i < algo.length; i++) {
            const data = await fetchJSON(a)

            await delay()
        }
    )
})()
