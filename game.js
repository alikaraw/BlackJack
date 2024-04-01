/* Classes */

import Card from "./classes/Card";
import Deck from "./classes/Deck";
import Player from "./classes/Player";

/* HTML Elements */
let containerPlayersInfo = document.getElementById("containerPlayersInfo");

let btnNextPlayer = document.getElementById("btnNextPlayer");
let btnHit = document.getElementById("btnHit");
let btnDouble = document.getElementById("btnDouble");
let btnStand = document.getElementById("btnStand");
let btnSplit = document.getElementById("btnSplit");
let btnInsurance = document.getElementById("btnInsurance");
let btnSurrender = document.getElementById("btnSurrender");

let dealerTitle = document.getElementById("dealerTitle");
let dealerHand = document.getElementById("dealerHand");

let playerTitle = document.getElementById("playerTitle");
let playerHandMain = document.getElementById("playerHandMain");
let playerHandSplit = document.getElementById("playerHandSplit");

let imgChips = document.querySelectorAll(".chip");
let textBet = document.getElementById("TextBet");
let btnBetConfirm = document.getElementById("btnBetConfirm");
let btnBetReset = document.getElementById("btnBetReset");
let btnBetAllIn = document.getElementById("btnBetAllIn");

let containerOverlay = document.getElementById("containerOverlay");
let startRoundMessage = document.getElementById("startRoundMessage");
let containerOverlaySummery = document.getElementById("containerOverlaySummery");
let containerOverlayDealer = document.getElementById("containerOverlayDealer");
let containerOverlayPlayer = document.querySelectorAll(".containerOverlayPlayer");

let containerActionButtons = document.getElementById("containerActionButtons");
let containerConfirmBet = document.getElementById("containerConfirmBet");
let containerPlaceBet = document.getElementById("containerPlaceBet");

let containerPlayerInformationPanel = document.getElementById("containerPlayerInformationPanel");

/* Vars */
const GameDeck = new Deck();
const AmountOfPlayers = sessionStorage.getItem("amountOfPlayers");
const Players = [];
const Dealer = new Player("Dealer");

let CurrentPlayerIndex = 0;
let CurrentBetAmount = 0;
let CurrentPlayerFinished = false;
let FinishedTheRound = false;

/* On Click Functions */

btnBetReset.onclick = () => {
    CurrentBetAmount = 0;
    updateBetAmount();
}

btnBetAllIn.onclick = () => {
    CurrentBetAmount = Players[CurrentPlayerIndex].balance;
    updateBetAmount();
}

for(let iChip = 0; iChip < imgChips.length; iChip++) {
    imgChips[iChip].onclick = (e) => {
        let amount = parseInt(e.target.src.split('_')[1].replace(".png", ""));
        if ((CurrentBetAmount + amount) <= Players[CurrentPlayerIndex].balance) {
            CurrentBetAmount += amount;
            updateBetAmount();
        }
    }
}

btnBetConfirm.onclick = () => {
    if(CurrentBetAmount == 0) { return; }

    Players[CurrentPlayerIndex].bet = CurrentBetAmount;
    Players[CurrentPlayerIndex].balance -= CurrentBetAmount;
    updatePlayerInfo(CurrentPlayerIndex);
    
    CurrentBetAmount = 0;
    updateBetAmount();

    if (CurrentPlayerIndex < Players.length - 1) {
        CurrentPlayerIndex++;
    } else {
        CurrentPlayerIndex = 0; // reset the index position
        startGameRound();
        togglePanel(false);
    }

    updatePlayerPanelInfo();
}

// draw a card flipped
btnHit.onclick = () => {
    DrawAndFlipCard(Players[CurrentPlayerIndex]);
    updateHandElement(Players[CurrentPlayerIndex].handMain, playerHandMain);
    updatePlayerGame();
}

