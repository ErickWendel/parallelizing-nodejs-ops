import { getPostgresConnection } from './db.js'
const db = await getPostgresConnection()

// console.log(`process ${process.pid} started.`);

process.on('message', (items) => {
    // console.log(` ${process.pid} received ${items.length} items`,);
    db.students.insertMany(items)
        .then(() => {
            process.send(items.length);
        })
        .catch((error) => {
            console.error(error);
        });
});
