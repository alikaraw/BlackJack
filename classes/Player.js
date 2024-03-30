export default class Player {
    /**
     * Constructor for creating a Player object
     * @param {String} name player name 
     */
    constructor(name){
        this.name = name;
        this.balance = 1500;
        this.bet = 0;
        this.resetHands();
    }

    /**
     * resets both hands of the player
     */
    resetHands(){
        this.handMain = [];
        this.handSplit = [];
    }

    /**
     * Splits the hand1 of the player to two hands
     */
    splitHand() {
        this.handSplit.push(this.handMain.pop())
    }

    /**
     * Adds a card to the main hand of the player
     * @param {Card} card the card to add
     */
    addCard(card) {
        this.handMain.push(card);
    }

    getHandPoints() {
        let sum;
        
    }
}