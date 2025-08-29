ws = new WebSocket('ws://' + window.location.host);

console.log("play.js loaded");

// Ensure DOM is loaded before running
window.addEventListener('DOMContentLoaded', () => {
    
});

ws.onmessage = (msg) => {
    let { type, string, data } = JSON.parse(msg.data);
    console.log(`${type} ${string}${data !== undefined ? ': ' + JSON.stringify(data) : ''}`);
    switch(`${type} ${string}`) {
        case "command addCard":
            addCardToHand(data.card);
            
            break;
        case "info HOST":
            let button = document.createElement("button");
            button.innerText = "Start Game";
            button.onclick = () => ws.send(JSON.stringify({ type: "command", string: "startGame" }));
            document.getElementById("top-bar").appendChild(button);
    }
}

window.drawCard = function() {
    ws.send(JSON.stringify({ type: "command", string: "drawCard"}));
}

function addCardToHand(card) {
    console.log("Adding card to hand:", card);
    const hand = document.getElementById("hand");
    if (!hand) {
        console.error("#hand element not found");
        return;
    }
    const img = document.createElement("img");
    
    img.className = "card";
    let rank = card.rank;
    if (rank === 11) rank = 'J';
    else if (rank === 12) rank = 'Q';
    else if (rank === 13) rank = 'K';
    else if (rank === 14) rank = 'A';
    img.src = `/assets/cards/${card.suit}${rank}.${["J", "Q", "K"].includes(rank) /* Face cards are JPG */ ? 'jpg' : 'png'}`;
    // Attach the Card object directly
    img.cardObject = card;
    img.style.zIndex = hand.children.length;
    hand.appendChild(img);
    updateBlocker();
}

function updateBlocker() {
    const hand = document.getElementById("hand");
    const blocker = document.getElementById("blocker");
    const width = hand.children.length * 32 + 75; // 30px per card + 2px border + 70px first card + 5px extra
    const left = Math.floor(window.innerWidth / 2 - width / 2 - 2);
    blocker.style.left = left + 'px';
    hand.style.left = (left + 70) + 'px'; // 70px offset for first card
    blocker.style.width = width + 'px';
}

function playCard(index) {
    const hand = document.getElementById("hand");
    hand.removeChild(hand.children[index]);
    document.getElementById("pile").appendChild(hand.children[index]);
    updateBlocker();
}