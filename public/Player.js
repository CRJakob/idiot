let Card = require('./Card.js').default;

class Player {
    constructor(ws) {
        this.hand = [];
        this.closed = [];
        this.open = [];
        this.ready = false;
        this.ws = ws;
    }

    
    /**
     * Adds a card to the player's hand
     */
    addCard(card) {
        this.hand.push(card);
    }

    /**
     * Removes and returns the card at hand[index], or null if index==-1
     */
    playCard(index) {
        if (index < this.hand.length) {
            return this.hand.splice(index, 1)[0];
        } else if (index === -1) {
            return null;
        }
        throw new Error("Card not in hand");
    }

    /**
     * Takes all cards from the pile into hand. If tryLuck is true, caller should handle luck logic.
     */
    fail(pile, tryLuck = false) {
        // If tryLuck, caller should handle luck logic before calling fail
        this.hand.push(...pile);
    }

    /**
     * Sets the player's hand, closed, and open cards
     */
    setHand(cards) {
        this.hand = cards;
    }
    setClosed(cards) {
        this.closed = cards;
    }
    setOpen(cards) {
        this.open = cards;
    }

    /**
     * Switches a card between hand and open
     */
    switch(handIndex, openIndex) {
        if ([0, 1, 2].includes(handIndex) && handIndex < this.hand.length &&
            [0, 1, 2].includes(openIndex) && openIndex < this.open.length) {
            const temp = this.hand[handIndex];
            this.hand[handIndex] = this.open[openIndex];
            this.open[openIndex] = temp;
        } else {
            throw new Error("Invalid indices for switch");
        }
    }
    /**
     * Returns true if player is ready
     */
    isReady() {
        return this.ready;
    }
    /**
     * Sets player as ready
     */
    ready() {
        this.ready = true;
    }
}

module.exports = Player;