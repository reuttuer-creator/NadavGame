# Dice Evasion Game

A fun browser-based game where you need to dodge falling dice and jump over side-coming dice to pass levels!

## How to Play Locally

1. Open `index.html` in your browser
2. Enjoy the game!

## How to Share Your Game Online

### Option 1: GitHub Pages (הכי קל)

1. צור חשבון ב-GitHub (אם אין לך)
2. צור מאגר (repository) חדש
3. העלה את כל קבצי המשחק למאגר
4. הפעל את GitHub Pages דרך הגדרות המאגר
5. המשחק יהיה זמין בכתובת `https://[username].github.io/[repository-name]`

### Option 2: Netlify Drop (פשוט מאוד)

1. גש לאתר [Netlify Drop](https://app.netlify.com/drop)
2. גרור את תיקיית המשחק (עם כל הקבצים) לאזור המסומן באתר
3. המשחק יועלה אוטומטית ותקבל קישור לשיתוף

### Option 3: Python HTTP Server (ללא התקנות נוספות)

אם יש לך Python מותקן במחשב:

1. פתח חלון Terminal/Command Prompt בתיקיית המשחק
2. הרץ את הפקודה:
   ```
   # אם יש לך Python 3
   python -m http.server 8000
   
   # אם יש לך Python 2
   python -m SimpleHTTPServer 8000
   ```
3. המשחק יהיה זמין בכתובת `http://localhost:8000`
4. חברים באותה רשת מקומית יכולים לגשת דרך כתובת ה-IP המקומית שלך: `http://[your-local-ip]:8000`

### Option 4: Web Server for Chrome (הרחבה לדפדפן)

1. התקן את ההרחבה [Web Server for Chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb)
2. פתח את ההרחבה ובחר את תיקיית המשחק
3. לחץ על הכתובת המוצגת כדי לגשת למשחק
4. חברים באותה רשת מקומית יכולים לגשת דרך כתובת ה-IP המקומית שלך

## How to Share Your Game Online with NGROK (אפשרות מתקדמת)

To let others play your game over the internet, follow these steps:

### Prerequisites

- Make sure you have [Node.js](https://nodejs.org/) installed on your computer

### Steps

1. Open a terminal/command prompt in the game folder
2. Run the server:
   ```
   node server.js
   ```
3. You should see: `Server running at http://localhost:3000/`
4. In a new terminal window, install and run NGROK:
   ```
   npx ngrok http 3000
   ```
5. NGROK will display a URL (looks like `https://abc123.ngrok.io`)
6. Share this URL with your friends - they can now play your game!

### Game Controls

- **Left/Right Arrow Keys**: Move left and right
- **Space**: Jump (to avoid dice coming from the sides)

### Features

- 4 built-in levels with increasing difficulty
- Custom skin system - earn new skins by completing levels
- Create your own custom levels with different settings
- Save and load your custom levels
- Share your game with friends online

Enjoy playing and sharing your game! 