// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add animation to character cards when they come into view
const observerOptions = {
    threshold: 0.2
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.character-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

// Add hover effect to character cards
document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Stałe gry
const BLOCK_SIZE = 16;
const WORLD_WIDTH = 200;
const WORLD_HEIGHT = 100;
const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const MOVE_SPEED = 3;

// Zmienne gry
let world = [];
let enemies = [];
let projectiles = [];
let fruits = [];
let chests = [];
let isGameRunning = false;
let mouseX = 0;
let mouseY = 0;
let keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
    a: false,
    d: false,
    w: false,
    x: false,
    e: false,
    f: false,
    '1': false,
    '2': false,
    '3': false,
    '4': false,
    '5': false
};

// Typy bloków
const BLOCK_TYPES = {
    AIR: 0,
    DIRT: 1,
    GRASS: 2,
    STONE: 3,
    WOOD: 4,
    LEAVES: 5,
    SAND: 6,
    WATER: 7,
    LAVA: 8,
    GOLD: 9,
    DIAMOND: 10,
    CHEST: 11
};

// Typy postaci
const CHARACTER_TYPES = {
    WARRIOR: 0,
    ARCHER: 1,
    MAGE: 2
};

// Typy wrogów
const ENEMY_TYPES = {
    SLIME: 0,
    ZOMBIE: 1,
    SKELETON: 2,
    SPIDER: 3
};

// Typy owoców
const FRUIT_TYPES = {
    APPLE: 0,
    BANANA: 1,
    CHERRY: 2,
    GRAPE: 3
};

// Typy broni
const WEAPON_TYPES = {
    SWORD: 0,
    AXE: 1,
    PICKAXE: 2,
    BOW: 3,
    STAFF: 4
};

// Kolory bloków
const BLOCK_COLORS = {
    [BLOCK_TYPES.DIRT]: '#8B4513',
    [BLOCK_TYPES.GRASS]: '#2ecc71',
    [BLOCK_TYPES.STONE]: '#95a5a6',
    [BLOCK_TYPES.WOOD]: '#d35400',
    [BLOCK_TYPES.LEAVES]: '#27ae60',
    [BLOCK_TYPES.SAND]: '#f1c40f',
    [BLOCK_TYPES.WATER]: '#3498db',
    [BLOCK_TYPES.LAVA]: '#e74c3c',
    [BLOCK_TYPES.GOLD]: '#f39c12',
    [BLOCK_TYPES.DIAMOND]: '#1abc9c',
    [BLOCK_TYPES.CHEST]: '#8e44ad'
};

// Kolory postaci
const CHARACTER_COLORS = {
    [CHARACTER_TYPES.WARRIOR]: '#e74c3c',
    [CHARACTER_TYPES.ARCHER]: '#3498db',
    [CHARACTER_TYPES.MAGE]: '#9b59b6'
};

// Kolory wrogów
const ENEMY_COLORS = {
    [ENEMY_TYPES.SLIME]: '#2ecc71',
    [ENEMY_TYPES.ZOMBIE]: '#7f8c8d',
    [ENEMY_TYPES.SKELETON]: '#ecf0f1',
    [ENEMY_TYPES.SPIDER]: '#34495e'
};

// Kolory owoców
const FRUIT_COLORS = {
    [FRUIT_TYPES.APPLE]: '#e74c3c',
    [FRUIT_TYPES.BANANA]: '#f1c40f',
    [FRUIT_TYPES.CHERRY]: '#c0392b',
    [FRUIT_TYPES.GRAPE]: '#8e44ad'
};

// Kolory broni
const WEAPON_COLORS = {
    [WEAPON_TYPES.SWORD]: '#95a5a6',
    [WEAPON_TYPES.AXE]: '#d35400',
    [WEAPON_TYPES.PICKAXE]: '#7f8c8d',
    [WEAPON_TYPES.BOW]: '#8e44ad',
    [WEAPON_TYPES.STAFF]: '#3498db'
};

// Właściwości postaci
const CHARACTER_PROPERTIES = {
    [CHARACTER_TYPES.WARRIOR]: {
        health: 150,
        mana: 50,
        speed: 3,
        weapon: WEAPON_TYPES.SWORD,
        color: CHARACTER_COLORS[CHARACTER_TYPES.WARRIOR]
    },
    [CHARACTER_TYPES.ARCHER]: {
        health: 100,
        mana: 80,
        speed: 4,
        weapon: WEAPON_TYPES.BOW,
        color: CHARACTER_COLORS[CHARACTER_TYPES.ARCHER]
    },
    [CHARACTER_TYPES.MAGE]: {
        health: 80,
        mana: 150,
        speed: 3,
        weapon: WEAPON_TYPES.STAFF,
        color: CHARACTER_COLORS[CHARACTER_TYPES.MAGE]
    }
};

// Właściwości wrogów
const ENEMY_PROPERTIES = {
    [ENEMY_TYPES.SLIME]: {
        health: 30,
        damage: 5,
        speed: 1,
        points: 10,
        color: ENEMY_COLORS[ENEMY_TYPES.SLIME]
    },
    [ENEMY_TYPES.ZOMBIE]: {
        health: 50,
        damage: 10,
        speed: 1.5,
        points: 20,
        color: ENEMY_COLORS[ENEMY_TYPES.ZOMBIE]
    },
    [ENEMY_TYPES.SKELETON]: {
        health: 40,
        damage: 15,
        speed: 2,
        points: 25,
        color: ENEMY_COLORS[ENEMY_TYPES.SKELETON]
    },
    [ENEMY_TYPES.SPIDER]: {
        health: 25,
        damage: 8,
        speed: 2.5,
        points: 15,
        color: ENEMY_COLORS[ENEMY_TYPES.SPIDER]
    }
};

