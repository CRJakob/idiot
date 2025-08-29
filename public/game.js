class Game {
    /**
     * Game state: pile, stock, graveyard, players, turn
     */
    constructor() {
        this.pile = [];
        this.stock = [];
        this.graveyard = [];
        this.players = [new Player()];
        this.turn = 0;
    }

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
        this.stock = Card.CARDS.slice();
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