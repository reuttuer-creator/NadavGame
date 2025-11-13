// משתני התחברות
let playerName = '';
let playerEmail = '';
let playerLevel = 1;
let isLoggedIn = false;
let joinDate = '';
let playerStats = {
    highestLevel: 1,
    totalGames: 0,
    localRank: '--'
};

// משתני דירוג
let globalLeaderboard = [];
let localLeaderboard = [];

// הגדרות דירוג
let leaderboardSettings = {
    showLeaderboard: 'both', // 'both', 'local', 'global', 'none'
    defaultView: 'local'     // 'local', 'global'
};

const loginScreen = document.getElementById('loginScreen');
const loginBtn = document.getElementById('loginBtn');
const playerNameInput = document.getElementById('playerName');
const playerEmailInput = document.getElementById('playerEmail');
const welcomeMessage = document.getElementById('welcomeMessage');
const playerLevelDisplay = document.getElementById('playerLevelValue');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const messageDiv = document.getElementById('message');
const retryBtn = document.getElementById('retryBtn');
const startBtn = document.getElementById('startBtn');
const backToLobbyBtn = document.getElementById('backToLobbyBtn');
const lobby = document.getElementById('lobby');
const gameContainer = document.getElementById('gameContainer');

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
const boxSpeed = 3;
let boxInterval = 1200; // כל כמה זמן נוצרת קוביה (ms)
let lastBoxTime = 0;

// קוביות מהצדדים בשלב 3
function spawnSideBox() {
    // בחר צד אקראי
    const fromLeft = Math.random() < 0.5;
    const y = canvas.height - player.height - 10; // בגובה הדמות
    const x = fromLeft ? -boxWidth : canvas.width;
    const speed = fromLeft ? 4 : -4;
    boxes.push({ x, y, width: boxWidth, height: boxHeight, speedX: speed, speedY: 0, side: true });
}

// משתני קפיצה
let isJumping = false;
let jumpStartY = 0;
let jumpTime = 0;
const jumpHeight = 90;
const jumpDuration = 600; // ms

// טיימר שלב
let level = 1;
let levelTime = 60000; // ברירת מחדל: 60 שניות
let startTime = null;
let gameOver = false;

// קלט מקשים
const keys = {};
document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ' && !isJumping && player.y >= canvas.height - player.height - 0.1) {
        isJumping = true;
        jumpStartY = canvas.height - player.height;
        jumpTime = 0;
    }
});
document.addEventListener('keyup', e => keys[e.key] = false);

// הגדרת צבעים קבועים לכל שלב
const LEVEL_SKINS = {
    1: '#00cc44', // ירוק
    2: '#ff66cc', // ורוד
    3: '#3366ff', // כחול
    4: '#ff9933'  // כתום (התחלתי)
};

let ownedSkins = [LEVEL_SKINS[1]]; // ירוק ברירת מחדל
let selectedSkin = LEVEL_SKINS[1];

// משתנים לשלבים מותאמים אישית
let customLevels = [];
let currentCustomLevel = null;

// הגדרות שפה
let currentLanguage = 'en'; // ברירת מחדל: אנגלית