// Właściwości owoców
const FRUIT_PROPERTIES = {
    [FRUIT_TYPES.APPLE]: {
        health: 20,
        points: 10,
        color: FRUIT_COLORS[FRUIT_TYPES.APPLE]
    },
    [FRUIT_TYPES.BANANA]: {
        health: 15,
        points: 8,
        color: FRUIT_COLORS[FRUIT_TYPES.BANANA]
    },
    [FRUIT_TYPES.CHERRY]: {
        health: 10,
        points: 5,
        color: FRUIT_COLORS[FRUIT_TYPES.CHERRY]
    },
    [FRUIT_TYPES.GRAPE]: {
        health: 25,
        points: 12,
        color: FRUIT_COLORS[FRUIT_TYPES.GRAPE]
    }
};

// Właściwości broni
const WEAPON_PROPERTIES = {
    [WEAPON_TYPES.SWORD]: {
        damage: 15,
        range: 20,
        manaCost: 5,
        attackSpeed: 20,
        color: WEAPON_COLORS[WEAPON_TYPES.SWORD]
    },
    [WEAPON_TYPES.AXE]: {
        damage: 20,
        range: 15,
        manaCost: 8,
        attackSpeed: 30,
        color: WEAPON_COLORS[WEAPON_TYPES.AXE]
    },
    [WEAPON_TYPES.PICKAXE]: {
        damage: 10,
        range: 15,
        manaCost: 3,
        attackSpeed: 15,
        color: WEAPON_COLORS[WEAPON_TYPES.PICKAXE]
    },
    [WEAPON_TYPES.BOW]: {
        damage: 12,
        range: 200,
        manaCost: 10,
        attackSpeed: 25,
        color: WEAPON_COLORS[WEAPON_TYPES.BOW]
    },
    [WEAPON_TYPES.STAFF]: {
        damage: 18,
        range: 150,
        manaCost: 15,
        attackSpeed: 35,
        color: WEAPON_COLORS[WEAPON_TYPES.STAFF]
    }
};

