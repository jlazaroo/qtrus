


const app_key = `0873c0ac9a8c2ec4df73424a9df89768`;
const app_id = `0d5e9a2e`;

options = {
	method: 'GET',
	headers: {
		"Accept": "application/json","app_id": app_id, "app_key": app_key
	}
};

const listsDiv = document.getElementById('listsDiv');
const historyDiv = document.getElementById('historyDiv');
const synListUl = document.getElementById('synListUl');
const antListUl = document.getElementById('antListUl');
const historyListUl = document.getElementById('historyListUl');
const submit = document.getElementById('submit');
const clear = document.getElementById('clear');
const searchInput = document.getElementById('searchInput');
const searchWord = document.getElementById('searchWord');
const images = document.querySelectorAll('img');

let word;
let data;
let synonymsList;
let antonymsList;
let historyList = [];


// checks if local storage is not empty then loads local storage and runs fetch
if (localStorage.length > 0) {
    load();
    fetchData(word);
};

// clears local storage
clear.onclick = function() {
    localStorage.clear();
    location.reload();
}

// triggers submit 'click' if 'enter' is pressed
searchInput.onkeydown = function(event) {
    if(event.key === 'Enter') {
        submit.click();
    }
}

// listens for submit click and runs fetchData
submit.onclick = function() {
    word = searchInput.value;
    searchWord.innerHTML = word;
    historyListArray();
    listsClear();
    fetchData(word);
};

// fetches the searched word from a thesaurus database api
function fetchData(word) {
    fetch(`https://od-api.oxforddictionaries.com/api/v2/thesaurus/en/${word}?strictMatch=false`, options)
	.then(response => response.json())
	.then(function(response){
        searchWord.innerHTML = word;
        data = response;

        synonymsList = data.results[0].lexicalEntries[0].entries[0].senses[0].synonyms;
 
        synonymsList.forEach(createSynonymsList)

        if(data.results[0].lexicalEntries[0].entries[0].senses[0].antonyms.length > 0) {
            antonymsList = data.results[0].lexicalEntries[0].entries[0].senses[0].antonyms;
            antonymsList.forEach(createAntonymsList)
        }
        // console.log(synonymsList)
        historyList.forEach(createHistoryList);
        clickWord();
        save();
    } )
	.catch(err => console.error(err));
};

// creates the click listener for list items and their copy icons
function clickWord() {
    listsDiv.onclick = function(event) {
        if(event.target.nodeName == 'LI') {
            word = event.target.innerHTML;
            historyListArray();
            listsClear();
            fetchData(word);
        }
        if(event.target.nodeName == 'IMG') {
            navigator.clipboard.writeText(event.target.previousSibling.innerHTML);
        }
    }
    historyDiv.onclick = function(event) {
        if(event.target.nodeName == 'LI') {
            word = event.target.innerHTML;
            historyListArray();
            listsClear();
            fetchData(word);
        }
    }
};

// adds current word to the history array
function historyListArray() {
    let dupe = false;
    // checks if the current word is in history
    historyList.forEach(function(item) {
        if(word != item && dupe == false) {
            dupe = false;
        }else{
            dupe = true;
        }
    });
    // console.log(dupe);
    if(historyList.length < 5 && dupe == false) {
        historyList.push(word);
    }else if(dupe == false){
        historyList.shift();
        historyList.push(word);
    }
}

function createHistoryList(item) {
    historyListUl.innerHTML += `
        <div class="history-list-item"><li>${item}</li></div>
    `
};

function createSynonymsList(item) {
    console.log(item.text);
    synListUl.innerHTML += `
        <div class="list-item"><li>${item.text}</li><img src="images/copy-icon.png" alt="[ ]" title="copy ${item.text}"></div>
    `
};

function createAntonymsList(item) {
    antListUl.innerHTML += `
        <div class="list-item"><li>${item.text}</li><img src="images/copy-icon.png" alt="[ ]" title="copy ${item.text}"></div>
    `
};

function listsClear() {
    synListUl.innerHTML = '';
    antListUl.innerHTML = '';
    historyListUl.innerHTML = '';
}

// saves current word and history to local storage
function save() {
    localStorage.setItem('word', word);
    localStorage.setItem('historyList', JSON.stringify(historyList));
};

// loads local storage
function load() {
    word = localStorage.getItem('word');
    historyList = JSON.parse(localStorage.getItem('historyList'));
};





