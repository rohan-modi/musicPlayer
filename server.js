const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const { start } = require('repl');
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

app.post('/start-simulation', async (req, res) => {
    console.log("Starting simulation");

    let browser;
    try {
        // Launch a new browser instance
        browser = await puppeteer.launch({ 
            headless: false,
            args: ['--window-size=1200,800']
        });
        console.log("Launched");
        const page = await browser.newPage();

        await page.setViewport({ width: 1200, height: 800 });

        await page.goto('https://www.youtube.com/');
        console.log("Went to youtube");
        
        var newSongs = await page.evaluate(() => {

            return new Promise((resolve) => {
                let data = {
                    videoIDs: [],
                    songNames: [],
                    artists: []
                };

                function extractVideoID(url) {
                    if (url.slice(0, 24) == 'https://www.youtube.com/') {
                        if (url.includes('v')) {
                            var startIndex = url.indexOf('v=') + 2;
                            var videoID = url.slice(startIndex);
                            if (url.includes('&')) {
                                var endIndex = url.indexOf('&');
                                videoID = url.slice(startIndex, endIndex);
                            }
                            return videoID;
                        }
                    }
                }

                function handleKeyDown(event) {
                    if (event.metaKey && event.shiftKey && event.key === 's') {
                        var url = window.location.href;
                        console.log("The current url is", url);
                        console.log('The video id is', extractVideoID(url));
                        var videoID = extractVideoID(url);
                        var songName = prompt("What is the song name");
                        var artist = prompt("What is the name of the artist");

                        data.videoIDs.push(videoID);
                        data.songNames.push(songName);
                        data.artists.push(artist);
                    }
                }

                function handleBeforeUnload(event) {
                    event.preventDefault();
                    resolve(data); // Resolve the promise with the data object
                }

                document.addEventListener('keydown', handleKeyDown);
                window.addEventListener('beforeunload', handleBeforeUnload);
            });
        });
        
        res.send('Simulation completed');
        console.log("Went to page");

        console.log(newSongs);

        console.log("Adding new songs, there are", newSongs.artists.length);
        
        updateLibrary(newSongs);

    } catch (error) {
        console.error('Error during simulation:', error);
        res.status(500).send('Error during simulation');
    }
});

async function updateLibrary(newSongs) {
    console.log("In the function and adding", newSongs);
    const filePath = path.join(__dirname, 'public/songs.json');

    try {
        await fs.access(filePath, fs.constants.R_OK);

        const data = await fs.readFile(filePath, 'utf8');

        let jsonData;
        try {
            jsonData = JSON.parse(data);
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            return;
        }

        console.log("Here is all the json data");
        console.log(jsonData);

        for (let i = 0; i < newSongs.artists.length; i++) {
            console.log("Adding a song");
            const newSong = {
                title: newSongs.songNames[i],
                id: newSongs.videoIDs[i],
                artist: newSongs.artists[i]
            };
            console.log("This is the song", newSong);
            jsonData.songs.push(newSong);
        }

        const updatedJsonString = JSON.stringify(jsonData, null, 2);

        await fs.writeFile(filePath, updatedJsonString, 'utf8');
    } catch (err) {
        console.error("Error:", err.message);
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

