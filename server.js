const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to save JSON data
app.post('/save-json', (req, res) => {
    const jsonData = JSON.stringify(req.body.data, null, 2);
    const newFileName = req.body.fileName;

    fs.writeFile(newFileName, jsonData, (err) => {
        if (err) {
            return res.status(500).send('Error writing file');
        }

        res.send('JSON file has been created or updated successfully.');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});