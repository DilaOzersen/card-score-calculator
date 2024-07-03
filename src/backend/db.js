import PouchDB from 'pouchdb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = new PouchDB(path.join(__dirname, 'cards'));

async function deleteAndRecreateDatabase() {
    try {
        await db.destroy();

        // Recreate the database
        db = new PouchDB(path.join(__dirname, 'cards'));
        console.log('Database recreated');
    } catch (error) {
        console.error('Error deleting database:', error);
    }
}

async function populateDatabase() {
    try {
        const filePath = path.join(__dirname, 'cards.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(data);
        const cards = jsonData.cards;

        const docs = cards.map(card => ({
            _id: new Date().toISOString() + '-' + card.id,
            ...card
        }));

        await db.bulkDocs(docs);
        verifyData();
    } catch (error) {
        console.error('Error populating database:', error);
    }
}

async function verifyData() {
    try {
        const result = await db.allDocs({ include_docs: true });
        const docs = result.rows.map(row => row.doc);
    } catch (error) {
        console.error('Error retrieving cards from database:', error);
    }
}

async function initializeDatabase() {
    try {
        await deleteAndRecreateDatabase();
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