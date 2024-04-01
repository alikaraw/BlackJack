export default class Player {
    /**
     * Constructor for creating a Player object
     * @param {String} name player name 
     */
    constructor(name){
        this.name = name;
        this.balance = 1500;
        this.resetPlayer();
    }

    /**
     * resets both hands of the player
     */
    resetHands() {
        this.handMain = [];
        this.handSplit = [];
    }

    /**
     * resets all player info for the round (bet, insurance, hands)
     */
    resetPlayer(){
        this.resetHands();
        this.bet = 0;
        this.insurance = 0;
    }

    /**
     * Switches between the hands of the player
     */
    switchHands() {
        let temp = this.handMain;
        this.handMain = this.handSplit;
        this.handSplit = temp;
    }

    /**
     * Check if the player can split his hand
     * A player can split only when he has only 2 cards and they are similar and has enough balance to bet twice
     * @returns whether the player can split his hand
     */
    canSplit() {
        return this.handMain.length == 2 && this.handSplit.length == 0 && this.handMain[0].value == this.handMain[1].value && this.balance >= this.bet;
    }

    /**
     * Splits the hand1 of the player to two hands
     */
    splitHand() {
        this.balance -= this.bet;
        this.handSplit.push(this.handMain.pop());
        this.splittedHand = true;
    }

    /**
     * Player takes insurance equal to 0.5 of his bet
     */
    takeInsurance() {
        if(this.balance - (this.bet * 0.5) <= 0) { // player has less then 0.5 of bet, meaning insurance will set balance to 0
            this.insurance = this.balance;
            this.balance = 0;
        } else {
            this.insurance = this.bet * 0.5;
            this.balance -= this.insurance;
        }
    }

    /**
     * Adds a card to the main hand of the player
     * @param {Card} card card to add
     */
    addCard(card) {
        this.handMain.push(card);
    }

    /**
     * Returns the amout of points in player's main hand
     * @returns {Number} the amount of points in player's main hand
     */
    getMainHandPoints() {
        return this._calcHandPoints(this.handMain)
    }

    /**
     * Returns the amout of points in player's split hand
     * @returns {Number} the amount of points in player's split hand
     */
    getSplitHandPoints(){
        return this._calcHandPoints(this.handSplit);
    }

    isMainHandBJ() {
        return this._hasBlackjack(this.handMain);
    }

    isSplitHandBJ() {
        return this._hasBlackjack(this.handSplit);
    }

    _hasBlackjack(cards) {
        return cards.length == 2 && ((cards[0].value == 1 && cards[1].value >= 11) || (cards[0].value >= 11 && cards[1].value == 1));
    }

    /**
     * Returns the amount of points in a the array of cards
     * @returns {Number} 
     */
    _calcHandPoints(cards) {
        let sum = 0;
        let amountOfAces = 0;

        for(let iCard = 0; iCard < cards.length; iCard++) {
            if(!cards[iCard].isUp) { continue; }
            
            if(cards[iCard].value == 1) {
                amountOfAces++;
            } else {
                sum += (cards[iCard].value >= 11) ? 10 : cards[iCard].value;  
            }
        }

        while(amountOfAces > 0) {
            sum += ((sum + 11) > 21) ? 1 : 11;
            amountOfAces--;
        }

        return sum;
    }
}