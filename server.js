const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Endpoint to save data
app.post('/save', (req, res) => {
    const { data } = req.body;
    if (!data) {
        return res.status(400).send('No data received.');
    }

    const filePath = path.join(__dirname, 'result.csv');
    const header = "Sub,Trial,Condition,Condition Response 1 or 2,Confidence 1-100,Page Entry Time,Bar Choice Time,Page Submit Time,Test Condition,Risk Condition,Risky Option Amount,Safe Option Amount,EV Condition\n";
    
    // Check if file exists and has content. If not, write header.
    const fileExists = fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
    const dataToAppend = fileExists ? '\n' + data : header + data;

    // Append data to the CSV file
    fs.appendFile(filePath, dataToAppend, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).send('Error saving data.');
        }
        res.status(200).send('Data saved successfully.');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`To run the experiment, open http://localhost:${port} in your browser.`);
}); 