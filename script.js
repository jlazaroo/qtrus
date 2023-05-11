


const listsDiv = document.getElementById('listsDiv');
const historyDiv = document.getElementById('historyDiv');
const synStat = document.getElementById('synStat');
const synListDiv = document.getElementById('synListDiv')
let synListUl = document.getElementById('synListUl');
const antStat = document.getElementById('antStat');
const antListDiv = document.getElementById('antListDiv');
let antListUl = document.getElementById('antListUl');
const historyListUl = document.getElementById('historyListUl');
const submit = document.getElementById('submit');
const clear = document.getElementById('clear');
const searchInput = document.getElementById('searchInput');
const searchWord = document.getElementById('searchWord');
const images = document.querySelectorAll('img');
let word;
let data;
let synonymsList = [];
let antonymsList = [];
let historyList = [];


// checks if local storage is not empty then loads local storage and runs fetch
if (localStorage.length > 0) {
    load();
    fetchData(word);
};

// clears local storage
clear.onclick = function() {
    if(confirm('CLEAR? This will clear everything!')) {
        localStorage.clear();
        location.reload();
    }
    
}

// triggers submit 'click' if 'enter' is pressed
searchInput.onkeydown = function(event) {
    if(event.key === 'Enter') {
        submit.click();
    }
}

// listens for submit click and runs fetchData
submit.onclick = function() {
    if(searchInput.value == ''){
        alert('search has no input');
    }else{
         word = searchInput.value;
        // searchWord.innerHTML = word;
        // historyListArray();
        // listsClear();
        fetchData(word);
    }
   
};

// fetches the searched word from a thesaurus database api
function fetchData(word) {
    Promise.all([
        fetch(`https://api.datamuse.com/words?rel_syn=${word}`),
        fetch(`https://api.datamuse.com/words?rel_ant=${word}`)
    ])
	.then(function (responses) {
        // Get a JSON object from each of the responses
        return Promise.all(responses.map(function (response) {
            return response.json();
        }))
    })
	.then(function(response){
        
        data = response;

        if(data[0].length > 0 || data[1].length > 0){
            searchWord.innerHTML = word;
            historyListArray();
            listsClear();
            historyList.forEach(createHistoryList);
        }
        
        if(data[0].length > 0){
            synonymsList = data[0];
            createList(synListUl, synonymsList, 0, synonymsList.length);
            synStat.innerHTML = `${synonymsList.length}`;
        }

        if(data[1].length > 0){
            antonymsList = data[1];
            createList(antListUl, antonymsList, 0, antonymsList.length)
            antStat.innerHTML = `${antonymsList.length}`;
        }
        

        
        hide('synListUl');
        
        clickWord();
        save();
    } )
	.catch(err => console.error(err));
};

// creates the click listener for list items and their copy icons and expanding lists
function clickWord() {
    listsDiv.onclick = function(event) {
        // event.preventDefault();
        if(event.target.nodeName == 'LI') {
            word = event.target.innerHTML;
            historyListArray();
            listsClear();
            fetchData(word);
        }
        if(event.target.nodeName == 'IMG') {
            navigator.clipboard.writeText(event.target.previousSibling.innerHTML);
        }
        // console.log(event.target.classList.contains('more'))
        // expands lists if arrow is clicked
        if(event.target.classList.contains('more')){
            // console.log(event.target.parentElement.id)
            if(event.target.parentElement.id == 'synListDiv'){
                show('synListUl');
                toggleMore(synListUl, synListDiv);
            }
        }
        if(event.target.classList.contains('less')){
            if(event.target.parentElement.id == 'synListDiv'){
                hide('synListUl');
                toggleMore(synListUl, synListDiv);
            }
        }
    }
    // adds copy function to history items
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
// list is capped at 5 - adds to the end and removes the first
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

// creates list for Synonyms and Antonyms depending on which UL is passed
function createList(ul, array,  start, end) {
    for(let i = start; i < end; i++){
        ul.innerHTML += `
            <div class="list-item"><li>${array[i].word}</li><img src="images/copy-icon.png" alt="[ ]" title="copy ${array[i].word}"></div>
        `
    }
    listItems = document.querySelectorAll(`#${ul.id} .list-item`);

    if(listItems.length > 20){
        synListDiv.innerHTML += `
            <p id="${ul.id}More" class="more">more...</p>
        `
    }
};

// toggles the more... less... link if the list has more than 20 words
function toggleMore(ul, listDiv) {
    if(document.getElementById(`${ul.id}More`)){
        // console.log(true)
        let listUlMore = document.getElementById(`${ul.id}More`);
        listUlMore.remove();
        listDiv.innerHTML += `
            <p id="${ul.id}Less" class="less">less...</p>
        `
    }else{
        let listUlLess = document.getElementById(`${ul.id}Less`);
        listUlLess.remove();
        listDiv.innerHTML += `
            <p id="${ul.id}More" class="more">more...</p>
        `
    }
}

// hides the rest of the list if the list goes over 20
function hide(ul) {
    listItems = document.querySelectorAll(`#${ul} .list-item`);
    if(ul)
    for(let i=20; i < listItems.length; i++) {
        listItems[i].classList.add('hide');
    }
}

// shows the rest of the list over 20 to the end of list
function show(ul) {
    listItems = document.querySelectorAll(`#${ul} .list-item`);
    for(let i=20; i < listItems.length; i++) {
        listItems[i].classList.remove('hide');
    }
}

// clears all lists and more links
function listsClear() {
    synListUl = document.getElementById('synListUl');
    antListUl = document.getElementById('antListUl');
    synListUl.innerHTML = '';
    antListUl.innerHTML = '';
    historyListUl.innerHTML = '';
    let more = document.querySelectorAll('.more');
    more.forEach(function(item){
        item.remove()
    })
    let less = document.querySelectorAll('.less');
    less.forEach(function(item){
        item.remove()
    })
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






