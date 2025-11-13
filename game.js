// יצירת אבן ממוקדת שחקן מתא סכנה אקראי
function spawnMapHazardTowardPlayer() {
    const map = window.currentMap;
    if (!map || !Array.isArray(map.cells)) return;
    const dangerCells = map.cells.filter(c => c.type === 'danger');
    if (dangerCells.length === 0) return;

    // בחר תא סכנה אקראי
    const source = dangerCells[Math.floor(Math.random() * dangerCells.length)];
    const cellWidth = canvas.width / map.width;
    const cellHeight = canvas.height / map.height;

    // מרכז מקור
    const startX = source.x * cellWidth + cellWidth / 2;
    const startY = source.y * cellHeight + cellHeight / 2;

    // יעד: מרכז השחקן
    const targetX = player.x + player.width / 2;
    const targetY = player.y + player.height / 2;

    const dx = targetX - startX;
    const dy = targetY - startY;
    const len = Math.hypot(dx, dy) || 1;
    const speed = 3.5; // מהירות בסיסית
    const vx = (dx / len) * speed;
    const vy = (dy / len) * speed;

    const hazardSize = Math.min(cellWidth, cellHeight) * 0.8;
    boxes.push({
        x: startX - hazardSize / 2,
        y: startY - hazardSize / 2,
        width: hazardSize,
        height: hazardSize,
        speedX: vx,
        speedY: vy,
        side: false
    });
}
// משתני התחברות
let playerName = '';
let playerEmail = '';
let playerPassword = ''; // סיסמה ייחודית
let playerLevel = 1;
let isLoggedIn = false;
let joinDate = '';
let playerStats = {
    highestLevel: 1,
    totalGames: 0,
    localRank: '--'
};

// משתני משחק
const LEVEL_SKINS = {
    1: 'green',
    2: 'pink',
    3: 'blue',
    4: 'orange'
};

// מערכת ביצים ופרסים
const EGG_REWARDS = {
    'green': { chance: 0.7, description: 'ביצה ירוקה בהירה', color: '#00ff00' },
    'yellow': { chance: 0.5, description: 'ביצה צהובה בהירה', color: '#ffff00' },
    'red': { chance: 0.2, description: 'ביצה אדומה בהירה', color: '#ff0000' }
};

let playerEggs = [];
let playerRewards = [];

let ownedSkins = [LEVEL_SKINS[1]];
let selectedSkin = LEVEL_SKINS[1];
window.customMaps = window.customMaps || [];
let currentMap = null;
window.currentLanguage = 'en';

// מערכת חברים
let friends = [];
let friendRequests = [];
const MAX_FRIENDS = 100;

// העליון של הקובץ
let pendingBlackHole = false;
let showBlackHole = false;
let timeUp = false;
let timerBlinking = false;
let blackHoleActive = false;
let blackHoleX = 0;
let blackHoleY = 0;
let blackHoleRadius = 0;
let boxesBeingSucked = [];
let blackHoleFullScreen = false; // האם החור השחור בולע את כל המסך
let emergingFromBlackHole = false; // האם השחקן יוצא מהחור השחור
let emergingProgress = 0; // התקדמות היציאה מהחור (0-1)

// מערכת בוס
let bossActive = false; // האם קרב הבוס פעיל
let boss = {
    x: 0,
    y: 50,
    width: 120,
    height: 120,
    health: 500,
    maxHealth: 500,
    speedX: 2, // מהירות תנועה של הבוס
    direction: 1 // 1 = ימינה, -1 = שמאלה
};
let playerHits = 0; // מספר הפגיעות שהשחקן ספג
const MAX_PLAYER_HITS = 4; // 4 פגיעות = הפסד
let playerBullets = []; // רשימת הקוביות הירוקות שהשחקן יורה
let bossBullets = []; // רשימת הקוביות האדומות שהבוס יורה
let lastPlayerShot = 0; // זמן היריה האחרונה של השחקן
let lastBossShot = 0; // זמן היריה האחרונה של הבוס
const PLAYER_SHOOT_COOLDOWN = 300; // cooldown בין יריות (במילישניות)
const BOSS_SHOOT_INTERVAL = 1500; // הבוס יורה כל 1.5 שניות
const PLAYER_BULLET_DAMAGE = 25; // נזק של כל יריה (500/25 = 20 יריות)

// אנימציית פיצוץ הבוס
let bossExploding = false;
let explosionProgress = 0;
let explosionParticles = [];

// פונקציה לטיפול בהתחברות
function handleLogin() {
    console.log("פונקציית התחברות הופעלה");
    const nameInput = document.getElementById('loginName');
    const emailInput = document.getElementById('loginEmail');
    
    // בדוק שהוזנו שם ואימייל
    if (nameInput && nameInput.value.trim() !== '' && 
        emailInput && emailInput.value.trim() !== '') {
        
        // שמור את פרטי המשתמש
        playerName = nameInput.value.trim();
        playerEmail = emailInput.value.trim();
        isLoggedIn = true;
        
        // הגדר תאריך הצטרפות אם זה חדש
        if (!joinDate) {
            joinDate = getCurrentDate();
        }
        
        // הגדר סטטיסטיקות התחלתיות אם צריך
        if (!playerStats || typeof playerStats !== 'object') {
            playerStats = {
                highestLevel: playerLevel,
                totalGames: 0,
                localRank: '--'
            };
        }
        
        // שמור את הנתונים ב-localStorage
        saveGameData();
        
        // הסתר את מסך ההתחברות והצג את הלובי
        const loginOverlay = document.getElementById('loginOverlay');
        if (loginOverlay) {
            loginOverlay.style.display = 'none';
        }
        
        const lobby = document.getElementById('lobby');
        if (lobby) {
            lobby.style.display = 'block';
        }
        
                    // הצג את כפתור ההגדרות
            const settingsButton = document.getElementById('settingsButton');
            if (settingsButton) {
                settingsButton.style.display = 'flex';
                console.log("כפתור הגדרות הוצג");
            } else {
                console.error("לא נמצא אלמנט settingsButton");
            }
        
        // עדכן את פרטי המשתמש בלובי
        updatePlayerInfo();
        
        // עדכן את מסך הפרופיל
        updateProfileDisplay();
        
        // עדכן את הדירוג המקומי
        updateLocalLeaderboard();
        
        // עדכן את טבלאות הדירוג
        updateLeaderboards();
        
        console.log('התחברות הושלמה בהצלחה:', playerName, playerEmail);
    } else {
        // הודעת שגיאה אם חסרים פרטים
        alert('אנא הזן שם ואימייל כדי להתחיל לשחק');
    }
}

// פונקציה לטיפול בהתחברות ישירות מה-HTML
window.loginDirectly = function() {
    console.log("פונקציית התחברות ישירה הופעלה");
    
    // מנע ברירת מחדל אם נקרא מאירוע
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    
    try {
        const nameInput = document.getElementById('loginName');
        const passwordInput = document.getElementById('loginPassword');
        const errorDiv = document.getElementById('loginError');
        
        // בדוק שהוזנו שם וסיסמה
        if (nameInput && nameInput.value.trim() !== '' && 
            passwordInput && passwordInput.value.trim() !== '') {
            
            const username = nameInput.value.trim();
            const password = passwordInput.value.trim();
            
            // בדוק אם הסיסמה תפוסה על ידי משתמש אחר
            if (isPasswordTaken(password, username)) {
                if (errorDiv) {
                    errorDiv.textContent = '❌ הסיסמה הזאת כבר תפוסה על ידי משתמש אחר!';
                    errorDiv.style.display = 'block';
                }
                return;
            }
            
            // שמור את פרטי המשתמש
            playerName = username;
            playerPassword = password;
            playerEmail = password + '@dice-game.local'; // גם שומרים כאימייל לתאימות
            isLoggedIn = true;
            
            // שמור את הסיסמה במאגר הסיסמאות הגלובלי
            saveRegisteredPassword(username, password);
            
            // הסתר הודעת שגיאה אם הייתה
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
            
            // הגדר תאריך הצטרפות אם זה חדש
            if (!joinDate) {
                joinDate = getCurrentDate();
            }
            
            // הגדר סטטיסטיקות התחלתיות אם צריך
            if (!playerStats || typeof playerStats !== 'object') {
                playerStats = {
                    highestLevel: playerLevel,
                    totalGames: 0,
                    localRank: '--'
                };
            }
            
            // הוסף את השחקן לדירוג המקומי אם הוא לא קיים
            const existingPlayerIndex = localLeaderboard.findIndex(p => p.email === playerEmail);
            if (existingPlayerIndex === -1) {
                localLeaderboard.push({
                    name: playerName,
                    email: playerEmail,
                    level: playerLevel,
                    joinDate: joinDate
                });
            }
            
            // שמור את הנתונים ב-localStorage
            saveGameData();
            
            console.log("נתונים נשמרו ב-localStorage");
            
            // הסתר את מסך ההתחברות
            const loginScreen = document.getElementById('loginScreen') || document.getElementById('loginOverlay');
            if (loginScreen) {
                loginScreen.style.display = 'none';
                console.log("✅ מסך התחברות הוסתר");
            } else {
                console.error("❌ לא נמצא אלמנט loginScreen או loginOverlay");
            }
            
            // הצג את הלובי
            const lobby = document.getElementById('lobby');
            if (lobby) {
                lobby.style.display = 'block';
                console.log("לובי הוצג");
            } else {
                console.error("לא נמצא אלמנט lobby");
            }
            
            // הצג את כפתור ההגדרות
            const settingsButton = document.getElementById('settingsButton');
            if (settingsButton) {
                settingsButton.style.display = 'flex';
                console.log("כפתור הגדרות הוצג");
            } else {
                console.error("לא נמצא אלמנט settingsButton");
            }
            
            // עדכן את הודעת הברכה
            const welcomeMessage = document.getElementById('welcomeMessage');
            if (welcomeMessage) {
                welcomeMessage.textContent = `ברוך הבא, ${playerName}!`;
            }
            
            console.log('התחברות הושלמה בהצלחה:', playerName, playerEmail);
            
            // עדכן את פרטי המשתמש בלובי
            updatePlayerInfo();
            
            // עדכן את מסך הפרופיל
            updateProfileDisplay();
            
            // עדכן את הדירוג המקומי
            updateLocalLeaderboard();
            
            // עדכן את טבלאות הדירוג
            updateLeaderboards();
        } else {
            console.error("שם או אימייל חסרים");
            alert('אנא הזן שם ואימייל כדי להתחיל לשחק');
        }
    } catch (error) {
        console.error("שגיאה בתהליך ההתחברות:", error);
        alert('אירעה שגיאה בתהליך ההתחברות. אנא נסה שוב.');
    }
}

// משתני דירוג
let globalLeaderboard = [];
let localLeaderboard = [];

// הגדרות דירוג
let leaderboardSettings = {
    showLeaderboard: 'both', // 'both', 'local', 'global', 'none'
    defaultView: 'local'     // 'local', 'global'
};

// קבל את אלמנטי ה-DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const messageDiv = document.getElementById('message');
const retryBtn = document.getElementById('retryBtn');
const startBtn = document.getElementById('startBtn');
const backToLobbyBtn = document.getElementById('backToLobbyBtn');
const lobby = document.getElementById('lobby');
const gameContainer = document.getElementById('gameContainer');
const settingsButton = document.getElementById('settingsButton');

console.log("🔍 בדיקת אלמנטים גלובליים:", {
    lobby: lobby ? "✅" : "❌",
    gameContainer: gameContainer ? "✅" : "❌",
    settingsButton: settingsButton ? "✅" : "❌"
});

// הגדרות דמות
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 40,
    width: 40,
    height: 40,
    color: '#00cc44', // ירוק קבוע
    speed: 6
};

// קוביות נופלות
const boxes = [];
const boxWidth = 40;
const boxHeight = 40;
const boxSpeed = 1;
let boxInterval = 1200; // כל כמה זמן נוצרת קוביה (ms)
let lastBoxTime = 0;
// מפה: יוצר סכנות ממוקדות שחקן
let lastMapHazardTime = 0;
let mapHazardIntervalMs = 1000; // כל כמה זמן משוגר אבן מסוכנת

// קוביות מהצדדים בשלב 3
function spawnSideBox() {
    // בחר צד אקראי
    const fromLeft = Math.random() < 0.5;
    const y = canvas.height - player.height - 10; // בגובה הדמות
    const x = fromLeft ? -boxWidth : canvas.width;
    const speed = fromLeft ? 1 : -1;
    boxes.push({ x, y, width: boxWidth, height: boxHeight, speedX: speed, speedY: 0, side: true });
}

// משתני קפיצה ותנועה אנכית
let isJumping = false;
let jumpStartY = 0;
let jumpTime = 0;
const jumpHeight = 90;
const jumpDuration = 600; // ms
let verticalVelocity = 0; // מהירות אנכית
const verticalAcceleration = 0.8; // "גרביטציה" קלה
const verticalMaxSpeed = 6;

// טיימר שלב
let level = 1;
let levelTime = 60000; // ברירת מחדל: 60 שניות
let startTime = null;
let gameOver = false;

// קלט מקשים
const keys = {};
document.addEventListener('keydown', e => {
    // מניעת גלילת דפדפן בחצים במצב מפה
    if (level === 'map' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
    }
    keys[e.key] = true;
    
    // קפיצה במשחק רגיל (לא בבוס)
    if (e.key === ' ' && !bossActive && !isJumping && player.y >= canvas.height - player.height - 0.1) {
        isJumping = true;
        jumpStartY = canvas.height - player.height;
        jumpTime = 0;
    }
});
document.addEventListener('keyup', e => {
    if (level === 'map' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
    }
    keys[e.key] = false;
});

// תמיכה במובייל - משתנים עבור touch
let touchStartX = null;
let touchStartY = null;
let touchCurrentX = null;
let isTouching = false;

// אירועי touch לגרירת השחקן
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchStartX = touch.clientX - rect.left;
    touchStartY = touch.clientY - rect.top;
    touchCurrentX = touchStartX;
    isTouching = true;
    
    // במשחק רגיל (לא בוס) - בדוק אם זו לחיצה לקפיצה
    // אם נוגעים בחלק העליון של המסך, זו קפיצה
    if (!bossActive && touchStartY < canvas.height * 0.3) {
        if (!isJumping && player.y >= canvas.height - player.height - 0.1) {
            isJumping = true;
            jumpStartY = canvas.height - player.height;
            jumpTime = 0;
        }
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isTouching) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchCurrentX = touch.clientX - rect.left;
    
    // הזז את השחקן לפי מיקום האצבע (רק בציר X)
    // המרת מיקום touch למיקום שחקן
    const targetX = touchCurrentX - player.width / 2;
    player.x = Math.max(0, Math.min(canvas.width - player.width, targetX));
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isTouching = false;
    touchStartX = null;
    touchStartY = null;
    touchCurrentX = null;
});

canvas.addEventListener('touchcancel', (e) => {
    e.preventDefault();
    isTouching = false;
    touchStartX = null;
    touchStartY = null;
    touchCurrentX = null;
});

// הגדרת צבעים קבועים לכל שלב - הוגדר כבר בתחילת הקובץ עם שמות צבעים
// נמחקה הגדרה כפולה כדי למנוע שגיאת "Identifier 'LEVEL_SKINS' has already been declared"

