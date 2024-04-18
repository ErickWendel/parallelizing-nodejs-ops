import { getPostgresConnection } from './db.js'
const db = await getPostgresConnection()

// console.log(`process ${process.pid} started.`);

process.on('message', (items) => {
    // console.log(` ${process.pid} received ${items.length} items`,);
    for (const item of items) {
        db.students.insert(item)
            .then(() => {
                process.send('item-done');
            })
            .catch((error) => {
                console.error(error);
            });
    }
});
