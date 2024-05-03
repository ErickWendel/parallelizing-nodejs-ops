import { initialize } from "./cluster.js"
import { getMongoConnection, getPostgresConnection } from './db.js'
import cliProgress from 'cli-progress'
import os from 'os';

const mongoDB = await getMongoConnection()
const postgresDB = await getPostgresConnection()
// const ITEMS_PER_PAGE = 4000
const CLUSTER_SIZE = os.cpus().length
const TASK_FILE = new URL('./background-task.js', import.meta.url).pathname
const DATA_STREAMING_FILE = new URL('./data-streaming.js', import.meta.url).pathname

// console.log(`there was ${await postgresDB.students.count()} items on Postgres, deleting all...`)
await postgresDB.students.deleteAll()

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
        async onMessage(cumulativeProcessed) {
            totalProcessed += cumulativeProcessed;
            progress.update(totalProcessed);

            if (totalProcessed !== total) return
            // console.log(`all ${amountToBeProcessed} processed! Exiting...`)
            progress.stop()
            cp.killAll()

            const insertedOnSQLPostGres = await postgresDB.students.count()
            console.log(`total on MongoDB ${total} and total on PostGres ${insertedOnSQLPostGres}`)
            console.log(`are the same? ${total === insertedOnSQLPostGres ? 'yes' : 'no'}`)
            process.exit()
        }
    }
)

initialize(
    {
        backgroundTaskFile: DATA_STREAMING_FILE,
        clusterSize: 1,
        async onMessage(message) {
            cp.sendToChild(message)
        }
    }
)