const translations = {
    en: {
        // כותרות
        gameTitle: 'Dice Evasion Game',
        loginTitle: 'Welcome to Dice Evasion Game',
        howToPlayTitle: 'How to Play:',
        createMapTitle: 'Create Custom Map',
        myCustomMapsTitle: 'My Custom Maps',
        mapCreatorTab: 'Map Creator',
        settingsTitle: 'Settings',
        
        // הודעות עלייה ברמה
        levelUpMessage: 'Level completed! +{0} player level points!',
        
        // פרופיל
        profileTabBtn: 'Profile',
        profileStatsTitle: 'Player Statistics',
        profileLevelLabel: 'Level:',
        profileJoinDateLabel: 'Joined:',
        profileEmailLabel: 'Email:',
        profileHighestLevelLabel: 'Highest Level',
        profileTotalGamesLabel: 'Total Games',
        profileRankLabel: 'Local Rank',
        
        // מסך התחברות
        nameLabel: 'Name:',
        emailLabel: 'Email:',
        loginBtn: 'Start Playing',
        playerNamePlaceholder: 'Enter your name',
        playerEmailPlaceholder: 'Enter your email',
        welcomeMessage: 'Welcome, {0}!',
        playerLevel: 'Level: {0}',
        loginRequired: 'Please enter both name and email.',
        
        // דירוג
        leaderboardTitle: 'Leaderboards',
        localLeaderboardTitle: 'Local Top Players',
        globalLeaderboardTitle: 'Global Top Players',
        rankHeader: 'Rank',
        nameHeader: 'Name',
        levelHeader: 'Level',
        localTabBtn: 'Local',
        globalTabBtn: 'Global',
        noLocalPlayers: 'No local players yet',
        noGlobalPlayers: 'No global players yet',
        
        // הגדרות דירוג
        generalTabBtn: 'General',
        leaderboardTabBtn: 'Leaderboard',
        showLeaderboardLabel: 'Show Leaderboard:',
        defaultLeaderboardLabel: 'Default View:',
        resetLocalLeaderboardLabel: 'Reset Local Leaderboard:',
        resetLocalLeaderboardBtn: 'Reset',
        resetConfirmation: 'Are you sure you want to reset the local leaderboard?',
        showBoth: 'Both Local & Global',
        showLocalOnly: 'Local Only',
        showGlobalOnly: 'Global Only',
        hideLeaderboards: 'Hide Leaderboards',
        
        // חברים
        friendsTabBtn: 'Friends',
        friendsListLabel: 'Friends ({0}/{1})',
        addFriendLabel: 'Add Friend',
        searchFriendPlaceholder: 'Search friend by name or email...',
        friendRequestsLabel: 'Friend Requests ({0})',
        friendEmailPlaceholder: 'Enter friend email or name',
        sendRequestBtn: 'Send Request',
        acceptRequestBtn: 'Accept',
        rejectRequestBtn: 'Reject',
        removeFriendBtn: 'Remove',
        maxFriendsReached: 'Maximum {0} friends reached!',
        friendRequestSent: 'Friend request sent to {0}!',
        friendAdded: '{0} added as friend!',
        friendRequestAccepted: 'Friend request accepted!',
        friendRemoved: 'Friend {0} removed',
        cannotAddYourself: 'Cannot add yourself as a friend!',
        
        // הוראות משחק
        instruction1: '• Use the left/right arrow keys to move',
        instruction2: '• Dodge the falling red dice',
        instruction3: '• Survive for one minute to pass the level',
        instruction4: '• In level 2, more dice will fall at once!',
        instruction5: '• In level 3, dice will also come from the sides – jump over them with the Space key!',
        
        // תוויות
        startLevelLabel: 'Start from level:',
        topDiceLabel: 'Top Dice:',
        sideDiceLabel: 'Side Dice:',
        levelTimeLabel: 'Time (seconds):',
        diceSpeedLabel: 'Dice Speed:',
        levelNameLabel: 'Level Name:',
        languageLabel: 'Language:',
        
        // כפתורים
        startBtn: 'Start Game',
        loadBtn: 'Load',
        deleteBtn: 'Delete',
        retryBtn: 'Try Again',
        continueToLevel2: 'Continue to Level 2',
        continueToLevel3: 'Continue to Level 3',
        continueToLevel4: 'Continue to Level 4',
        playAgain: 'Play Again',
        tryAgain: 'Try Again',
        tryLevel2Again: 'Try Level 2 Again',
        tryLevel3Again: 'Try Level 3 Again',
        tryLevel4Again: 'Try Level 4 Again',
        backToLobbyBtn: 'Back to Lobby',
        saveSettingsBtn: 'Save',
        
        // הודעות
        passedLevel1: 'Great job! You passed Level 1!',
        receivedEgg: 'You received an egg!',
        openEgg: 'Open Egg',
        receivedReward: 'You received a reward: {0}!',
        noReward: 'No reward this time. Try again!',
        timeUp: 'TIME UP!',
        blackHole: 'BLACK HOLE!',
        passedLevel2: 'Awesome! You passed Level 2!',
        passedLevel3: 'Incredible! You passed Level 3!',
        completedAllLevels: 'AMAZING! You completed all levels!',
        youLost: 'You lost! Try again.',
        
        // אחר
        levelPrefix: 'Level ',
        levelSaved: 'Level "{0}" saved!',
        confirmDelete: 'Are you sure you want to delete the level "{0}"?',
        drawTimer: 'Time left: {0}s',
        receivedGreenSkin: 'You received the Green Skin!',
        receivedPinkSkin: 'You received the Pink Skin!',
        receivedBlueSkin: 'You received the Blue Skin!',
        receivedOrangeSkin: 'You received the Orange Skin!',
        
        // שינוי שם
        saveNameBtn: 'Save',
        nameChangedSuccess: 'Name changed successfully!'
    },
    he: {
        // כותרות
        gameTitle: 'משחק התחמקות מקוביות',
        loginTitle: 'ברוכים הבאים למשחק התחמקות מקוביות',
        howToPlayTitle: 'איך משחקים:',
        createMapTitle: 'צור מפה מותאמת אישית',
        myCustomMapsTitle: 'המפות המותאמות שלי',
        mapCreatorTab: 'יוצר מפות',
        settingsTitle: 'הגדרות',
        
        // הודעות עלייה ברמה
        levelUpMessage: 'שלב הושלם! +{0} נקודות רמת שחקן!',
        
        // פרופיל
        profileTabBtn: 'פרופיל',
        profileStatsTitle: 'סטטיסטיקות שחקן',
        profileLevelLabel: 'רמה:',
        profileJoinDateLabel: 'הצטרף:',
        profileEmailLabel: 'אימייל:',
        profileHighestLevelLabel: 'רמה הגבוהה ביותר',
        profileTotalGamesLabel: 'סך משחקים',
        profileRankLabel: 'דירוג מקומי',
        
        // מסך התחברות
        nameLabel: 'שם:',
        emailLabel: 'אימייל:',
        loginBtn: 'התחל לשחק',
        playerNamePlaceholder: 'הכנס את שמך',
        playerEmailPlaceholder: 'הכנס את האימייל שלך',
        welcomeMessage: 'שלום, {0}!',
        playerLevel: 'רמה: {0}',
        loginRequired: 'אנא הזן שם ואימייל.',
        
        // דירוג
        leaderboardTitle: 'טבלאות דירוג',
        localLeaderboardTitle: 'שחקנים מקומיים מובילים',
        globalLeaderboardTitle: 'שחקנים עולמיים מובילים',
        rankHeader: 'דירוג',
        nameHeader: 'שם',
        levelHeader: 'רמה',
        localTabBtn: 'מקומי',
        globalTabBtn: 'עולמי',
        noLocalPlayers: 'אין עדיין שחקנים מקומיים',
        noGlobalPlayers: 'אין עדיין שחקנים עולמיים',
        
        // הגדרות דירוג
        generalTabBtn: 'כללי',
        leaderboardTabBtn: 'טבלת דירוג',
        showLeaderboardLabel: 'הצג טבלת דירוג:',
        defaultLeaderboardLabel: 'תצוגת ברירת מחדל:',
        resetLocalLeaderboardLabel: 'אפס טבלת דירוג מקומית:',
        resetLocalLeaderboardBtn: 'איפוס',
        resetConfirmation: 'האם אתה בטוח שברצונך לאפס את טבלת הדירוג המקומית?',
        showBoth: 'גם מקומי וגם עולמי',
        showLocalOnly: 'מקומי בלבד',
        showGlobalOnly: 'עולמי בלבד',
        hideLeaderboards: 'הסתר טבלאות דירוג',
        
        // חברים
        friendsTabBtn: 'חברים',
        friendsListLabel: 'חברים ({0}/{1})',
        addFriendLabel: 'הוסף חבר',
        searchFriendPlaceholder: 'חפש חבר בשם או אימייל...',
        friendRequestsLabel: 'בקשות חברות ({0})',
        friendEmailPlaceholder: 'הכנס אימייל או שם חבר',
        sendRequestBtn: 'שלח בקשה',
        acceptRequestBtn: 'אשר',
        rejectRequestBtn: 'דחה',
        removeFriendBtn: 'הסר',
        maxFriendsReached: 'הגעת למקסימום של {0} חברים!',
        friendRequestSent: 'בקשת חברות נשלחה ל-{0}!',
        friendAdded: '{0} נוסף כחבר!',
        friendRequestAccepted: 'בקשת חברות אושרה!',
        friendRemoved: 'החבר {0} הוסר',
        cannotAddYourself: 'לא ניתן להוסיף את עצמך כחבר!',
        
        // הוראות משחק
        instruction1: '• השתמש בחצים ימינה/שמאלה כדי לנוע',
        instruction2: '• התחמק מהקוביות האדומות שנופלות',
        instruction3: '• שרוד דקה כדי לעבור שלב',
        instruction4: '• בשלב 2, יפלו יותר קוביות בכל פעם!',
        instruction5: '• בשלב 3, קוביות יגיעו גם מהצדדים – קפוץ מעליהן עם מקש הרווח!',
        
        // תוויות
        startLevelLabel: 'התחל משלב:',
        topDiceLabel: 'קוביות מלמעלה:',
        sideDiceLabel: 'קוביות מהצדדים:',
        levelTimeLabel: 'זמן (שניות):',
        diceSpeedLabel: 'מהירות קוביות:',
        levelNameLabel: 'שם השלב:',
        languageLabel: 'שפה:',
        
        // כפתורים
        startBtn: 'התחל משחק',
        loadBtn: 'טען',
        deleteBtn: 'מחק',
        retryBtn: 'נסה שוב',
        continueToLevel2: 'המשך לשלב 2',
        continueToLevel3: 'המשך לשלב 3',
        continueToLevel4: 'המשך לשלב 4',
        playAgain: 'שחק שוב',
        tryAgain: 'נסה שוב',
        tryLevel2Again: 'נסה שוב שלב 2',
        tryLevel3Again: 'נסה שוב שלב 3',
        tryLevel4Again: 'נסה שוב שלב 4',
        backToLobbyBtn: 'חזור ללובי',
        saveSettingsBtn: 'שמור',
        
        // הודעות
        passedLevel1: 'כל הכבוד! עברת את השלב הראשון!',
        passedLevel2: 'מעולה! עברת את השלב השני!',
        passedLevel3: 'מדהים! עברת את השלב השלישי!',
        completedAllLevels: 'מדהים! סיימת את כל השלבים!',
        youLost: 'נפסלת! נסה שוב.',
        
        // אחר
        levelPrefix: 'שלב ',
        levelSaved: 'שלב "{0}" נשמר!',
        confirmDelete: 'האם אתה בטוח שברצונך למחוק את השלב "{0}"?',
        drawTimer: 'זמן שנותר: {0} שניות',
        receivedGreenSkin: 'קיבלת את הסקין הירוק!',
        receivedPinkSkin: 'קיבלת את הסקין הורוד!',
        receivedBlueSkin: 'קיבלת את הסקין הכחול!',
        receivedOrangeSkin: 'קיבלת את הסקין הכתום!',
        receivedEgg: 'קיבלת ביצה!',
        openEgg: 'פתח ביצה',
        receivedReward: 'קיבלת פרס: {0}!',
        noReward: 'אין פרס הפעם. נסה שוב!',
        timeUp: 'הזמן נגמר!',
        blackHole: 'חור שחור!',
        
        // שינוי שם
        saveNameBtn: 'שמור',
        nameChangedSuccess: 'השם שונה בהצלחה!'
    }
};

// פונקציה שמחליפה פרמטרים בטקסט
function formatString(str, ...args) {
    return str.replace(/{(\d+)}/g, (match, number) => {
        return typeof args[number] !== 'undefined' ? args[number] : match;
    });
}

// פונקציה שמתרגמת טקסט לפי המפתח
function translate(key, ...args) {
    const text = translations[currentLanguage][key] || translations['en'][key] || key;
    if (args.length > 0) {
        return formatString(text, ...args);
    }
    return text;
}

// פונקציה שמעדכנת את כל הטקסטים בדף
function updatePageLanguage() {
    // הוספת או הסרת כיוון RTL
    if (currentLanguage === 'he') {
        document.body.classList.add('rtl');
    } else {
        document.body.classList.remove('rtl');
    }
    
    // כותרות
    document.title = translate('gameTitle');
    
    // עדכן את התרגומים של מערכת יצירת המפות אם היא קיימת
    if (typeof updateMapCreatorTranslations === 'function') {
        updateMapCreatorTranslations();
    }
    
    // עדכון מסך התחברות
    const loginTitle = document.getElementById('loginTitle');
    if (loginTitle) loginTitle.textContent = translate('loginTitle');
    
    // עדכון טקסטים בפרופיל
    const profileTabButton = document.getElementById('profileTabBtn');
    if (profileTabButton) profileTabButton.textContent = translate('profileTabBtn');
    
    const profileStatsTitle = document.getElementById('profileStatsTitle');
    if (profileStatsTitle) profileStatsTitle.textContent = translate('profileStatsTitle');
    
    const profileLevelLabel = document.getElementById('profileLevelLabel');
    if (profileLevelLabel) profileLevelLabel.textContent = translate('profileLevelLabel');
    
    const profileJoinDateLabel = document.getElementById('profileJoinDateLabel');
    if (profileJoinDateLabel) profileJoinDateLabel.textContent = translate('profileJoinDateLabel');
    
    const profileEmailLabel = document.getElementById('profileEmailLabel');
    if (profileEmailLabel) profileEmailLabel.textContent = translate('profileEmailLabel');
    
    const profileHighestLevelLabel = document.getElementById('profileHighestLevelLabel');
    if (profileHighestLevelLabel) profileHighestLevelLabel.textContent = translate('profileHighestLevelLabel');
    
    const profileTotalGamesLabel = document.getElementById('profileTotalGamesLabel');
    if (profileTotalGamesLabel) profileTotalGamesLabel.textContent = translate('profileTotalGamesLabel');
    
    const profileRankLabel = document.getElementById('profileRankLabel');
    if (profileRankLabel) profileRankLabel.textContent = translate('profileRankLabel');
    
    const nameLabel = document.getElementById('nameLabel');
    if (nameLabel) nameLabel.textContent = translate('nameLabel');
    
    const emailLabel = document.getElementById('emailLabel');
    if (emailLabel) emailLabel.textContent = translate('emailLabel');
    
    const loginButton = document.getElementById('loginBtn');
    if (loginButton) loginButton.textContent = translate('loginBtn');
    
    const playerNameInput = document.getElementById('playerName');
    if (playerNameInput) playerNameInput.placeholder = translate('playerNamePlaceholder');
    
    const playerEmailInput = document.getElementById('playerEmail');
    if (playerEmailInput) playerEmailInput.placeholder = translate('playerEmailPlaceholder');
    
    // עדכון פרטי משתמש אם מחובר
    if (isLoggedIn) {
        updatePlayerInfo();
    }
    
    // עדכון טבלאות דירוג
    const leaderboardTitle = document.getElementById('leaderboardTitle');
    if (leaderboardTitle) leaderboardTitle.textContent = translate('leaderboardTitle');
    
    const localLeaderboardTitle = document.getElementById('localLeaderboardTitle');
    if (localLeaderboardTitle) localLeaderboardTitle.textContent = translate('localLeaderboardTitle');
    
    const globalLeaderboardTitle = document.getElementById('globalLeaderboardTitle');
    if (globalLeaderboardTitle) globalLeaderboardTitle.textContent = translate('globalLeaderboardTitle');
    
    const rankHeader = document.getElementById('rankHeader');
    if (rankHeader) rankHeader.textContent = translate('rankHeader');
    
    const nameHeader = document.getElementById('nameHeader');
    if (nameHeader) nameHeader.textContent = translate('nameHeader');
    
    const levelHeader = document.getElementById('levelHeader');
    if (levelHeader) levelHeader.textContent = translate('levelHeader');
    
    const globalRankHeader = document.getElementById('globalRankHeader');
    if (globalRankHeader) globalRankHeader.textContent = translate('rankHeader');
    
    const globalNameHeader = document.getElementById('globalNameHeader');
    if (globalNameHeader) globalNameHeader.textContent = translate('nameHeader');
    
    const globalLevelHeader = document.getElementById('globalLevelHeader');
    if (globalLevelHeader) globalLevelHeader.textContent = translate('levelHeader');
    
    const localTabBtn = document.getElementById('localTabBtn');
    if (localTabBtn) localTabBtn.textContent = translate('localTabBtn');
    
    const globalTabBtn = document.getElementById('globalTabBtn');
    if (globalTabBtn) globalTabBtn.textContent = translate('globalTabBtn');
    
    // עדכון טאבים בהגדרות
    const generalTabBtn = document.getElementById('generalTabBtn');
    if (generalTabBtn) generalTabBtn.textContent = translate('generalTabBtn');
    
    const leaderboardTabBtn = document.getElementById('leaderboardTabBtn');
    if (leaderboardTabBtn) leaderboardTabBtn.textContent = translate('leaderboardTabBtn');
    
    const friendsTabBtn = document.getElementById('friendsTabBtn');
    if (friendsTabBtn) friendsTabBtn.textContent = translate('friendsTabBtn');
    
    const friendsListLabel = document.getElementById('friendsListLabel');
    if (friendsListLabel) friendsListLabel.textContent = translate('friendsListLabel', friends.length, MAX_FRIENDS);
    
    const addFriendLabel = document.getElementById('addFriendLabel');
    if (addFriendLabel) addFriendLabel.textContent = translate('addFriendLabel');
    
    const friendEmailInput = document.getElementById('friendEmailInput');
    if (friendEmailInput) friendEmailInput.placeholder = translate('friendEmailPlaceholder');
    
    const sendFriendRequestBtn = document.getElementById('sendFriendRequestBtn');
    if (sendFriendRequestBtn) sendFriendRequestBtn.textContent = translate('sendRequestBtn');
    
    const playerNameChangeLabel = document.getElementById('playerNameLabel');
    if (playerNameChangeLabel) playerNameChangeLabel.textContent = translate('playerNameLabel');
    
    const playerNameChangeInput = document.getElementById('playerNameChange');
    if (playerNameChangeInput) playerNameChangeInput.placeholder = translate('playerNamePlaceholder');
    
    const saveNameBtn = document.getElementById('saveNameBtn');
    if (saveNameBtn) saveNameBtn.textContent = translate('saveNameBtn');
    
    // עדכון הגדרות דירוג
    const showLeaderboardLabel = document.getElementById('showLeaderboardLabel');
    if (showLeaderboardLabel) showLeaderboardLabel.textContent = translate('showLeaderboardLabel');
    
    const defaultLeaderboardLabel = document.getElementById('defaultLeaderboardLabel');
    if (defaultLeaderboardLabel) defaultLeaderboardLabel.textContent = translate('defaultLeaderboardLabel');
    
    const resetLocalLeaderboardLabel = document.getElementById('resetLocalLeaderboardLabel');
    if (resetLocalLeaderboardLabel) resetLocalLeaderboardLabel.textContent = translate('resetLocalLeaderboardLabel');
    
    const resetLocalLeaderboardBtn = document.getElementById('resetLocalLeaderboardBtn');
    if (resetLocalLeaderboardBtn) resetLocalLeaderboardBtn.textContent = translate('resetLocalLeaderboardBtn');
    
    // עדכון אפשרויות בתפריטים
    const showLeaderboardSelect = document.getElementById('showLeaderboardSelect');
    if (showLeaderboardSelect) {
        const options = showLeaderboardSelect.options;
        if (options[0]) options[0].textContent = translate('showBoth');
        if (options[1]) options[1].textContent = translate('showLocalOnly');
        if (options[2]) options[2].textContent = translate('showGlobalOnly');
        if (options[3]) options[3].textContent = translate('hideLeaderboards');
    }
    
    // עדכון טבלאות הדירוג
    updateLeaderboards();
    
    // כותרות בלובי
    const lobbyTitle = document.querySelector('#lobby h1');
    if (lobbyTitle) lobbyTitle.textContent = translate('gameTitle');
    
    document.getElementById('howToPlayTitle').textContent = translate('howToPlayTitle');
    document.getElementById('settingsTitle').textContent = translate('settingsTitle');
    
    // הוראות משחק
    document.getElementById('instruction1').textContent = translate('instruction1');
    document.getElementById('instruction2').textContent = translate('instruction2');
    document.getElementById('instruction3').textContent = translate('instruction3');
    document.getElementById('instruction4').textContent = translate('instruction4');
    document.getElementById('instruction5').textContent = translate('instruction5');
    
    // תוויות (אלמנטים שהוסרו מה-HTML - בדיקה בטוחה)
    const elementsToUpdate = [
        'startLevelLabel', 'topDiceLabel', 'sideDiceLabel', 
        'levelTimeLabel', 'diceSpeedLabel', 'levelNameLabel', 'languageLabel'
    ];
    
    elementsToUpdate.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = translate(elementId);
        }
    });
    
    // כפתורים (בדיקה בטוחה)
    const buttonsToUpdate = ['startBtn', 'backToLobbyBtn', 'saveSettingsBtn'];
    buttonsToUpdate.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.textContent = translate(buttonId);
        }
    });
    
    // אחר
    
    // עדכון כותרת המשחק אם המשחק פעיל
    const gameTitle = document.getElementById('gameTitle');
    if (gameTitle) {
        gameTitle.textContent = translate('gameTitle');
    }
    if (gameTitle) {
        if (level === 'custom' && currentCustomLevel) {
            gameTitle.textContent = `${translate('gameTitle')} - ${currentCustomLevel.name}`;
        } else {
            gameTitle.textContent = `${translate('gameTitle')} - ${translate('levelPrefix')}${level}`;
        }
    }
    
    // עדכון כפתור נסה שוב אם מוצג
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn.style.display !== 'none') {
        updateRetryButtonText();
    }
}

