import PouchDB from 'pouchdb';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersDB = new PouchDB(path.join(__dirname, 'users'));

// purges the user database
async function purgeUsersDB() {
    try {
        const allDocs = await usersDB.allDocs();
        const deletePromises = allDocs.rows.map(row => {
            return usersDB.remove(row.id, row.value.rev);
        });
        await Promise.all(deletePromises);
        console.log('All user documents have been purged.');
    } catch (err) {
        console.error('Error purging user database:', err);
    }
}

purgeUsersDB();
