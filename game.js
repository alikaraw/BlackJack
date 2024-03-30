/* Classes */

import Card from "./classes/Card";
import Deck from "./classes/Deck";
import Player from "./classes/Player";

/* HTML Elements */
let containerPlayersInfo = document.getElementById("containerPlayersInfo");

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

/* Vars */
const GameDeck = new Deck();
const AmountOfPlayers = sessionStorage.getItem("amountOfPlayers");
const Players = [];
const Dealer = new Player("Dealer");
let CurrentPlayerIndex = 0;

/* On Click Functions */

btnSplit.onclick = () => { 
    // let hand2CardRow = playerHand2.children[0];
    // let hand1card2 = playerHand1.children[0].children[1];

    // let moveX = hand2CardRow.getBoundingClientRect().x - hand1card2.getBoundingClientRect().x;
    // let moveY = hand2CardRow.getBoundingClientRect().y - hand1card2.getBoundingClientRect().y;

    // hand1card2.style.position = `relative`;
    // hand1card2.style.left = `${moveX}px`;
    // hand1card2.style.top = `${moveY}px`;

    // // append card 2 from playerHand1 to the first "cards-row" in playerHand2
    // setTimeout(()=>{
    //     hand1card2.style.position = `static`;
    //     hand1card2.style.left = `0px`;
    //     hand1card2.style.top = `0px`;
    //     playerHand2.children[0].append(playerHand1.children[0].children[1])
    // }, 800)
}

/* Functions */

initGameCycle();
startGameRound();

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
            UpdatePlayerInfo(iPlayer);
        }
    }

    for(; iPlayer < containerPlayersInfo.children.length; iPlayer++) {
        containerPlayersInfo.children[iPlayer].style.visibility = "hidden";
    }

    // Create Deck
    for(let symbol = 0; symbol < 4; symbol++) {
        for(let value = 1; value <= 13; value++){
            GameDeck.addCard(new Card(value, symbol))
        }
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

    DrawAndFlipCard(Dealer);
    DrawCard(Dealer);
    updateHand(Dealer.handMain, dealerHand);

    for(let iPlayer = 0; iPlayer < Players.length; iPlayer++) {
        for(let i = 0; i < 2; i++) {
            DrawCard(Players[iPlayer]);
        }
    }
}

function DrawCard(player) {
    player.addCard(GameDeck.getRandomCard());
}

function DrawAndFlipCard(player) {
    let randomCard = GameDeck.getRandomCard();
    randomCard.setCardUp(true);
    player.addCard(randomCard);
}

function updateHand(playerHand, handElement) {
    let Cards = handElement.querySelectorAll('.card-scene');
    for(let iCard = 0; iCard < Cards.length; iCard++) {
        if(playerHand[iCard]) {
            Cards[iCard].style.visibility = "visible";
            Cards[iCard].children[0].children[0].children[0].src = getCardImage(playerHand[iCard]);
            Cards[iCard].children[0].classList.toggle("card-flipped", playerHand[iCard].isCardUp());
        } else {
            Cards[iCard].style.visibility = "hidden";
        }
    }
}

function getCardImage(card) {
    let valueName = card.getValueName();
    let symbolName = card.getSymbolName();
    return `./images/cards/${valueName}_of_${symbolName}.svg`;
}

function UpdatePlayerInfo(iPlayer) {
    let playerInfoElement = containerPlayersInfo.children[iPlayer].children[0].children[0];
    console.log(playerInfoElement.children)
    // 0 = name
    // 1 = points
    // 2 = cash
    playerInfoElement.children[0].innerHTML = Players[iPlayer].name;
    playerInfoElement.children[1].innerHTML = `${Players[iPlayer].balance}$`
    playerInfoElement.children[2].innerHTML = "0 Points"; // if 2 hands type with / between the numbers
    playerInfoElement.children[3].innerHTML = `${Players[iPlayer].bet}$ Bet`
}