require('dotenv').config();
const { MongoClient } = require('mongodb');
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

let db;

// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the current directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to serve config.json
app.get('/config.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'config.json'));
});

// Endpoint to save data
app.post('/save', async (req, res) => {
    const { data } = req.body;
    if (!data) {
        return res.status(400).send('No data received.');
    }

    try {
        const resultsCollection = db.collection('results');
        const header = "Sub,Trial,Condition,Condition_Response_1_or_2,Confidence_1_100,Page_Entry_Time,Bar_Choice_Time,Page_Submit_Time,Test_Condition,Risk_Condition,Risky_Option_Amount,Safe_Option_Amount,EV_Condition";
        const keys = header.split(',');
        
        // Split data by newlines and filter out empty lines
        const rows = data.split('\n').filter(row => row.trim() !== '');
        const entries = rows.map(row => {
            const values = row.split(',');
            const entry = {};
            keys.forEach((key, index) => {
                entry[key] = values[index];
            });
            return entry;
        });

        console.log('Inserting entries:', entries);

        await resultsCollection.insertMany(entries);
        res.status(200).send('Data saved successfully.');
    } catch (err) {
        console.error('Error writing to database:', err);
        return res.status(500).send('Error saving data.');
    }
});

async function connectToDb() {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in your .env file');
    }
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db('risk_survey'); // You can name your database here
}

connectToDb().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log(`To run the experiment, open http://localhost:${port} in your browser.`);
    });
}).catch(err => {
    console.error('Failed to connect to the database', err);
    process.exit(1);
}); 