// split the hand, most of the code is animation
btnSplit.onclick = () => {
    // Animation of card sliding to second hand
    let playerHand1Card2 = playerHandMain.children[0].children[1]
    let playerHand2Card1 = playerHandSplit.children[0].children[0];

    let moveX = playerHand2Card1.getBoundingClientRect().x - playerHand1Card2.getBoundingClientRect().x;
    let moveY = playerHand2Card1.getBoundingClientRect().y - playerHand1Card2.getBoundingClientRect().y;

    playerHand2Card1.children[0].classList.add("card-flipped");
    Players[CurrentPlayerIndex].splitHand();

    playerHand1Card2.style.position = "relative";
    playerHand1Card2.style.left = `${moveX}px`;
    playerHand1Card2.style.top = `${moveY}px`;
    
    setTimeout(() => {
        updatePlayerGame();
        playerHand1Card2.children[0].classList.remove("card-flipped");
        playerHand1Card2.style.position = "static";
        playerHand1Card2.style.left = `0px`;
        playerHand1Card2.style.top = `0px`;
    }, 400);
}

// draw one last card and finish round
btnDouble.onclick = () => {
    // draw one card
    DrawAndFlipCard(Players[CurrentPlayerIndex]);
    updateHandElement(Players[CurrentPlayerIndex].handMain, playerHandMain);

    // double the bet
    Players[CurrentPlayerIndex].balance -= Players[CurrentPlayerIndex].bet;
    Players[CurrentPlayerIndex].bet *= 2;

    // finish game
    CurrentPlayerFinished = true;
    updatePlayerGame();
}

// Give up bet but get 0.5 of the bet back
btnSurrender.onclick = () => {
    Players[CurrentPlayerIndex].balance += Players[CurrentPlayerIndex].bet * 0.5;
    Players[CurrentPlayerIndex].bet = 0;
    CurrentPlayerFinished = true;
    updatePlayerGame();
}

// Finish round
btnStand.onclick = () => {
    CurrentPlayerFinished = true;
    updatePlayerGame();
}

btnInsurance.onclick = () => {
    Players[CurrentPlayerIndex].takeInsurance();
    updatePlayerGame();    
}

// Next player turn to play CHECK IF PLAYER HAVE ANOTHER HAND IF SO CHANGE BUTTON TO "next hand"
btnNextPlayer.onclick = () => {
    if(FinishedTheRound) {
        togglePanel(true);
        startBettingRound();
        updatePlayerPanelInfo();
        FinishedTheRound = false;
        return;
    }

    let updatePlayerVisual = false;
    CurrentPlayerFinished = false;
    // last player to finish his round
    if(Players[CurrentPlayerIndex].splittedHand) { // switch hands
        Players[CurrentPlayerIndex].splittedHand = false;
        Players[CurrentPlayerIndex].switchHands();
        updatePlayerVisual = true;
    } else if(CurrentPlayerIndex >= Players.length - 1) { // last player 
        flipPlayerCards(Dealer);
        updateDealerGame();
        let drawCardCycle = setInterval(() => {
            if(Dealer.getMainHandPoints() < 17) {
                DrawAndFlipCard(Dealer);
                updateDealerGame();
            } else {
                clearInterval(drawCardCycle);
                toggleOverlayPanel(false);
                finishGameRound();
            }
        }, 1000);
    } else {
        CurrentPlayerIndex++;
        updatePlayerVisual = true;
    }

    if(updatePlayerVisual) {
        setHandElement(playerHandSplit, false);
        setHandElement(playerHandMain, false);
        setTimeout(() => {
            setHandElement(playerHandSplit, true); 
            updatePlayerGame();
        }, 600)
    }
}

/* Functions */

// startup Functions
initGameCycle();
updateBetAmount();
updatePlayerPanelInfo();

/**
 * Sets everything up to start the game with the function startGameRound
 */
function initGameCycle() {
    // Create Players
    let iPlayer = 0;
    for(; iPlayer < AmountOfPlayers; iPlayer++) {
        let playerName = sessionStorage.getItem(`player${iPlayer}`);
        Players.push(new Player(playerName));
        if(AmountOfPlayers != 1) {
            updatePlayerInfo(iPlayer);
        }
    }

    for(; iPlayer < containerPlayersInfo.children.length; iPlayer++) {
        containerPlayersInfo.children[iPlayer].style.visibility = "hidden";
    }

    // Create Deck
    for(let deck = 0; deck < 6; deck++) { // 5 decks 
        for(let symbol = 0; symbol < 4; symbol++) { // 4 Symbols
            for(let value = 1; value <= 13; value++) { // 13 Cards per Symbol
                GameDeck.addCard(new Card(value, symbol))
            }
        }
    }

    startBettingRound();
}

