let Card = require('./Card.js');
let Player = require('./Player.js');

const SUITS = ["S", "H", "D", "C"];
const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 11=J, 12=Q, 13=K, 14=A

/**
 * All 52 cards as strings, e.g. "S2", "H14"
 */
const CARDS = (() => {
    const cards = [];
    for (let s of SUITS) {
        for (let r of RANKS) {
            cards.push(`${s}${r}`);
        }
    }
    return cards;
})();


class Game {
    /**
     * Game state: pile, stock, graveyard, players, turn
     */
    constructor() {
        this.pile = [];
        this.stock = [];
        this.graveyard = [];
        this.players = [];
        this.turn = 0;
    }

    getPile() { return this.pile; }
    getStock() { return this.stock; }
    getGraveyard() { return this.graveyard; }

    /**
     * Adds a player to the game
     */
    addPlayer(player) {
        this.players.push(player);
    }

    /**
     * Deals cards to all players: 3 closed, 3 open, 3 hand
     */
    dealCards() {
        this.stock = CARDS.slice();
        this.stock.forEach(card => { this.stock[this.stock.indexOf(card)] = new Card(card[0], parseInt(card.slice(1))); });
        console.log(this.stock);
        this.stock = this.stock.sort(() => Math.random() - 0.5); // shuffle
        this.players.forEach(player => {
            player.setClosed(this.stock.splice(0, 3));
            player.setOpen(this.stock.splice(0, 3));
            player.setHand(this.stock.splice(0, 3));
        });
    }

    /**
     * Returns true if all players are ready
     */
    isReady() {
        return this.players.every(player => player.isReady());
    }

    /**
     * Player attempts to play a card from hand at index
     * Returns true if played, false if not
     */
    playCard(index) {
        const player = this.players[this.turn];
        const card = player.playCard(index);
        if (!card) return false;
        // If pile is empty, any card can be played
        if (this.pile.length === 0 || card.beats(Card.toCard(this.pile[this.pile.length - 1]))) {
            this.pile.push(card.toString());
            this.refillHand(player);
            return true;
        } else {
            // Card cannot be played, put back in hand
            player.addCard(card);
            return false;
        }
    }
    /**
     * Refills player's hand from stock up to 3 cards
     */
    refillHand(player) {
        while (player.hand.length < 3 && this.stock.length > 0) {
            player.addCard(Card.toCard(this.stock.pop()));
        }
    }
    /**
     * Main turn logic: player tries to play, try luck, or fails
     */
    playTurn() {
        const player = this.players[this.turn];
        // Try to play any card from hand that beats pile
        let played = false;
        for (let i = 0; i < player.hand.length; i++) {
            const card = player.hand[i];
            if (this.pile.length === 0 || Card.toCard(card).beats(Card.toCard(this.pile[this.pile.length - 1]))) {
                this.playCard(i);
                played = true;
                break;
            }
        }
        if (!played) {
            // Try luck: play top stock card
            if (this.stock.length > 0) {
                const luckCard = Card.toCard(this.stock[this.stock.length - 1]);
                if (this.pile.length === 0 || luckCard.beats(Card.toCard(this.pile[this.pile.length - 1]))) {
                    this.pile.push(this.stock.pop());
                    this.refillHand(player);
                    played = true;
                }
            }
        }
        if (!played) {
            // Fail: take pile into hand
            player.fail(this.pile);
            this.pile = [];
        }
        // Next player's turn
        this.turn = (this.turn + 1) % this.players.length;
    }
}

module.exports = Game;