function updateRetryButtonText() {
    const retryBtn = document.getElementById('retryBtn');
    if (!retryBtn) return;
    
    if (gameOver) {
        if (level === 1 && messageDiv.textContent.includes(translate('passedLevel1'))) {
            retryBtn.textContent = translate('continueToLevel2');
        } else if (level === 2 && messageDiv.textContent.includes(translate('passedLevel2'))) {
            retryBtn.textContent = translate('continueToLevel3');
        } else if (level === 3 && messageDiv.textContent.includes(translate('passedLevel3'))) {
            retryBtn.textContent = translate('continueToLevel4');
        } else if (level === 4 || level === 'custom') {
            retryBtn.textContent = translate('playAgain');
        } else {
            if (level === 'custom') {
                retryBtn.textContent = translate('tryAgain');
            } else {
                retryBtn.textContent = (level === 1) ? translate('tryAgain') : 
                                    (level === 2) ? translate('tryLevel2Again') : 
                                    (level === 3) ? translate('tryLevel3Again') : translate('tryLevel4Again');
            }
        }
    }
}

// פונקציות מערכת הביצים
function addNewEgg() {
    // צור ביצה חדשה עם סיכויים אקראיים
    const random = Math.random();
    let eggType = 'green'; // ברירת מחדל
    
    // בחר סוג ביצה לפי הסיכויים
    if (random <= 0.2) {
        eggType = 'red';
    } else if (random <= 0.5) {
        eggType = 'yellow';
    } else if (random <= 0.7) {
        eggType = 'green';
    }
    
    const newEgg = {
        id: Date.now(),
        type: eggType,
        level: level,
        opened: false
    };
    
    playerEggs.push(newEgg);
    console.log(`נוספה ביצה חדשה מסוג ${eggType} ברמה ${level}`);
    saveGameData();
    
    return newEgg;
}

function showOpenEggButton() {
    // בדוק אם כבר קיים כפתור לפתיחת ביצה
    let openEggBtn = document.getElementById('openEggBtn');
    
    if (!openEggBtn) {
        // יצירת כפתור חדש לפתיחת ביצה
        openEggBtn = document.createElement('button');
        openEggBtn.id = 'openEggBtn';
        openEggBtn.textContent = translate('openEgg');
        openEggBtn.style.display = 'inline-block';
        openEggBtn.style.marginLeft = '10px';
        openEggBtn.style.background = 'linear-gradient(45deg, #ffcc00, #ff9900)';
        openEggBtn.style.color = 'white';
        openEggBtn.style.border = 'none';
        openEggBtn.style.borderRadius = '5px';
        openEggBtn.style.padding = '10px 20px';
        openEggBtn.style.cursor = 'pointer';
        
        // הוספת מאזין אירועים לכפתור
        openEggBtn.addEventListener('click', openLastEgg);
        
        // הוספת הכפתור לצד כפתור הניסיון מחדש
        retryBtn.parentNode.insertBefore(openEggBtn, retryBtn.nextSibling);
    } else {
        openEggBtn.style.display = 'inline-block';
    }
}

function openLastEgg() {
    // מציאת הביצה האחרונה שלא נפתחה
    const lastEgg = [...playerEggs].reverse().find(egg => !egg.opened);
    
    if (lastEgg) {
        // סימון הביצה כפתוחה
        lastEgg.opened = true;
        
        // בחר פרס אקראי בהתאם לסיכויים החדשים
        const random = Math.random();
        let selectedReward = null;
        
        // בדוק לפי הסדר: אדום (20%), צהוב (50%), ירוק (70%)
        if (random <= 0.2) {
            selectedReward = 'red';
        } else if (random <= 0.5) {
            selectedReward = 'yellow';
        } else if (random <= 0.7) {
            selectedReward = 'green';
        }
        
        if (selectedReward) {
            // הוסף את הפרס לאוסף הפרסים של השחקן
            playerRewards.push({
                id: Date.now(),
                type: selectedReward,
                name: EGG_REWARDS[selectedReward].description,
                description: EGG_REWARDS[selectedReward].description,
                color: EGG_REWARDS[selectedReward].color,
                eggId: lastEgg.id,
                receivedAt: new Date().toISOString()
            });
            
            // הצג הודעה על הפרס עם הצבע המתאים
            const messageDiv = document.getElementById('message');
            if (messageDiv) {
                messageDiv.innerHTML = `
                    <div style="text-align: center; color: ${EGG_REWARDS[selectedReward].color}; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">
                        🎉 ${translate('receivedReward', EGG_REWARDS[selectedReward].description)} 🎉
                    </div>
                `;
            }
        } else {
            // אין פרס הפעם
            const messageDiv = document.getElementById('message');
            if (messageDiv) {
                messageDiv.innerHTML = `
                    <div style="text-align: center; color: white; font-size: 20px; font-weight: bold;">
                        ${translate('noReward')}
                    </div>
                `;
            }
        }
        
        // הסתרת כפתור פתיחת הביצה
        const openEggBtn = document.getElementById('openEggBtn');
        if (openEggBtn) {
            openEggBtn.style.display = 'none';
        }
        
        // שמירת הנתונים המעודכנים
        saveGameData();
    }
}

// פונקציות שמירה וטעינה
function saveGameData() {
    const gameData = {
        ownedSkins: ownedSkins,
        selectedSkin: selectedSkin,
        lastLevel: level,
        customMaps: window.customMaps,
        language: window.currentLanguage,
        playerName: playerName,
        playerEmail: playerEmail,
        playerPassword: playerPassword, // שמור סיסמה
        playerLevel: playerLevel,
        isLoggedIn: isLoggedIn,
        joinDate: joinDate,
        playerStats: playerStats,
        localLeaderboard: localLeaderboard,
        leaderboardSettings: leaderboardSettings,
        playerEggs: playerEggs,
        playerRewards: playerRewards,
        friends: friends || [],
        friendRequests: friendRequests || []
    };
    localStorage.setItem('diceEvasionGame', JSON.stringify(gameData));
    
    // עדכון הדירוג המקומי
    updateLocalLeaderboard();
}

// מערכת סיסמאות ייחודיות
function getAllRegisteredPasswords() {
    const allPasswords = localStorage.getItem('allRegisteredPasswords');
    return allPasswords ? JSON.parse(allPasswords) : {};
}

function saveRegisteredPassword(username, password) {
    const allPasswords = getAllRegisteredPasswords();
    allPasswords[password] = username;
    localStorage.setItem('allRegisteredPasswords', JSON.stringify(allPasswords));
}

function isPasswordTaken(password, currentUsername) {
    const allPasswords = getAllRegisteredPasswords();
    // הסיסמה תפוסה אם היא קיימת ושייכת למשתמש אחר
    return password in allPasswords && allPasswords[password] !== currentUsername;
}

function loadGameData() {
    try {
    console.log("טוען נתוני משחק מהאחסון המקומי");
    const savedData = localStorage.getItem('diceEvasionGame');
    if (savedData) {
        console.log("נמצאו נתונים שמורים");
        const gameData = JSON.parse(savedData);
        ownedSkins = gameData.ownedSkins || [LEVEL_SKINS[1]];
        selectedSkin = gameData.selectedSkin || LEVEL_SKINS[1];
            window.customMaps = gameData.customMaps || [];
            playerEggs = gameData.playerEggs || [];
            playerRewards = gameData.playerRewards || [];
        
        // טען שפה אם נשמרה
        if (gameData.language) {
                window.currentLanguage = gameData.language;
                currentLanguage = gameData.language; // גם במשתנה המקומי
                const languageSelect = document.getElementById('languageSelect');
                if (languageSelect) {
                    languageSelect.value = window.currentLanguage;
                }
                console.log("נטענה שפה מ-localStorage:", gameData.language);
        }
        
        // טען נתוני משתמש אם נשמרו (או בדוק רק שם למשתמשים ישנים)
        if (gameData.isLoggedIn && gameData.playerName) {
            console.log("נמצאו נתוני משתמש:", gameData.playerName);
            playerName = gameData.playerName;
            playerEmail = gameData.playerEmail;
            playerPassword = gameData.playerPassword || ''; // למשתמשים ישנים
            playerLevel = gameData.playerLevel || 1;
            isLoggedIn = true;
            
            // טען תאריך הצטרפות ונתוני שחקן
            joinDate = gameData.joinDate || getCurrentDate();
            playerStats = gameData.playerStats || {
                highestLevel: playerLevel,
                totalGames: 0,
                localRank: '--'
            };
            
            // הסתר את מסך ההתחברות והצג את הלובי
                const loginScreen = document.getElementById('loginScreen') || document.getElementById('loginOverlay');
            const lobby = document.getElementById('lobby');
                const settingsButton = document.getElementById('settingsButton');
            
            if (loginScreen) {
                loginScreen.style.display = 'none';
                console.log("מסך התחברות הוסתר");
            } else {
                console.error("❌ מסך התחברות לא נמצא (חיפוש: loginScreen או loginOverlay)");
            }
            if (lobby) {
                lobby.style.display = 'block';
                console.log("לובי הוצג");
            }
                
                // הצג את כפתור ההגדרות
                if (settingsButton) {
                    settingsButton.style.display = 'flex';
                    console.log("כפתור הגדרות הוצג");
            }
            
            // עדכן את הודעת הברכה ורמת השחקן
            updatePlayerInfo();
            
            // עדכן את מסך הפרופיל
            updateProfileDisplay();
            
            console.log("נטענו נתוני משתמש:", { playerName, playerEmail, joinDate });
        } else {
                // אין משתמש מחובר, הצג את מסך ההתחברות
            const loginScreen = document.getElementById('loginScreen') || document.getElementById('loginOverlay');
            const lobby = document.getElementById('lobby');
                const settingsButton = document.getElementById('settingsButton');
            
            if (loginScreen) {
                loginScreen.style.display = 'block';
                console.log("מסך התחברות הוצג");
            }
            if (lobby) {
                lobby.style.display = 'none';
                console.log("לובי הוסתר");
            }
                if (settingsButton) {
                    settingsButton.style.display = 'none';
                    console.log("כפתור הגדרות הוסתר");
            }
        }
        
        // טען דירוג מקומי אם נשמר
        if (gameData.localLeaderboard) {
            localLeaderboard = gameData.localLeaderboard;
        }
        
        // טען הגדרות דירוג אם נשמרו
        if (gameData.leaderboardSettings) {
            leaderboardSettings = gameData.leaderboardSettings;
            
            // עדכן את הבחירות בתפריט ההגדרות
            const showLeaderboardSelect = document.getElementById('showLeaderboardSelect');
            if (showLeaderboardSelect) {
                showLeaderboardSelect.value = leaderboardSettings.showLeaderboard;
            }
            
            const defaultLeaderboardSelect = document.getElementById('defaultLeaderboardSelect');
            if (defaultLeaderboardSelect) {
                defaultLeaderboardSelect.value = leaderboardSettings.defaultView;
            }
            
            // החל את ההגדרות על תצוגת הדירוג
            applyLeaderboardSettings();
        }
         
         // טען נתוני חברים אם נשמרו
         if (gameData.friends) {
             friends = gameData.friends;
         }
         if (gameData.friendRequests) {
             friendRequests = gameData.friendRequests;
         }
         
         
         // עדכן את רשימת המפות השמורות (הוסר)
         
        // עדכן את תצוגת החברים (הוסר)
        
        // עדכן את השלבים הזמינים
        updateAvailableLevels();
        
        // עדכן את שפת הדף
        updatePageLanguage();
        
        // טען דירוג עולמי מהשרת (סימולציה) (הוסר)
    } else {
        // אין נתונים שמורים - צור משתמש ברירת מחדל והתחל ישר בלובי
        playerName = "Player";
        playerEmail = "";
        isLoggedIn = true;
        joinDate = getCurrentDate();
        playerStats = {
            highestLevel: 1,
            totalGames: 0,
            localRank: '--'
        };
        
        // שמור את הנתונים החדשים
        saveGameData();
        
        // הצג את הלובי
        const loginOverlay = document.getElementById('loginOverlay');
        const lobby = document.getElementById('lobby');
        const settingsButton = document.getElementById('settingsButton');
        
        if (loginOverlay) {
            loginOverlay.style.display = 'none';
        }
        if (lobby) {
            lobby.style.display = 'block';
            console.log("לובי הוצג (משתמש ברירת מחדל)");
        }
        if (settingsButton) {
            settingsButton.style.display = 'flex';
            console.log("כפתור הגדרות הוצג");
        }
        
        // עדכן את פרטי המשתמש בלובי
        updatePlayerInfo();
        updateAvailableLevels();
        updatePageLanguage();
    }
    } catch (error) {
        console.error("שגיאה בטעינת נתוני משחק:", error);
    }
    
    // טען דירוג עולמי מהשרת (סימולציה)
    fetchGlobalLeaderboard();
}

