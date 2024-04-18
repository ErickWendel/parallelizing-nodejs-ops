import { initialize } from "./cluster.js"
import { getMongoConnection, getPostgresConnection } from './db.js'
import cliProgress from 'cli-progress'
import { setTimeout } from 'node:timers/promises'
const mongoDB = await getMongoConnection()
const postgresDB = await getPostgresConnection()
const ITEMS_PER_PAGE = 4000
const CLUSTER_SIZE = 99
const TASK_FILE = new URL('./background-task.js', import.meta.url).pathname

// console.log(`there was ${await postgresDB.students.count()} items on Postgres, deleting all...`)
await postgresDB.students.deleteAll()

async function* getAllPagedData(itemsPerPage, page = 0) {

    const data = mongoDB.students.find().skip(page).limit(itemsPerPage)
    const items = await data.toArray()
    if (!items.length) return

    yield items

    yield* getAllPagedData(itemsPerPage, page += itemsPerPage)
}

const total = await mongoDB.students.countDocuments()
// console.log(`total items on DB: ${total}`)

const progress = new cliProgress.SingleBar({
    format: 'progress [{bar}] {percentage}% | {value}/{total} | {duration}s',
    clearOnComplete: false,
}, cliProgress.Presets.shades_classic);

progress.start(total, 0);
let totalProcessed = 0
const cp = initialize(
    {
        backgroundTaskFile: TASK_FILE,
        clusterSize: CLUSTER_SIZE,
        amountToBeProcessed: total,
        async onMessage(message) {
            progress.increment()

            if (++totalProcessed !== total) return
            // console.log(`all ${amountToBeProcessed} processed! Exiting...`)
            progress.stop()
            cp.killAll()

            const insertedOnSQLite = await postgresDB.students.count()
            console.log(`total on MongoDB ${total} and total on PostGres ${insertedOnSQLite}`)
            console.log(`are the same? ${total === insertedOnSQLite ? 'yes' : 'no'}`)
            process.exit()

        }
    }
)
await setTimeout(1000)

for await (const data of getAllPagedData(ITEMS_PER_PAGE)) {
    cp.sendToChild(data)
}