function startBettingRound() {
    togglePanel(true);
    toggleOverlayPanel(true);
    for(let iPlayer = 0; iPlayer < Players.length; iPlayer++) {
        Players[iPlayer].resetPlayer();
    }
}

/**
 * Function to start the round keeping the info of each player from last game
 */
function startGameRound() {
    // reset Deck
    GameDeck.resetDeck()
    
    // reset Players Hands & Deck Hands
    Dealer.resetHands();
    for(let iPlayer = 0; iPlayer < Players.length; iPlayer++) {
        Players[iPlayer].resetHands();
    }

    // Draw cards for dealer and players
    DrawAndFlipCard(Dealer);
    DrawCard(Dealer);
    setHandElement(dealerHand, false);
    updateDealerGame();

    for(let iPlayer = 0; iPlayer < Players.length; iPlayer++) {
        for(let i = 0; i < 2; i++) {
            DrawCard(Players[iPlayer]);
        }
    }
    
    setHandElement(playerHandMain, false);
    setHandElement(playerHandSplit, true);
    updatePlayerGame();
}

function finishGameRound() {
    let dealerPoints = Dealer.getMainHandPoints();

    containerOverlay.classList.add("isOnScreen");
    
    containerOverlayDealer.children[0].innerHTML = `Dealer (${dealerPoints} Points)`
    containerOverlayDealer.children[1].innerHTML = '';

    for(let iCard = 0; iCard < Dealer.handMain.length; iCard++) {
        let newCard = document.createElement("img");
        newCard.src = getCardImage(Dealer.handMain[iCard]);
        containerOverlayDealer.children[1].append(newCard);
    }

    let iPlayer = 0;
    for(; iPlayer < Players.length; iPlayer++) {
        containerOverlayPlayer[iPlayer].style.display = 'block';
        let player = Players[iPlayer];
        
        let playerOverlayInformation = containerOverlayPlayer[iPlayer].children[1];
        let didPlayerSplit = player.handSplit.length != 0;

        // Name
        containerOverlayPlayer[iPlayer].children[0].innerText = player.name
        
        // Hand 1
        playerOverlayInformation.children[0].children[0].children[0].innerText = `${player.getMainHandPoints()} Points`;
        playerOverlayInformation.children[0].children[0].children[1].innerText = `${player.bet}$ Bet`;

        // Hand 2
        playerOverlayInformation.children[0].children[1].children[0].innerText = `${(didPlayerSplit) ? player.getSplitHandPoints() : '-'} Points`;
        playerOverlayInformation.children[0].children[1].children[1].innerText = `${(didPlayerSplit) ? `${player.bet}$` : '-'} Bet`;

        // Insurance
        playerOverlayInformation.children[1].innerHTML = `${player.insurance}$ - Insurance`;

        // Total Bet Money
        let totalBetMoney = player.bet * (didPlayerSplit ? 2 : 1) + player.insurance;
        playerOverlayInformation.children[2].innerHTML = `${totalBetMoney}$ - Total Money Bet`;       

        // Total Money Won
        let totalWonMoney = 0;
        console.log(Dealer.isMainHandBJ());
        /* Main Hand Check */
        if (player.getMainHandPoints() <= 21) { //
            if(dealerPoints > 21) { // dealer lost he has over 21 points
                totalWonMoney += (player.bet * (player.isMainHandBJ() ? 2.5 : 2)); // 2.5 for blackjack
            } else { // neither player or dealer over 21 points
                if(player.getMainHandPoints() > dealerPoints) { // player has more points than dealer
                    totalWonMoney += (player.bet * (player.isMainHandBJ() ? 2.5 : 2)); // 2.5 for blackjack
                } else if (player.getMainHandPoints() == dealerPoints) { // player and dealer has same points // money back
                    totalWonMoney += player.bet;
                }
            }
        }

        /* Split Hand Check */
        if (player.getSplitHandPoints() > 0 && player.getSplitHandPoints() <= 21) { //
            if(dealerPoints > 21) { // dealer lost he has over 21 points
                totalWonMoney += (player.bet * (player.isSplitHandBJ() ? 2.5 : 2)); // 2.5 for blackjack
            } else { // neither player or dealer over 21 points
                if(player.getSplitHandPoints() > dealerPoints) { // player has more points than dealer
                    totalWonMoney += (player.bet * (player.isSplitHandBJ() ? 2.5 : 2)); // 2.5 for blackjack
                } else if (player.getSplitHandPoints() == dealerPoints) { // player and dealer has same points // money back
                    totalWonMoney += player.bet;
                }
            }
        }

        /* Check Insurance */
        if(Dealer.isMainHandBJ()) {
            totalWonMoney += player.insurance * 2;
        }
        
        playerOverlayInformation.children[3].innerHTML = `${totalWonMoney}$ - Total Money Won`;

        // New Total Balance
        player.balance += totalWonMoney;
        playerOverlayInformation.children[4].innerHTML = `${player.balance}$ - Total Balance`;
    }

    for(; iPlayer < 4; iPlayer++) {
        containerOverlayPlayer[iPlayer].style.display = 'none';
    }

    CurrentPlayerIndex = 0;
    FinishedTheRound = true;
    btnNextPlayer.innerHTML = "Start New Round";
    btnNextPlayer.disabled = true;
    setTimeout(() => {
        btnNextPlayer.disabled = false;
    }, 3000)
}