// פונקציה להחזרת התאריך הנוכחי במבנה מתאים
function getCurrentDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
}

// פונקציה לעדכון תצוגת הפרופיל
function updateProfileDisplay() {
    // עדכון אווטאר
    const playerAvatar = document.getElementById('playerAvatar');
    if (playerAvatar) {
        // הצג את האות הראשונה של שם המשתמש
        playerAvatar.textContent = playerName.charAt(0).toUpperCase();
        
        // צבע האווטאר לפי הסקין הנבחר
        playerAvatar.style.background = selectedSkin;
    }
    
    // עדכון שם המשתמש
    const profileName = document.getElementById('profileName');
    if (profileName) {
        profileName.textContent = playerName;
    }
    
    // עדכון תאריך הצטרפות
    const profileJoinDate = document.getElementById('profileJoinDate');
    if (profileJoinDate) {
        profileJoinDate.textContent = joinDate;
    }
    
    // עדכון אימייל
    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail) {
        profileEmail.textContent = playerEmail;
    }
    
    // עדכון סטטיסטיקות
    const profileTotalGames = document.getElementById('profileTotalGames');
    if (profileTotalGames) {
        profileTotalGames.textContent = playerStats.totalGames;
    }
    
    const profileRank = document.getElementById('profileRank');
    if (profileRank) {
        // מצא את הדירוג המקומי של השחקן
        const playerIndex = localLeaderboard.findIndex(p => p.email === playerEmail);
        playerStats.localRank = playerIndex !== -1 ? playerIndex + 1 : '--';
        profileRank.textContent = playerStats.localRank;
    }
}
    

// פונקציה להחלת הגדרות הדירוג על התצוגה
function applyLeaderboardSettings() {
    const leaderboardContainer = document.getElementById('leaderboardContainer');
    if (!leaderboardContainer) return;
    
    // הצג/הסתר את מיכל הדירוג לפי ההגדרות
    if (leaderboardSettings.showLeaderboard === 'none') {
        leaderboardContainer.style.display = 'none';
    } else {
        leaderboardContainer.style.display = 'block';
        
        // הצג/הסתר את הטאבים של הדירוג לפי ההגדרות
        const localTabBtn = document.getElementById('localTabBtn');
        const globalTabBtn = document.getElementById('globalTabBtn');
        const localLeaderboardDiv = document.getElementById('localLeaderboard');
        const globalLeaderboardDiv = document.getElementById('globalLeaderboard');
        const leaderboardTabs = document.querySelector('.leaderboard-tabs');
        
        if (leaderboardSettings.showLeaderboard === 'both') {
            // הצג את שני הטאבים
            if (leaderboardTabs) leaderboardTabs.style.display = 'flex';
            
            // הצג את הדירוג המתאים לפי ברירת המחדל
            if (leaderboardSettings.defaultView === 'local') {
                if (localTabBtn) localTabBtn.classList.add('active');
                if (globalTabBtn) globalTabBtn.classList.remove('active');
                if (localLeaderboardDiv) localLeaderboardDiv.style.display = 'block';
                if (globalLeaderboardDiv) globalLeaderboardDiv.style.display = 'none';
            } else {
                if (globalTabBtn) globalTabBtn.classList.add('active');
                if (localTabBtn) localTabBtn.classList.remove('active');
                if (globalLeaderboardDiv) globalLeaderboardDiv.style.display = 'block';
                if (localLeaderboardDiv) localLeaderboardDiv.style.display = 'none';
            }
        } else if (leaderboardSettings.showLeaderboard === 'local') {
            // הסתר את הטאבים והצג רק את הדירוג המקומי
            if (leaderboardTabs) leaderboardTabs.style.display = 'none';
            if (localLeaderboardDiv) localLeaderboardDiv.style.display = 'block';
            if (globalLeaderboardDiv) globalLeaderboardDiv.style.display = 'none';
        } else if (leaderboardSettings.showLeaderboard === 'global') {
            // הסתר את הטאבים והצג רק את הדירוג העולמי
            if (leaderboardTabs) leaderboardTabs.style.display = 'none';
            if (globalLeaderboardDiv) globalLeaderboardDiv.style.display = 'block';
            if (localLeaderboardDiv) localLeaderboardDiv.style.display = 'none';
        }
    }
}


function renderSkins() {
    const skinsContainer = document.getElementById('skinsContainer');
    if (!skinsContainer) return;
    skinsContainer.innerHTML = '';
    ownedSkins.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'skin-btn' + (color === selectedSkin ? ' selected' : '');
        btn.style.background = color;
        btn.title = color;
        btn.onclick = () => {
            selectedSkin = color;
            renderSkins();
            saveGameData(); // שמירה אחרי בחירת סקין
        };
        skinsContainer.appendChild(btn);
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function drawPlayer() {
    // אל תצייר את השחקן אם הוא קטן מדי (נבלע בחור השחור)
    if (player.width > 1 && player.height > 1) {
        // אם השחקן קטן (נמשך לחור), הוסף שקיפות
        if (blackHoleActive && player.width < 20) {
            const opacity = player.width / 20; // שקיפות לפי הגודל
            ctx.globalAlpha = opacity;
        }
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.globalAlpha = 1.0; // אפס את השקיפות
    }
}

function drawBoxes() {
    ctx.fillStyle = '#ff3333';
    for (const box of boxes) {
        // אל תצייר קוביות שקטנות מדי (נבלעו בחור השחור)
        const bw = box.width || boxWidth;
        const bh = box.height || boxHeight;
        if (bw > 1 && bh > 1) {
            // אם הקוביה קטנה (נמשכת לחור), הוסף שקיפות
            if (blackHoleActive && bw < 20) {
                const opacity = bw / 20; // שקיפות לפי הגודל
                ctx.globalAlpha = opacity;
            }
            ctx.fillRect(box.x, box.y, bw, bh);
            ctx.globalAlpha = 1.0; // אפס את השקיפות
        }
    }
    
    // ציור מפה מותאמת אישית אם קיימת
    if (level === 'map' && window.currentMap) {
        const map = window.currentMap;
        const cellWidth = canvas.width / map.width;
        const cellHeight = canvas.height / map.height;
        
        for (const cell of map.cells) {
            if (cell.type === 'start') continue;
            if (cell.type === 'wall') {
                ctx.fillStyle = 'rgba(139,69,19,0.7)';
            } else if (cell.type === 'danger') {
                ctx.fillStyle = 'rgba(244,67,54,0.3)';
            } else if (cell.type === 'safe') {
                ctx.fillStyle = 'rgba(33,150,243,0.3)';
            } else {
                continue;
            }
            ctx.fillRect(cell.x * cellWidth, cell.y * cellHeight, cellWidth, cellHeight);
        }
        // שחזר צבע לקוביות
        ctx.fillStyle = '#ff3333';
    }
}

function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    // תנועה אנכית: חצים למעלה/למטה במשחק מפה
    if (level === 'map') {
        if (keys['ArrowUp']) {
            verticalVelocity = Math.max(-verticalMaxSpeed, verticalVelocity - 0.6);
        } else if (keys['ArrowDown']) {
            verticalVelocity = Math.min(verticalMaxSpeed, verticalVelocity + 0.6);
        } else {
            // דעיכה קלה לכיוון 0
            verticalVelocity *= 0.9;
            if (Math.abs(verticalVelocity) < 0.05) verticalVelocity = 0;
        }
        player.y += verticalVelocity;
        // גבולות הקנבס
        if (player.y < 0) player.y = 0;
        if (player.y > canvas.height - player.height) player.y = canvas.height - player.height;
    } else {
        // קפיצה (ללא מפה)
    if (isJumping) {
        jumpTime += 16; // בערך פריים
        const t = Math.min(jumpTime / jumpDuration, 1);
        player.y = jumpStartY - jumpHeight * 4 * t * (1 - t);
        if (t >= 1) {
            isJumping = false;
            player.y = jumpStartY;
            }
        }
    }
}

function updateBoxes() {
    // הגבר מהירות עם הזמן בכל שלב
    let currentSpeed = boxSpeed;
    let currentSideSpeed = 1;
    let speedMessage = null;
    
    // אם הזמן נגמר, הקוביות ימשיכו לרדת למטה
    if (timeUp) {
        // הזז את כל הקוביות למטה ולהסר אותן כשהן יוצאות מהמסך
        for (const box of boxes) {
            box.y += boxSpeed * 2; // מהירות כפולה למטה
        }
        // הסר קוביות שיצאו מהמסך
        for (let i = boxes.length - 1; i >= 0; i--) {
            if (boxes[i].y > canvas.height) {
                boxes.splice(i, 1);
            }
        }
        return;
    }

    if (level !== 'map' && startTime !== null) {
        const currentElapsed = window.performance ? performance.now() : Date.now();
        const elapsed = currentElapsed - startTime;
        
        // בדוק אם הזמן נגמר
        if (elapsed >= levelTime) {
            timeUp = true;
            startBlackHoleEffect();
            return;
        }
        
        // הגבר מהירות בהדרגה עד 2x במהלך 60 שניות
        // השתמש בפונקציה חלקה יותר (ease-in-out)
        const progress = Math.min(elapsed / 60000, 1); // 0 עד 1
        const smoothProgress = progress * progress * (3 - 2 * progress); // smoothstep function
        const speedMultiplier = 1 + smoothProgress; // 1 עד 2
        const clampedMultiplier = Math.min(speedMultiplier, 2); // מקסימום 2
        
        currentSpeed = boxSpeed * clampedMultiplier;
        currentSideSpeed = clampedMultiplier;
        
        // הצג הודעות מהירות בהתאם לזמן
        if (clampedMultiplier >= 2) {
            speedMessage = '🚀 מהירות קוביות מרבית (2x) - אתגר מקסימלי!';
        } else if (clampedMultiplier >= 1.5) {
            speedMessage = '⚡ מהירות קוביות גבוהה (1.5x) - זה מתחמם!';
        } else if (clampedMultiplier >= 1.2) {
            speedMessage = '🔥 מהירות קוביות מוגברת (1.2x) - הקושי עולה!';
        } else if (clampedMultiplier >= 1.1) {
            speedMessage = '📈 מהירות קוביות עולה (1.1x) - דרגת קושי מוגברת!';
        } else if (clampedMultiplier >= 1.05) {
            speedMessage = '💨 מהירות קוביות מתגברת (1.05x) - הישאר ערני!';
        } else if (clampedMultiplier >= 1.02) {
            speedMessage = '🎯 מהירות קוביות עולה (1.02x) - התחל להתחמם!';
        } else if (clampedMultiplier >= 1.01) {
            speedMessage = '⚡ מהירות קוביות עולה (1.01x) - זה מתחיל!';
        } else if (clampedMultiplier >= 1.005) {
            speedMessage = '🎮 מהירות קוביות עולה (1.005x) - התחל להתחמם!';
        } else if (clampedMultiplier >= 1.001) {
            speedMessage = '🎯 מהירות קוביות עולה (1.001x) - התחל להתחמם!';
        }
        
        // הצג הודעת מהירות על המסך
        if (speedMessage) {
            const messageDiv = document.getElementById('message');
            if (messageDiv) {
                messageDiv.textContent = speedMessage;
                messageDiv.style.color = '#ff6b6b';
                messageDiv.style.fontSize = '18px';
                messageDiv.style.fontWeight = 'bold';
                messageDiv.style.textAlign = 'center';
                messageDiv.style.marginTop = '10px';
                messageDiv.style.animation = 'pulse 0.5s ease-in-out';
                
                // הסר את ההודעה אחרי 3 שניות
                setTimeout(() => {
                    if (messageDiv.textContent === speedMessage) {
                        messageDiv.style.animation = 'fadeInOut 1s ease-in-out';
                        setTimeout(() => {
                            messageDiv.textContent = '';
                            messageDiv.style.animation = '';
                        }, 1000);
                    }
                }, 3000);
            }
        }
    }
    
    for (const box of boxes) {
        if (box.side) {
            // עדכן מהירות בהתאם לזמן
            if (level === 4) {
                const originalSpeed = box.speedX > 0 ? 1 : -1;
                box.x += originalSpeed * currentSideSpeed;
        } else {
                box.x += box.speedX * currentSideSpeed;
            }
        } else {
            // אם מוגדר וקטור מהירות מותאם, השתמש בו
            if (typeof box.speedX === 'number' || typeof box.speedY === 'number') {
                box.x += (box.speedX || 0) * currentSpeed;
                box.y += (box.speedY || 0) * currentSpeed;
            } else {
                // עבור כל השלבים, עדכן מהירות דינמית
                box.y += box.speed * currentSpeed;
            }
        }
    }
    // הסר קוביות שיצאו מהמסך
    for (let i = boxes.length - 1; i >= 0; i--) {
        const bw = boxes[i].width || boxWidth;
        const bh = boxes[i].height || boxHeight;
        if (boxes[i].y > canvas.height || boxes[i].x < -bw || boxes[i].x > canvas.width + bw || boxes[i].y < -bh) {
            boxes.splice(i, 1);
        }
    }
    // בתום עדכון קוביות (ו-canvas), הצג את ההודעה האדומה:
    if (level !== 'map' && speedMessage) {
        ctx.save();
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText(speedMessage, canvas.width/2, canvas.height/2);
        ctx.restore();
    }
}

function spawnBox() {
    if (level === 'map') {
        // במצב מפה, אל תיצור קוביות אוטומטיות מלמעלה
        return;
    } else if (level === 1) {
        // שלב 1: קוביה אחת
        const x = Math.floor(Math.random() * (canvas.width - boxWidth));
        boxes.push({ x, y: -boxHeight, width: boxWidth, height: boxHeight, speed: boxSpeed });
    } else if (level === 2) {
        // שלב 2: תמיד 3 קוביות
        const numBoxes = 3;
        const usedPositions = [];
        for (let i = 0; i < numBoxes; i++) {
            let x;
            let attempts = 0;
            do {
                x = Math.floor(Math.random() * (canvas.width - boxWidth));
                attempts++;
            } while (usedPositions.some(pos => Math.abs(pos - x) < boxWidth) && attempts < 20);
            if (attempts >= 20) continue; // אם לא נמצא מקום פנוי, דלג
            usedPositions.push(x);
            boxes.push({ x, y: -boxHeight, width: boxWidth, height: boxHeight, speed: boxSpeed });
        }
    } else if (level === 3) {
        // שלב 3: תמיד 2 קוביות מהצדדים
        spawnSideBox(); // קוביה אחת מצד אחד
        spawnSideBox(); // קוביה שנייה (יכולה להיות מאותו צד או מהצד השני)
    } else if (level === 4) {
        // שלב 4: קוביה אחת מלמעלה + 2 קוביות מהצדדים
        // קוביה מלמעלה
        const x = Math.floor(Math.random() * (canvas.width - boxWidth));
        boxes.push({ x, y: -boxHeight, width: boxWidth, height: boxHeight, speed: boxSpeed });
        // 2 קוביות מהצדדים
        spawnSideBox();
        spawnSideBox();
    } else if (level === 'custom' && currentCustomLevel) {
        // שלב מותאם אישית
        // קוביות מלמעלה
        const usedPositions = [];
        for (let i = 0; i < currentCustomLevel.topDiceCount; i++) {
            let x;
            let attempts = 0;
            do {
                x = Math.floor(Math.random() * (canvas.width - boxWidth));
                attempts++;
            } while (usedPositions.some(pos => Math.abs(pos - x) < boxWidth) && attempts < 20);
            if (attempts >= 20) continue; // אם לא נמצא מקום פנוי, דלג
            usedPositions.push(x);
            boxes.push({ x, y: -boxHeight, width: boxWidth, height: boxHeight, speed: boxSpeed });
        }
        
        // קוביות מהצדדים
        for (let i = 0; i < currentCustomLevel.sideDiceCount; i++) {
            spawnSideBox();
        }
    }
}

function checkCollision() {
    // בדיקת התנגשות עם קוביות (אבנים) תחילה כדי שיהיה מורגש
    for (const box of boxes) {
        const bx2 = box.x + (box.width || boxWidth);
        const by2 = box.y + (box.height || boxHeight);
        const px2 = player.x + player.width;
        const py2 = player.y + player.height;
        const overlap = !(px2 <= box.x || player.x >= bx2 || py2 <= box.y || player.y >= by2);
        if (overlap) {
            return true;
        }
    }

    // במצב מפה, בדוק גם אלמנטי מפה
    if (level === 'map' && typeof checkMapCollision === 'function') {
        if (checkMapCollision()) return true;
    }
    return false;
}

