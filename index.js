const MAX_PLAYERS_AMOUNT = 4;

/* Html Elements */
let addPlayer = document.getElementById("btnAddPlayer");
let removePlayer = document.getElementById("btnRemovePlayer");
let displayNumOfPlayers = document.getElementById("displayNumOfPlayers");
let startButton = document.getElementById("btnStart");
let playerNamesInput = [];

for(let i = 0; i < MAX_PLAYERS_AMOUNT; i++) {
    playerNamesInput[i] = document.getElementById(`inputName${i+1}`);
}

/* Vars */
let amountOfPlayers = sessionStorage.getItem("amountOfPlayers") ? parseInt(sessionStorage.getItem("amountOfPlayers")) : 0;
updateHTML();

/* Add & Remove players amount */
addPlayer.onclick = () => {
    amountOfPlayers += (amountOfPlayers < MAX_PLAYERS_AMOUNT) ? 1:0;
    updateHTML();
}

removePlayer.onclick = () => {
    amountOfPlayers -= (amountOfPlayers > 1) ? 1:0;
    updateHTML();
}

startButton.onclick = () => {
    sessionStorage.setItem("amountOfPlayers", amountOfPlayers);
    for(let i = 0; i < amountOfPlayers; i++) {
        sessionStorage.setItem(`player${i}`, `${playerNamesInput[i].value}`);
    }
    
    window.location = "game.html";
}

function updateHTML() {
    if(amountOfPlayers == 0) {
        amountOfPlayers = 1;
        sessionStorage.setItem(`player0`, "");
    }

    displayNumOfPlayers.innerText = `Number Of Players - ${amountOfPlayers}`
    
    for(let i = 0; i < amountOfPlayers; i++) {
        playerNamesInput[i].disabled = false;
    }
    
    for(let i = amountOfPlayers; i < MAX_PLAYERS_AMOUNT; i++) {
        playerNamesInput[i].disabled = true;
    }
}