/**
 * Draws a card for the player 
 * @param {Player} player 
 */
function DrawCard(player) {
    player.addCard(GameDeck.getRandomCard());
}

/**
 * Draws a flipped card for the player
 * @param {Player} player 
 */
function DrawAndFlipCard(player) {
    let randomCard = GameDeck.getRandomCard();
    randomCard.setCardUp(true);
    player.addCard(randomCard);
}

/**
 * Flips all player mainHand cards up
 * @param {Player} player 
 */
function flipPlayerCards(player) {
    for(let iCard = 0; iCard < player.handMain.length; iCard++) {
        player.handMain[iCard].setCardUp(true);
    }
}

/**
 * Updates the image view of the handElement according to the playerHand Array
 * @param {[Card...]} playerHand array of the cards to place in the element 
 * @param {HTMLElement} handElement the element of hand to update
 */
function updateHandElement(playerHand, handElement) {
    let Cards = handElement.querySelectorAll('.card-scene');
    for(let iCard = 0; iCard < Cards.length; iCard++) {
        if(playerHand[iCard]) {
            Cards[iCard].style.visibility = "visible";
            Cards[iCard].children[0].children[0].children[0].src = getCardImage(playerHand[iCard]);
            Cards[iCard].children[0].classList.toggle("card-flipped", playerHand[iCard].isUp);
        } else {
            Cards[iCard].style.visibility = "hidden";
        }
    }
}

/**
 * Sets the flip status of the cards of the handElement to the boolean given
 * @param {HTMLElement} handElement hand element to flip it cards
 * @param {Boolean} isCardUp which side to flip the cards in handElement, true = up 
 */
function setHandElement(handElement, isCardUp) {
    let Cards = handElement.querySelectorAll('.card-scene');
    for(let iCard = 0; iCard < Cards.length; iCard++) {
        Cards[iCard].children[0].classList.toggle("card-flipped", isCardUp);
    }
}

/**
 * Get the image for the card
 * @param {Card} card card to get the image for
 * @returns {String} path to the card image
 */
function getCardImage(card) {
    let valueName = card.getValueName();
    let symbolName = card.getSymbolName();
    return `./images/cards/${valueName}_of_${symbolName}.svg`;
}

/**
 * Updates the information for the player in the side bar
 * @param {Number} iPlayer index of the player to update the information 
 */
function updatePlayerInfo(iPlayer) {
    let playerInfoElement = containerPlayersInfo.children[iPlayer].children[0].children[0];
    // 0 = name
    // 1 = points
    // 2 = cash
    // 3 = bet
    playerInfoElement.children[0].innerHTML = Players[iPlayer].name;
    playerInfoElement.children[1].innerHTML = `${Players[iPlayer].balance}$`
    if(!Players[iPlayer].getSplitHandPoints()) {
        playerInfoElement.children[2].innerHTML = `${Players[iPlayer].getMainHandPoints()} Points`; // if 2 hands type with / between the numbers
        playerInfoElement.children[3].innerHTML = `${Players[iPlayer].bet}$ Bet`
    } else {
        playerInfoElement.children[2].innerHTML = `${Players[iPlayer].getMainHandPoints()} / ${Players[iPlayer].getSplitHandPoints()} Points`; // if 2 hands type with / between the numbers
        playerInfoElement.children[3].innerHTML = `2x${Players[iPlayer].bet}$ Bet`
    }
}