function drawTimer(timeLeft) {
    // אם הזמן נגמר, הצג את הטיימר במרכז עם הבהבה
    if (timeUp) {
        // החלף את ההבהבה כל 300ms
        const now = Date.now();
        const blinkInterval = Math.floor(now / 300);
        const isRed = blinkInterval % 2 === 0;
        
        // אם החור השחור עדיין לא פעיל, הצג רקע כהה והזמן במרכז
        if (!blackHoleActive) {
            // צייר רקע כהה
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // צייר את הזמן 0.00 בגדול ומהבהב
            ctx.fillStyle = isRed ? '#ff0000' : '#ffffff';
            ctx.font = 'bold 120px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('0.00', canvas.width / 2, canvas.height / 2 - 30);
            
            // צייר טקסט משני
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 36px Arial';
            ctx.fillText('!הזמן נגמר', canvas.width / 2, canvas.height / 2 + 80);
        }
    } else {
    ctx.fillStyle = '#222';
    ctx.font = '20px Arial';
    
    // שמירת ההגדרות הנוכחיות של הקנבס
    ctx.save();
    
    // הגדרת כיוון הטקסט בהתאם לשפה
    if (currentLanguage === 'he') {
        ctx.textAlign = 'right';
        ctx.fillText(translate('drawTimer', (timeLeft / 1000).toFixed(1)), canvas.width - 10, 30);
    } else {
        ctx.textAlign = 'left';
        ctx.fillText(translate('drawTimer', (timeLeft / 1000).toFixed(1)), 10, 30);
    }
    
    // שחזור ההגדרות הקודמות
    ctx.restore();
    }
}

function drawBlackHole() {
    // אם אנחנו יוצאים מהחור השחור (התחלת שלב חדש)
    if (emergingFromBlackHole) {
        emergingProgress += 0.008; // התקדמות יותר איטית לאנימציה ארוכה יותר
        const progress = Math.min(emergingProgress, 1);
        
        // הקטן את החור השחור בהדרגה (גם אם הוא הגיע ל-0, תמשיך עד שהשחקן נוגע בריצפה)
        const maxRadius = Math.max(canvas.width, canvas.height);
        const currentRadius = Math.max(0, maxRadius * (1 - progress));
        
        // צייר רקע שחור מלא בהתחלה
        if (progress < 0.2) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // צייר את החור השחור המתכווץ
        if (currentRadius > 1) {
            // צייר את החור השחור המרכזי עם גרדיאנט
            const gradient = ctx.createRadialGradient(
                blackHoleX, blackHoleY, 0,
                blackHoleX, blackHoleY, currentRadius
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.5, 'rgba(50, 0, 100, 0.9)');
            gradient.addColorStop(1, 'rgba(100, 0, 200, 0.5)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(blackHoleX, blackHoleY, currentRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            // צייר טבעות מסתובבות סביב החור
            const time = Date.now() / 1000;
            for (let i = 0; i < 4; i++) {
                const ringRadius = currentRadius + 10 + i * 12;
                const rotation = (time * 4 + i * 1.5) % (Math.PI * 2);
                
                ctx.beginPath();
                ctx.arc(blackHoleX, blackHoleY, ringRadius, rotation, rotation + Math.PI * 0.8);
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 - i * 0.15})`;
                ctx.lineWidth = 4;
                ctx.stroke();
            }
            
            // הוסף אפקט זוהר
            ctx.shadowColor = 'rgba(100, 0, 200, 0.8)';
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(blackHoleX, blackHoleY, currentRadius * 0.3, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(150, 0, 255, 0.6)';
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        return;
    }
    
    // בליעה - הגדל את רדיוס החור השחור בהדרגה
    blackHoleRadius += 2;
    const maxRadius = Math.max(canvas.width, canvas.height); // שינוי ל-max כדי לכסות את כל המסך
    if (blackHoleRadius > maxRadius) {
        blackHoleRadius = maxRadius;
        blackHoleFullScreen = true; // סמן שהחור מכסה את כל המסך
    }
    
    // אם החור מכסה את כל המסך, צייר רק שחור
    if (blackHoleFullScreen) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }
    
    ctx.save();
    
    // צייר אפקט של ספירלה מסתובבת
    const time = Date.now() / 1000;
    const spiralCount = 8;
    for (let i = 0; i < spiralCount; i++) {
        const angle = (time * 2 + i * Math.PI * 2 / spiralCount) % (Math.PI * 2);
        const spiralRadius = blackHoleRadius * 0.8;
        
        ctx.beginPath();
        ctx.arc(blackHoleX, blackHoleY, spiralRadius, angle, angle + Math.PI / 4);
        ctx.strokeStyle = `rgba(100, 0, 200, ${0.5 - i * 0.05})`;
        ctx.lineWidth = 5;
        ctx.stroke();
    }
    
    // צייר את החור השחור המרכזי
    const gradient = ctx.createRadialGradient(
        blackHoleX, blackHoleY, 0,
        blackHoleX, blackHoleY, blackHoleRadius
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
    gradient.addColorStop(0.5, 'rgba(50, 0, 100, 0.8)');
    gradient.addColorStop(1, 'rgba(100, 0, 200, 0.3)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(blackHoleX, blackHoleY, blackHoleRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // צייר טבעות מסתובבות
    for (let i = 0; i < 3; i++) {
        const ringRadius = blackHoleRadius + 20 + i * 15;
        const rotation = (time * 3 + i * 2) % (Math.PI * 2);
        
        ctx.beginPath();
        ctx.arc(blackHoleX, blackHoleY, ringRadius, rotation, rotation + Math.PI);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 - i * 0.2})`;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    // צייר טקסט מהבהב
    const textOpacity = 0.5 + Math.sin(time * 3) * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${textOpacity})`;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚫ חור שחור ⚫', blackHoleX, blackHoleY + blackHoleRadius + 40);
    
    // צייר חלקיקים מסביב לחור השחור
    for (let i = 0; i < 20; i++) {
        const particleAngle = (time * 2 + i * Math.PI * 2 / 20) % (Math.PI * 2);
        const particleRadius = blackHoleRadius + 10 + Math.sin(time * 3 + i) * 20;
        const particleX = blackHoleX + Math.cos(particleAngle) * particleRadius;
        const particleY = blackHoleY + Math.sin(particleAngle) * particleRadius;
        
        ctx.beginPath();
        ctx.arc(particleX, particleY, 2, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(150, 100, 255, ${0.7 - (i % 5) * 0.1})`;
        ctx.fill();
    }
    
    ctx.restore();
    
    // משוך את הקוביות לחור השחור
    for (let i = boxes.length - 1; i >= 0; i--) {
        const box = boxes[i];
        const boxCenterX = box.x + (box.width || boxWidth) / 2;
        const boxCenterY = box.y + (box.height || boxHeight) / 2;
        const dx = blackHoleX - boxCenterX;
        const dy = blackHoleY - boxCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // משוך את כל הקוביות לחור השחור בכוח חזק יותר
        const pullForce = 0.08 + (1 - distance / canvas.width) * 0.15;
        box.x += dx * pullForce;
        box.y += dy * pullForce;
        
        // הקטן את הקוביה ככל שהיא מתקרבת - בצורה יותר דרמטית
        const scale = 0.92; // התכווצות קבועה בכל פריים
        if (!box.width) box.width = boxWidth;
        if (!box.height) box.height = boxHeight;
        box.width *= scale;
        box.height *= scale;
        
        // אם הקוביה קטנה מדי או קרובה מדי, הסר אותה לגמרי
        if (distance < blackHoleRadius * 0.5 || box.width < 2 || box.height < 2) {
            boxes.splice(i, 1);
        }
    }
    
    // משוך גם את השחקן לחור השחור
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const playerDx = blackHoleX - playerCenterX;
    const playerDy = blackHoleY - playerCenterY;
    const playerDistance = Math.sqrt(playerDx * playerDx + playerDy * playerDy);
    
    // משוך את השחקן חזק יותר
    const playerPullForce = 0.05 + (1 - playerDistance / canvas.width) * 0.1;
    player.x += playerDx * playerPullForce;
    player.y += playerDy * playerPullForce;
    
    // הקטן את השחקן בצורה דרמטית יותר
    const playerScale = 0.95;
    player.width *= playerScale;
    player.height *= playerScale;
    
    // אם השחקן קטן מדי או קרוב מדי, הוא "נעלם" לגמרי
    if (playerDistance < blackHoleRadius * 0.3 || player.width < 3 || player.height < 3) {
        player.width = 0;
        player.height = 0;
    }
}

function gameLoop(timestamp) {
    if (startTime === null) {
        startTime = timestamp;
    }
    const elapsed = timestamp - startTime;
    const timeLeft = Math.max(0, levelTime - elapsed);
    
    // בדוק אם הזמן נגמר
    if (elapsed >= levelTime && !timeUp && level !== 'map') {
        timeUp = true;
        timerBlinking = true;
        
        // עצור את יצירת קוביות חדשות
        gameOver = true;
        
        // אחרי 2 שניות של הבהוב, הצג חור שחור
        setTimeout(() => {
            if (timeUp) {
                blackHoleActive = true;
                blackHoleX = canvas.width / 2;
                blackHoleY = canvas.height / 2;
                blackHoleRadius = 0;
                
                // אחרי 3 שניות, החור מכסה את כל המסך
                setTimeout(() => {
                    if (timeUp) {
                        blackHoleFullScreen = true;
                        
                        // אחרי 2 שניות של מסך שחור, עבור לשלב הבא אוטומטית
                        setTimeout(() => {
                            if (timeUp) {
                                // שמור את הנתונים לפני המעבר
                                if (isLoggedIn && level !== 'custom' && level !== 'map') {
                                    addNewEgg();
                                    playerStats.totalGames++;
                                    saveGameData();
                                }
                                
                                console.log("🚀 קורא ל-startGame(true) למעבר לשלב הבא");
                                // עבור לשלב הבא אוטומטית
                                startGame(true);
                            }
                        }, 2000);
                    }
                }, 3000);
            }
        }, 2000);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // אם יוצאים מהחור השחור (התחלת שלב חדש)
    if (emergingFromBlackHole) {
        // צייר רקע שחור בהתחלה
        if (emergingProgress < 0.2) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // הגדל את השחקן בהדרגה
        if (player.width < 40) {
            player.width = Math.min(40, player.width + 0.4);
            player.height = Math.min(40, player.height + 0.4);
            player.x = blackHoleX - player.width / 2;
            player.y = blackHoleY - player.height / 2;
        } else {
            // כשהשחקן מגיע לגודל מלא, הזז אותו לתחתית
            const targetY = canvas.height - player.height;
            if (player.y < targetY) {
                player.y = Math.min(targetY, player.y + 4);
            } else {
                // השחקן נחת על הריצפה! סיים את האנימציה
                emergingFromBlackHole = false;
                emergingProgress = 0;
                blackHoleActive = false;
                blackHoleFullScreen = false;
            }
        }
        
        // צייר את החור השחור המתכווץ מעל הכל
        drawBlackHole();
        // צייר את השחקן והקוביות מתחת לחור
        drawPlayer();
        drawBoxes();
        drawTimer(timeLeft);
        
        // הצג טקסט של השלב החדש עם אפקט מרשים
        if (emergingProgress > 0.15) {
            const textOpacity = Math.min(1, (emergingProgress - 0.15) / 0.4);
            ctx.save();
            ctx.globalAlpha = textOpacity;
            
            // אפקט זוהר לטקסט
            ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
            ctx.shadowBlur = 20;
            
            // טקסט ראשי
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 64px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`שלב ${level}`, canvas.width / 2, canvas.height / 2 - 50);
            
            // טקסט משני
            ctx.font = 'bold 32px Arial';
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowBlur = 10;
            ctx.fillText('בהצלחה! 🎮', canvas.width / 2, canvas.height / 2 + 20);
            
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
            ctx.restore();
        }
    }
    // אם הזמן נגמר
    else if (timeUp) {
        if (blackHoleActive) {
            // שלב 2: החור השחור פעיל
            // צייר את החור השחור קודם
            drawBlackHole();
            // צייר את הקוביות (שנמשכות לחור)
            drawBoxes();
            // צייר את השחקן (שנמשך לחור)
            drawPlayer();
        } else {
            // שלב 1: הזמן נגמר אבל החור עדיין לא מופיע
            // הקוביות ממשיכות לרדת למטה
            updateBoxes();
            // צייר את המשחק
            drawPlayer();
            drawBoxes();
            // הטיימר יצייר את הרקע הכהה ואת 0.00
            drawTimer(timeLeft);
        }
    } else {
        // משחק רגיל
    drawPlayer();
    drawBoxes();
    drawTimer(timeLeft);
    updatePlayer();
    updateBoxes();
    }

    // יצירת קוביות (רק אם הזמן לא נגמר ולא יוצאים מהחור השחור)
    if (!timeUp && !emergingFromBlackHole && level !== 'map') {
        // עבור שלב 4, הגבר קצב יצירה עם הזמן
        let currentInterval = boxInterval;
        if (level === 4 && startTime) {
            const elapsed = timestamp - startTime;
            // הגבר קצב יצירה עד 1.5x מהר יותר במהלך 60 שניות
            const speedMultiplier = 1 + (elapsed / 60000) * 0.5; // עד 1.5x
            const clampedMultiplier = Math.min(speedMultiplier, 1.5);
            currentInterval = boxInterval / clampedMultiplier;
        }
        
        if (timestamp - lastBoxTime > currentInterval) {
        spawnBox();
        lastBoxTime = timestamp;
        }
    } else if (!timeUp) {
        // במצב מפה: שגר אבנים מתאי סכנה אל עבר השחקן
        if (window.currentMap && timestamp - lastMapHazardTime > mapHazardIntervalMs) {
            spawnMapHazardTowardPlayer();
            lastMapHazardTime = timestamp;
        }
    }

    // בדיקת פגיעה (רק אם הזמן לא נגמר)
    if (!timeUp && checkCollision()) {
        endGame(false);
        return;
    }

    // בדיקת סיום שלב (רק עבור מפות - שלבים רגילים נסתיימו ע"י החור השחור)
    if (timeLeft <= 0 && level === 'map') {
        // במצב קמפיין מפות: עבור מיד למפה הבאה
        if (window.isMapsCampaignActive) {
        endGame(true);
        } else {
            endGame(true);
        }
        return;
    }

    // המשך את ה-game loop גם כשהזמן נגמר (כדי שהאנימציה תמשיך)
    if (!gameOver || timeUp || emergingFromBlackHole) {
        requestAnimationFrame(gameLoop);
    }

    // ב-gameLoop() נוסיף למטה:
    if (pendingBlackHole && boxes.length === 0) {
        showBlackHole = true;
        pendingBlackHole = false;
        // אפקט מחשיך מיד
    }

    if (showBlackHole) {
        // אפקט כיסוי כל המסך (חור שחור במרכז)
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
        // חור שחור/עיגול גדול
        let r = Math.min(canvas.width, canvas.height)/3;
        ctx.beginPath();
        ctx.arc(canvas.width/2, canvas.height/2, r, 0, 2*Math.PI);
        ctx.fillStyle = '#222';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 70;
        ctx.fill();
        ctx.shadowBlur = 0;
        // כיתוב וכפתורים וירטואליים
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('השלב הושלם!', canvas.width/2, canvas.height/2-30);
        ctx.font = '23px Arial';
        ctx.fillText('→ שלב הבא', canvas.width/2 + r/2, canvas.height/2+20);
        ctx.fillText('חזור ללובי ←', canvas.width/2 - r/2, canvas.height/2+20);
        ctx.restore();

        // מוסיפים קליטה ללחיצות
        canvas.onclick = function(ev) {
            const x = ev.offsetX, y = ev.offsetY;
            // next level אזור ימין
            if (x > canvas.width/2 + r/4 && Math.abs(y - canvas.height/2) < r/2) {
                showBlackHole = false;
                startNewGame();
            } else if (x < canvas.width/2 - r/4 && Math.abs(y - canvas.height/2) < r/2) {
                showBlackHole = false;
                showLobby();
            }
        };
        return; // לעצור המשך ציור קנבס
    }
}

