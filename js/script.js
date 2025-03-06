// Global game state
let deck = [];
let placed = [];
let currentCard = null;
let selectedDeckPath = '';

// DOM elements
const startScreen = document.getElementById('start-screen');
const header = document.getElementById('header');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start-button');
const deckTitleOptions = document.querySelectorAll('.deck-title-option');
const deckPreview = document.querySelector('#deck-preview .deck-option');
const backButton = document.getElementById('back-button');
const themeSelect = document.getElementById('theme-select');

// Theme switching
themeSelect.addEventListener('change', (e) => {
    document.body.dataset.theme = e.target.value;
});

// Add event listeners for deck selection - now loading metadata from JSON
deckTitleOptions.forEach(option => {
    option.addEventListener('click', () => {
        deckTitleOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedDeckPath = option.dataset.deck;
        startButton.disabled = true; // Disable until metadata is loaded

        // Load metadata from the selected deck JSON
        fetch(selectedDeckPath)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load deck info: ${response.statusText}`);
                return response.json();
            })
            .then(data => {
                // Update the preview with metadata from the JSON
                deckPreview.querySelector('.deck-thumbnail').src = data.thumbnail;
                deckPreview.querySelector('.deck-title').textContent = data.title;
                deckPreview.querySelector('.deck-description').textContent = data.description;
                deckPreview.style.animation = 'none';
                setTimeout(() => {
                    deckPreview.style.animation = 'deckAppear 0.3s ease forwards';
                }, 10);
                startButton.disabled = false;
            })
            .catch(error => {
                console.error('Error loading deck info:', error);
                showMessage('Error loading deck preview. Please try again.');
            });
    });
});

// Set initial preview by triggering click on first deck option
const firstDeck = deckTitleOptions[0];
firstDeck.click();

// Start button
startButton.addEventListener('click', () => {
    if (selectedDeckPath) {
        startButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            startButton.style.transform = 'scale(1)';
            loadDeck(selectedDeckPath);
        }, 100);
    }
});

// Back button
backButton.addEventListener('click', () => {
    gameContainer.style.opacity = '0';
    setTimeout(() => {
        startScreen.style.display = 'flex';
        header.style.display = 'flex';
        gameContainer.style.display = 'none';
        startScreen.style.opacity = '0';
        startScreen.style.animation = 'fadeIn 0.5s ease forwards';
        header.style.opacity = '0';
        header.style.animation = 'fadeIn 0.5s ease forwards';
        placed = [];
        currentCard = null;
    }, 300);
});

// Load deck - updated to handle new JSON structure
function loadDeck(deckPath) {
    showMessage('Loading deck...');
    fetch(deckPath)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load deck: ${response.statusText}`);
            return response.json();
        })
        .then(data => {
            deck = data.cards;
            startScreen.style.transition = 'opacity 0.3s ease';
            header.style.transition = 'opacity 0.3s ease';
            gameContainer.style.transition = 'opacity 0.3s ease';            
            startScreen.style.opacity = '0';
            header.style.opacity = '0';
            
            setTimeout(() => {
                startScreen.style.display = 'none';
                header.style.display = 'none';
                
                gameContainer.style.display = 'block';
                gameContainer.style.opacity = '0';
                setTimeout(() => {
                    gameContainer.style.opacity = '1';
                }, 10);
                
                initialize();
                showMessage('');
            }, 300);
        })
        .catch(error => {
            console.error('Error loading deck:', error);
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

// Render placed cards with staggered animation
function renderPlaced() {
    const placedDiv = document.getElementById('placed-cards');
    placedDiv.innerHTML = '';
    addInsertionPoint(placedDiv, 0);
    placed.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.innerHTML = `<img src="${card.image}" alt="${card.text}"><p>${card.text}</p>`;
        cardDiv.style.animationDelay = `${index * 0.1}s`; // Staggered entry
        placedDiv.appendChild(cardDiv);
        addInsertionPoint(placedDiv, index + 1);
    });
}

// Add an insertion point with click event listener
function addInsertionPoint(container, index) {
    const insertDiv = document.createElement('div');
    insertDiv.className = 'insertion-point';
    insertDiv.dataset.index = index;

    // Click event
    insertDiv.addEventListener('click', handleClick);

    container.appendChild(insertDiv);
}

// Render current card with a pop-in effect
function renderCurrent() {
    const currentDiv = document.getElementById('current-card');
    if (currentCard) {
        currentDiv.innerHTML = `<p>${currentCard.text}</p><img src="${currentCard.image}" alt="${currentCard.text}"><p>${currentCard.description}</p>`;
        currentDiv.style.transform = 'scale(0.8)';
        setTimeout(() => { currentDiv.style.transform = 'scale(1)'; }, 50);
    } else {
        currentDiv.innerHTML = '';
    }
}

// Handle click event
function handleClick(e) {
    const index = parseInt(e.target.dataset.index);
    const insertionPoint = e.target;
    
    if (checkPlacement(index)) {
        tryPlacement(index);
    } else {
        // Add wiggle animation class
        insertionPoint.classList.add('incorrect');
        
        // Remove class after animation completes
        setTimeout(() => {
            insertionPoint.classList.remove('incorrect');
        }, 500); // matches animation duration
        
        showMessage('Incorrect, try again.');
    }
}

// Attempt to place the card at the given index
function tryPlacement(index) {
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

// Show message with fade effect
function showMessage(msg) {
    const messageDiv = document.getElementById('message');
    if (msg === '') {
        messageDiv.style.opacity = '0';
        setTimeout(() => { messageDiv.textContent = ''; }, 300);
    } else {
        messageDiv.textContent = msg;
        messageDiv.style.opacity = '1';
        if (msg !== 'Loading deck...') {
            setTimeout(() => { messageDiv.style.opacity = '0'; }, 2000);
        }
    }
}

// Initialize with a clean slate
function initialize() {
    shuffle(deck);
    placed = [];
    currentCard = deck.shift();
    renderPlaced();
    renderCurrent();
}
