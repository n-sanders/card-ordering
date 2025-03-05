// Sample deck (customize this for different playthroughs)
const deck = [
    { image: 'img1.jpg', text: 'Event 1', order: 1 },
    { image: 'img2.jpg', text: 'Event 2', order: 2 },
    { image: 'img3.jpg', text: 'Event 3', order: 3 },
    { image: 'img4.jpg', text: 'Event 4', order: 4 }
];

// Shuffle function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Game state
shuffle(deck);
let placed = [];
let currentCard = deck.shift();

// Render placed cards with insertion points
function renderPlaced() {
    const placedDiv = document.getElementById('placed-cards');
    placedDiv.innerHTML = '';

    // Add insertion point at start
    addInsertionPoint(placedDiv, 0);

    placed.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.innerHTML = `<img src="${card.image}" alt="${card.text}"><p>${card.text}</p>`;
        placedDiv.appendChild(cardDiv);

        // Add insertion point after this card
        addInsertionPoint(placedDiv, index + 1);
    });
}

// Add an insertion point with drag-and-drop and click event listeners
function addInsertionPoint(container, index) {
    const insertDiv = document.createElement('div');
    insertDiv.className = 'insertion-point';
    insertDiv.dataset.index = index;

    // Drag-and-drop events
    insertDiv.addEventListener('dragover', (e) => e.preventDefault());
    insertDiv.addEventListener('dragenter', (e) => {
        e.target.classList.add('drag-over');
    });
    insertDiv.addEventListener('dragleave', (e) => {
        e.target.classList.remove('drag-over');
    });
    insertDiv.addEventListener('drop', handleDrop);

    // Click event
    insertDiv.addEventListener('click', handleClick);

    container.appendChild(insertDiv);
}

// Render current card to place
function renderCurrent() {
    const currentDiv = document.getElementById('current-card');
    if (currentCard) {
        currentDiv.innerHTML = `<img src="${currentCard.image}" alt="${currentCard.text}"><p>${currentCard.text}</p>`;
        currentDiv.className = 'card';
        currentDiv.draggable = true;
        currentDiv.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', 'card');
            currentDiv.classList.add('dragging');
        });
        currentDiv.addEventListener('dragend', () => {
            currentDiv.classList.remove('dragging');
        });
    } else {
        currentDiv.innerHTML = '';
        currentDiv.className = '';
    }
}

// Handle drop event
function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('drag-over');
    if (e.dataTransfer.getData('text/plain') === 'card') {
        const index = parseInt(e.target.dataset.index);
        tryPlacement(index);
    }
}

// Handle click event
function handleClick(e) {
    const index = parseInt(e.target.dataset.index);
    tryPlacement(index);
}

// Attempt to place the card at the given index
function tryPlacement(index) {
    if (checkPlacement(index)) {
        placed.splice(index, 0, currentCard);
        renderPlaced();
        if (deck.length > 0) {
            currentCard = deck.shift();
            renderCurrent();
        } else {
            currentCard = null;
            renderCurrent();
            showMessage('Congratulations, you have sorted all cards correctly!');
        }
    } else {
        showMessage('Incorrect, try again.');
    }
}

// Check if placement is correct
function checkPlacement(i) {
    if (placed.length === 0) {
        return true; // First card is always correct
    } else if (i === 0) {
        return currentCard.order < placed[0].order; // Before first card
    } else if (i === placed.length) {
        return placed[placed.length - 1].order < currentCard.order; // After last card
    } else {
        return placed[i - 1].order < currentCard.order && currentCard.order < placed[i].order; // Between cards
    }
}

// Show feedback message
function showMessage(msg) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = msg;
    setTimeout(() => { messageDiv.textContent = ''; }, 2000);
}

// Initialize game
renderPlaced();
renderCurrent();