function endGame(won) {
    gameOver = true;
    if (won) {
        // שמירת נתונים כשמסיימים שלב
        if (isLoggedIn && level !== 'custom' && level !== 'map') {
            // הוספת ביצה חדשה בסיום שלב
            addNewEgg();
            playerStats.totalGames++;
            saveGameData();
        }
        
        if (level === 'custom') {
            messageDiv.textContent = translate('completedCustomLevel', currentCustomLevel.name);
            retryBtn.textContent = translate('playAgain');
            retryBtn.style.display = 'inline-block';
        } else if (level === 'map') {
            messageDiv.textContent = translate('completedCustomLevel', currentMap.name);
            retryBtn.textContent = translate('playAgain');
            retryBtn.style.display = 'inline-block';
        } else if (level >= 1 && level <= 10) {
            // רמות רגילות 1-10
            if (level === 10) {
                messageDiv.textContent = translate('completedAllLevels') + ' ' + translate('receivedEgg');
            retryBtn.textContent = translate('playAgain');
            } else {
                messageDiv.textContent = `עברת את שלב ${level}! קיבלת ביצה! 🥚`;
                retryBtn.textContent = `המשך לשלב ${level + 1}`;
            }
            retryBtn.style.display = 'inline-block';
            showOpenEggButton();
        }
    } else {
        // הפסד - הצג הודעה ותתחיל מחדש אוטומטית
        if (level === 'custom') {
            messageDiv.textContent = translate('youLost');
        } else if (level === 'map') {
            messageDiv.textContent = translate('youLost');
        } else {
            messageDiv.textContent = translate('youLost');
        }
        
        // התחל מחדש אוטומטית אחרי שניה (ללא אנימציית חור שחור)
        setTimeout(() => {
            messageDiv.textContent = '';
            startGame(false, true); // התחל את אותו שלב מחדש, skipAnimation = true
        }, 1000);
    }
}

// התחלת קרב בוס
function startBossFight() {
    // הסתר לובי והצג קנבס
    document.getElementById('lobby').style.display = 'none';
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.style.display = 'block';
    
    // הפעל מסך מלא
    gameContainer.classList.add('fullscreen');
    
    // התאם את גודל הקנבס למסך
    resizeCanvas();
    
    // הצג כפתור ירייה
    const shootBtn = document.getElementById('shootBtn');
    if (shootBtn) {
        shootBtn.style.display = 'block';
    }
    
    // נעל גלילה בזמן משחק
    if (document && document.body && document.body.classList) {
        document.body.classList.add('no-scroll');
    }
    
    // אפס משתנים
    bossActive = true;
    bossExploding = false; // ✅ אפס את אנימציית הפיצוץ
    explosionProgress = 0;
    explosionParticles = [];
    level = 'boss'; // מצב מיוחד של בוס
    gameOver = false;
    playerHits = 0;
    boxes.length = 0;
    playerBullets = [];
    bossBullets = [];
    
    // אפס את הבוס
    boss.health = boss.maxHealth;
    boss.x = canvas.width / 2 - boss.width / 2;
    boss.y = 50;
    boss.direction = 1;
    
    // מקם את השחקן
    player.x = canvas.width / 2 - 20;
    player.y = canvas.height - player.height;
    player.width = 40;
    player.height = 40;
    player.color = selectedSkin;
    
    // אפס זמנים
    startTime = Date.now();
    lastBossShot = Date.now();
    lastPlayerShot = 0;
    
    // עדכן כותרת
    const gameTitle = document.getElementById('gameTitle');
    if (gameTitle) {
        gameTitle.textContent = '⚔️ קרב בוס ⚔️';
    }
    
    // התחל את לולאת המשחק
    requestAnimationFrame(gameBossLoop);
}

// לולאת משחק של קרב בוס
function gameBossLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // אם יש אנימציית פיצוץ
    if (bossExploding) {
        updateExplosion();
        drawPlayer();
        drawExplosion();
        requestAnimationFrame(gameBossLoop);
        return;
    }
    
    if (gameOver) return;
    
    const now = Date.now();
    
    // עדכן תנועת השחקן
    updatePlayer();
    
    // הבוס יורה לכיוון השחקן
    if (now - lastBossShot > BOSS_SHOOT_INTERVAL) {
        const centerX = boss.x + boss.width / 2;
        const centerY = boss.y + boss.height / 2;
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        
        // חשב את הכיוון לשחקן
        const dx = playerCenterX - centerX;
        const dy = playerCenterY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // נרמל את הכיוון
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        
        const bulletSpeed = 4;
        
        bossBullets.push({
            x: centerX - 15,
            y: centerY - 15,
            width: 30,
            height: 30,
            speedX: normalizedDx * bulletSpeed,
            speedY: normalizedDy * bulletSpeed
        });
        
        lastBossShot = now;
    }
    
    // עדכן קוביות של הבוס
    for (let i = bossBullets.length - 1; i >= 0; i--) {
        const bullet = bossBullets[i];
        bullet.x += bullet.speedX;
        bullet.y += bullet.speedY;
        
        // הסר קוביות שיצאו מהמסך
        if (bullet.y > canvas.height || bullet.y + bullet.height < 0 || 
            bullet.x > canvas.width || bullet.x + bullet.width < 0) {
            bossBullets.splice(i, 1);
            continue;
        }
        
        // בדוק פגיעה בשחקן
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
            bossBullets.splice(i, 1);
            playerHits++;
            
            // בדוק אם השחקן הפסיד
            if (playerHits >= MAX_PLAYER_HITS) {
                endBossFight(false);
                return;
            }
        }
    }
    
    // עדכן קוביות ירוקות של השחקן
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        bullet.y -= bullet.speedY;
        
        // הסר קוביות שיצאו מהמסך
        if (bullet.y + bullet.height < 0) {
            playerBullets.splice(i, 1);
            continue;
        }
        
        // בדוק פגיעה בבוס
        if (!bossExploding && bullet.x < boss.x + boss.width &&
            bullet.x + bullet.width > boss.x &&
            bullet.y < boss.y + boss.height &&
            bullet.y + bullet.height > boss.y) {
            playerBullets.splice(i, 1);
            boss.health -= PLAYER_BULLET_DAMAGE;
            
            // בדוק אם הבוס מת
            if (boss.health <= 0) {
                boss.health = 0;
                startBossExplosion();
            }
        }
    }
    
    // צייר הכל
    if (!bossExploding) {
        drawBoss();
    }
    drawPlayer();
    drawBossBullets();
    drawPlayerBullets();
    drawBossUI();
    
    requestAnimationFrame(gameBossLoop);
}

// צייר את הבוס
function drawBoss() {
    // קוביה ענקית אדומה עם פרטים
    ctx.save();
    
    // צל
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    // גוף הבוס
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
    
    // מסגרת
    ctx.strokeStyle = '#DC143C';
    ctx.lineWidth = 4;
    ctx.strokeRect(boss.x, boss.y, boss.width, boss.height);
    
    // עיניים
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(boss.x + 25, boss.y + 30, 20, 20);
    ctx.fillRect(boss.x + 75, boss.y + 30, 20, 20);
    
    // פה
    ctx.fillRect(boss.x + 30, boss.y + 80, 60, 10);
    
    ctx.restore();
}

