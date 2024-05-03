import { StreamCache } from './stram-cache.js'
import { getMongoConnection } from './db.js'

const ITEMS_PER_PAGE = 4000

const mongoDB = await getMongoConnection()
const stream = mongoDB.students.find().stream()
const cache = new StreamCache(stream, ITEMS_PER_PAGE)

cache.stream().on('data', (data) => {
    process.send(JSON.parse(data));
});
