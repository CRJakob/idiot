// English card layout 52 cards
class Card {

    static SUITS = ["S", "H", "D", "C"];
    static RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 11=J, 12=Q, 13=K, 14=A
    /**
     * All 52 cards as strings, e.g. "S2", "H14"
     */
    static CARDS = (() => {
        const cards = [];
        for (let s of Card.SUITS) {
            for (let r of Card.RANKS) {
                cards.push(`${s}${r}`);
            }
        }
        return cards;
    })();

    /**
     * Converts a string like "S2" or "HA" to a Card instance
     */
    static toCard(str) {
        const suit = str[0];
        let rankStr = str.slice(1);
        let rank;
        switch (rankStr) {
            case "J": rank = 11; break;
            case "Q": rank = 12; break;
            case "K": rank = 13; break;
            case "A": rank = 14; break;
            default: rank = parseInt(rankStr);
        }
        if (this.CARDS.includes(`${suit}${rank}`)) {
            return new Card(suit, rank);
        } else {
            throw new Error("Invalid card string");
        }
    }

    /**
     * Creates a card with given suit and rank
     * @param {string} suit - One of "S" (♠), "H" (♥), "D" (♦), "C" (♣)
     * @param {number} rank - 2-14 (11=J, 12=Q, 13=K, 14=A)
     */
    constructor(suit, rank) {
        if (!Card.SUITS.includes(suit)) {
            throw new Error("Invalid suit");
        }
        if (!Card.RANKS.includes(rank)) {
            throw new Error("Invalid rank");
        }
        this.suit = suit;
        this.rank = rank;
    }

    /**
     * Returns the numeric value of the card
     */
    getValue() {
        return this.rank;
    }

    /**
     * Returns true if this card beats anotherCard (or is a 2 or 10)
     */
    beats(anotherCard) {
        return (this.rank >= anotherCard.getValue()) || [2, 10].includes(this.rank);
    }

    /**
     * Returns a string representation, e.g. "SA"
     */
    toString() {
        let publicRank = "";
        switch (this.rank) {
            case 11:
                publicRank = "J";
                break;
            case 12:
                publicRank = "Q";
                break;
            case 13:
                publicRank = "K";
                break;
            case 14:
                publicRank = "A";
                break;
            default:
                publicRank = this.rank;
        }
        console.log("Card toString:", this.suit, this.rank, publicRank);
        return `${this.suit}${publicRank}`;
    }
}

module.exports = Card;