// צייר קוביות אדומות של הבוס
function drawBossBullets() {
    ctx.fillStyle = '#ff3333';
    for (const bullet of bossBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.strokeStyle = '#cc0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// צייר קוביות ירוקות של השחקן
function drawPlayerBullets() {
    ctx.fillStyle = '#00ff00';
    for (const bullet of playerBullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.strokeStyle = '#00cc00';
        ctx.lineWidth = 2;
        ctx.strokeRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// צייר UI של קרב בוס
function drawBossUI() {
    // חיי בוס
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 380, 40);
    
    // שורת חיים
    const healthPercent = boss.health / boss.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.2 ? '#ffff00' : '#ff0000';
    ctx.fillRect(15, 15, 370 * healthPercent, 30);
    
    // טקסט חיים
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${boss.health} / ${boss.maxHealth}`, 200, 33);
    
    // פגיעות שחקן
    ctx.textAlign = 'right';
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`❤️ ${MAX_PLAYER_HITS - playerHits}`, canvas.width - 20, 70);
}

// התחל אנימציית פיצוץ הבוס
function startBossExplosion() {
    bossExploding = true;
    explosionProgress = 0;
    explosionParticles = [];
    
    // צור חלקיקים לפיצוץ
    const centerX = boss.x + boss.width / 2;
    const centerY = boss.y + boss.height / 2;
    
    for (let i = 0; i < 100; i++) {
        const angle = (Math.PI * 2 * i) / 100;
        const speed = 3 + Math.random() * 5;
        explosionParticles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 8 + Math.random() * 15,
            color: ['#ff0000', '#ff6600', '#ffff00', '#ff3300', '#ffffff'][Math.floor(Math.random() * 5)],
            life: 1
        });
    }
}

// עדכן ורדר אנימציית פיצוץ
function updateExplosion() {
    explosionProgress += 0.01;
    
    // עדכן חלקיקים
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        const p = explosionParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // גרביטציה
        p.life -= 0.01;
        p.size *= 0.99;
        
        if (p.life <= 0) {
            explosionParticles.splice(i, 1);
        }
    }
    
    // סיים אנימציה
    if (explosionProgress >= 1) {
        bossExploding = false;
        endBossFight(true);
    }
}

// צייר את אנימציית הפיצוץ
function drawExplosion() {
    // פלאש לבן
    if (explosionProgress < 0.2) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${(1 - explosionProgress * 5) * 0.8})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
    
    // צייר חלקיקים
    for (const p of explosionParticles) {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        
        // זוהר חזק יותר
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 25;
        ctx.fill();
        ctx.restore();
    }
}

// סיום קרב בוס
function endBossFight(won) {
    gameOver = true;
    bossActive = false;
    bossExploding = false;
    
    // הסתר כפתור ירייה
    const shootBtn = document.getElementById('shootBtn');
    if (shootBtn) {
        shootBtn.style.display = 'none';
    }
    
    const messageDiv = document.getElementById('message');
    const retryBtn = document.getElementById('retryBtn');
    
    if (won) {
        messageDiv.textContent = '🎉 ניצחת את הבוס! 🎉';
        messageDiv.style.color = '#00ff00';
    } else {
        messageDiv.textContent = '💀 הבוס ניצח! 💀';
        messageDiv.style.color = '#ff0000';
    }
    
    retryBtn.textContent = 'חזור ללובי';
    retryBtn.style.display = 'inline-block';
    retryBtn.onclick = function() {
        document.getElementById('gameContainer').style.display = 'none';
        document.getElementById('lobby').style.display = 'block';
        messageDiv.textContent = '';
        retryBtn.style.display = 'none';
    };
}

// התחלת המשחק
// nextLevel: אם true, זה מעבר לשלב הבא (עם אנימציה)
// skipAnimation: אם true, דלג על אנימציית החור השחור
function startGame(nextLevel = false, skipAnimation = false) {
    bossActive = false; // ודא שלא במצב בוס
    boxes.length = 0;
    player.x = canvas.width / 2 - 20;
    // במצב מפות: אפס מהירות אנכית
    verticalVelocity = 0;
    startTime = null;
    lastBoxTime = 0;
    gameOver = false;
    messageDiv.textContent = '';
    retryBtn.style.display = 'none';
    
    // אפס את משתני המהירות
    window.maxSpeedReached = false;
    window.highSpeedReached = false;
    
    // אפס את משתני החור השחור והטיימר
    timeUp = false;
    timerBlinking = false;
    blackHoleX = canvas.width / 2;
    blackHoleY = canvas.height / 2;
    boxesBeingSucked = [];
    
    // אם עוברים לשלב הבא, הגדל את level
    if (nextLevel) {
        level++;
    }
    // הוסר - ה-level כבר מוגדר ע"י הכפתור retry
    // אין צורך להעלות אותו פעם נוספת
    if (!nextLevel) {
        // אם לא עוברים לשלב הבא, נשאר באותו שלב
        // רק אם אנחנו לא באמצע משחק (אין לנו level), אז נקבל אותו מה-select
        if (!level || level === 0) {
            const levelSelect = document.getElementById('levelSelect');
            if (levelSelect) {
                level = parseInt(levelSelect.value) || 1;
            } else {
                level = 1; // ברירת מחדל
            }
            
            // אם מתחילים משלב 2 או גבוה יותר, דואגים להוסיף את כל הסקינים הדרושים
            if (level >= 2) {
                ensureAllSkins(level);
            }
        }
        
        // הגדר את זמן השלב
        levelTime = 60000; // 60 שניות
    }
    
    // התחל עם אנימציית יציאה מהחור השחור אם:
    // 1. זה משלב 2 ומעלה
    // 2. לא ביקשו לדלג על האנימציה (skipAnimation)
    // skipAnimation = true רק כשנפסלים, אחרת תמיד יש אנימציה
    if (level !== 'map' && level >= 2 && !skipAnimation) {
        blackHoleActive = true;
        blackHoleFullScreen = true;
        emergingFromBlackHole = true;
        emergingProgress = 0;
        blackHoleRadius = Math.max(canvas.width, canvas.height);
        
        // הגדר את מיקום החור השחור במרכז המסך
        blackHoleX = canvas.width / 2;
        blackHoleY = canvas.height / 2;
        
        // השחקן מתחיל קטן ויגדל בהדרגה
        player.width = 5;
        player.height = 5;
        player.x = canvas.width / 2 - 2.5;
        player.y = canvas.height / 2 - 2.5;
        
        // האנימציה תסתיים אוטומטית כשהשחקן נוגע בריצפה (ב-gameLoop)
    } else {
        // ללא אנימציה - התחל רגיל
        blackHoleActive = false;
        blackHoleFullScreen = false;
        blackHoleRadius = 0;
        emergingFromBlackHole = false;
        emergingProgress = 0;
    }
    
    // Update game title
    const gameTitle = document.getElementById('gameTitle');
    if (gameTitle) {
        if (level === 'map' && currentMap) {
            gameTitle.textContent = `${translate('gameTitle')} - ${currentMap.name}`;
        } else {
            gameTitle.textContent = `${translate('gameTitle')} - ${translate('levelPrefix')}${level}`;
        }
    }
    // Restore player dimensions in non-map modes (אלא אם אנחנו יוצאים מהחור)
    if (level !== 'map' && !emergingFromBlackHole) {
        player.width = 40;
        player.height = 40;
    }
    
    // Set player color to selected skin
    player.color = selectedSkin;
    
    // דמות תמיד על הקרקע בתחילת שלב (אלא אם אנחנו יוצאים מהחור)
    if (!emergingFromBlackHole) {
    player.y = canvas.height - player.height;
    }
    isJumping = false;
    jumpTime = 0;
    
    // אם זה משחק מפה, צור את אלמנטי המפה
    if (level === 'map' && currentMap && typeof createMapElements === 'function') {
        createMapElements(currentMap);
    }
    
    // אם זה שלב מותאם אישית, הגדר את הפרמטרים
    if (level === 'custom' && currentCustomLevel) {
        levelTime = currentCustomLevel.time * 1000; // המרה למילישניות
        boxSpeed = currentCustomLevel.speed;
        boxInterval = 1000 / currentCustomLevel.speed; // המרה למילישניות
    } else if (level === 'map' && currentMap) {
        // אם זה משחק מפה, הגדר זמן שלב
        levelTime = 60000; // 60 שניות למפה
    } else {
        // שלבים רגילים
        levelTime = 60000; // 60 שניות
    }
    
    // אפס את זמן ההתחלה
    startTime = null;
    
    // אפס את זמן יצירת הקוביות
    lastBoxTime = 0;
    
    requestAnimationFrame(gameLoop);
}

function showLobby() {
    showBlackHole = false;
    pendingBlackHole = false;
    timeUp = false;
    timerBlinking = false;
    blackHoleActive = false;
    blackHoleX = 0;
    blackHoleY = 0;
    blackHoleRadius = 0;
    boxesBeingSucked = [];
    // דאג תמיד להסתיר משחק ולהציג לובי
    if (typeof gameContainer !== 'undefined' && gameContainer) {
        gameContainer.style.display = 'none';
        // בטל מסך מלא
        gameContainer.classList.remove('fullscreen');
        // החזר את הקנבס לגודל המקורי
        canvas.width = 400;
        canvas.height = 600;
    }
    if (typeof lobby !== 'undefined' && lobby) lobby.style.display = 'block';
    gameOver = true;
    if (document && document.body && document.body.classList) {
        document.body.classList.remove('no-scroll');
    }
}

// פונקציה להתאמת גודל הקנבס למסך
function resizeCanvas() {
    if (gameContainer && gameContainer.classList.contains('fullscreen')) {
        // מסך מלא - התאם לגודל המסך
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // התאם את מיקום השחקן
        if (player) {
            player.x = Math.min(player.x, canvas.width - player.width);
            player.y = Math.min(player.y, canvas.height - player.height);
        }
        
        console.log(`📐 Canvas resized to fullscreen: ${canvas.width}x${canvas.height}`);
    }
}

function ensureAllSkins(targetLevel) {
    // דואג שיש את כל הסקינים עד לשלב הנבחר
    for (let i = 1; i <= targetLevel; i++) {
        if (i <= 4 && !ownedSkins.includes(LEVEL_SKINS[i])) {
            ownedSkins.push(LEVEL_SKINS[i]);
        }
    }
    // בוחר את הסקין האחרון שנוסף
    if (targetLevel <= 4) {
        selectedSkin = LEVEL_SKINS[targetLevel];
    } else {
        selectedSkin = ownedSkins[ownedSkins.length - 1];
    }
    renderSkins();
}

function startNewGame() {
    console.log("🚀 startNewGame נקרא!");
    showBlackHole = false;
    pendingBlackHole = false;
    console.log("🎮 מסתיר לובי ומציג קנטיינר משחק");
    lobby.style.display = 'none';
    gameContainer.style.display = 'block';
    
    // הפעל מסך מלא
    gameContainer.classList.add('fullscreen');
    
    // התאם את גודל הקנבס למסך
    resizeCanvas();
    
    // נעל גלילה בזמן משחק
    if (document && document.body && document.body.classList) {
        document.body.classList.add('no-scroll');
    }
    console.log("✅ startNewGame הושלם")
    
    // אפס את משתני המהירות
    window.maxSpeedReached = false;
    window.highSpeedReached = false;
    
    // קבע את השלב לפי הבחירה בלובי
    const levelSelect = document.getElementById('levelSelect');
    if (levelSelect) {
        level = parseInt(levelSelect.value) || 1;
    } else {
        level = 1;
    }
    
    // אם מתחילים משלב 2 או גבוה יותר, דואגים להוסיף את כל הסקינים הדרושים
    if (level >= 2) {
        ensureAllSkins(level);
    }
    
        // תמיד מרנדר סקינים כדי לוודא שהבחירה תקינה
        if (!ownedSkins.includes(selectedSkin)) {
            selectedSkin = ownedSkins[0];
        }
        renderSkins();
    
    // Always start with selected skin
    player.color = selectedSkin;
    // Update game title
    const gameTitle = document.getElementById('gameTitle');
    if (gameTitle) {
        gameTitle.textContent = `${translate('gameTitle')} - ${translate('levelPrefix')}${level}`;
    }
    startGame(false); // התחלה ידנית מהלובי - ללא אנימציה
}

retryBtn.onclick = function() {
    if (gameOver && level === 1 && messageDiv.textContent.includes(translate('passedLevel1'))) {
        // קבלת סקין של שלב 1 (ירוק) - כבר יש לנו אותו, אבל נוודא
        if (!ownedSkins.includes(LEVEL_SKINS[1])) {
            ownedSkins.push(LEVEL_SKINS[1]);
        }
        // קבלת סקין חדש של שלב 2 (ורוד)
        if (!ownedSkins.includes(LEVEL_SKINS[2])) {
            ownedSkins.push(LEVEL_SKINS[2]);
        }
        selectedSkin = LEVEL_SKINS[2];
        renderSkins();
        player.color = selectedSkin;
        saveGameData(); // שמירה אחרי קבלת סקין חדש
        level = 2;
        levelTime = 60000;
        startGame(true); // עבור לשלב 2
    } else if (gameOver && level === 2 && messageDiv.textContent.includes(translate('passedLevel2'))) {
        // קבלת סקין חדש לשלב 3 (כחול)
        if (!ownedSkins.includes(LEVEL_SKINS[3])) {
            ownedSkins.push(LEVEL_SKINS[3]);
        }
        selectedSkin = LEVEL_SKINS[3];
        renderSkins();
        player.color = selectedSkin;
        saveGameData(); // שמירה אחרי קבלת סקין חדש
        level = 3;
        levelTime = 60000;
        startGame(true); // כאן התיקון: nextLevel=true
    } else if (gameOver && level === 3 && messageDiv.textContent.includes(translate('passedLevel3'))) {
        // קבלת סקין חדש לשלב 4 (כתום)
        if (!ownedSkins.includes(LEVEL_SKINS[4])) {
            ownedSkins.push(LEVEL_SKINS[4]);
        }
        selectedSkin = LEVEL_SKINS[4];
        renderSkins();
        player.color = selectedSkin;
        saveGameData(); // שמירה אחרי קבלת סקין חדש
        level = 4;
        levelTime = 60000;
        startGame(true);
    } else {
        // לא מחליפים צבע - נסה שוב את אותו שלב
        startGame(false); // nextLevel=false - נשאר באותו שלב
    }
};

startBtn.onclick = startNewGame;
backToLobbyBtn.onclick = showLobby;

// הוספת מאזינים לכפתורים של שלבים מותאמים אישית (הוסר)

// הגדרות - פתיחה וסגירה של חלון הגדרות
// פונקציה לעדכון פרטי המשתמש בלובי
function updatePlayerInfo() {
    const welcomeMessage = document.getElementById('welcomeMessage');
    const playerLevelDisplay = document.getElementById('playerLevelValue');
    
    if (welcomeMessage) {
        welcomeMessage.textContent = translate('welcomeMessage', playerName);
    }
    
    if (playerLevelDisplay) {
        playerLevelDisplay.textContent = playerLevel;
    }
}

// פונקציה זו הוסרה - אין יותר מערכת רמות לשחקן
function updatePlayerLevel() {
    // הפונקציה כבר לא בשימוש - נשארה לתאימות לאחור
}

function updateAvailableLevels() {
    const levelSelect = document.getElementById('levelSelect');
    if (!levelSelect) return;
    
    // נקה את כל האפשרויות
    levelSelect.innerHTML = '';
    
    // הוסף את השלבים הזמינים (רק השלבים שניצחת בהם + השלב הבא)
    const highestLevel = playerStats.highestLevel || 1;
    const maxAvailableLevel = Math.min(highestLevel + 1, 10); // שונה ל-10 רמות
    
    for (let i = 1; i <= maxAvailableLevel; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `שלב ${i}`;
        
        // סמן את השלב הבא (אם יש) כחדש
        if (i === highestLevel + 1 && i <= 10) {
            option.textContent += ' (חדש!)';
            option.style.color = '#ff6b6b';
            option.style.fontWeight = 'bold';
        }
        
        levelSelect.appendChild(option);
    }
    
    // בחר את השלב הגבוה ביותר שניצחת בו
    levelSelect.value = highestLevel;
}

function startBlackHoleEffect() {
    console.log("מתחיל אפקט חור שחור");
    // התחל את אפקט החור השחור
    blackHoleActive = true;
    blackHoleX = canvas.width / 2;
    blackHoleY = canvas.height / 2;
    blackHoleRadius = 0;
    
    // התחל את ההבהבה של הטיימר
    timerBlinking = true;
    
    // התחל למשוך את הקוביות לחור השחור
    boxesBeingSucked = [...boxes];
    
    // אחרי 3 שניות, הצג את הביצה
    setTimeout(() => {
        showEgg();
    }, 3000);
}

function showEgg() {
    // צור ביצה חדשה עם הסיכויים החדשים
    const egg = addNewEgg();
    
    // הצג את הביצה במרכז המסך
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.innerHTML = `
            <div style="text-align: center; color: white; font-size: 24px; font-weight: bold;">
                🥚 ${translate('receivedEgg')} 🥚
            </div>
            <div style="text-align: center; margin-top: 10px;">
                <button id="openEggBtn" style="background: linear-gradient(45deg, #ff6b6b, #ee5a24); color: white; padding: 15px 30px; border: none; border-radius: 50px; cursor: pointer; font-size: 1.2em; font-weight: bold; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);">
                    ${translate('openEgg')}
                </button>
            </div>
        `;
        
        // הוסף מאזין לכפתור פתיחת הביצה
        const openEggBtn = document.getElementById('openEggBtn');
        if (openEggBtn) {
            openEggBtn.addEventListener('click', openLastEgg);
        }
    }
}

// פונקציות דירוג
function updateLocalLeaderboard() {
    // בדוק אם השחקן כבר נמצא בדירוג
    const existingPlayerIndex = localLeaderboard.findIndex(p => p.email === playerEmail);
    
    if (existingPlayerIndex !== -1) {
        // עדכן את תאריך ההצטרפות אם השחקן כבר בדירוג
        localLeaderboard[existingPlayerIndex].joinDate = joinDate;
    } else {
        // הוסף את השחקן לדירוג
        localLeaderboard.push({
            name: playerName,
            email: playerEmail,
            joinDate: joinDate
        });
    }
    
    // מיין את הדירוג לפי שם (אלפביתי)
    localLeaderboard.sort((a, b) => a.name.localeCompare(b.name));
    
    // הגבל את הדירוג ל-10 שחקנים
    if (localLeaderboard.length > 10) {
        localLeaderboard = localLeaderboard.slice(0, 10);
    }
    
    // עדכן את תצוגת הדירוג
    updateLeaderboards();
}

// פונקציה לטעינת דירוג עולמי (סימולציה)
function fetchGlobalLeaderboard() {
    // סימולציה של דירוג עולמי עם נתונים אקראיים
    globalLeaderboard = [
        { name: "SuperPlayer", level: 25, country: "USA" },
        { name: "DiceKing", level: 22, country: "UK" },
        { name: "MasterDodger", level: 20, country: "Israel" },
        { name: "ProGamer123", level: 18, country: "France" },
        { name: "DiceQueen", level: 17, country: "Germany" },
        { name: "FastReflexes", level: 15, country: "Italy" },
        { name: "CubeEvader", level: 14, country: "Spain" },
        { name: "GameMaster", level: 12, country: "Russia" },
        { name: "LuckyDodge", level: 10, country: "China" },
        { name: "SpeedRunner", level: 9, country: "Japan" }
    ];
    
    // הוסף את השחקן הנוכחי לדירוג העולמי אם הוא לא כבר שם
    const playerInGlobal = globalLeaderboard.findIndex(p => p.name === playerName);
    if (playerInGlobal === -1 && playerName) {
        globalLeaderboard.push({
            name: playerName,
            level: playerLevel,
            country: "Israel" // ברירת מחדל
        });
        
        // מיין מחדש לפי רמה
        globalLeaderboard.sort((a, b) => b.level - a.level);
    }
    
    // עדכן את תצוגת הדירוג
    updateLeaderboards();
}

// פונקציה לעדכון תצוגת הדירוג
function updateLeaderboards() {
    // עדכון דירוג מקומי
    const localBody = document.getElementById('localLeaderboardBody');
    if (localBody) {
        localBody.innerHTML = '';
        
        if (localLeaderboard.length === 0) {
            // אם אין שחקנים בדירוג המקומי
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 3; // עודכן ל-3 עמודות (הסרנו רמה)
            cell.textContent = translate('noLocalPlayers');
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            localBody.appendChild(row);
        } else {
            // הצג את השחקנים בדירוג המקומי
            localLeaderboard.forEach((player, index) => {
                const row = document.createElement('tr');
                
                const rankCell = document.createElement('td');
                rankCell.textContent = index + 1;
                rankCell.className = 'rank-column';
                
                const nameCell = document.createElement('td');
                nameCell.textContent = player.name;
                nameCell.className = 'name-column';
                
                const dateCell = document.createElement('td');
                dateCell.textContent = player.joinDate || '01/01/2023';
                dateCell.className = 'date-column';
                
                // הדגש את השחקן הנוכחי
                if (player.email === playerEmail) {
                    row.classList.add('current-player');
                    row.style.fontWeight = 'bold';
                    row.style.background = 'rgba(255, 215, 0, 0.2)';
                }
                
                row.appendChild(rankCell);
                row.appendChild(nameCell);
                row.appendChild(dateCell);
                localBody.appendChild(row);
            });
        }
        
        // עדכון מספר השחקנים המקומיים
        const localPlayerCount = document.getElementById('localPlayerCount');
        if (localPlayerCount) {
            localPlayerCount.textContent = `${localLeaderboard.length} ${translate('players')}`;
        }
        
        // עדכון הדירוג האישי של השחקן
        const localYourRank = document.getElementById('localYourRank');
        if (localYourRank) {
            const playerRank = localLeaderboard.findIndex(p => p.email === playerEmail);
            if (playerRank !== -1) {
                localYourRank.textContent = `${translate('yourRank')}: ${playerRank + 1}`;
            } else {
                localYourRank.textContent = `${translate('yourRank')}: -`;
            }
        }
    }
    
    // עדכון דירוג עולמי
    const globalBody = document.getElementById('globalLeaderboardBody');
    if (globalBody) {
        globalBody.innerHTML = '';
        
        if (globalLeaderboard.length === 0) {
            // אם אין שחקנים בדירוג העולמי
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 3; // עודכן ל-3 עמודות (הסרנו רמה)
            cell.textContent = translate('noGlobalPlayers');
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            globalBody.appendChild(row);
        } else {
            // הצג את השחקנים בדירוג העולמי
            globalLeaderboard.forEach((player, index) => {
                const row = document.createElement('tr');
                
                const rankCell = document.createElement('td');
                rankCell.textContent = index + 1;
                rankCell.className = 'rank-column';
                
                const nameCell = document.createElement('td');
                nameCell.textContent = player.name;
                nameCell.className = 'name-column';
                
                const countryCell = document.createElement('td');
                countryCell.textContent = player.country || 'Global';
                countryCell.className = 'country-column';
                
                // הוסף דגל אם יש מידע על מדינה
                if (player.country) {
                    const flag = document.createElement('span');
                    flag.className = 'country-flag';
                    flag.textContent = getCountryFlag(player.country) + ' ';
                    countryCell.prepend(flag);
                }
                
                row.appendChild(rankCell);
                row.appendChild(nameCell);
                row.appendChild(countryCell);
                globalBody.appendChild(row);
            });
        }
        
        // עדכון מספר השחקנים הגלובליים
        const globalPlayerCount = document.getElementById('globalPlayerCount');
        if (globalPlayerCount) {
            globalPlayerCount.textContent = `${globalLeaderboard.length} ${translate('players')}`;
        }
        
        // עדכון הדירוג העולמי של השחקן
        const globalYourRank = document.getElementById('globalYourRank');
        if (globalYourRank) {
            const playerRank = globalLeaderboard.findIndex(p => p.name === playerName);
            if (playerRank !== -1) {
                globalYourRank.textContent = `${translate('yourGlobalRank')}: ${playerRank + 1}`;
            } else {
                globalYourRank.textContent = `${translate('yourGlobalRank')}: -`;
            }
        }
    }
    
    // הוסף מאזיני אירועים לכפתורים
    setupLeaderboardEventListeners();
}

// פונקציה להחזרת אימוג'י של דגל עבור מדינה
function getCountryFlag(country) {
    const flags = {
        'Israel': '🇮🇱',
        'USA': '🇺🇸',
        'UK': '🇬🇧',
        'France': '🇫🇷',
        'Germany': '🇩🇪',
        'Italy': '🇮🇹',
        'Spain': '🇪🇸',
        'Russia': '🇷🇺',
        'China': '🇨🇳',
        'Japan': '🇯🇵',
        'Global': '🌍'
    };
    
    return flags[country] || '🌍';
}

// פונקציה להגדרת מאזיני אירועים ללוחות התוצאות
function setupLeaderboardEventListeners() {
    // כפתור רענון לוחות התוצאות
    const refreshBtn = document.getElementById('refreshLeaderboardBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            // אנימציה לכפתור
            this.style.transform = 'rotate(360deg)';
            
            // רענון הנתונים
            updateLocalLeaderboard();
            fetchGlobalLeaderboard();
            
            // הודעה למשתמש
            alert(translate('leaderboardRefreshed'));
            
            // איפוס האנימציה לאחר סיום
            setTimeout(() => {
                this.style.transform = 'rotate(0deg)';
            }, 1000);
        });
    }
    
    // מיון לוחות התוצאות
    const sortSelect = document.getElementById('leaderboardSortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortBy = this.value;
            
            // מיון הנתונים
            if (sortBy === 'level') {
                localLeaderboard.sort((a, b) => b.level - a.level);
                globalLeaderboard.sort((a, b) => b.level - a.level);
            } else if (sortBy === 'name') {
                localLeaderboard.sort((a, b) => a.name.localeCompare(b.name));
                globalLeaderboard.sort((a, b) => a.name.localeCompare(b.name));
            } else if (sortBy === 'date') {
                localLeaderboard.sort((a, b) => {
                    if (!a.joinDate) return 1;
                    if (!b.joinDate) return -1;
                    return new Date(b.joinDate) - new Date(a.joinDate);
                });
            }
            
            // עדכון התצוגה
            updateLeaderboards();
        });
    }
    
    // כפתור איפוס לוח תוצאות מקומי
    const resetLocalBtn = document.getElementById('resetLocalLeaderboardBtnInline');
    if (resetLocalBtn) {
        resetLocalBtn.addEventListener('click', function() {
            if (confirm(translate('confirmResetLeaderboard'))) {
                localLeaderboard = [];
                saveGameData();
                updateLeaderboards();
                alert(translate('leaderboardReset'));
            }
        });
    }
    
    // כפתור שיתוף תוצאה
    const shareScoreBtn = document.getElementById('shareScoreBtn');
    if (shareScoreBtn) {
        shareScoreBtn.addEventListener('click', function() {
            const shareText = `${translate('shareScore', playerName, playerLevel)}`;
            
            // נסה להשתמש ב-Web Share API אם זמין
            if (navigator.share) {
                navigator.share({
                    title: 'Dice Evasion Game',
                    text: shareText,
                    url: window.location.href
                }).catch(err => {
                    // אם לא ניתן לשתף, העתק ללוח
                    copyToClipboard(shareText);
                });
            } else {
                // העתק ללוח אם Web Share API לא זמין
                copyToClipboard(shareText);
            }
        });
    }
}

// פונקציה להעתקת טקסט ללוח
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert(translate('scoreCopied'));
}

// פונקציה לטעינת מידע גרסה
async function loadVersionInfo() {
    try {
        const response = await fetch('version.json?' + new Date().getTime()); // מונע caching
        const versionData = await response.json();
        
        // עדכן את האלמנטים
        const gameVersion = document.getElementById('gameVersion');
        const gameBuildDate = document.getElementById('gameBuildDate');
        const gameLastUpdate = document.getElementById('gameLastUpdate');
        const deployStatus = document.getElementById('deployStatus');
        
        if (gameVersion) gameVersion.textContent = 'v' + versionData.version;
        if (gameBuildDate) gameBuildDate.textContent = versionData.buildDate;
        if (gameLastUpdate) gameLastUpdate.textContent = versionData.lastUpdate;
        if (deployStatus) {
            const now = new Date();
            const buildDate = new Date(versionData.buildDate);
            const daysDiff = Math.floor((now - buildDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 0) {
                deployStatus.innerHTML = '✅ Live (Updated today!)';
                deployStatus.style.color = '#4CAF50';
            } else if (daysDiff === 1) {
                deployStatus.innerHTML = '✅ Live (Updated yesterday)';
                deployStatus.style.color = '#4CAF50';
            } else {
                deployStatus.innerHTML = `✅ Live (${daysDiff} days old)`;
                deployStatus.style.color = '#2196F3';
            }
        }
        
        console.log('📦 Version loaded:', versionData.version);
    } catch (error) {
        console.error('❌ Error loading version info:', error);
        const gameVersion = document.getElementById('gameVersion');
        if (gameVersion) gameVersion.textContent = 'Unknown';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded נטען!");
    
    // טען מידע גרסה
    loadVersionInfo();
    
    // התחברות מנוהלת דרך loginDirectly() ב-HTML
    
    // הוסף מאזיני אירועים לטאבים בהגדרות
    const settingsTabs = document.querySelectorAll('.settings-tab-btn');
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            console.log("נלחץ טאב:", tab.dataset.tab);
            
            // הסר את הבחירה מכל הטאבים
            settingsTabs.forEach(t => t.classList.remove('active'));
            
            // סמן את הטאב הנבחר
            tab.classList.add('active');
            
            // הסתר את כל תוכן הטאבים
            document.querySelectorAll('.settings-tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // הצג את התוכן של הטאב הנבחר
            const tabContent = document.getElementById(tab.dataset.tab);
            if (tabContent) tabContent.style.display = 'block';
        });
    });
    
    // הוסף מאזין אירועים לפתיחת חלון ההגדרות
    const settingsButton = document.getElementById('settingsButton');
    if (settingsButton) {
        settingsButton.addEventListener('click', function() {
            const settingsModal = document.getElementById('settingsModal');
            if (settingsModal) {
                settingsModal.style.display = 'block';
                console.log("נפתח חלון הגדרות");
            }
        });
    }
    
    // הוסף מאזין אירועים לסגירת חלון ההגדרות
    const closeButton = document.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            const settingsModal = document.getElementById('settingsModal');
            if (settingsModal) {
                settingsModal.style.display = 'none';
                console.log("נסגר חלון הגדרות");
            }
        });
    }
    
    // הוסף מאזין אירועים לשמירת הגדרות
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            const settingsModal = document.getElementById('settingsModal');
            if (settingsModal) {
                settingsModal.style.display = 'none';
                console.log("נשמרו הגדרות");
            }
            
            // שמור את השפה הנבחרת
            const languageSelect = document.getElementById('languageSelect');
            if (languageSelect) {
                currentLanguage = languageSelect.value;
                window.currentLanguage = currentLanguage; // שמירה גם במשתנה גלובלי
                console.log("שפה עודכנה ל:", currentLanguage);
                updatePageLanguage();
                saveGameData();
            }
        });
    }
    
    // טען את נתוני המשחק
    loadGameData();
}); 

// הוסף מאזיני אירועים לכפתורי המשחק
document.addEventListener('DOMContentLoaded', function() {
    console.log("מוסיף מאזיני אירועים לכפתורי המשחק");
    
    // מאזין אירועים לכפתור התחלת משחק
    const startBtn = document.getElementById('startBtn');
    console.log("🎮 startBtn נמצא?", startBtn ? "כן" : "לא");
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            console.log("🎮 לחיצה על כפתור התחלת משחק!");
            startNewGame();
        });
    } else {
        console.error("❌ כפתור startBtn לא נמצא!");
    }
    
    // כפתור בוס
    const bossBtn = document.getElementById('bossBtn');
    if (bossBtn) {
        bossBtn.addEventListener('click', function() {
            console.log("לחיצה על כפתור בוס");
            startBossFight();
        });
    }
    
    // כפתור ירייה בקרב בוס
    const shootBtn = document.getElementById('shootBtn');
    if (shootBtn) {
        shootBtn.addEventListener('click', function() {
            if (!bossActive || gameOver) return;
            
            const now = Date.now();
            if (now - lastPlayerShot > PLAYER_SHOOT_COOLDOWN) {
                playerBullets.push({
                    x: player.x + player.width / 2 - 10,
                    y: player.y,
                    width: 20,
                    height: 20,
                    speedY: 8
                });
                lastPlayerShot = now;
            }
        });
        
        // תמיכה ב-touch לכפתור ירייה (מהר יותר)
        shootBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (!bossActive || gameOver) return;
            
            const now = Date.now();
            if (now - lastPlayerShot > PLAYER_SHOOT_COOLDOWN) {
                playerBullets.push({
                    x: player.x + player.width / 2 - 10,
                    y: player.y,
                    width: 20,
                    height: 20,
                    speedY: 8
                });
                lastPlayerShot = now;
            }
        });
    }
    
    // מאזין אירועים לכפתור חזרה ללובי
    const backToLobbyBtn = document.getElementById('backToLobbyBtn');
    if (backToLobbyBtn) {
        backToLobbyBtn.addEventListener('click', function() {
            console.log("לחיצה על כפתור חזרה ללובי");
            showLobby();
        });
    }
    
    // מאזין אירועים לכפתור נסה שוב
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
        retryBtn.addEventListener('click', function() {
            console.log("לחיצה על כפתור נסה שוב");
            if (gameOver && level === 1 && messageDiv.textContent.includes(translate('passedLevel1'))) {
                // קבלת סקין של שלב 1 (ירוק) - כבר יש לנו אותו, אבל נוודא
                if (!ownedSkins.includes(LEVEL_SKINS[1])) {
                    ownedSkins.push(LEVEL_SKINS[1]);
                }
                // קבלת סקין חדש של שלב 2 (ורוד)
                if (!ownedSkins.includes(LEVEL_SKINS[2])) {
                    ownedSkins.push(LEVEL_SKINS[2]);
                }
                selectedSkin = LEVEL_SKINS[2];
    renderSkins();
                player.color = selectedSkin;
                saveGameData(); // שמירה אחרי קבלת סקין חדש
                level = 2;
                levelTime = 60000;
                startGame(true); // עבור לשלב 2
            } else if (gameOver && level === 2 && messageDiv.textContent.includes(translate('passedLevel2'))) {
                // קבלת סקין חדש לשלב 3 (כחול)
                if (!ownedSkins.includes(LEVEL_SKINS[3])) {
                    ownedSkins.push(LEVEL_SKINS[3]);
                }
                selectedSkin = LEVEL_SKINS[3];
                renderSkins();
                player.color = selectedSkin;
                saveGameData(); // שמירה אחרי קבלת סקין חדש
                level = 3;
                levelTime = 60000;
                startGame(true); // כאן התיקון: nextLevel=true
            } else if (gameOver && level === 3 && messageDiv.textContent.includes(translate('passedLevel3'))) {
                // קבלת סקין חדש לשלב 4 (כתום)
                if (!ownedSkins.includes(LEVEL_SKINS[4])) {
                    ownedSkins.push(LEVEL_SKINS[4]);
                }
                selectedSkin = LEVEL_SKINS[4];
                renderSkins();
                player.color = selectedSkin;
                saveGameData(); // שמירה אחרי קבלת סקין חדש
                level = 4;
                levelTime = 60000;
                startGame(true);
            } else {
                // לא מחליפים צבע - נסה שוב את אותו שלב
                startGame(false); // nextLevel=false - נשאר באותו שלב
            }
        });
    }
}); 

// ========== מערכת חברים ==========

// טען נתוני חברים מ-localStorage
function loadFriendsData() {
    const gameData = localStorage.getItem('diceEvasionGame');
    if (gameData) {
        const data = JSON.parse(gameData);
        friends = data.friends || [];
        friendRequests = data.friendRequests || [];
    }
    updateFriendsDisplay();
}

// שמור נתוני חברים ל-localStorage
function saveFriendsData() {
    const gameData = localStorage.getItem('diceEvasionGame');
    if (gameData) {
        const data = JSON.parse(gameData);
        data.friends = friends;
        data.friendRequests = friendRequests;
        localStorage.setItem('diceEvasionGame', JSON.stringify(data));
    }
}

// עדכן תצוגת רשימת חברים
function updateFriendsDisplay() {
    const friendsListDiv = document.getElementById('friendsList');
    const friendsCountDiv = document.getElementById('friendsListLabel');
    const requestsCountDiv = document.getElementById('friendRequestsLabel');
    const requestsListDiv = document.getElementById('friendRequestsList');
    
    if (!friendsListDiv || !friendsCountDiv || !requestsCountDiv || !requestsListDiv) return;
    
    // עדכן כותרת רשימת חברים
    friendsCountDiv.textContent = translate('friendsListLabel', friends.length, MAX_FRIENDS);
    
    // רינדר רשימת חברים
    if (friends.length === 0) {
        friendsListDiv.innerHTML = '<p style="text-align: center; color: #999;">No friends yet</p>';
        } else {
        friendsListDiv.innerHTML = friends.map(friend => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #eee;">
                <span>${friend.name}</span>
                <button class="remove-friend-btn" onclick="removeFriend('${friend.email}')">${translate('removeFriendBtn')}</button>
            </div>
        `).join('');
    }
    
    // עדכן כותרת בקשות חברות
    requestsCountDiv.textContent = translate('friendRequestsLabel', friendRequests.length);
    
    // רינדר רשימת בקשות חברות
    if (friendRequests.length === 0) {
        requestsListDiv.innerHTML = '<p style="text-align: center; color: #999;">No pending requests</p>';
    } else {
        requestsListDiv.innerHTML = friendRequests.map(req => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px; border-bottom: 1px solid #eee;">
                <span>${req.from}</span>
                <div>
                    <button class="accept-btn" onclick="acceptFriendRequest('${req.from}')" style="margin-right: 5px; padding: 3px 8px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">${translate('acceptRequestBtn')}</button>
                    <button class="reject-btn" onclick="rejectFriendRequest('${req.from}')" style="padding: 3px 8px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">${translate('rejectRequestBtn')}</button>
                </div>
            </div>
        `).join('');
    }
}

// שלח בקשות חברות
function sendFriendRequest() {
    const emailInput = document.getElementById('friendEmailInput');
    if (!emailInput) return;
    
    const friendEmail = emailInput.value.trim();
    if (!friendEmail) {
        alert('Please enter a friend email or name');
        return;
    }
    
    // בדוק אם השחקן מנסה להוסיף את עצמו
    if (friendEmail === playerEmail || friendEmail === playerName) {
        alert(translate('cannotAddYourself'));
        return;
    }
    
    // בדוק אם כבר חבר
    if (friends.find(f => f.email === friendEmail || f.name === friendEmail)) {
        alert(translate('friendAdded', friendEmail));
        emailInput.value = '';
        return;
    }
    
    // בדוק אם כבר שלח בקשה
    if (friendRequests.find(r => r.from === friendEmail)) {
        alert(translate('friendRequestSent', friendEmail));
        emailInput.value = '';
        return;
    }
    
    // בדוק מגבלת 100 חברים
    if (friends.length >= MAX_FRIENDS) {
        alert(translate('maxFriendsReached', MAX_FRIENDS));
        emailInput.value = '';
        return;
    }
    
    // הוסף בקשה חדשה
    friendRequests.push({
        from: friendEmail,
        timestamp: Date.now()
    });
    
    saveFriendsData();
    updateFriendsDisplay();
    
    alert(translate('friendRequestSent', friendEmail));
    emailInput.value = '';
}

// אשר בקשות חברות
function acceptFriendRequest(fromEmail) {
    // הסר מהרשימת בקשות
    friendRequests = friendRequests.filter(r => r.from !== fromEmail);
    
    // הוסף לרשימת חברים
    friends.push({
        email: fromEmail,
        name: fromEmail,
        addedAt: new Date().toLocaleDateString()
    });
    
    saveFriendsData();
    updateFriendsDisplay();
    
    alert(translate('friendRequestAccepted'));
}

// דחה בקשות חברות
function rejectFriendRequest(fromEmail) {
    friendRequests = friendRequests.filter(r => r.from !== fromEmail);
    saveFriendsData();
    updateFriendsDisplay();
}

// הסר חבר
function removeFriend(email) {
    if (!confirm(`Are you sure you want to remove this friend?`)) return;
    
    friends = friends.filter(f => f.email !== email);
    saveFriendsData();
    updateFriendsDisplay();
}

// הוסף מאזינים למערכת חברים
document.addEventListener('DOMContentLoaded', function() {
    // טען נתוני חברים
    loadFriendsData();
    
    // הוסף מאזין לכפתור שליחת בקשות חברות
    const sendRequestBtn = document.getElementById('sendFriendRequestBtn');
    if (sendRequestBtn) {
        sendRequestBtn.addEventListener('click', sendFriendRequest);
    }
    
    // הוסף מאזין לEnter בשדה אימייל
    const friendEmailInput = document.getElementById('friendEmailInput');
    if (friendEmailInput) {
        friendEmailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendFriendRequest();
            }
        });
    }
    
    // הוסף מאזין לכפתור שינוי שם
    const saveNameBtn = document.getElementById('saveNameBtn');
    if (saveNameBtn) {
        saveNameBtn.addEventListener('click', changePlayerName);
    }
    
    // הוסף מאזין לEnter בשדה שינוי שם
    const playerNameChange = document.getElementById('playerNameChange');
    if (playerNameChange) {
        playerNameChange.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                changePlayerName();
            }
        });
    }
});

// פונקציה לשינוי שם שחקן
function changePlayerName() {
    const nameInput = document.getElementById('playerNameChange');
    if (!nameInput) return;
    
    const newName = nameInput.value.trim();
    if (!newName) {
        alert('Please enter a name');
        return;
    }
    
    // עדכן את השם
    playerName = newName;
    
    // עדכן תצוגה
    updatePlayerInfo();
    updateProfileDisplay();
    
    // שמור נתונים
    saveGameData();
    
    alert(translate('nameChangedSuccess'));
    nameInput.value = '';
}

// מחוץ ל-gameLoop (בראש/סוף קובץ)
let blackHoleHandlerActive = false;

function handleBlackHoleClick(ev) {
    let canvas = document.getElementById('gameCanvas');
    let r = Math.min(canvas.width, canvas.height)*0.33;
    const x = ev.offsetX, y = ev.offsetY;
    if (x > canvas.width/2 + r/2 && Math.abs(y - canvas.height/2) < r/1.5) {
        showBlackHole = false;
        pendingBlackHole = false;
        canvas.removeEventListener('click', handleBlackHoleClick);
        blackHoleHandlerActive = false;
        startNewGame();
    } else if (x < canvas.width/2 - r/2 && Math.abs(y - canvas.height/2) < r/1.5) {
        showBlackHole = false;
        pendingBlackHole = false;
        canvas.removeEventListener('click', handleBlackHoleClick);
        blackHoleHandlerActive = false;
        showLobby();
    }
}

// הוסף את הפונקציה ל-window כדי שתהיה נגישה
window.loadGameData = loadGameData;
window.loginDirectly = loginDirectly;
window.startGame = startGame;
window.startNewGame = startNewGame;
window.showLobby = showLobby;
window.updatePlayerLevel = updatePlayerLevel;
window.saveGameData = saveGameData;
