const express = require('express');
const path = require('path');
const fs = require('fs').promises;

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
    const filePath = path.join(__dirname, 'public/playlists', newFileName);

    console.log("Filepath:", filePath);

    fs.writeFile(filePath, jsonData, (err) => {
        if (err) {
            return res.status(500).send('Error writing file');
        }
        res.send('JSON file has been created or updated successfully.');
    });
});

app.get('/list-files', async (req, res) => {
    const directoryPath = path.join(__dirname, 'public/playlists');

    try {
        const files = await fs.readdir(directoryPath);
        // Log the files for debugging
        console.log('Files in directory:', files);
        // Return the list of file names
        res.json(files);
    } catch (err) {
        console.error('Error reading directory:', err); // Log the error for debugging
        res.status(500).send('Error reading directory');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});