// Poczekaj na załadowanie całej strony
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded'); // Debug log

    // Pobierz elementy canvas
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startGame');
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');

    console.log('Canvas:', canvas); // Debug log

    // Ustaw wymiary canvasa
    canvas.width = WORLD_WIDTH * BLOCK_SIZE;
    canvas.height = WORLD_HEIGHT * BLOCK_SIZE;

    // Wyczyść canvas na niebiesko (niebo)
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stan gry
    let score = 0;
    let level = 1;
    let inventory = [];
    let selectedCharacterType = CHARACTER_TYPES.WARRIOR;

    // Gracz
    const player = {
        x: canvas.width / 2,
        y: 0,
        width: BLOCK_SIZE - 4,
        height: BLOCK_SIZE * 2,
        velocityX: 0,
        velocityY: 0,
        isJumping: false,
        selectedBlock: BLOCK_TYPES.DIRT,
        health: 100,
        maxHealth: 100,
        mana: 20,
        maxMana: 20,
        speed: 3,
        movingLeft: false,
        movingRight: false,
        fastRunning: false,
        invulnerable: false,
        invulnerabilityTime: 0,
        inventory: [],
        equipment: {
            weapon: null
        },
        buffs: [],
        facingRight: true,
        characterType: CHARACTER_TYPES.WARRIOR,
        attackCooldown: 0
    };

    // Inicjalizacja świata
    function initWorld() {
        world = Array(WORLD_HEIGHT).fill().map(() => Array(WORLD_WIDTH).fill(BLOCK_TYPES.AIR));
        
        // Generuj podstawowy teren
        const groundHeight = Math.floor(WORLD_HEIGHT * 0.7);
        for (let x = 0; x < WORLD_WIDTH; x++) {
            // Generuj trawę
            world[groundHeight][x] = BLOCK_TYPES.GRASS;
            
            // Generuj ziemię pod trawą
            for (let y = groundHeight + 1; y < WORLD_HEIGHT; y++) {
                if (y < groundHeight + 3) {
                    world[y][x] = BLOCK_TYPES.DIRT;
                } else {
                    world[y][x] = BLOCK_TYPES.STONE;
                }
            }
        }
        
        // Generuj jaskinie
        generateCaves();
        
        // Generuj drzewa
        generateTrees();
        
        // Generuj skarby
        generateChests();
        
        // Generuj owoce
        generateFruits();
        
        // Generuj wrogów
        generateEnemies();
        
        // Ustaw pozycję gracza
        player.x = BLOCK_SIZE * 5;
        player.y = (groundHeight - 1) * BLOCK_SIZE;
        
        // Daj graczowi podstawową broń
        player.equipment.weapon = WEAPON_TYPES.SWORD;
    }

    // Generowanie drzew
    function generateTrees() {
        const numTrees = Math.floor(Math.random() * 5) + 3; // 3-7 drzew
        
        for (let i = 0; i < numTrees; i++) {
            // Losowa pozycja na powierzchni
            const x = Math.floor(Math.random() * (WORLD_WIDTH - 4)) + 2;
            let y = 0;
            
            // Znajdź powierzchnię
            for (let j = 0; j < WORLD_HEIGHT; j++) {
                if (world[j][x] === BLOCK_TYPES.GRASS) {
                    y = j;
                    break;
                }
            }
            
            if (y === 0) continue;
            
            // Generuj pień
            const trunkHeight = Math.floor(Math.random() * 3) + 4; // 4-6 bloków wysokości
            for (let j = 1; j <= trunkHeight; j++) {
                world[y - j][x] = BLOCK_TYPES.WOOD;
            }
            
            // Generuj liście
            const leafRadius = 2;
            for (let leafY = y - trunkHeight - leafRadius; leafY <= y - trunkHeight + leafRadius; leafY++) {
                for (let leafX = x - leafRadius; leafX <= x + leafRadius; leafX++) {
                    // Sprawdź czy pozycja jest w zakresie świata
                    if (leafX < 0 || leafX >= WORLD_WIDTH || leafY < 0 || leafY >= WORLD_HEIGHT) continue;
                    
                    // Sprawdź czy to jest powietrze
                    if (world[leafY][leafX] === BLOCK_TYPES.AIR) {
                        // Sprawdź odległość od środka
                        const dx = leafX - x;
                        const dy = leafY - (y - trunkHeight);
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        // Dodaj liście w promieniu
                        if (distance <= leafRadius) {
                            world[leafY][leafX] = BLOCK_TYPES.LEAVES;
                        }
                    }
                }
            }
        }
    }

    // Generowanie jaskiń
    function generateCaves() {
        // Parametry jaskiń
        const caveFrequency = 0.05; // Jak często pojawiają się jaskinie
        const caveSize = 3; // Rozmiar jaskini
        
        // Generuj jaskinie
        for (let x = 0; x < WORLD_WIDTH; x++) {
            for (let y = 0; y < WORLD_HEIGHT; y++) {
                // Sprawdź czy to jest kamień
                if (world[y][x] === BLOCK_TYPES.STONE) {
                    // Losowa szansa na jaskinię
                    if (Math.random() < caveFrequency) {
                        // Twórz jaskinię
                        for (let caveY = y - caveSize; caveY <= y + caveSize; caveY++) {
                            for (let caveX = x - caveSize; caveX <= x + caveSize; caveX++) {
                                // Sprawdź czy pozycja jest w zakresie świata
                                if (caveX < 0 || caveX >= WORLD_WIDTH || caveY < 0 || caveY >= WORLD_HEIGHT) continue;
                                
                                // Sprawdź czy to jest kamień
                                if (world[caveY][caveX] === BLOCK_TYPES.STONE) {
                                    // Sprawdź odległość od środka
                                    const dx = caveX - x;
                                    const dy = caveY - y;
                                    const distance = Math.sqrt(dx * dx + dy * dy);
                                    
                                    // Usuń bloki w promieniu
                                    if (distance <= caveSize) {
                                        world[caveY][caveX] = BLOCK_TYPES.AIR;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Dodaj stalagmity i stalaktyty
        for (let x = 0; x < WORLD_WIDTH; x++) {
            for (let y = 0; y < WORLD_HEIGHT; y++) {
                // Sprawdź czy to jest powietrze
                if (world[y][x] === BLOCK_TYPES.AIR) {
                    // Sprawdź bloki nad i pod
                    const blockAbove = y > 0 ? world[y - 1][x] : BLOCK_TYPES.AIR;
                    const blockBelow = y < WORLD_HEIGHT - 1 ? world[y + 1][x] : BLOCK_TYPES.AIR;
                    
                    // Stalagmit (rośnie z dołu)
                    if (blockBelow === BLOCK_TYPES.STONE && Math.random() < 0.1) {
                        world[y][x] = BLOCK_TYPES.STONE;
                    }
                    
                    // Stalaktyt (rośnie z góry)
                    if (blockAbove === BLOCK_TYPES.STONE && Math.random() < 0.1) {
                        world[y][x] = BLOCK_TYPES.STONE;
                    }
                }
            }
        }
    }

    // Generowanie skarbów
    function generateChests() {
        const numChests = Math.floor(Math.random() * 3) + 2; // 2-4 skarby
        
        for (let i = 0; i < numChests; i++) {
            // Losowa pozycja w jaskini
            let x, y;
            let attempts = 0;
            
            do {
                x = Math.floor(Math.random() * WORLD_WIDTH);
                y = Math.floor(Math.random() * WORLD_HEIGHT);
                attempts++;
            } while ((!isSolid(x, y) || isSolid(x, y - 1)) && attempts < 100);
            
            if (attempts >= 100) continue;
            
            // Stwórz skarb
            chests.push({
                x: x * BLOCK_SIZE,
                y: y * BLOCK_SIZE,
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                opened: false,
                items: generateChestItems()
            });
        }
    }

    // Generowanie przedmiotów w skarbie
    function generateChestItems() {
        const items = [];
        const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 przedmioty
        
        for (let i = 0; i < numItems; i++) {
            // Losowy typ przedmiotu
            const itemTypes = [
                { type: 'weapon', id: WEAPON_TYPES.SWORD, chance: 0.3 },
                { type: 'weapon', id: WEAPON_TYPES.AXE, chance: 0.2 },
                { type: 'weapon', id: WEAPON_TYPES.PICKAXE, chance: 0.2 },
                { type: 'weapon', id: WEAPON_TYPES.BOW, chance: 0.15 },
                { type: 'weapon', id: WEAPON_TYPES.STAFF, chance: 0.15 }
            ];
            
            const roll = Math.random();
            let cumulativeChance = 0;
            let selectedItem = null;
            
            for (const item of itemTypes) {
                cumulativeChance += item.chance;
                if (roll <= cumulativeChance) {
                    selectedItem = item;
                    break;
                }
            }
            
            if (selectedItem) {
                items.push({
                    type: selectedItem.type,
                    id: selectedItem.id,
                    quantity: 1
                });
            }
        }
        
        return items;
    }

    // Generowanie owoców
    function generateFruits(groundHeight) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            for (let y = 0; y < groundHeight; y++) {
                if (world[y][x] === BLOCK_TYPES.LEAVES && Math.random() < 0.1) {
                    // Twórz owoce na drzewach
                    const fruitType = Math.floor(Math.random() * Object.keys(FRUIT_TYPES).length);
                    fruits.push({
                        x: x * BLOCK_SIZE + BLOCK_SIZE / 2,
                        y: y * BLOCK_SIZE + BLOCK_SIZE / 2,
                        width: BLOCK_SIZE / 2,
                        height: BLOCK_SIZE / 2,
                        type: fruitType,
                        collected: false
                    });
                }
            }
        }
    }

    // Generowanie wrogów
    function generateEnemies(groundHeight) {
        const numEnemies = Math.floor(Math.random() * 5) + 3; // 3-7 wrogów
        
        for (let i = 0; i < numEnemies; i++) {
            // Losowa pozycja na powierzchni
            const x = Math.floor(Math.random() * WORLD_WIDTH);
            let y = 0;
            
            // Znajdź powierzchnię
            for (let j = 0; j < WORLD_HEIGHT; j++) {
                if (isSolid(x, j) && !isSolid(x, j - 1)) {
                    y = j - 1;
                    break;
                }
            }
            
            // Losowy typ wroga
            const enemyTypes = [
                { type: ENEMY_TYPES.SLIME, chance: 0.4 },
                { type: ENEMY_TYPES.ZOMBIE, chance: 0.3 },
                { type: ENEMY_TYPES.SKELETON, chance: 0.2 },
                { type: ENEMY_TYPES.SPIDER, chance: 0.1 }
            ];
            
            const roll = Math.random();
            let cumulativeChance = 0;
            let selectedType = ENEMY_TYPES.SLIME;
            
            for (const enemy of enemyTypes) {
                cumulativeChance += enemy.chance;
                if (roll <= cumulativeChance) {
                    selectedType = enemy.type;
                    break;
                }
            }
            
            // Stwórz wroga
            const properties = ENEMY_PROPERTIES[selectedType];
            enemies.push({
                type: selectedType,
                x: x * BLOCK_SIZE,
                y: y * BLOCK_SIZE,
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                health: properties.health,
                maxHealth: properties.health,
                damage: properties.damage,
                speed: properties.speed,
                points: properties.points,
                velocityX: 0,
                velocityY: 0,
                facingRight: Math.random() < 0.5,
                attackCooldown: 0
            });
        }
    }

    // Obsługa ruchu myszy
    canvas.addEventListener('mousemove', (e) => {
        if (!isGameRunning) return;
        
        // Pobierz pozycję myszy względem canvas
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        mouseX = (e.clientX - rect.left) * scaleX;
        mouseY = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener('mousedown', (e) => {
        if (!isGameRunning) return;
        
        // Konwertuj pozycję myszy na koordynaty bloków
        const blockX = Math.floor(mouseX / BLOCK_SIZE);
        const blockY = Math.floor(mouseY / BLOCK_SIZE);
        
        // Lewy przycisk myszy - kopanie
        if (e.button === 0) {
            digBlock(blockX, blockY);
        }
        // Prawy przycisk myszy - stawianie
        else if (e.button === 2) {
            placeBlock(blockX, blockY);
        }
    });

    // Zapobiegaj domyślnej akcji prawego przycisku myszy
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Obsługa koła myszy
    canvas.addEventListener('wheel', (e) => {
        if (!isGameRunning) return;
        
        // Przewijanie w górę - następna broń
        if (e.deltaY < 0) {
            const currentIndex = player.inventory.findIndex(item => 
                item.type === 'weapon' && item.id === player.equipment.weapon
            );
            
            if (currentIndex !== -1) {
                // Znajdź następną broń
                for (let i = 1; i <= player.inventory.length; i++) {
                    const nextIndex = (currentIndex + i) % player.inventory.length;
                    const nextItem = player.inventory[nextIndex];
                    
                    if (nextItem.type === 'weapon') {
                        player.equipment.weapon = nextItem.id;
                        break;
                    }
                }
            }
        }
        // Przewijanie w dół - poprzednia broń
        else {
            const currentIndex = player.inventory.findIndex(item => 
                item.type === 'weapon' && item.id === player.equipment.weapon
            );
            
            if (currentIndex !== -1) {
                // Znajdź poprzednią broń
                for (let i = 1; i <= player.inventory.length; i++) {
                    const prevIndex = (currentIndex - i + player.inventory.length) % player.inventory.length;
                    const prevItem = player.inventory[prevIndex];
                    
                    if (prevItem.type === 'weapon') {
                        player.equipment.weapon = prevItem.id;
                        break;
                    }
                }
            }
        }
    });

    // Rysowanie świata
    function drawWorld() {
        // Tło (niebo)
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Rysuj bloki
        for (let y = 0; y < WORLD_HEIGHT; y++) {
            for (let x = 0; x < WORLD_WIDTH; x++) {
                const block = world[y][x];
                if (block !== BLOCK_TYPES.AIR) {
                    drawBlock(x * BLOCK_SIZE, y * BLOCK_SIZE, block);
                }
            }
        }

        // Rysuj skarby
        drawChests();
        
        // Rysuj owoce
        drawFruits();
        
        // Rysuj wrogów
        drawEnemies();
        
        // Rysuj pociski
        drawProjectiles();

        // Rysuj podświetlenie bloku pod kursorem
        if (mouseX >= 0 && mouseX < WORLD_WIDTH && mouseY >= 0 && mouseY < WORLD_HEIGHT) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(mouseX * BLOCK_SIZE, mouseY * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    // Rysowanie bloku
    function drawBlock(x, y, type) {
        ctx.fillStyle = BLOCK_COLORS[type];
        ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
        
        // Dodaj cieniowanie
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(x, y + BLOCK_SIZE - 2, BLOCK_SIZE, 2);
        ctx.fillRect(x + BLOCK_SIZE - 2, y, 2, BLOCK_SIZE);
    }

    // Rysowanie gracza
    function drawPlayer() {
        // Jeśli gracz jest odporny na obrażenia, rysuj go z przezroczystością
        if (player.invulnerable) {
            ctx.globalAlpha = 0.5 + Math.sin(player.invulnerabilityTime * 0.2) * 0.3;
        }

        // Ciało postaci
        ctx.fillStyle = CHARACTER_PROPERTIES[player.characterType].color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Głowa
        ctx.fillStyle = '#2980b9';
        ctx.fillRect(player.x + 2, player.y - 4, player.width - 4, 4);
        
        // Broń
        if (player.equipment.weapon !== null) {
            const weaponType = player.equipment.weapon;
            ctx.fillStyle = WEAPON_PROPERTIES[weaponType].color;
            
            if (weaponType === WEAPON_TYPES.BOW || weaponType === WEAPON_TYPES.STAFF) {
                // Długie bronie
                ctx.fillRect(
                    player.facingRight ? player.x + player.width : player.x - 12,
                    player.y + player.height/2,
                    12,
                    3
                );
            } else {
                // Krótkie bronie
                ctx.fillRect(
                    player.facingRight ? player.x + player.width : player.x - 8,
                    player.y + player.height/2,
                    8,
                    2
                );
            }
        }
        
        // Pasek zdrowia
        drawHealthBar(player.x, player.y - 10, player.width, 5, player.health, player.maxHealth, '#e74c3c');
        
        // Pasek many
        drawHealthBar(player.x, player.y - 5, player.width, 5, player.mana, player.maxMana, '#3498db');

        // Przywróć normalną przezroczystość
        ctx.globalAlpha = 1.0;
    }

    // Rysowanie paska zdrowia/many
    function drawHealthBar(x, y, width, height, value, maxValue, color) {
        // Tło
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, width, height);
        
        // Wartość
        const fillWidth = (value / maxValue) * width;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, fillWidth, height);
    }

    // Rysowanie skarbów
    function drawChests() {
        chests.forEach(chest => {
            if (!chest.opened) {
                ctx.fillStyle = BLOCK_COLORS[BLOCK_TYPES.CHEST];
                ctx.fillRect(chest.x, chest.y, chest.width, chest.height);
                
                // Dodaj cieniowanie
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.fillRect(chest.x, chest.y + chest.height - 2, chest.width, 2);
                ctx.fillRect(chest.x + chest.width - 2, chest.y, 2, chest.height);
            }
        });
    }

    // Rysowanie owoców
    function drawFruits() {
        fruits.forEach(fruit => {
            if (!fruit.collected) {
                const properties = FRUIT_PROPERTIES[fruit.type];
                ctx.fillStyle = properties.color;
                
                // Rysuj owoc jako okrąg
                ctx.beginPath();
                ctx.arc(fruit.x, fruit.y, fruit.width / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Dodaj cieniowanie
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.beginPath();
                ctx.arc(fruit.x - 1, fruit.y - 1, fruit.width / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    // Rysowanie wrogów
    function drawEnemies() {
        enemies.forEach(enemy => {
            if (enemy.health > 0) {
                const properties = ENEMY_PROPERTIES[enemy.type];
                
                // Ciało wroga
                ctx.fillStyle = properties.color;
                ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
                
                // Głowa wroga
                ctx.fillStyle = '#333';
                ctx.fillRect(enemy.x + 2, enemy.y - 4, enemy.width - 4, 4);
                
                // Oczy wroga
                ctx.fillStyle = '#fff';
                if (enemy.facingRight) {
                    ctx.fillRect(enemy.x + enemy.width - 6, enemy.y - 3, 2, 2);
                } else {
                    ctx.fillRect(enemy.x + 2, enemy.y - 3, 2, 2);
                }
                
                // Pasek zdrowia
                drawHealthBar(enemy.x, enemy.y - 10, enemy.width, 5, enemy.health, enemy.maxHealth, '#e74c3c');
            }
        });
    }

    // Rysowanie pocisków
    function drawProjectiles() {
        projectiles.forEach(projectile => {
            ctx.fillStyle = projectile.color;
            ctx.beginPath();
            ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // Aktualizacja fizyki
    function updatePhysics() {
        // Grawitacja
        player.velocityY += GRAVITY;
        
        // Ruch poziomy
        if (player.movingLeft) {
            player.velocityX = -player.speed;
            player.facingRight = false;
        } else if (player.movingRight) {
            player.velocityX = player.speed;
            player.facingRight = true;
        } else {
            player.velocityX *= 0.8; // Tarcie
        }
        
        // Szybki bieg
        if (player.fastRunning) {
            player.velocityX *= 1.5;
        }
        
        // Aktualizuj pozycję
        player.x += player.velocityX;
        player.y += player.velocityY;
        
        // Aktualizuj cooldown ataku
        if (player.attackCooldown > 0) {
            player.attackCooldown--;
        }
        
        // Aktualizuj odporność na obrażenia
        if (player.invulnerable) {
            player.invulnerabilityTime--;
            if (player.invulnerabilityTime <= 0) {
                player.invulnerable = false;
            }
        }
        
        // Regeneracja many
        if (player.mana < player.maxMana) {
            player.mana = Math.min(player.mana + 0.1, player.maxMana);
        }
        
        // Sprawdź kolizje
        checkCollisions();
    }

    // Aktualizacja stanu gry
    function updateGameState() {
        // Aktualizuj fizykę
        updatePhysics();
        
        // Aktualizuj wrogów
        updateEnemies();
        
        // Aktualizuj pociski
        updateProjectiles();
        
        // Sprawdź warunki zwycięstwa/przegranej
        if (player.health <= 0) {
            gameOver();
        }
    }

    // Koniec gry
    function gameOver() {
        isGameRunning = false;
        
        // Wyświetl ekran końcowy
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
        
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${player.score}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 60);
    }

    // Start gry
    function startGame() {
        // Resetuj stan gry
        player.health = player.maxHealth;
        player.mana = player.maxMana;
        player.score = 0;
        player.x = BLOCK_SIZE * 5;
        player.y = BLOCK_SIZE * 5;
        player.velocityX = 0;
        player.velocityY = 0;
        player.movingLeft = false;
        player.movingRight = false;
        player.fastRunning = false;
        player.facingRight = true;
        player.attackCooldown = 0;
        
        // Inicjalizuj podstawowy ekwipunek
        player.inventory = [
            { type: 'weapon', id: WEAPON_TYPES.SWORD, quantity: 1 },
            { type: 'weapon', id: WEAPON_TYPES.PICKAXE, quantity: 1 },
            { type: 'weapon', id: WEAPON_TYPES.AXE, quantity: 1 },
            { type: 'block', id: BLOCK_TYPES.DIRT, quantity: 50 },
            { type: 'block', id: BLOCK_TYPES.STONE, quantity: 30 }
        ];
        
        // Ustaw podstawową broń
        player.equipment.weapon = WEAPON_TYPES.SWORD;
        
        // Wyczyść świat
        world = Array(WORLD_HEIGHT).fill().map(() => Array(WORLD_WIDTH).fill(BLOCK_TYPES.AIR));
        enemies = [];
        projectiles = [];
        fruits = [];
        chests = [];
        
        // Generuj nowy świat
        initWorld();
        
        // Rozpocznij grę
        isGameRunning = true;
        gameLoop();
    }

    // Główna pętla gry
    function gameLoop() {
        if (!isGameRunning) return;
        
        // Wyczyść canvas
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Aktualizuj stan gry
        updateGameState();
        
        // Rysuj świat
        drawWorld();
        
        // Rysuj gracza
        drawPlayer();
        
        // Rysuj interfejs
        drawUI();
        
        // Następna klatka
        requestAnimationFrame(gameLoop);
    }

    // Rysowanie interfejsu
    function drawUI() {
        // Pasek zdrowia
        drawHealthBar(10, 10, 200, 20, player.health, player.maxHealth, '#e74c3c');
        
        // Pasek many
        drawHealthBar(10, 40, 200, 20, player.mana, player.maxMana, '#3498db');
        
        // Wynik
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${player.score}`, 10, 80);
        
        // Ekwipunek
        const slotSize = 40;
        const padding = 5;
        const startX = 10;
        const startY = canvas.height - slotSize - 10;
        
        // Rysuj sloty ekwipunku
        player.inventory.forEach((item, index) => {
            const x = startX + (slotSize + padding) * index;
            
            // Tło slotu
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(x, startY, slotSize, slotSize);
            
            // Przedmiot
            if (item.type === 'weapon') {
                ctx.fillStyle = WEAPON_PROPERTIES[item.id].color;
            } else if (item.type === 'block') {
                ctx.fillStyle = BLOCK_COLORS[item.id];
            }
            ctx.fillRect(x + 5, startY + 5, slotSize - 10, slotSize - 10);
            
            // Ilość
            if (item.quantity > 1) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(item.quantity.toString(), x + slotSize - 2, startY + slotSize - 2);
            }
            
            // Podświetl wybrany slot
            if (item.type === 'weapon' && item.id === player.equipment.weapon) {
                ctx.strokeStyle = '#f1c40f';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, startY, slotSize, slotSize);
            }
        });
        
        // Aktualna broń
        if (player.equipment.weapon !== null) {
            const weaponType = player.equipment.weapon;
            const properties = WEAPON_PROPERTIES[weaponType];
            
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Weapon: ${getWeaponName(weaponType)}`, 10, canvas.height - slotSize - 30);
        }
    }

    // Pomocnicza funkcja do uzyskania nazwy broni
    function getWeaponName(weaponType) {
        switch(weaponType) {
            case WEAPON_TYPES.SWORD: return 'Sword';
            case WEAPON_TYPES.AXE: return 'Axe';
            case WEAPON_TYPES.PICKAXE: return 'Pickaxe';
            case WEAPON_TYPES.BOW: return 'Bow';
            case WEAPON_TYPES.STAFF: return 'Staff';
            default: return 'Unknown';
        }
    }

    // Obsługa klawiatury
    document.addEventListener('keydown', (e) => {
        if (!isGameRunning) return;
        
        switch (e.key.toLowerCase()) {
            case 'a':
            case 'arrowleft':
                player.movingLeft = true;
                break;
            case 'd':
            case 'arrowright':
                player.movingRight = true;
                break;
            case 'w':
            case 'arrowup':
            case ' ':
                if (isOnGround(player)) {
                    player.velocityY = -15;
                }
                break;
            case 'x':
                player.fastRunning = true;
                break;
            case 'e':
                // Interakcja z przedmiotami
                handleItemInteraction();
                break;
            case 'f':
                // Atak
                handleAttack();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                // Wybór broni
                const slot = parseInt(e.key) - 1;
                const weapon = player.inventory[slot];
                if (weapon && weapon.type === 'weapon') {
                    player.equipment.weapon = weapon.id;
                }
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (!isGameRunning) return;
        
        switch (e.key.toLowerCase()) {
            case 'a':
            case 'arrowleft':
                player.movingLeft = false;
                break;
            case 'd':
            case 'arrowright':
                player.movingRight = false;
                break;
            case 'x':
                player.fastRunning = false;
                break;
        }
    });

    // Start
    startButton.addEventListener('click', startGame);
    initWorld();
    drawWorld();
    drawPlayer();

    console.log('Game initialized'); // Debug log

    // Aktualizacja wrogów
    function updateEnemies() {
        enemies.forEach(enemy => {
            if (enemy.health <= 0) return;
            
            // Sprawdź odległość od gracza
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Jeśli wróg jest wystarczająco blisko, zacznij go ścigać
            if (distance < 200) {
                // Określ kierunek ruchu
                enemy.facingRight = dx > 0;
                
                // Ruch w kierunku gracza
                if (Math.abs(dx) > 5) {
                    enemy.x += enemy.facingRight ? enemy.speed : -enemy.speed;
                }
                
                // Skok jeśli gracz jest wyżej
                if (dy < -50 && isOnGround(enemy)) {
                    enemy.velocityY = -10;
                }
                
                // Atak jeśli jest wystarczająco blisko
                if (distance < 30 && enemy.attackCooldown <= 0) {
                    attackPlayer(enemy);
                    enemy.attackCooldown = 60; // 1 sekunda cooldownu
                }
            } else {
                // Losowy ruch patrolowy
                if (Math.random() < 0.02) {
                    enemy.facingRight = !enemy.facingRight;
                }
                
                if (enemy.facingRight) {
                    enemy.x += enemy.speed * 0.5;
                } else {
                    enemy.x -= enemy.speed * 0.5;
                }
            }
            
            // Aktualizuj cooldown ataku
            if (enemy.attackCooldown > 0) {
                enemy.attackCooldown--;
            }
            
            // Zastosuj grawitację
            enemy.velocityY += GRAVITY;
            enemy.y += enemy.velocityY;
            
            // Sprawdź kolizje z blokami
            const blockX = Math.floor(enemy.x / BLOCK_SIZE);
            const blockY = Math.floor(enemy.y / BLOCK_SIZE);
            
            // Kolizja z podłożem
            if (enemy.velocityY > 0 && isSolid(blockX, blockY + 1)) {
                enemy.y = blockY * BLOCK_SIZE;
                enemy.velocityY = 0;
            }
            
            // Kolizja z sufitem
            if (enemy.velocityY < 0 && isSolid(blockX, blockY)) {
                enemy.y = (blockY + 1) * BLOCK_SIZE;
                enemy.velocityY = 0;
            }
            
            // Kolizja z blokami po bokach
            if (enemy.facingRight && isSolid(blockX + 1, blockY)) {
                enemy.x = blockX * BLOCK_SIZE;
                enemy.facingRight = false;
            } else if (!enemy.facingRight && isSolid(blockX - 1, blockY)) {
                enemy.x = (blockX + 1) * BLOCK_SIZE;
                enemy.facingRight = true;
            }
        });
    }

    // Atak wroga
    function attackPlayer(enemy) {
        // Sprawdź czy gracz jest odporny na obrażenia
        if (player.invulnerable) return;

        const properties = ENEMY_PROPERTIES[enemy.type];
        const damage = Math.max(1, properties.damage / 2);
        player.health -= damage;
        
        // Ustaw odporność na obrażenia
        player.invulnerable = true;
        player.invulnerabilityTime = 60; // 1 sekunda odporności
        
        // Efekt odrzucenia
        const knockback = 5;
        player.velocityX = enemy.facingRight ? knockback : -knockback;
        player.velocityY = -5;
        
        // Sprawdź czy gracz żyje
        if (player.health <= 0) {
            gameOver();
        }
    }

    // Aktualizacja pocisków
    function updateProjectiles() {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            
            // Aktualizuj pozycję
            projectile.x += projectile.velocityX;
            projectile.y += projectile.velocityY;
            
            // Sprawdź kolizje z blokami
            const blockX = Math.floor(projectile.x / BLOCK_SIZE);
            const blockY = Math.floor(projectile.y / BLOCK_SIZE);
            
            if (isSolid(blockX, blockY)) {
                projectiles.splice(i, 1);
                continue;
            }
            
            // Sprawdź kolizje z wrogami
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (enemy.health <= 0) continue;
                
                if (checkCollision(projectile, enemy)) {
                    // Zadaj obrażenia
                    enemy.health -= projectile.damage;
                    
                    // Efekt odrzucenia
                    enemy.velocityX = projectile.velocityX * 0.2;
                    enemy.velocityY = -5;
                    
                    // Usuń pocisk
                    projectiles.splice(i, 1);
                    
                    // Sprawdź czy wróg żyje
                    if (enemy.health <= 0) {
                        // Dodaj punkty
                        player.score += ENEMY_PROPERTIES[enemy.type].points;
                        
                        // Losowa szansa na upuszczenie przedmiotu
                        if (Math.random() < 0.3) {
                            spawnItem(enemy.x, enemy.y);
                        }
                        
                        // Usuń wroga
                        enemies.splice(j, 1);
                    }
                    
                    break;
                }
            }
            
            // Usuń pocisk jeśli jest poza ekranem
            if (projectile.x < 0 || projectile.x > canvas.width ||
                projectile.y < 0 || projectile.y > canvas.height) {
                projectiles.splice(i, 1);
            }
        }
    }

    // Sprawdzanie kolizji między obiektami
    function checkCollision(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }

    // Obsługa ataku gracza
    function handleAttack() {
        if (player.attackCooldown > 0) return;
        
        const weaponType = player.equipment.weapon;
        if (!weaponType) return;
        
        const properties = WEAPON_PROPERTIES[weaponType];
        
        // Sprawdź czy gracz ma wystarczająco many
        if (properties.manaCost > player.mana) return;
        
        // Odejmij manę
        player.mana -= properties.manaCost;
        
        // Ustaw cooldown ataku
        player.attackCooldown = properties.attackSpeed;
        
        // Stwórz pocisk lub melee attack
        if (weaponType === WEAPON_TYPES.BOW || weaponType === WEAPON_TYPES.STAFF) {
            // Stwórz pocisk
            const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
            const speed = 10;
            
            projectiles.push({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed,
                damage: properties.damage,
                radius: 5,
                color: properties.color
            });
        } else {
            // Melee attack
            const attackBox = {
                x: player.facingRight ? player.x + player.width : player.x - properties.range,
                y: player.y,
                width: properties.range,
                height: player.height
            };
            
            // Sprawdź kolizje z wrogami
            enemies.forEach(enemy => {
                if (enemy.health <= 0) return;
                
                if (checkCollision(attackBox, enemy)) {
                    // Zadaj obrażenia
                    enemy.health -= properties.damage;
                    
                    // Efekt odrzucenia
                    enemy.velocityX = player.facingRight ? 5 : -5;
                    enemy.velocityY = -5;
                    
                    // Sprawdź czy wróg żyje
                    if (enemy.health <= 0) {
                        // Dodaj punkty
                        player.score += ENEMY_PROPERTIES[enemy.type].points;
                        
                        // Losowa szansa na upuszczenie przedmiotu
                        if (Math.random() < 0.3) {
                            spawnItem(enemy.x, enemy.y);
                        }
                    }
                }
            });
        }
    }

    // Obsługa interakcji z przedmiotami
    function handleItemInteraction() {
        // Sprawdź kolizje z owocami
        fruits.forEach((fruit, index) => {
            if (fruit.collected) return;
            
            if (checkCollision(player, fruit)) {
                // Zbierz owoc
                const properties = FRUIT_PROPERTIES[fruit.type];
                player.health = Math.min(player.health + properties.health, player.maxHealth);
                player.score += properties.points;
                
                // Oznacz jako zebrany
                fruit.collected = true;
                fruits.splice(index, 1);
            }
        });
        
        // Sprawdź kolizje ze skarbami
        chests.forEach((chest, index) => {
            if (chest.opened) return;
            
            if (checkCollision(player, chest)) {
                // Otwórz skarb
                chest.opened = true;
                
                // Dodaj przedmioty ze skarbu
                chest.items.forEach(item => {
                    addItemToInventory(item);
                });
                
                // Usuń skarb
                chests.splice(index, 1);
            }
        });
    }

    // Dodawanie przedmiotu do ekwipunku
    function addItemToInventory(item) {
        // Sprawdź czy gracz ma już ten przedmiot
        const existingItem = player.inventory.find(i => i.type === item.type);
        
        if (existingItem) {
            // Zwiększ ilość
            existingItem.quantity += item.quantity;
        } else {
            // Dodaj nowy przedmiot
            player.inventory.push(item);
        }
    }

    // Spawn przedmiotu
    function spawnItem(x, y) {
        // Losowy przedmiot
        const itemTypes = [
            { type: 'weapon', id: WEAPON_TYPES.SWORD, chance: 0.3 },
            { type: 'weapon', id: WEAPON_TYPES.AXE, chance: 0.2 },
            { type: 'weapon', id: WEAPON_TYPES.PICKAXE, chance: 0.2 },
            { type: 'weapon', id: WEAPON_TYPES.BOW, chance: 0.15 },
            { type: 'weapon', id: WEAPON_TYPES.STAFF, chance: 0.15 }
        ];
        
        // Wybierz przedmiot na podstawie szans
        const roll = Math.random();
        let cumulativeChance = 0;
        
        for (const item of itemTypes) {
            cumulativeChance += item.chance;
            if (roll <= cumulativeChance) {
                player.inventory.push({
                    type: item.type,
                    id: item.id,
                    quantity: 1
                });
                break;
            }
        }
    }

    // Sprawdzanie kolizji
    function checkCollisions() {
        // Kolizje z blokami
        const blockX = Math.floor(player.x / BLOCK_SIZE);
        const blockY = Math.floor(player.y / BLOCK_SIZE);
        
        // Kolizja z podłożem
        if (player.velocityY > 0 && isSolid(blockX, blockY + 1)) {
            player.y = blockY * BLOCK_SIZE;
            player.velocityY = 0;
            player.isJumping = false;
        }
        
        // Kolizja z sufitem
        if (player.velocityY < 0 && isSolid(blockX, blockY)) {
            player.y = (blockY + 1) * BLOCK_SIZE;
            player.velocityY = 0;
        }
        
        // Kolizja z blokami po bokach
        if (player.movingRight && isSolid(blockX + 1, blockY)) {
            player.x = blockX * BLOCK_SIZE;
        } else if (player.movingLeft && isSolid(blockX - 1, blockY)) {
            player.x = (blockX + 1) * BLOCK_SIZE;
        }
        
        // Kolizje z wrogami
        enemies.forEach(enemy => {
            if (enemy.health <= 0) return;
            
            if (checkCollision(player, enemy)) {
                // Odrzuć gracza
                const knockback = 5;
                player.velocityX = enemy.facingRight ? knockback : -knockback;
                player.velocityY = -5;
                
                // Zadaj obrażenia
                player.health -= ENEMY_PROPERTIES[enemy.type].damage;
                
                // Sprawdź czy gracz żyje
                if (player.health <= 0) {
                    gameOver();
                }
            }
        });
        
        // Kolizje z owocami
        handleItemInteraction();
    }

    // Sprawdzanie czy obiekt jest na ziemi
    function isOnGround(obj) {
        const blockX = Math.floor(obj.x / BLOCK_SIZE);
        const blockY = Math.floor(obj.y / BLOCK_SIZE);
        return isSolid(blockX, blockY + 1);
    }

    // Kopanie bloku
    function digBlock(x, y) {
        if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT) return;
        
        const block = world[y][x];
        if (block === BLOCK_TYPES.AIR) return;
        
        // Sprawdź czy gracz ma narzędzie
        const weaponType = player.equipment.weapon;
        if (!weaponType) return;
        
        // Usuń blok
        world[y][x] = BLOCK_TYPES.AIR;
        
        // Dodaj blok do ekwipunku
        addItemToInventory({
            type: 'block',
            id: block,
            quantity: 1
        });
    }

    // Stawianie bloku
    function placeBlock(x, y) {
        if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT) return;
        
        // Sprawdź czy miejsce jest wolne
        if (world[y][x] !== BLOCK_TYPES.AIR) return;
        
        // Sprawdź czy gracz ma blok w ekwipunku
        const blockItem = player.inventory.find(item => item.type === 'block');
        if (!blockItem) return;
        
        // Sprawdź czy nie blokujemy drogi graczowi
        const playerBlockX = Math.floor(player.x / BLOCK_SIZE);
        const playerBlockY = Math.floor(player.y / BLOCK_SIZE);
        
        if (x === playerBlockX && y === playerBlockY) return;
        if (x === playerBlockX && y === playerBlockY - 1) return;
        
        // Postaw blok
        world[y][x] = blockItem.id;
        
        // Usuń blok z ekwipunku
        blockItem.quantity--;
        if (blockItem.quantity <= 0) {
            player.inventory = player.inventory.filter(item => item !== blockItem);
        }
    }

    // Sprawdzanie czy blok jest stały
    function isSolid(x, y) {
        if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT) return true;
        const block = world[y][x];
        return block !== BLOCK_TYPES.AIR && block !== BLOCK_TYPES.WATER;
    }
}); 