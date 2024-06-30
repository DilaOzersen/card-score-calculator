import PouchDB from 'pouchdb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct the path to PouchDB database
const db = new PouchDB(path.join(__dirname, 'cards'));

async function clearDatabase() {
    try {
        console.log('Clearing database...');
        const result = await db.allDocs();
        for (const row of result.rows) {
            await db.remove(row.id, row.value.rev);
            console.log(`Removed doc: ${row.id}`);
        }
        console.log('Database cleared');
    } catch (error) {
        console.error('Error clearing database:', error);
    }
}

async function populateDatabase() {
    try {
        const filePath = path.join(__dirname, 'cards.json');
        console.log(`Reading file from ${filePath}`);
        fs.readFile(filePath, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading cards.json:', err);
                return;
            }

            console.log('File read successfully');
            const cards = JSON.parse(data).cards;
            console.log(`Read ${cards.length} cards from cards.json`);
            for (const card of cards) {
                try {
                    await db.put({
                        _id: new Date().toISOString() + '-' + card.id,
                        ...card
                    });
                    console.log(`Inserted card: ${card.name}`);
                } catch (error) {
                    console.error('Error inserting card:', error);
                }
            }
            console.log('Initial data loaded into PouchDB');
            verifyData(); // Call verification after population
        });
    } catch (error) {
        console.error('Error populating database:', error);
    }
}

async function verifyData() {
    try {
        const result = await db.allDocs({ include_docs: true });
        console.log('Loaded cards:', JSON.stringify(result.rows.map(row => row.doc)));
    } catch (error) {
        console.error('Error retrieving cards from database:', error);
    }
}

async function initializeDatabase() {
    try {
        await clearDatabase();
        await populateDatabase();
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

initializeDatabase().then(() => {
    console.log('Database initialization complete');
}).catch(err => {
    console.error('Error initializing database:', err);
});
