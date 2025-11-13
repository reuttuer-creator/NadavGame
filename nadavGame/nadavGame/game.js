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

// קבל את אלמנטי ה-DOM
document.addEventListener('DOMContentLoaded', function() {
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
    
    // ... המשך הקוד הקיים ... 