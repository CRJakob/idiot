ws = new WebSocket('ws://' + window.location.host);

console.log("play.js loaded");

// Ensure DOM is loaded before running
window.addEventListener('DOMContentLoaded', () => {
    
});

ws.onmessage = (msg) => {
    let { type, string, data } = JSON.parse(msg.data);
    console.log(`${type} ${string}${data !== undefined ? ': ' + JSON.stringify(data) : ''}`);
    if (type === "error") popupDelay(`Error: ${string}`, 4000);
    
    switch(`${type} ${string}`) {
        case "command addCard hand":
            addCardToHand(data.card);
            break;
        case "command setOpen":
            data.cards.forEach(card => {
                console.log("Adding open card:", card);
                console.log(`open-table-card-${data.cards.indexOf(card) + 1}`)
                const open = document.getElementById(`open-table-card-${data.cards.indexOf(card) + 1}`);
                const img = document.createElement("img");
                img.className = "card";
                let rank = card.rank; 
                if (rank === 11) rank = 'J'; 
                else if (rank === 12) rank = 'Q'; 
                else if (rank === 13) rank = 'K'; 
                else if (rank === 14) rank = 'A'; 
                img.src = `/assets/cards/${card.suit}${rank}.${["J", "Q", "K"].includes(rank) /* Face cards are JPG */ ? 'jpg' : 'png'}`; 
                img.cardObject = card; 
                open.appendChild(img); 
            }); 
            break; 
        case "info Card played": 
            const hand = document.getElementById("hand"); 
            const cardObj = hand.children[data.index].cardObject; 
            if (cardObj && cardObj.rank === data.card.rank && cardObj.suit === data.card.suit) { 
                hand.removeChild(hand.children[data.index]); 
                updateBlocker(); 
            } 
            console.log(document.getElementById("pile")); 
            const img = document.createElement("img"); 
            let rank = cardObj.rank;
            if (rank === 11) rank = 'J';
            else if (rank === 12) rank = 'Q';
            else if (rank === 13) rank = 'K';
            else if (rank === 14) rank = 'A';
            img.src = `/assets/cards/${cardObj.suit}${rank}.${["J", "Q", "K"].includes(rank) /* Face cards are JPG */ ? 'jpg' : 'png'}`;
            img.className = "card";
            const pile = document.getElementById("pile");
            if (pile.children.length > 0) pile.removeChild(pile.lastChild);
            pile.appendChild(img);
            break;
        case "info HOST":
            let button = document.createElement("button");
            button.innerText = "Start Game";
            button.onclick = () => ws.send(JSON.stringify({ type: "command", string: "startGame" }));
            document.getElementById("top-bar").appendChild(button);
            popup("You are the host");
            break;
        case "info counters":
            document.getElementById("pile-counter").innerText = data.pile;
            document.getElementById("stock-counter").innerText = data.stock;
    }
}

window.requestDrawCard = function() {
    ws.send(JSON.stringify({ type: "command", string: "drawCard"}));
}

window.requestPlayCard = function(index) {
    ws.send(JSON.stringify({ type: "command", string: "playCard", data: { index } }));
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
    const index = hand.children.length;
    img.onclick = () => requestPlayCard(index);
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

window.playCard = function(index) {
    updateBlocker();
}

function popup(msg) {
    const popup = document.createElement("p");
    popup.innerText = msg;
    popup.id = uuidv4();
    document.getElementById("top-bar").appendChild(popup);
    return popup.id;
}

async function removePopup(id, delayMs=0) {
    const popup = document.getElementById(id);
    await new Promise(r => setTimeout(r, delayMs)).then(() => document.getElementById("top-bar").removeChild(popup));
}

async function popupDelay(msg, delayMs=2000) {
    const id = popup(msg);
    await removePopup(id, delayMs);
}

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}
