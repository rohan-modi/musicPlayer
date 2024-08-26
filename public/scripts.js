// Global variables and stuff
var songPlayer;
var songIndex = 0;
var shuffled = false;
var shuffledSongs = [];
var loopedInfinitely = false;
var shuffledInfinitely = false;
var playingOutsideQueue = false;
var tempSongIndex;
var currentSong = 0;
var selectingSong = false;

class Song {
    constructor(title, ID, artist) {
        this.title = title;
        this.ID = ID;
        this.artist = artist;
    }

    copy() {
        return new Song(this.title, this.ID, this.artist);
    }
}

let songsData;
let songs = [];
let songNames = [];
const dropdown = document.querySelector(".dropdown");
const searchBar = document.getElementById("inputBox");

searchBar.onkeyup = function() {
    let result = [];
    let userInput = searchBar.value;
    if (userInput.length > 0) {
        result = songNames.filter((keyword)=>{
            return keyword.toLowerCase().includes(userInput.toLowerCase());
        });
    }
    displayDropdown(result);

    if (result.length == 0) {
        dropdown.innerHTML = '';
    }
}

searchBar.onkeydown = function(event) {
    if (event.key === 'Escape') {
        searchBar.blur();
    }
};

searchBar.addEventListener('blur', function() {
    if (selectingSong == false) {
        dropdown.innerHTML = '';
    }
});

fetch('./songs.json')
  .then(response => response.json())
  .then(data => {
    songsData = data;
    songsJSON = songsData.songs;
    numberOfSongs = songsJSON.length;
    console.log("The number of songs is", numberOfSongs)
    for (let i = 0; i < numberOfSongs; i++) {
        tempSong = songsJSON[i];
        songObject = new Song(tempSong.title, tempSong.id, tempSong.artist);
        songs[i] = songObject;
    }
    loadStuff()
  })
  .catch(error => {
    console.error('Error loading JSON:', error);
  });

dropdown.addEventListener('mouseover', function() {
    selectingSong = true;
});

dropdown.addEventListener('mouseout', function() {
    console.log("Went out");
    selectingSong = false;
});

document.addEventListener('DOMContentLoaded', function(event) {
    event.preventDefault();
    console.log("This happened");
    document.querySelector('body').style.opacity = 0;
    document.querySelector('body').style.opacity = 1;
})

let queuedSongs = [];

function savePlaylist() {
    playlistName = prompt("Name your playlist");
    return fetch("./" + playlistName + ".json")
        .then(response => {
            if (response.ok) {
                console.log("It exists");
                saveQueue(true, playlistName);
                return true;
            } else {
                console.log("It doth not exist");
                saveQueue(true, playlistName);
                return false;
            }
        });
}

function saveQueue(newFile, fileName) {
    fetch('http://localhost:3000/save-json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fileName: fileName + ".json",
            data: {
                name: "Signmund",
                modelType: "Neural Network",
                frameworks: ["PyTorch", "TensorFlow", "Keras"],
                architectures: ["ResNet", "MobileNet", "EfficientNet"]
            }
        })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function handleFocus(event) {
    const parentDiv = event.target.closest('.row');
    if (parentDiv) {
        parentDiv.classList.add('outline');
    }
}

function handleBlur(event) {
    const parentDiv = event.target.closest('.row');
    if (parentDiv) {
        parentDiv.classList.remove('outline');
    }
}

document.querySelectorAll('.row input').forEach(input => {
    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);
});

function playSong(whichSong) {
    songPlayer.loadVideoById(whichSong.ID);
}

function displayDropdown(results) {
    const content = results.map((list)=>{
        return "<li onclick=selectInput(this)>" + list + "</li>";
    });
    dropdown.innerHTML = "<ul>" + content.join("") + "</ul>";
}

function selectInput(chosenSong) {
    console.log("The inner stuff is:", chosenSong.innerHTML);
    searchBar.value = chosenSong.innerHTML;
    dropdown.innerHTML = '';
}

function giveSongNumber(songNameAndArtist) {
    for (let i = 0; i < songs.length; i++) {
        if (songNameAndArtist == songs[i].title + " - " + songs[i].artist) {
            return i;
        }
    }
}

function playAllSongs() {
    songIndex = 0;
    shuffled = false;
    playSong(songs[0]);
    queuedSongs.length = 0;
    for (let i = 0; i < songs.length; i++) {
        let newCopy = songs[i].copy();
        queuedSongs.push(newCopy);
    }
    printString();
}

