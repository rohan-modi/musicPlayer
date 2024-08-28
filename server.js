const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
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

// app.post('/start-simulation', async (req, res) => {
//     console.log("Starting simulation");
//     const browser = await puppeteer.launch();
//     console.log("Step 1");
//     const page = await browser.newPage();
//     console.log("Step 2");
//     await page.goto('https://example.com');
//     console.log("Step 3");
//     await page.waitForTimeout(1000);
//     console.log("Step 4");
//     await browser.close();
//     console.log("Step 5");
// });

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.post('/start-simulation', async (req, res) => {
    console.log("Starting simulation");

    let browser;
    try {
        // Launch a new browser instance
        browser = await puppeteer.launch({ headless: false });
        console.log("Launched");
        const page = await browser.newPage();
        
        // Navigate to a URL
        await page.goto('https://www.youtube.com/');
        
        await delay(500000);
        
        res.send('Simulation completed');
        console.log("Went to page");
    } catch (error) {
        console.error('Error during simulation:', error);
        res.status(500).send('Error during simulation');
    } finally {
        // Ensure the browser is closed
        if (browser) {
            await browser.close();
        }
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});