/**
 * Updates the current bet amount element
 */
function updateBetAmount() {
    textBet.innerHTML = `${CurrentBetAmount}$`;
}

/**
 * Updates the player visual game (Cards, Title, Information Panel, Buttons)
 */
function updatePlayerGame() {
    let player =  Players[CurrentPlayerIndex];

    flipPlayerCards(player);
    updateHandElement(player.handMain, playerHandMain);
    updateHandElement(player.handSplit, playerHandSplit);
    playerTitle.innerHTML = `${player.name} (${player.getMainHandPoints()} Points)`;

    updatePlayerInfo(CurrentPlayerIndex);
    updatePlayerPanelInfo();
    updateActionButtons();
}

/**
 * Updates the dealer visual game (Cards & Title)
 */
function updateDealerGame() {
    dealerTitle.innerHTML = `Dealer (${Dealer.getMainHandPoints()} Points)`;
    updateHandElement(Dealer.handMain, dealerHand);
}

/**
 * Updates the player information panel
 */
function updatePlayerPanelInfo() {
    let player =  Players[CurrentPlayerIndex];
    let elements = containerPlayerInformationPanel.children[0].children;
    elements[0].innerHTML = player.name;
    elements[1].innerHTML = `${player.balance}$`;
    elements[2].innerHTML = `${player.getMainHandPoints()} Points`;
    elements[3].innerHTML = `${player.bet}$ Bet${(player.insurance == 0 ? ``:` ${player.insurance}$ ins`)}`;
}

/**
 * Updates action buttons to what the player can do
 */
function updateActionButtons() {
    // Reset all buttons to active
    btnHit.disabled = false;
    btnDouble.disabled = false;
    btnStand.disabled = false;
    btnSplit.disabled = false;
    btnInsurance.disabled = false;
    btnSurrender.disabled = false;
    
    let player = Players[CurrentPlayerIndex];

    btnSurrender.disabled = !(player.handMain.length == 2 && player.handSplit.length == 0);
    btnDouble.disabled = !(player.balance >= player.bet && player.handMain.length == 2 && player.handSplit.length == 0);
    btnSplit.disabled = !player.canSplit();

    // dealer has ace OR player already took insurance
    btnInsurance.disabled = Dealer.handMain[0].value != 1 || player.insurance != 0;
    
    // hand over 21 OR currentPlayerFinished > means the current player is done playing
    if(player.getMainHandPoints() >= 21 || CurrentPlayerFinished) {
        btnHit.disabled = true;
        btnDouble.disabled = true;
        btnStand.disabled = true;
        btnSplit.disabled = true;
        btnInsurance.disabled = true;
        btnSurrender.disabled = true;
    }

    if (player.splittedHand) {
        btnNextPlayer.innerHTML = "Switch Hands";
    } else if(CurrentPlayerIndex >= Players.length - 1) {
        btnNextPlayer.innerHTML = "Finish Round";
    } else {
        btnNextPlayer.innerHTML = "Next Player";
    }

    btnNextPlayer.disabled = !(player.getMainHandPoints() >= 21 || CurrentPlayerFinished);
}

/**
 * toggles between bet panel and action button panel 
 * @param {Boolean} isBetPanel whether to toggle the bet panel
 */
function togglePanel(isBetPanel) {
    containerOverlay.classList.toggle("isOnScreen", isBetPanel);
    containerActionButtons.style.display = (isBetPanel) ? "none":"flex";
    btnNextPlayer.style.display =  (isBetPanel) ? "none":"block";
    containerConfirmBet.style.display = (!isBetPanel) ? "none":"flex";
    containerPlaceBet.style.display = (!isBetPanel) ? "none":"flex";
}

function toggleOverlayPanel(isMessage) {
    startRoundMessage.style.display = (isMessage) ? "flex":"none";
    containerOverlaySummery.style.display = (isMessage) ? "none":"flex";
}