const translations = {
    en: {
        // כותרות
        gameTitle: 'Dice Evasion Game',
        loginTitle: 'Welcome to Dice Evasion Game',
        howToPlayTitle: 'How to Play:',
        createCustomLevelTitle: 'Create Custom Level',
        myCustomLevelsTitle: 'My Custom Levels',
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
        saveCustomLevelBtn: 'Save Custom Level',
        playCustomLevelBtn: 'Play Custom Level',
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
        passedLevel2: 'Awesome! You passed Level 2!',
        passedLevel3: 'Incredible! You passed Level 3!',
        completedAllLevels: 'AMAZING! You completed all levels!',
        completedCustomLevel: 'You completed "{0}"!',
        youLost: 'You lost! Try again.',
        
        // אחר
        selectCustomLevel: '-- Select a custom level --',
        levelPrefix: 'Level ',
        customLevelPlaceholder: 'My Custom Level',
        levelSaved: 'Level "{0}" saved!',
        confirmDelete: 'Are you sure you want to delete the level "{0}"?',
        drawTimer: 'Time left: {0}s',
        receivedGreenSkin: 'You received the Green Skin!',
        receivedPinkSkin: 'You received the Pink Skin!',
        receivedBlueSkin: 'You received the Blue Skin!',
        receivedOrangeSkin: 'You received the Orange Skin!'
    },
    he: {
        // כותרות
        gameTitle: 'משחק התחמקות מקוביות',
        loginTitle: 'ברוכים הבאים למשחק התחמקות מקוביות',
        howToPlayTitle: 'איך משחקים:',
        createCustomLevelTitle: 'צור שלב מותאם אישית',
        myCustomLevelsTitle: 'השלבים המותאמים שלי',
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
        saveCustomLevelBtn: 'שמור שלב',
        playCustomLevelBtn: 'שחק בשלב',
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
        completedCustomLevel: 'סיימת את "{0}"!',
        youLost: 'נפסלת! נסה שוב.',
        
        // אחר
        selectCustomLevel: '-- בחר שלב מותאם אישית --',
        levelPrefix: 'שלב ',
        customLevelPlaceholder: 'השלב המותאם שלי',
        levelSaved: 'שלב "{0}" נשמר!',
        confirmDelete: 'האם אתה בטוח שברצונך למחוק את השלב "{0}"?',
        drawTimer: 'זמן שנותר: {0} שניות',
        receivedGreenSkin: 'קיבלת את הסקין הירוק!',
        receivedPinkSkin: 'קיבלת את הסקין הורוד!',
        receivedBlueSkin: 'קיבלת את הסקין הכחול!',
        receivedOrangeSkin: 'קיבלת את הסקין הכתום!'
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
    document.getElementById('createCustomLevelTitle').textContent = translate('createCustomLevelTitle');
    document.getElementById('myCustomLevelsTitle').textContent = translate('myCustomLevelsTitle');
    document.getElementById('settingsTitle').textContent = translate('settingsTitle');
    
    // הוראות משחק
    document.getElementById('instruction1').textContent = translate('instruction1');
    document.getElementById('instruction2').textContent = translate('instruction2');
    document.getElementById('instruction3').textContent = translate('instruction3');
    document.getElementById('instruction4').textContent = translate('instruction4');
    document.getElementById('instruction5').textContent = translate('instruction5');
    
    // תוויות
    document.getElementById('startLevelLabel').textContent = translate('startLevelLabel');
    document.getElementById('topDiceLabel').textContent = translate('topDiceLabel');
    document.getElementById('sideDiceLabel').textContent = translate('sideDiceLabel');
    document.getElementById('levelTimeLabel').textContent = translate('levelTimeLabel');
    document.getElementById('diceSpeedLabel').textContent = translate('diceSpeedLabel');
    document.getElementById('levelNameLabel').textContent = translate('levelNameLabel');
    document.getElementById('languageLabel').textContent = translate('languageLabel');
    
    // כפתורים
    document.getElementById('startBtn').textContent = translate('startBtn');
    document.getElementById('saveCustomLevelBtn').textContent = translate('saveCustomLevelBtn');
    document.getElementById('playCustomLevelBtn').textContent = translate('playCustomLevelBtn');
    document.getElementById('loadCustomLevelBtn').textContent = translate('loadBtn');
    document.getElementById('deleteCustomLevelBtn').textContent = translate('deleteBtn');
    document.getElementById('backToLobbyBtn').textContent = translate('backToLobbyBtn');
    document.getElementById('saveSettingsBtn').textContent = translate('saveSettingsBtn');
    
    // אחר
    document.getElementById('levelName').placeholder = translate('customLevelPlaceholder');
    document.querySelector('#savedLevelsSelect option').textContent = translate('selectCustomLevel');
    
    // עדכון כותרת המשחק אם המשחק פעיל
    const gameTitle = document.getElementById('gameTitle');
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

// פונקציות שמירה וטעינה
function saveGameData() {
    const gameData = {
        ownedSkins: ownedSkins,
        selectedSkin: selectedSkin,
        lastLevel: level,
        customLevels: customLevels,
        language: currentLanguage,
        playerName: playerName,
        playerEmail: playerEmail,
        playerLevel: playerLevel,
        isLoggedIn: isLoggedIn,
        joinDate: joinDate,
        playerStats: playerStats,
        localLeaderboard: localLeaderboard,
        leaderboardSettings: leaderboardSettings
    };
    localStorage.setItem('diceEvasionGame', JSON.stringify(gameData));
    
    // עדכון הדירוג המקומי
    updateLocalLeaderboard();
}

function loadGameData() {
    console.log("טוען נתוני משחק מהאחסון המקומי");
    const savedData = localStorage.getItem('diceEvasionGame');
    if (savedData) {
        console.log("נמצאו נתונים שמורים");
        const gameData = JSON.parse(savedData);
        ownedSkins = gameData.ownedSkins || [LEVEL_SKINS[1]];
        selectedSkin = gameData.selectedSkin || LEVEL_SKINS[1];
        customLevels = gameData.customLevels || [];
        
        // טען שפה אם נשמרה
        if (gameData.language) {
            currentLanguage = gameData.language;
            document.getElementById('languageSelect').value = currentLanguage;
        }
        
        // טען נתוני משתמש אם נשמרו
        if (gameData.isLoggedIn && gameData.playerName && gameData.playerEmail) {
            console.log("נמצאו נתוני משתמש:", gameData.playerName);
            playerName = gameData.playerName;
            playerEmail = gameData.playerEmail;
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
            const loginScreen = document.getElementById('loginScreen');
            const lobby = document.getElementById('lobby');
            
            if (loginScreen) {
                loginScreen.style.display = 'none';
                console.log("מסך התחברות הוסתר");
            }
            if (lobby) {
                lobby.style.display = 'block';
                console.log("לובי הוצג");
            }
            
            // עדכן את הודעת הברכה ורמת השחקן
            updatePlayerInfo();
            
            // עדכן את מסך הפרופיל
            updateProfileDisplay();
            
            console.log("נטענו נתוני משתמש:", { playerName, playerEmail, joinDate });
        } else {
            console.log("אין משתמש מחובר, מציג מסך התחברות");
            // אם אין משתמש מחובר, ודא שמסך ההתחברות מוצג
            const loginScreen = document.getElementById('loginScreen');
            const lobby = document.getElementById('lobby');
            
            if (loginScreen) {
                loginScreen.style.display = 'block';
                console.log("מסך התחברות הוצג");
            }
            if (lobby) {
                lobby.style.display = 'none';
                console.log("לובי הוסתר");
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
    } else {
        console.log("אין נתונים שמורים, מציג מסך התחברות");
        // אם אין נתונים שמורים, ודא שמסך ההתחברות מוצג
        const loginScreen = document.getElementById('loginScreen');
        const lobby = document.getElementById('lobby');
        
        if (loginScreen) {
            loginScreen.style.display = 'block';
            console.log("מסך התחברות הוצג");
        }
        if (lobby) {
            lobby.style.display = 'none';
            console.log("לובי הוסתר");
        }
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
    
    // עדכון רמת השחקן
    const profileLevel = document.getElementById('profileLevel');
    if (profileLevel) {
        profileLevel.textContent = playerLevel;
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
    const profileHighestLevel = document.getElementById('profileHighestLevel');
    if (profileHighestLevel) {
        profileHighestLevel.textContent = playerStats.highestLevel;
    }
    
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
    updateSavedLevelsList();
    updatePageLanguage();
    
    // טען דירוג עולמי מהשרת (סימולציה)
    fetchGlobalLeaderboard();
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

// פונקציות לשלבים מותאמים אישית
function createCustomLevel() {
    const topDiceCount = parseInt(document.getElementById('topDiceCount').value) || 0;
    const sideDiceCount = parseInt(document.getElementById('sideDiceCount').value) || 0;
    const levelTimeSeconds = parseInt(document.getElementById('levelTime').value) || 60;
    const diceSpeed = parseInt(document.getElementById('diceSpeed').value) || 3;
    const levelName = document.getElementById('levelName').value || "Custom Level";
    
    return {
        name: levelName,
        topDiceCount: Math.min(5, Math.max(0, topDiceCount)),
        sideDiceCount: Math.min(5, Math.max(0, sideDiceCount)),
        levelTimeMs: Math.min(120, Math.max(10, levelTimeSeconds)) * 1000,
        diceSpeed: Math.min(10, Math.max(1, diceSpeed))
    };
}

function saveCustomLevel() {
    const newLevel = createCustomLevel();
    
    // בדוק אם כבר קיים שלב עם אותו שם
    const existingIndex = customLevels.findIndex(level => level.name === newLevel.name);
    if (existingIndex !== -1) {
        customLevels[existingIndex] = newLevel;
    } else {
        customLevels.push(newLevel);
    }
    
    saveGameData();
    updateSavedLevelsList();
    
    alert(translate('levelSaved', newLevel.name));
}

function updateSavedLevelsList() {
    const select = document.getElementById('savedLevelsSelect');
    if (!select) return;
    
    // נקה את הרשימה הקיימת
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // הוסף את כל השלבים השמורים
    customLevels.forEach(level => {
        const option = document.createElement('option');
        option.value = level.name;
        option.textContent = level.name;
        select.appendChild(option);
    });
}

function loadCustomLevel() {
    const select = document.getElementById('savedLevelsSelect');
    if (!select || select.value === '') return;
    
    const selectedLevel = customLevels.find(level => level.name === select.value);
    if (!selectedLevel) return;
    
    // טען את הערכים לטופס
    document.getElementById('topDiceCount').value = selectedLevel.topDiceCount;
    document.getElementById('sideDiceCount').value = selectedLevel.sideDiceCount;
    document.getElementById('levelTime').value = selectedLevel.levelTimeMs / 1000;
    document.getElementById('diceSpeed').value = selectedLevel.diceSpeed;
    document.getElementById('levelName').value = selectedLevel.name;
}

function deleteCustomLevel() {
    const select = document.getElementById('savedLevelsSelect');
    if (!select || select.value === '') return;
    
    const confirmDelete = confirm(translate('confirmDelete', select.value));
    if (!confirmDelete) return;
    
    customLevels = customLevels.filter(level => level.name !== select.value);
    saveGameData();
    updateSavedLevelsList();
}

function playCustomLevel() {
    currentCustomLevel = createCustomLevel();
    level = 'custom';
    levelTime = currentCustomLevel.levelTimeMs;
    boxSpeed = currentCustomLevel.diceSpeed;
    
    lobby.style.display = 'none';
    gameContainer.style.display = 'block';
    
    // עדכון כותרת המשחק
    const gameTitle = document.getElementById('gameTitle');
    if (gameTitle) {
        gameTitle.textContent = `${translate('gameTitle')} - ${currentCustomLevel.name}`;
    }
    
    player.color = selectedSkin;
    startGame();
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
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBoxes() {
    ctx.fillStyle = '#ff3333';
    for (const box of boxes) {
        ctx.fillRect(box.x, box.y, box.width, box.height);
    }
}

function updatePlayer() {
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    // קפיצה
    if (isJumping) {
        jumpTime += 16; // בערך פריים
        const t = Math.min(jumpTime / jumpDuration, 1);
        // פרבולה
        player.y = jumpStartY - jumpHeight * 4 * t * (1 - t);
        if (t >= 1) {
            isJumping = false;
            player.y = jumpStartY;
        }
    }
}

function updateBoxes() {
    for (const box of boxes) {
        if (box.side) {
            box.x += box.speedX;
        } else {
            box.y += box.speed;
        }
    }
    // הסר קוביות שיצאו מהמסך
    for (let i = boxes.length - 1; i >= 0; i--) {
        if (boxes[i].y > canvas.height || boxes[i].x < -boxWidth || boxes[i].x > canvas.width + boxWidth) {
            boxes.splice(i, 1);
        }
    }
}

function spawnBox() {
    if (level === 1) {
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
    for (const box of boxes) {
        if (
            player.x < box.x + box.width &&
            player.x + player.width > box.x &&
            player.y < box.y + box.height &&
            player.y + player.height > box.y
        ) {
            // אם קופצים מעל קוביה מהצד – אין פגיעה
            if (box.side && isJumping && player.y + player.height < box.y + 10) continue;
            return true;
        }
    }
    return false;
}

function drawTimer(timeLeft) {
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

function gameLoop(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const timeLeft = Math.max(0, levelTime - elapsed);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawBoxes();
    drawTimer(timeLeft);
    updatePlayer();
    updateBoxes();

    // יצירת קוביות
    if (timestamp - lastBoxTime > boxInterval) {
        spawnBox();
        lastBoxTime = timestamp;
    }

    // בדיקת פגיעה
    if (checkCollision()) {
        endGame(false);
        return;
    }

    // בדיקת סיום שלב
    if (timeLeft <= 0) {
        endGame(true);
        return;
    }

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

function endGame(won) {
    gameOver = true;
    if (won) {
        // העלאת רמת השחקן כשמסיימים שלב
        if (isLoggedIn && level !== 'custom') {
            updatePlayerLevel();
        }
        
        if (level === 1) {
            messageDiv.textContent = translate('passedLevel1') + ' ' + translate('receivedPinkSkin');
            retryBtn.textContent = translate('continueToLevel2');
            retryBtn.style.display = 'inline-block';
        } else if (level === 2) {
            messageDiv.textContent = translate('passedLevel2') + ' ' + translate('receivedBlueSkin');
            retryBtn.textContent = translate('continueToLevel3');
            retryBtn.style.display = 'inline-block';
        } else if (level === 3) {
            messageDiv.textContent = translate('passedLevel3') + ' ' + translate('receivedOrangeSkin');
            retryBtn.textContent = translate('continueToLevel4');
            retryBtn.style.display = 'inline-block';
        } else if (level === 4) {
            messageDiv.textContent = translate('completedAllLevels');
            retryBtn.textContent = translate('playAgain');
            retryBtn.style.display = 'inline-block';
        } else if (level === 'custom') {
            messageDiv.textContent = translate('completedCustomLevel', currentCustomLevel.name);
            retryBtn.textContent = translate('playAgain');
            retryBtn.style.display = 'inline-block';
        }
    } else {
        if (level === 'custom') {
            messageDiv.textContent = translate('youLost');
            retryBtn.textContent = translate('tryAgain');
        } else {
            messageDiv.textContent = translate('youLost');
            retryBtn.textContent = (level === 1) ? translate('tryAgain') : 
                                (level === 2) ? translate('tryLevel2Again') : 
                                (level === 3) ? translate('tryLevel3Again') : translate('tryLevel4Again');
        }
        retryBtn.style.display = 'inline-block';
    }
}

// התחלת המשחק
function startGame(nextLevel = false) {
    boxes.length = 0;
    player.x = canvas.width / 2 - 20;
    startTime = null;
    lastBoxTime = 0;
    gameOver = false;
    messageDiv.textContent = '';
    retryBtn.style.display = 'none';
    if (nextLevel) {
        if (level === 2) {
            level = 2;
            levelTime = 60000;
        } else if (level === 3) {
            level = 3;
            levelTime = 60000;
        } else if (level === 4) {
            level = 4;
            levelTime = 60000;
        }
    }
    // Update game title
    const gameTitle = document.getElementById('gameTitle');
    if (gameTitle) {
        if (level === 'custom' && currentCustomLevel) {
            gameTitle.textContent = `${translate('gameTitle')} - ${currentCustomLevel.name}`;
        } else {
            gameTitle.textContent = `${translate('gameTitle')} - ${translate('levelPrefix')}${level}`;
        }
    }
    // Set player color to selected skin
    player.color = selectedSkin;
    // דמות תמיד על הקרקע בתחילת שלב
    player.y = canvas.height - player.height;
    isJumping = false;
    jumpTime = 0;
    requestAnimationFrame(gameLoop);
}

function showLobby() {
    lobby.style.display = 'block';
    gameContainer.style.display = 'none';
    gameOver = true; // עצור את המשחק
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
    lobby.style.display = 'none';
    gameContainer.style.display = 'block';
    // קובע את השלב לפי הבחירה בלובי
    const levelSelect = document.getElementById('levelSelect');
    level = levelSelect ? parseInt(levelSelect.value) : 1;
    // אם מתחילים משלב 2 או גבוה יותר, דואגים להוסיף את כל הסקינים הדרושים
    if (level >= 2) {
        ensureAllSkins(level);
    } else {
        // תמיד מרנדר סקינים כדי לוודא שהבחירה תקינה
        if (!ownedSkins.includes(selectedSkin)) {
            selectedSkin = ownedSkins[0];
        }
        renderSkins();
    }
    // Always start with selected skin
    player.color = selectedSkin;
    // Update game title
    const gameTitle = document.getElementById('gameTitle');
    if (gameTitle) {
        gameTitle.textContent = `${translate('gameTitle')} - ${translate('levelPrefix')}${level}`;
    }
    startGame();
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
        // לא מחליפים צבע
        startGame(level === 2 || level === 3 || level === 4); // נסה שוב את השלב הנוכחי
    }
};

startBtn.onclick = startNewGame;
backToLobbyBtn.onclick = showLobby;

// הוספת מאזינים לכפתורים של שלבים מותאמים אישית
document.getElementById('saveCustomLevelBtn').addEventListener('click', saveCustomLevel);
document.getElementById('playCustomLevelBtn').addEventListener('click', playCustomLevel);
document.getElementById('loadCustomLevelBtn').addEventListener('click', loadCustomLevel);
document.getElementById('deleteCustomLevelBtn').addEventListener('click', deleteCustomLevel);

// הגדרות - פתיחה וסגירה של חלון הגדרות
// פונקציה לעדכון פרטי המשתמש בלובי
function updatePlayerInfo() {
    if (welcomeMessage) {
        welcomeMessage.textContent = translate('welcomeMessage', playerName);
    }
    
    if (playerLevelDisplay) {
        playerLevelDisplay.textContent = playerLevel;
    }
}

// פונקציה לעדכון רמת השחקן
function updatePlayerLevel() {
    // העלה את רמת השחקן בהתאם לשלב שהושלם
    let levelBonus = 1; // ברירת מחדל: 1 נקודה
    
    // הענק בונוס נקודות בהתאם לשלב שהושלם
    if (level === 2) {
        levelBonus = 2; // בונוס גדול יותר עבור שלב 2
    } else if (level === 3) {
        levelBonus = 3; // בונוס גדול יותר עבור שלב 3
    } else if (level === 4) {
        levelBonus = 5; // בונוס גדול מאוד עבור שלב 4
    } else if (level === 'custom') {
        // בונוס עבור שלב מותאם אישית מחושב לפי הקושי
        if (currentCustomLevel) {
            const difficulty = (currentCustomLevel.topDiceCount + currentCustomLevel.sideDiceCount) * 
                               currentCustomLevel.diceSpeed / (currentCustomLevel.levelTimeMs / 1000);
            levelBonus = Math.max(1, Math.floor(difficulty));
        }
    }
    
    // הוסף את הבונוס לרמת השחקן
    playerLevel += levelBonus;
    
    // עדכן את הסטטיסטיקות
    playerStats.totalGames++;
    playerStats.highestLevel = Math.max(playerStats.highestLevel, playerLevel);
    
    // הצג הודעה על הבונוס
    const message = translate('levelUpMessage', levelBonus);
    
    // הצג הודעה קופצת עם הבונוס
    const levelUpMessage = document.createElement('div');
    levelUpMessage.className = 'level-up-message';
    levelUpMessage.textContent = message;
    document.body.appendChild(levelUpMessage);
    
    // הסר את ההודעה אחרי 3 שניות
    setTimeout(() => {
        if (levelUpMessage.parentNode) {
            levelUpMessage.parentNode.removeChild(levelUpMessage);
        }
    }, 3000);
    
    // עדכן את התצוגה
    updatePlayerInfo();
    updateProfileDisplay();
    
    // שמור את הנתונים
    saveGameData();
    
    // עדכן את הדירוג המקומי
    updateLocalLeaderboard();
}

// פונקציות דירוג
function updateLocalLeaderboard() {
    // בדוק אם השחקן כבר נמצא בדירוג
    const existingPlayerIndex = localLeaderboard.findIndex(p => p.email === playerEmail);
    
    if (existingPlayerIndex !== -1) {
        // עדכן את רמת השחקן אם הוא כבר בדירוג
        localLeaderboard[existingPlayerIndex].level = playerLevel;
    } else {
        // הוסף את השחקן לדירוג
        localLeaderboard.push({
            name: playerName,
            email: playerEmail,
            level: playerLevel
        });
    }
    
    // מיין את הדירוג לפי רמה (מהגבוה לנמוך)
    localLeaderboard.sort((a, b) => b.level - a.level);
    
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
        { name: "SuperPlayer", level: 25 },
        { name: "DiceKing", level: 22 },
        { name: "MasterDodger", level: 20 },
        { name: "ProGamer123", level: 18 },
        { name: "DiceQueen", level: 17 },
        { name: "FastReflexes", level: 15 },
        { name: "CubeEvader", level: 14 },
        { name: "GameMaster", level: 12 },
        { name: "LuckyDodge", level: 10 },
        { name: "SpeedRunner", level: 9 }
    ];
    
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
            cell.colSpan = 3;
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
                
                const nameCell = document.createElement('td');
                nameCell.textContent = player.name;
                
                const levelCell = document.createElement('td');
                levelCell.textContent = player.level;
                
                // הדגש את השחקן הנוכחי
                if (player.email === playerEmail) {
                    row.classList.add('current-player');
                    row.style.fontWeight = 'bold';
                    row.style.background = 'rgba(255, 215, 0, 0.2)';
                }
                
                row.appendChild(rankCell);
                row.appendChild(nameCell);
                row.appendChild(levelCell);
                localBody.appendChild(row);
            });
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
            cell.colSpan = 3;
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
                
                const nameCell = document.createElement('td');
                nameCell.textContent = player.name;
                
                const levelCell = document.createElement('td');
                levelCell.textContent = player.level;
                
                row.appendChild(rankCell);
                row.appendChild(nameCell);
                row.appendChild(levelCell);
                globalBody.appendChild(row);
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const settingsButton = document.getElementById('settingsButton');
    const settingsModal = document.getElementById('settingsModal');
    const closeButton = document.querySelector('.close-button');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    // הוסף מאזיני אירועים לטאבים של הדירוג
    const localTabBtn = document.getElementById('localTabBtn');
    const globalTabBtn = document.getElementById('globalTabBtn');
    const localLeaderboardDiv = document.getElementById('localLeaderboard');
    const globalLeaderboardDiv = document.getElementById('globalLeaderboard');
    
    if (localTabBtn && globalTabBtn && localLeaderboardDiv && globalLeaderboardDiv) {
        localTabBtn.addEventListener('click', function() {
            localTabBtn.classList.add('active');
            globalTabBtn.classList.remove('active');
            localLeaderboardDiv.style.display = 'block';
            globalLeaderboardDiv.style.display = 'none';
        });
        
        globalTabBtn.addEventListener('click', function() {
            globalTabBtn.classList.add('active');
            localTabBtn.classList.remove('active');
            globalLeaderboardDiv.style.display = 'block';
            localLeaderboardDiv.style.display = 'none';
        });
    }
    
    // הוסף מאזיני אירועים לטאבים של ההגדרות
    const generalTabBtn = document.getElementById('generalTabBtn');
    const profileTabBtn = document.getElementById('profileTabBtn');
    const leaderboardTabBtn = document.getElementById('leaderboardTabBtn');
    const generalSettingsTab = document.getElementById('generalSettingsTab');
    const profileSettingsTab = document.getElementById('profileSettingsTab');
    const leaderboardSettingsTab = document.getElementById('leaderboardSettingsTab');
    
    if (generalTabBtn && profileTabBtn && leaderboardTabBtn && generalSettingsTab && profileSettingsTab && leaderboardSettingsTab) {
        generalTabBtn.addEventListener('click', function() {
            generalTabBtn.classList.add('active');
            profileTabBtn.classList.remove('active');
            leaderboardTabBtn.classList.remove('active');
            generalSettingsTab.style.display = 'block';
            profileSettingsTab.style.display = 'none';
            leaderboardSettingsTab.style.display = 'none';
        });
        
        profileTabBtn.addEventListener('click', function() {
            profileTabBtn.classList.add('active');
            generalTabBtn.classList.remove('active');
            leaderboardTabBtn.classList.remove('active');
            profileSettingsTab.style.display = 'block';
            generalSettingsTab.style.display = 'none';
            leaderboardSettingsTab.style.display = 'none';
            
            // עדכן את תצוגת הפרופיל בכל פעם שנכנסים לטאב
            updateProfileDisplay();
        });
        
        leaderboardTabBtn.addEventListener('click', function() {
            leaderboardTabBtn.classList.add('active');
            generalTabBtn.classList.remove('active');
            profileTabBtn.classList.remove('active');
            leaderboardSettingsTab.style.display = 'block';
            generalSettingsTab.style.display = 'none';
            profileSettingsTab.style.display = 'none';
        });
    }
    
    // הוסף מאזיני אירועים להגדרות הדירוג
    const showLeaderboardSelect = document.getElementById('showLeaderboardSelect');
    const defaultLeaderboardSelect = document.getElementById('defaultLeaderboardSelect');
    const resetLocalLeaderboardBtn = document.getElementById('resetLocalLeaderboardBtn');
    
    if (showLeaderboardSelect) {
        showLeaderboardSelect.addEventListener('change', function() {
            leaderboardSettings.showLeaderboard = showLeaderboardSelect.value;
        });
    }
    
    if (defaultLeaderboardSelect) {
        defaultLeaderboardSelect.addEventListener('change', function() {
            leaderboardSettings.defaultView = defaultLeaderboardSelect.value;
        });
    }
    
    if (resetLocalLeaderboardBtn) {
        resetLocalLeaderboardBtn.addEventListener('click', function() {
            const confirmReset = confirm(translate('resetConfirmation'));
            if (confirmReset) {
                localLeaderboard = [];
                updateLeaderboards();
                saveGameData();
                alert('✓');
            }
        });
    }
    
    // הוסף מאזין אירועים לכפתור ההתחברות
    if (loginBtn) {
        console.log("נמצא כפתור התחברות:", loginBtn);
        loginBtn.addEventListener('click', function() {
            console.log("לחיצה על כפתור התחברות");
            const name = playerNameInput.value.trim();
            const email = playerEmailInput.value.trim();
            
            console.log("ערכי קלט:", { name, email });
            
            if (!name || !email) {
                alert(translate('loginRequired'));
                console.log("חסרים פרטי התחברות");
                return;
            }
            
            // שמור את פרטי המשתמש
            playerName = name;
            playerEmail = email;
            isLoggedIn = true;
            
            // קבע תאריך הצטרפות אם זה משתמש חדש
            joinDate = getCurrentDate();
            
            // אתחל את סטטיסטיקות השחקן
            playerStats = {
                highestLevel: 1,
                totalGames: 0,
                localRank: '--'
            };
            
            console.log("פרטי משתמש נשמרו:", { playerName, playerEmail, isLoggedIn });
            
            // הסתר את מסך ההתחברות והצג את הלובי
            loginScreen.style.display = 'none';
            lobby.style.display = 'block';
            
            console.log("הוחלפו תצוגות:", { 
                loginScreenDisplay: loginScreen.style.display,
                lobbyDisplay: lobby.style.display
            });
            
            // עדכן את הודעת הברכה ורמת השחקן
            updatePlayerInfo();
            
            // עדכן את מסך הפרופיל
            updateProfileDisplay();
            
            // הוסף את השחקן לדירוג המקומי
            updateLocalLeaderboard();
            
            // שמור את הנתונים
            saveGameData();
            
            console.log("התחברות הצליחה והנתונים נשמרו");
        });
    } else {
        console.error("כפתור התחברות לא נמצא!");
    }
    
    if (settingsButton) {
        settingsButton.addEventListener('click', function() {
            if (settingsModal) {
                settingsModal.style.display = 'block';
            }
        });
    }
    
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            if (settingsModal) {
                settingsModal.style.display = 'none';
            }
        });
    }
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            // שמירת הגדרות השפה
            const languageSelect = document.getElementById('languageSelect');
            if (languageSelect) {
                currentLanguage = languageSelect.value;
            }
            
            // שמירת הגדרות הדירוג
            const showLeaderboardSelect = document.getElementById('showLeaderboardSelect');
            if (showLeaderboardSelect) {
                leaderboardSettings.showLeaderboard = showLeaderboardSelect.value;
            }
            
            const defaultLeaderboardSelect = document.getElementById('defaultLeaderboardSelect');
            if (defaultLeaderboardSelect) {
                leaderboardSettings.defaultView = defaultLeaderboardSelect.value;
            }
            
            // עדכון השפה בדף
            updatePageLanguage();
            
            // החלת הגדרות הדירוג
            applyLeaderboardSettings();
            
            // שמירת ההגדרות
            saveGameData();
            
            // סגירת חלון ההגדרות
            if (settingsModal) {
                settingsModal.style.display = 'none';
            }
        });
    }
    
    // סגירת חלון ההגדרות בלחיצה מחוץ לחלון
    window.addEventListener('click', function(event) {
        if (settingsModal && event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
    
    // טעינת נתונים שמורים בהתחלה
    loadGameData();
    // הפעלת הצגת הסקינים בלובי
    renderSkins();
}); 

// בדיקה שמסך ההתחברות מוצג בטעינת הדף
document.addEventListener('DOMContentLoaded', function() {
    console.log("הדף נטען!");
    
    // בדוק אם יש משתמש מחובר בלוקל סטורג'
    const savedData = localStorage.getItem('diceEvasionGame');
    if (savedData) {
        const gameData = JSON.parse(savedData);
        if (gameData.isLoggedIn && gameData.playerName && gameData.playerEmail) {
            console.log("נמצא משתמש מחובר:", gameData.playerName);
            // המשתמש מחובר, הסתר את מסך ההתחברות והצג את הלובי
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('lobby').style.display = 'block';
        } else {
            console.log("אין משתמש מחובר, מציג מסך התחברות");
            // אין משתמש מחובר, הצג את מסך ההתחברות
            document.getElementById('loginScreen').style.display = 'block';
            document.getElementById('lobby').style.display = 'none';
        }
    } else {
        console.log("אין נתונים שמורים, מציג מסך התחברות");
        // אין נתונים שמורים, הצג את מסך ההתחברות
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('lobby').style.display = 'none';
    }
}); 