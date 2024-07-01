import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import PouchDB from 'pouchdb';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize PouchDB databases
const cardsDB = new PouchDB(path.join(__dirname, 'cards'));
const usersDB = new PouchDB(path.join(__dirname, 'users'));

// Middleware to parse JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// API endpoint to get cards data
app.get('/api/cards', async (req, res) => {
    try {
        const result = await cardsDB.allDocs({ include_docs: true });
        const cards = result.rows.map(row => row.doc);
        res.json({ cards });
    } catch (err) {
        res.status(500).send('Error retrieving cards data');
    }
});

// API endpoint for user registration
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await usersDB.get(username).catch(err => null);
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await usersDB.put({
            _id: username,
            password: hashedPassword,
            inventory: [],
            teams: [
                [],
                [],
                []
            ]
        });
        res.status(201).send('User registered successfully');
    } catch (err) {
        res.status(500).send('Error registering user');
    }
});

// API endpoint for user login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await usersDB.get(username).catch(err => null);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send('Invalid username or password');
        }

        res.status(200).send('Login successful');
    } catch (err) {
        res.status(500).send('Error logging in');
    }
});

// API endpoint to get user data
app.get('/api/user/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const user = await usersDB.get(username).catch(err => null);
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.json(user);
    } catch (err) {
        res.status(500).send('Error retrieving user data');
    }
});

// API endpoint to update user data
app.put('/api/user/:username', async (req, res) => {
    const { username } = req.params;
    const updatedUser = req.body;
    try {
        const user = await usersDB.get(username).catch(err => null);
        if (!user) {
            return res.status(404).send('User not found');
        }

        await usersDB.put({
            ...user,
            ...updatedUser,
            _rev: user._rev
        });

        res.json(updatedUser);
    } catch (err) {
        res.status(500).send('Error updating user data');
    }
});

// default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