function playSearched() {
    var userInput = searchBar.value;
    var songNumber = giveSongNumber(userInput);

    songPlayer.stopVideo();
    playSong(songs[songNumber]);
    playingOutsideQueue = true;
    tempSongIndex = songIndex;
    songIndex = integerButtonID;
}

function queueSearchedNext() {
    var userInput = searchBar.value;
    var songNumber = giveSongNumber(userInput);
    let newSong = songs[songNumber].copy();

    addSongToQueue(newSong, true, true);
    printString();
}

function queueSearchedLast() {
    var userInput = searchBar.value;
    var songNumber = giveSongNumber(userInput);
    let newSong = songs[songNumber].copy();

    addSongToQueue(newSong, true, false);
    printString();
}

function nextSong() {
    songPlayer.stopVideo();
    if (playingOutsideQueue) {
        playingOutsideQueue = false;
        songIndex = tempSongIndex;
        songIndex--;
    }
    songIndex++;
    if (songIndex >= queuedSongs.length) {
        if (shuffledInfinitely) {
            shuffleSongs();
        }
        songIndex = 0;
    }
    playSong(queuedSongs[songIndex]);
}

function previousSong() {
    songPlayer.stopVideo();
    if (playingOutsideQueue) {
        playingOutsideQueue = false;
        songIndex = tempSongIndex;
        songIndex++;
    }
    songIndex--;
    if (songIndex < 0) {
        songIndex = queuedSongs.length-1;
    }
    playSong(queuedSongs[songIndex]);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomOrderNumbers() {
    const numbers = Array.from({ length: songs.length }, (_, index) => index);
    return shuffleArray(numbers);
}

function shuffleSongs() {
    songIndex = 0;
    shuffled = true;
    shuffledSongs = getRandomOrderNumbers();
    queuedSongs.length = 0;
    for (let i = 0; i < shuffledSongs.length; i++) {
        let newCopy = songs[shuffledSongs[i]].copy();
        queuedSongs.push(newCopy);
    }
    playSong(queuedSongs[0]);
    updateQueueStat();
    printString();
}

function addSongToQueue(song, extendList, next) {
    if (next) {
        queueIndex = songIndex + 1;
    } else {
        queueIndex = queuedSongs.length;
    }
    if (extendList) {
        queuedSongs.splice(queueIndex, 0, song);
    }
    var queueList = document.getElementById('QueueTable');
    listItem = document.createElement('li');
    listItem.textContent = song.title + " - " + song.artist;
    listItem.draggable = true;

    var imageContainer = document.getElementById("ImageTable");
    var barImage = document.createElement('img');
    barImage.src = "./bars.png";
    barImage.style.width = '30px';
    barImage.style.height = '14px';
    var newRow = document.createElement('li');
    newRow.appendChild(barImage);
    imageContainer.appendChild(newRow);

    var currentListElement =  queueList.getElementsByTagName('li')[queueIndex];
    queueList.insertBefore(listItem, currentListElement);

    var removeSongButtonContainer = document.getElementById('QueueTableRemovers');
    var removeSongButton = document.createElement('Button');
    var newButtonRow = document.createElement('li');
    var xImage = document.createElement('img');
    xImage.src = './xButton.png';
    xImage.style.height = '14px';
    xImage.style.width = '14px';
    removeSongButton.append(xImage);
    removeSongButton.id = "Remover" + (queuedSongs.length-1).toString();
    removeSongButton.addEventListener("click", removeSongFromQueue);
    removeSongButton.style.height = '10px';
    removeSongButton.style.padding = 0;
    removeSongButton.style.paddingLeft = '5px';
    removeSongButton.style.margin = 0;

    newButtonRow.appendChild(removeSongButton);
    removeSongButtonContainer.appendChild(newButtonRow);

    updateQueueStat();
}

function printString() {
    if (queuedSongs.length == 0) {
        return;
    }
    var queueList = document.getElementById('QueueTable');
    var difference = queueList.getElementsByTagName("li").length - queuedSongs.length;
    console.log("Difference:", difference, queueList.getElementsByTagName("li").length, queuedSongs.length);
    if (difference > 0) {
        for (let i = 0; i < difference; i++) {
            console.log("Removed a song", difference, queueList.getElementsByTagName("li").length, queuedSongs.length);
            var column1 = document.getElementById('ImageTable');
            var column2 = document.getElementById('QueueTable');
            var column3 = document.getElementById('QueueTableRemovers');

            column1.removeChild(column1.getElementsByTagName("li")[0]);
            column2.removeChild(column2.getElementsByTagName("li")[0]);
            column3.removeChild(column3.getElementsByTagName("li")[0]);

            for (let j = 0; j < queuedSongs.length; j++) {
                column3.getElementsByTagName("li")[j].children[0].id = "temp" + j.toString();
            }
            for (let j = 0; j < queuedSongs.length; j++) {
                column3.getElementsByTagName("li")[j].children[0].id = "Remover" + j.toString();
            }
        }
    }
    for (let i = 0; i < queuedSongs.length; i++) {
        if (i >= queueList.getElementsByTagName("li").length) {
            addSongToQueue(queuedSongs[i], false, true);
        } else {
            queueList.getElementsByTagName("li")[i].textContent = queuedSongs[i].title + " - " + queuedSongs[i].artist;
        }

        if (i == songIndex && !playingOutsideQueue) {
            queueList.getElementsByTagName("li")[i].style.color = "red";
        } else {
            queueList.getElementsByTagName("li")[i].style.color = "rgb(30, 215, 96)";
        }
    }
    updateRemainingSongsStat();
    updateLibraryStat();
    var nextSongText = document.getElementById('NextSongInQueue');
    nextSongText.textContent = "Next Song: " + queuedSongs[songIndex+1].title + " - " + queuedSongs[songIndex+1].artist;
    var currentSongText = document.getElementById('CurrentSong');
    currentSongText.textContent = "Current Song: " + queuedSongs[songIndex].title + " - " + queuedSongs[songIndex].artist;
}

function removeSongFromQueue(event) {
    const clickedButton = event.currentTarget;
    const buttonID = clickedButton.id;
    var buttonSubString = buttonID.substring(7);
    var buttonIDNumber = parseInt(buttonSubString);

    var column1 = document.getElementById('ImageTable');
    var column2 = document.getElementById('QueueTable');
    var column3 = document.getElementById('QueueTableRemovers');

    column1.removeChild(column1.getElementsByTagName("li")[buttonIDNumber]);
    column2.removeChild(column2.getElementsByTagName("li")[buttonIDNumber]);
    column3.removeChild(column3.getElementsByTagName("li")[buttonIDNumber]);

    queuedSongs.splice(buttonIDNumber, 1);

    for (let i = 0; i < queuedSongs.length; i++) {
        column3.getElementsByTagName("li")[i].children[0].id = "temp" + i.toString();
    }
    for (let i = 0; i < queuedSongs.length; i++) {
        column3.getElementsByTagName("li")[i].children[0].id = "Remover" + i.toString();
    }

    if (buttonIDNumber < songIndex) {
        songIndex--;
    } else if (buttonIDNumber == songIndex) {
        songIndex--;
        nextSong();
    }
    updateQueueStat();
    printString();
}

function fillQueueTable() {
    var queueList = document.getElementById('QueueTable');
    queueList.innerHTML = '';
    for (let i = 0; i < queuedSongs.length; i++) {
        listItem = document.createElement('li');
        listItem.textContent = songs[i].title + " - " + songs[i].artist;
        if (i == songIndex) {
            listItem.style.color = "red";
        } else {
            listItem.style.color = "rgb(30, 215, 96)";
        }
        listItem.draggable = true;

        var imageContainer = document.getElementById("ImageTable");
        var imageListItem = document.createElement('li');
        var barImage = document.createElement('img');
        barImage.src = "./bars.png";
        barImage.style.width = '30px';
        barImage.style.height = '14px';
        imageListItem.appendChild(barImage);
        imageContainer.appendChild(imageListItem);

        var removeSongButtonContainer = document.getElementById('QueueTableRemovers');
        var removeSongButton = document.createElement('Button');
        var newButtonRow = document.createElement('li');
        var xImage = document.createElement('img');
        xImage.src = './xButton.png';
        xImage.style.height = '14px';
        xImage.style.width = '14px';
        removeSongButton.append(xImage);
        removeSongButton.id = "Remover" + i.toString();
        removeSongButton.addEventListener("click", removeSongFromQueue);
        removeSongButton.style.height = '10px';
        removeSongButton.style.padding = 0;
        removeSongButton.style.paddingLeft = '5px';
        removeSongButton.style.margin = 0;

        newButtonRow.appendChild(removeSongButton);
        removeSongButtonContainer.appendChild(newButtonRow);

        queueList.appendChild(listItem);
    }

    const sortableList =
        document.getElementById("QueueTable");
    let draggedItem = null;
    
    sortableList.addEventListener(
        "dragstart",
        (e) => {
            draggedItem = e.target;
            setTimeout(() => {
                e.target.style.display =
                    "none";
            }, 0);
            currentSong = queuedSongs[songIndex];
    });
    
    sortableList.addEventListener(
        "dragend",
        (e) => {
            setTimeout(() => {
                e.target.style.display = "";
                draggedItem = null;
            }, 0);
            
            var listOrder = queueList.getElementsByTagName("li");
            queuedSongs.length = 0;
            for (let i = 0; i < listOrder.length; i++) {
                let newCopy = songs[giveSongNumber(listOrder[i].textContent)].copy();
                queuedSongs.push(newCopy);
            }
            for (let i = 0; i < queuedSongs.length; i++) {
                if (listOrder[i].style.color == "red") {
                    var redSong = queuedSongs[songIndex];
                    if (currentSong.ID != redSong.ID) {
                        var counter = 1;
                        var found = false;
                        while (1) {
                            if (songIndex+counter >= queuedSongs.length) {
                                break;
                            }
                            if (queuedSongs[songIndex+counter].ID == currentSong.ID) {
                                songIndex += counter;
                                found = true;
                                break;
                            }
                            counter++;
                        }
                        var counter2 = 1;
                        while (!found) {
                            if (songIndex-counter2 < 0) {
                                break;
                            }
                            if (queuedSongs[songIndex-counter2].ID == currentSong.ID) {
                                songIndex -= counter2;
                                found = true;
                                break;
                            }
                            counter2++;
                        }
                    }
                }
            }
            printString();
    });
    
    sortableList.addEventListener(
        "dragover",
        (e) => {
            e.preventDefault();
            const afterElement =
                getDragAfterElement(
                    sortableList,
                    e.clientY);
            const currentElement =
                document.querySelector(
                    ".dragging");
            if (afterElement == null) {
                sortableList.appendChild(
                    draggedItem
                );} 
            else {
                sortableList.insertBefore(
                    draggedItem,
                    afterElement
                );}
        });
    
    const getDragAfterElement = (
        container, y
    ) => {
        const draggableElements = [
            ...container.querySelectorAll(
                "li:not(.dragging)"
            ),];
    
        return draggableElements.reduce(
            (closest, child) => {
                const box =
                    child.getBoundingClientRect();
                const offset =
                    y - box.top - box.height / 2;
                if (
                    offset < 0 &&
                    offset > closest.offset) {
                    return {
                        offset: offset,
                        element: child,
                    };} 
                else {
                    return closest;
                }},
            {
                offset: Number.NEGATIVE_INFINITY,
            }
        ).element;
    };
}

function queueSongNext(event) {
    var clickedButton = event.target;
    var buttonID = clickedButton.id;
    var integerButtonID = parseInt(buttonID);
    let newSong = songs[integerButtonID].copy();

    addSongToQueue(newSong, true, true);

    printString();
}

function queueSongLast(event) {
    var clickedButton = event.target;
    var buttonID = clickedButton.id;
    var integerButtonID = parseInt(buttonID);
    let newSong = songs[integerButtonID].copy();

    addSongToQueue(newSong, true, false);

    printString();
}

function playSongFromLibrary(event) {
    var clickedButton = event.target;
    var buttonID = clickedButton.id;
    var integerButtonID = parseInt(buttonID.slice(0, -10));
    songPlayer.stopVideo();
    playSong(songs[integerButtonID]);
    playingOutsideQueue = true;
    tempSongIndex = songIndex;
    songIndex = integerButtonID;
}

function clearQueue() {
    var savedLength = queuedSongs.length;
    for (let i = 0; i < savedLength; i++) {
        var column1 = document.getElementById('ImageTable');
        var column2 = document.getElementById('QueueTable');
        var column3 = document.getElementById('QueueTableRemovers');

        column1.removeChild(column1.getElementsByTagName("li")[0]);
        column2.removeChild(column2.getElementsByTagName("li")[0]);
        column3.removeChild(column3.getElementsByTagName("li")[0]);

        queuedSongs.splice(0, 1);

        for (let j = 0; j < queuedSongs.length; j++) {
            column3.getElementsByTagName("li")[j].children[0].id = "temp" + j.toString();
        }
        for (let j = 0; j < queuedSongs.length; j++) {
            column3.getElementsByTagName("li")[j].children[0].id = "Remover" + j.toString();
        }
    }
    updateQueueStat();
    songPlayer.stopVideo();
}

function makeTable() {
    var table = document.getElementById("songTable");
    for (let i = 0; i < songs.length; i++) {
        var row = document.createElement("tr");

        var queueNextButtonCell = document.createElement("td");
        var queueNextButton = document.createElement("button");
        queueNextButton.textContent = "Queue Next";
        queueNextButtonCell.appendChild(queueNextButton);
        queueNextButton.id = i.toString();
        queueNextButton.addEventListener("click", queueSongNext);

        var queueLastButtonCell = document.createElement("td");
        var queueLastButton = document.createElement("button");
        queueLastButton.textContent = "Queue Back";
        queueLastButtonCell.appendChild(queueLastButton);
        queueLastButton.id = i.toString();
        queueLastButton.addEventListener("click", queueSongLast);

        var playButtonCell = document.createElement("td");
        var playButton = document.createElement("button");
        playButton.textContent = "Play Song";
        playButtonCell.appendChild(playButton);
        playButton.id = i.toString() + "playButton";
        playButton.addEventListener("click", playSongFromLibrary);

        var songNameCell = document.createElement("td");
        songNameCell.textContent = songs[i].title + " - " + songs[i].artist;
        songNameCell.style.color = "white";

        row.appendChild(playButtonCell);
        row.appendChild(queueNextButtonCell);
        row.appendChild(queueLastButtonCell);
        row.appendChild(songNameCell);

        table.appendChild(row);
    }
}

function updateQueueStat() {
    var numberOfQueuedSongsHeader = document.getElementById("QueSize");
    numberOfQueuedSongsHeader.textContent = "Total queue size: " + queuedSongs.length.toString();
}

function updateLibraryStat() {
    var librarySizeHeader = document.getElementById("LibrarySize");
    librarySizeHeader.textContent = "Number of songs in library: " + songs.length.toString();
}

function updateRemainingSongsStat() {
    var remainingSongsHeader = document.getElementById("RemainingSongs");
    if (!playingOutsideQueue) {
        remainingSongsHeader.textContent = "Number of songs remaining to play: " + (queuedSongs.length - songIndex).toString();
    }
}

function fillSongNames() {
    for (let i = 0; i < songs.length; i++) {
        songNames[i] = songs[i].title + " - " + songs[i].artist;
    }
}

function loadStuff() {
    makeTable();
    queuedSongs.length = 0;
    for (let i = 0; i < songs.length; i++) {
        let newCopy = songs[i].copy();
        queuedSongs.push(newCopy);
    }
    fillSongNames();
    fillQueueTable();
    updateQueueStat();
    updateLibraryStat();
    updateRemainingSongsStat();
    printString();
}

function infiniteLoopPress() {
    loopedInfinitely = !loopedInfinitely;
    var loopButton = document.getElementById("loopButton");
    if (loopedInfinitely) {
        loopButton.textContent = "Loop: on";
    } else {
        loopButton.textContent = "Loop: off";
    }
    if (loopedInfinitely == false && shuffledInfinitely == true) {
        shuffledInfinitely = false;
        var shuffleButton = document.getElementById("infiniteShuffleButton");
        shuffleButton.textContent = "Shuffle Infinitely: off";
    }
}

function infiniteShufflePress() {
    shuffledInfinitely = !shuffledInfinitely;
    var shuffleButton = document.getElementById("infiniteShuffleButton");
    if (shuffledInfinitely) {
        shuffleButton.textContent = "Shuffle Infinitely: on";
    } else {
        shuffleButton.textContent = "Shuffle Infinitely: off";
    }
    if (loopedInfinitely == false && shuffledInfinitely == true) {
        infiniteLoopPress();
    }
}

function onPlayerStateChange() {
    if (songPlayer.getPlayerState() == 0) {
        if (playingOutsideQueue) {
            playingOutsideQueue = false;
            songIndex = tempSongIndex-1;
        }
        songIndex++;
        if (songIndex < queuedSongs.length) {
            playSong(queuedSongs[songIndex]);
        }
        if (loopedInfinitely) {
            if (shuffledInfinitely) {
                shuffleSongs();
                return;
            }
            songIndex = 0;
            playSong(queuedSongs[songIndex]);
        }
    }
    if (queuedSongs.length > 0) {
        document.title = queuedSongs[songIndex].title;
    } else {
        document.title = "MUSIC";
    }
    printString();
}

function onYouTubeIframeAPIReady() {
    songPlayer = new YT.Player('player', {height: '390', width: '640', videoId: 'nNnBcCk7eDA', events: {'onStateChange': onPlayerStateChange}});
}