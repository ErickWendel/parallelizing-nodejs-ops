import { faker } from '@faker-js/faker';
import { getMongoConnection, getPostgresConnection } from './db.js'

async function seedMongoDB(amount) {
    const { students, client } = await getMongoConnection()
    console.log('deleting all students')
    await students.deleteMany({})
    let person = []
    console.log(`inserting ${amount} students`)

    for (let i = 0; i < amount; i++) {

        person.push({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            age: faker.number.int(18, 60),
            registeredAt: faker.date.past(),
        })
    }

    await students.insertMany(person)

    console.log('done inserting!')
    await client.close()
}

async function seedPostegres() {
    const db = await getPostgresConnection()
    console.log('creating table students')
    await db.students.createTable()
    console.log('table students created with success')
    await db.client.end()
}
await seedMongoDB(1_000_000)
await seedPostegres()
