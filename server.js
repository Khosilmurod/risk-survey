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

// Function to properly parse CSV row (handles quoted fields)
function parseCSVRow(row) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < row.length) {
        const char = row[i];
        const nextChar = row[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i += 2;
            } else {
                // Start or end quotes
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current);
            current = '';
            i++;
        } else {
            current += char;
            i++;
        }
    }
    
    result.push(current); // Add last field
    return result;
}

// Endpoint to save data
app.post('/save', async (req, res) => {
    const { data } = req.body;
    if (!data) {
        return res.status(400).send('No data received.');
    }

    try {
        const resultsCollection = db.collection('results');
        const header = "participant_id,trial_number,bar_size_condition,choice,confidence,risk_probability,risk_reward,safe_probability,safe_reward,risk_position,safe_position,ev,bar_choice_time,confidence_choice_time,trial_id";
        const keys = header.split(',');
        
        // Split data by newlines and filter out empty lines
        const rows = data.split('\n').filter(row => row.trim() !== '');
        const entries = rows.map((row, index) => {
            try {
                const values = parseCSVRow(row);
                
                if (values.length !== keys.length) {
                    console.warn(`Row ${index + 1} has ${values.length} values but expected ${keys.length}`);
                    console.warn(`Row data: ${row}`);
                }
                
                const entry = {};
                keys.forEach((key, keyIndex) => {
                    const value = values[keyIndex];
                    // Convert numeric fields
                    if (['trial_number', 'confidence', 'risk_probability', 'risk_reward', 'safe_reward', 'safe_probability', 'bar_choice_time', 'confidence_choice_time', 'trial_id'].includes(key)) {
                        // Handle 'null' strings and convert to actual null
                        if (value === 'null' || value === '' || value === undefined) {
                            entry[key] = null;
                        } else {
                            entry[key] = parseFloat(value);
                        }
                    } else {
                        entry[key] = value || '';
                    }
                });
                
                // Add timestamp
                entry.timestamp = new Date();
                
                return entry;
            } catch (parseError) {
                console.error(`Error parsing row ${index + 1}:`, parseError);
                console.error(`Problematic row: ${row}`);
                throw parseError;
            }
        });

        console.log(`Inserting ${entries.length} entries to database`);
        console.log('Sample entry:', entries[0]);

        if (entries.length > 0) {
            await resultsCollection.insertMany(entries);
        }
        
        res.status(200).send(`Data saved successfully. ${entries.length} entries processed.`);
    } catch (err) {
        console.error('Error saving data to database:', err);
        return res.status(500).send(`Error saving data: ${err.message}`);
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