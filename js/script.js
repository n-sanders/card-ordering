// Global game state
let deck = [];
let placed = [];
let currentCard = null;
let selectedDeckPath = '';

// DOM elements for start screen
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-button');
const deckOptions = document.querySelectorAll('.deck-option');
const backButton = document.getElementById('back-button');

// Add event listeners for deck selection
deckOptions.forEach(option => {
    option.addEventListener('click', () => {
        // Remove selected class from all options
        deckOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        option.classList.add('selected');
        
        // Store the selected deck path
        selectedDeckPath = option.dataset.deck;
        
        // Enable the start button
        startButton.disabled = false;
    });
});

// Add event listener for start button
startButton.addEventListener('click', () => {
    if (selectedDeckPath) {
        loadDeck(selectedDeckPath);
    }
});

// Add event listener for back button
backButton.addEventListener('click', () => {
    // Show start screen and hide game container
    startScreen.style.display = 'flex';
    gameContainer.style.display = 'none';
    
    // Reset game state
    placed = [];
    currentCard = null;
});

// Load deck from the selected JSON file
function loadDeck(deckPath) {
    // Show loading feedback (could be enhanced with a loading spinner)
    showMessage('Loading deck...');
    
    fetch(deckPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load deck: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            deck = data;
            // Hide start screen and show game container
            startScreen.style.display = 'none';
            gameContainer.style.display = 'block';
            // Initialize the game with the loaded deck
            initialize();
            showMessage('');
        })
        .catch(error => {
            console.error('Error loading deck data:', error);
            showMessage('Error loading deck. Please try again.');
        });
}

// Shuffle function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

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
    if (msg === '') {
        messageDiv.textContent = '';
    } else {
        messageDiv.textContent = msg;
        if (msg !== 'Loading deck...') {
            setTimeout(() => { messageDiv.textContent = ''; }, 2000);
        }
    }
}

// Initialize game
function initialize() {
    shuffle(deck);
    placed = [];
    currentCard = deck.shift();
    renderPlaced();
    renderCurrent();
}
