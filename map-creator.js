/**
 * מערכת יצירת מפות מותאמות אישית
 * מאפשרת למשתמשים ליצור, לשמור ולשחק במפות משלהם
 */

// משתנים גלובליים למערכת יצירת המפות
window.customMaps = window.customMaps || [];
// אל תכריז שוב על currentMap כדי למנוע התנגשות עם game.js
let currentTool = 'wall';
let mapWidth = 10;
let mapHeight = 15;
let cellSize = 30;
let hasStartPosition = false;
let mapEventListenersAdded = false; // משתנה לבדיקה האם מאזיני האירועים כבר נוספו
let currentLanguage = 'en'; // ברירת מחדל לשפה האנגלית

// תרגומים למערכת יצירת המפות
const mapCreatorTranslations = {
    en: {
        createMapTitle: 'Create Custom Map',
        mapWidthLabel: 'Map Width:',
        mapHeightLabel: 'Map Height:',
        mapNameLabel: 'Map Name:',
        mapNamePlaceholder: 'My Custom Map',
        wallTool: 'Wall',
        startTool: 'Start',
        dangerTool: 'Danger',
        safeTool: 'Safe',
        eraseTool: 'Erase',
        saveMapBtn: 'Save Map',
        clearMapBtn: 'Clear',
        myCustomMapsTitle: 'My Custom Maps',
        selectCustomMap: '-- Select a custom map --',
        loadMapBtn: 'Load',
        playMapBtn: 'Play',
        deleteMapBtn: 'Delete',
        mapCreatorDescription: 'Create custom maps with walls, danger zones, and safe areas.',
        openMapCreatorBtn: 'Open Map Creator',
        mapGridSizeLabel: 'Grid Size:',
        defaultMapElementsLabel: 'Default Map Elements:',
        mapSaved: 'Map "{0}" saved!',
        confirmDeleteMap: 'Are you sure you want to delete the map "{0}"?',
        startPositionRequired: 'You must place a start position on the map!',
        smallGrid: 'Small (10x15)',
        mediumGrid: 'Medium (15x20)',
        largeGrid: 'Large (20x25)'
    },
    he: {
        createMapTitle: 'צור מפה מותאמת אישית',
        mapWidthLabel: 'רוחב המפה:',
        mapHeightLabel: 'גובה המפה:',
        mapNameLabel: 'שם המפה:',
        mapNamePlaceholder: 'המפה המותאמת שלי',
        wallTool: 'קיר',
        startTool: 'התחלה',
        dangerTool: 'סכנה',
        safeTool: 'בטוח',
        eraseTool: 'מחק',
        saveMapBtn: 'שמור מפה',
        clearMapBtn: 'נקה',
        myCustomMapsTitle: 'המפות המותאמות שלי',
        selectCustomMap: '-- בחר מפה מותאמת אישית --',
        loadMapBtn: 'טען',
        playMapBtn: 'שחק',
        deleteMapBtn: 'מחק',
        mapCreatorDescription: 'צור מפות מותאמות אישית עם קירות, אזורי סכנה ואזורים בטוחים.',
        openMapCreatorBtn: 'פתח יוצר מפות',
        mapGridSizeLabel: 'גודל רשת:',
        defaultMapElementsLabel: 'אלמנטים ברירת מחדל:',
        mapSaved: 'מפה "{0}" נשמרה!',
        confirmDeleteMap: 'האם אתה בטוח שברצונך למחוק את המפה "{0}"?',
        startPositionRequired: 'חובה למקם נקודת התחלה במפה!',
        smallGrid: 'קטן (10x15)',
        mediumGrid: 'בינוני (15x20)',
        largeGrid: 'גדול (20x25)'
    }
};

// פונקציה עזר לפורמט מחרוזות
function formatString(str, ...args) {
    return str.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}

// צור שם מפה ייחודי אם השם ריק/ברירת מחדל/קיים
function getUniqueMapName(baseName, defaultPlaceholder) {
    const nameBase = (!baseName || baseName === defaultPlaceholder) ? 'My Custom Map' : baseName;
    const existing = new Set((window.customMaps || []).map(m => m && m.name).filter(Boolean));
    if (!existing.has(nameBase)) return nameBase;
    let i = 2;
    while (existing.has(`${nameBase} (${i})`)) i++;
    return `${nameBase} (${i})`;
}

// פונקציה לתרגום טקסט של מערכת יצירת המפות
function translateMapCreator(key, ...args) {
    // נסה לקחת את השפה מהמשחק אם היא קיימת
    if (typeof window !== 'undefined' && window.currentLanguage) {
        currentLanguage = window.currentLanguage;
        console.log("translateMapCreator: שפה מ-window:", currentLanguage);
    } else if (typeof currentLanguage !== 'undefined') {
        console.log("translateMapCreator: שימוש בשפה מקומית:", currentLanguage);
    }
    
    const lang = currentLanguage || 'en';
    
    // בדוק שהמפתח קיים בשפה הנוכחית
    if (!mapCreatorTranslations[lang] || !mapCreatorTranslations[lang][key]) {
        console.log(`Missing translation for key: ${key} in language: ${lang}`);
        const text = (mapCreatorTranslations['en'] && mapCreatorTranslations['en'][key]) || key;
        if (args.length > 0) {
            return formatString(text, ...args);
        }
        return text;
    }
    
    const text = mapCreatorTranslations[lang][key];
    if (args.length > 0) {
        return formatString(text, ...args);
    }
    return text;
}

// פונקציה לעדכון תרגומי מערכת יצירת המפות
function updateMapCreatorTranslations() {
    try {
        // כותרות
        const createMapTitle = document.getElementById('createMapTitle');
        if (createMapTitle) createMapTitle.textContent = translateMapCreator('createMapTitle');
        
        const myCustomMapsTitle = document.getElementById('myCustomMapsTitle');
        if (myCustomMapsTitle) myCustomMapsTitle.textContent = translateMapCreator('myCustomMapsTitle');
        
        // תוויות
        const mapWidthLabel = document.getElementById('mapWidthLabel');
        if (mapWidthLabel) mapWidthLabel.textContent = translateMapCreator('mapWidthLabel');
        
        const mapHeightLabel = document.getElementById('mapHeightLabel');
        if (mapHeightLabel) mapHeightLabel.textContent = translateMapCreator('mapHeightLabel');
        
        const mapNameLabel = document.getElementById('mapNameLabel');
        if (mapNameLabel) mapNameLabel.textContent = translateMapCreator('mapNameLabel');
        
        // כלים
        const wallTool = document.getElementById('wallTool');
        if (wallTool) wallTool.textContent = translateMapCreator('wallTool');
        
        const startTool = document.getElementById('startTool');
        if (startTool) startTool.textContent = translateMapCreator('startTool');
        
        const dangerTool = document.getElementById('dangerTool');
        if (dangerTool) dangerTool.textContent = translateMapCreator('dangerTool');
        
        const safeTool = document.getElementById('safeTool');
        if (safeTool) safeTool.textContent = translateMapCreator('safeTool');
        
        const eraseTool = document.getElementById('eraseTool');
        if (eraseTool) eraseTool.textContent = translateMapCreator('eraseTool');
        
        // כפתורים
        const saveMapBtn = document.getElementById('saveMapBtn');
        if (saveMapBtn) saveMapBtn.textContent = translateMapCreator('saveMapBtn');
        
        const clearMapBtn = document.getElementById('clearMapBtn');
        if (clearMapBtn) clearMapBtn.textContent = translateMapCreator('clearMapBtn');
        
        const loadMapBtn = document.getElementById('loadMapBtn');
        if (loadMapBtn) loadMapBtn.textContent = translateMapCreator('loadMapBtn');
        
        const playMapBtn = document.getElementById('playMapBtn');
        if (playMapBtn) playMapBtn.textContent = translateMapCreator('playMapBtn');
        
        const deleteMapBtn = document.getElementById('deleteMapBtn');
        if (deleteMapBtn) deleteMapBtn.textContent = translateMapCreator('deleteMapBtn');
        
        // פלייסהולדר
        const mapNameInput = document.getElementById('mapName');
        if (mapNameInput) mapNameInput.placeholder = translateMapCreator('mapNamePlaceholder');
        
        // בחירת מפה
        const savedMapsOption = document.querySelector('#savedMapsSelect option');
        if (savedMapsOption) savedMapsOption.textContent = translateMapCreator('selectCustomMap');
        
        // טאב יצירת מפות בהגדרות
        const mapCreatorTabBtn = document.getElementById('mapCreatorTabBtn');
        if (mapCreatorTabBtn) mapCreatorTabBtn.textContent = translateMapCreator('mapCreatorTab');
        
        const mapCreatorDescription = document.getElementById('mapCreatorDescription');
        if (mapCreatorDescription) mapCreatorDescription.textContent = translateMapCreator('mapCreatorDescription');
        
        const openMapCreatorBtn = document.getElementById('openMapCreatorBtn');
        if (openMapCreatorBtn) openMapCreatorBtn.textContent = translateMapCreator('openMapCreatorBtn');
        
        const mapGridSizeLabel = document.getElementById('mapGridSizeLabel');
        if (mapGridSizeLabel) mapGridSizeLabel.textContent = translateMapCreator('mapGridSizeLabel');
        
        const defaultMapElementsLabel = document.getElementById('defaultMapElementsLabel');
        if (defaultMapElementsLabel) defaultMapElementsLabel.textContent = translateMapCreator('defaultMapElementsLabel');
        
        // אלמנטים במפה
        const wallPreview = document.getElementById('wallPreview');
        if (wallPreview) wallPreview.textContent = translateMapCreator('wallTool');
        
        const startPreview = document.getElementById('startPreview');
        if (startPreview) startPreview.textContent = translateMapCreator('startTool');
        
        const dangerPreview = document.getElementById('dangerPreview');
        if (dangerPreview) dangerPreview.textContent = translateMapCreator('dangerTool');
        
        const safePreview = document.getElementById('safePreview');
        if (safePreview) safePreview.textContent = translateMapCreator('safeTool');
        
        // אפשרויות גודל רשת
        const gridSizeSelect = document.getElementById('mapGridSizeSelect');
        if (gridSizeSelect) {
            const options = gridSizeSelect.options;
            if (options[0]) options[0].textContent = translateMapCreator('smallGrid');
            if (options[1]) options[1].textContent = translateMapCreator('mediumGrid');
            if (options[2]) options[2].textContent = translateMapCreator('largeGrid');
        }
    } catch (error) {
        console.error('שגיאה בעדכון תרגומי מערכת יצירת המפות:', error);
    }
}

// פונקציה ליצירת רשת המפה
function createMapGrid() {
    try {
        console.log("יוצר רשת מפה");
        
        const mapEditor = document.getElementById('mapEditor');
        if (!mapEditor) {
            console.error("לא נמצא אלמנט mapEditor");
            return;
        }
        
        // נקה את הרשת הקיימת
        mapEditor.innerHTML = '';
        
        // עדכן את גודל הרשת בהתאם למידות
        mapEditor.style.gridTemplateColumns = `repeat(${mapWidth}, ${cellSize}px)`;
        mapEditor.style.gridTemplateRows = `repeat(${mapHeight}, ${cellSize}px)`;
        mapEditor.style.width = `${mapWidth * cellSize}px`;
        mapEditor.style.height = `${mapHeight * cellSize}px`;
        mapEditor.style.display = 'grid';
        
        console.log(`יוצר רשת בגודל ${mapWidth}x${mapHeight}`);
        
        // צור את התאים
        for (let y = 0; y < mapHeight; y++) {
            for (let x = 0; x < mapWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'mapCell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // הוסף מאזין אירועים לתא
                cell.addEventListener('click', function(e) {
                    console.log(`נלחץ תא במיקום (${x}, ${y})`);
                    handleCellClick(e);
                });
                
                mapEditor.appendChild(cell);
            }
        }
        
        // איפוס משתנה מיקום התחלה
        hasStartPosition = false;
        
        console.log(`נוצרו ${mapWidth * mapHeight} תאים ברשת המפה`);
        
        // עדכן את הסגנון של מיכל העריכה
        const mapEditorContainer = document.querySelector('.mapEditorContainer');
        if (mapEditorContainer) {
            mapEditorContainer.style.display = 'flex';
            mapEditorContainer.style.justifyContent = 'center';
            mapEditorContainer.style.alignItems = 'center';
            mapEditorContainer.style.margin = '20px 0';
            mapEditorContainer.style.overflow = 'auto';
            mapEditorContainer.style.maxWidth = '100%';
            mapEditorContainer.style.maxHeight = '500px';
            mapEditorContainer.style.border = '1px solid #444';
            mapEditorContainer.style.padding = '10px';
        }
    } catch (error) {
        console.error("שגיאה ביצירת רשת המפה:", error);
    }
}

// פונקציה לטיפול בלחיצה על תא במפה
function handleCellClick(event) {
    try {
        const cell = event.target;
        if (!cell || !cell.dataset) {
            console.error("אלמנט לא תקין נלחץ:", cell);
            return;
        }
        
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        
        if (isNaN(x) || isNaN(y)) {
            console.error("נתוני מיקום לא תקינים:", cell.dataset);
            return;
        }
        
        console.log(`נלחץ תא במיקום (${x}, ${y}) עם כלי: ${currentTool}`);
        
        // בדוק שיש כלי נבחר
        if (!currentTool) {
            console.error("אין כלי נבחר");
            return;
        }
        
        // הסר את כל הקלאסים הקיימים חוץ מ-mapCell
        const wasStart = cell.classList.contains('start');
        cell.className = 'mapCell';
        
        // אם הכלי הנבחר הוא מחיקה, אין צורך להוסיף קלאס
        if (currentTool === 'erase') {
            // אם היה זה תא התחלה, עדכן את המשתנה
            if (wasStart) {
                hasStartPosition = false;
                console.log("נמחקה נקודת התחלה");
            }
            return;
        }
        
        // אם הכלי הנבחר הוא התחלה, וודא שיש רק נקודת התחלה אחת
        if (currentTool === 'start') {
            // הסר את כל נקודות ההתחלה הקיימות
            const startCells = document.querySelectorAll('.mapCell.start');
            startCells.forEach(startCell => {
                startCell.classList.remove('start');
            });
            
            // סמן את התא הנוכחי כנקודת התחלה
            cell.classList.add(currentTool);
            hasStartPosition = true;
            console.log(`נקבעה נקודת התחלה חדשה במיקום (${x}, ${y})`);
        } else {
            // הוסף את הקלאס המתאים לכלי הנבחר
            cell.classList.add(currentTool);
            console.log(`נוסף אלמנט ${currentTool} במיקום (${x}, ${y})`);
        }
        
        // הוסף אנימציה קטנה לתא שנלחץ
        cell.style.transform = 'scale(1.1)';
        setTimeout(() => {
            cell.style.transform = '';
        }, 200);
    } catch (error) {
        console.error("שגיאה בטיפול בלחיצה על תא:", error);
    }
}

// פונקציה לשמירת המפה הנוכחית
function saveMap() {
    try {
        console.log("מנסה לשמור מפה");
        
        // מצא את שדה שם המפה עם מנגנון גיבוי
        let mapNameInput = document.getElementById('mapName') || document.querySelector('#mapCreatorContainer #mapName');
        if (!mapNameInput) {
            console.warn("שדה שם המפה לא נמצא בדום, משתמש בשם ברירת מחדל");
        }
        
        const inputName = (mapNameInput && mapNameInput.value && mapNameInput.value.trim()) || '';
        const placeholderName = translateMapCreator('mapNamePlaceholder') || 'My Custom Map';
        let mapName = inputName || placeholderName;
        console.log("שם המפה:", mapName);
        
        // וודא שיש נקודת התחלה במפה
        if (!hasStartPosition) {
            console.warn("אין נקודת התחלה במפה");
            alert(translateMapCreator('startPositionRequired'));
            return;
        }
        
        // אם השם ריק/שם ברירת מחדל/כבר קיים – צור שם ייחודי כדי לא לדרוס מפות
        mapName = getUniqueMapName(mapName, placeholderName);
        if (mapNameInput) {
            mapNameInput.value = mapName;
        }

        // צור אובייקט מפה חדש
        const newMap = {
            name: mapName,
            width: mapWidth,
            height: mapHeight,
            cells: []
        };
        
        // אסוף את כל התאים במפה
        const mapCells = document.querySelectorAll('.mapCell');
        console.log(`נמצאו ${mapCells.length} תאים במפה`);
        
        let elementsCount = 0;
        mapCells.forEach(cell => {
            if (!cell.dataset || !cell.dataset.x || !cell.dataset.y) {
                console.warn("נמצא תא ללא נתוני מיקום:", cell);
                return;
            }
            
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            
            if (isNaN(x) || isNaN(y)) {
                console.warn("נתוני מיקום לא תקינים:", cell.dataset);
                return;
            }
            
            // בדוק אם יש לתא קלאס מיוחד
            if (cell.classList.contains('wall') || 
                cell.classList.contains('start') || 
                cell.classList.contains('danger') || 
                cell.classList.contains('safe')) {
                
                // קבע את סוג התא
                let type = 'empty';
                if (cell.classList.contains('wall')) type = 'wall';
                else if (cell.classList.contains('start')) type = 'start';
                else if (cell.classList.contains('danger')) type = 'danger';
                else if (cell.classList.contains('safe')) type = 'safe';
                
                // הוסף את התא למפה
                newMap.cells.push({ x, y, type });
                elementsCount++;
            }
        });
        
        console.log(`נאספו ${elementsCount} אלמנטים במפה`);
        
        if (elementsCount === 0) {
            console.warn("אין אלמנטים במפה");
            if (!confirm("המפה ריקה למעט נקודת ההתחלה. האם אתה בטוח שברצונך לשמור אותה?")) {
                return;
            }
        }
        
        // וודא שמערך המפות קיים
        if (!Array.isArray(window.customMaps)) {
            console.warn("מערך המפות לא קיים, יוצר מערך חדש");
            window.customMaps = [];
        }
        
        // הוסף מפה חדשה (שם כבר ייחודי)
        window.customMaps.push(newMap);
        console.log(`נוספה מפה חדשה: ${mapName}`);
        
        // שמור את המפות בלוקל סטורג'
        saveCustomMaps();
        
        // עדכן את רשימת המפות השמורות
        updateSavedMapsList();
        
        // הצג הודעת אישור
        alert(translateMapCreator('mapSaved', mapName));
        console.log("המפה נשמרה בהצלחה");
    } catch (error) {
        console.error("שגיאה בשמירת המפה:", error);
        alert("שגיאה בשמירת המפה: " + error.message);
    }
}

// פונקציה לניקוי המפה הנוכחית
function clearMap() {
    try {
        console.log("מנקה את המפה");
        
        // נקה את כל התאים במפה
        const mapCells = document.querySelectorAll('.mapCell');
        if (!mapCells || mapCells.length === 0) {
            console.warn("לא נמצאו תאים במפה");
            return;
        }
        
        console.log(`מנקה ${mapCells.length} תאים`);
        
        mapCells.forEach(cell => {
            cell.className = 'mapCell';
        });
        
        // איפוס משתנה מיקום התחלה
        hasStartPosition = false;
        
        console.log("המפה נוקתה בהצלחה");
    } catch (error) {
        console.error("שגיאה בניקוי המפה:", error);
    }
}

// פונקציה לשמירת המפות בלוקל סטורג'
function saveCustomMaps() {
    try {
        console.log("שומר מפות בלוקל סטורג'");
        
        if (!Array.isArray(window.customMaps)) {
            console.warn("מערך המפות לא תקין, יוצר מערך חדש");
            window.customMaps = [];
        }
        
        console.log(`שומר ${window.customMaps.length} מפות`);
        
        // הוסף את המפות לאובייקט נתוני המשחק
        const savedData = localStorage.getItem('diceEvasionGame');
        if (savedData) {
            try {
                const gameData = JSON.parse(savedData);
                // שמור מפות בשמות ייחודיים בלבד
                const uniqueByName = [];
                const seen = new Set();
                for (const m of window.customMaps) {
                    if (!m || !m.name || seen.has(m.name)) continue;
                    seen.add(m.name);
                    uniqueByName.push(m);
                }
                gameData.customMaps = uniqueByName;
                localStorage.setItem('diceEvasionGame', JSON.stringify(gameData));
                console.log("המפות נשמרו בהצלחה (עדכון נתונים קיימים)");
            } catch (parseError) {
                console.error("שגיאה בפירוס נתוני משחק:", parseError);
                
                // אם יש שגיאה בפירוס, צור אובייקט חדש
                const newGameData = {
                    customMaps: window.customMaps
                };
                localStorage.setItem('diceEvasionGame', JSON.stringify(newGameData));
                console.log("המפות נשמרו בהצלחה (יצירת נתונים חדשים בגלל שגיאת פירוס)");
            }
        } else {
            // אם אין נתונים שמורים, צור אובייקט חדש
            const gameData = {
                customMaps: window.customMaps
            };
            localStorage.setItem('diceEvasionGame', JSON.stringify(gameData));
            console.log("המפות נשמרו בהצלחה (יצירת נתונים חדשים)");
        }
    } catch (error) {
        console.error("שגיאה בשמירת המפות בלוקל סטורג':", error);
    }
}

// פונקציה לטעינת המפות מהלוקל סטורג'
function loadCustomMaps() {
    try {
        console.log("טוען מפות מהלוקל סטורג'");
        
        const savedData = localStorage.getItem('diceEvasionGame');
        if (savedData) {
            try {
                const gameData = JSON.parse(savedData);
                if (gameData.customMaps && Array.isArray(gameData.customMaps)) {
                    // הסר כפילויות בשם בעת טעינה
                    const uniqueByName = [];
                    const seen = new Set();
                    for (const m of gameData.customMaps) {
                        if (!m || !m.name || seen.has(m.name)) continue;
                        seen.add(m.name);
                        uniqueByName.push(m);
                    }
                    window.customMaps = uniqueByName;
                    console.log(`נטענו ${window.customMaps.length} מפות`);
                    updateSavedMapsList();
                } else {
                    console.warn("לא נמצאו מפות בנתונים השמורים או שהמערך לא תקין");
                    window.customMaps = [];
                }
            } catch (parseError) {
                console.error("שגיאה בפירוס נתוני משחק:", parseError);
                window.customMaps = [];
            }
        } else {
            console.log("לא נמצאו נתונים שמורים");
            window.customMaps = [];
        }
    } catch (error) {
        console.error("שגיאה בטעינת המפות מהלוקל סטורג':", error);
        window.customMaps = [];
    }
}

// פונקציה לעדכון רשימת המפות השמורות
function updateSavedMapsList() {
    try {
        console.log("מעדכן את רשימת המפות השמורות");
        
        const select = document.getElementById('savedMapsSelect');
        if (!select) {
            console.error("רשימת המפות השמורות לא נמצאה");
            return;
        }
        
        // נקה את הרשימה הקיימת, שמור על האופציה הראשונה
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // בדוק שמערך המפות קיים
        if (!Array.isArray(window.customMaps)) {
            console.warn("מערך המפות לא תקין");
            return;
        }
        
        // הוסף את המפות השמורות לרשימה (ללא כפילויות בשם)
        if (window.customMaps.length === 0) {
            console.log("אין מפות שמורות להצגה");
        } else {
            const seen = new Set();
            window.customMaps.forEach((map, index) => {
                if (!map || !map.name) {
                    console.warn(`מפה לא תקינה במיקום ${index}:`, map);
                    return;
                }
                if (seen.has(map.name)) return;
                seen.add(map.name);
                
                const option = document.createElement('option');
                option.value = map.name;
                option.textContent = map.name;
                select.appendChild(option);
            });
            console.log(`נוספו ${window.customMaps.length} מפות לרשימה`);
        }
    } catch (error) {
        console.error("שגיאה בעדכון רשימת המפות השמורות:", error);
    }
}

// פונקציה לטעינת מפה שמורה
function loadMap() {
    try {
        console.log("טוען מפה שמורה");
        
        const select = document.getElementById('savedMapsSelect');
        if (!select) {
            console.error("רשימת המפות השמורות לא נמצאה");
            return;
        }
        
        if (select.value === '') {
            console.warn("לא נבחרה מפה");
            alert("אנא בחר מפה מהרשימה");
            return;
        }
        
        console.log(`מנסה לטעון מפה: ${select.value}`);
        
        // מצא את המפה הנבחרת
        const selectedMap = window.customMaps.find(map => map.name === select.value);
        if (!selectedMap) {
            console.error(`המפה ${select.value} לא נמצאה במערך המפות`);
            alert("המפה שנבחרה לא נמצאה");
            return;
        }
        
        console.log("מפה נמצאה:", selectedMap);
        
        // עדכן את המידות של המפה
        mapWidth = selectedMap.width || 10;
        mapHeight = selectedMap.height || 15;
        
        console.log(`מעדכן מידות מפה: ${mapWidth}x${mapHeight}`);
        
        // עדכן את שדות הקלט
        const mapWidthInput = document.getElementById('mapWidth') || document.querySelector('#mapCreatorContainer #mapWidth');
        if (mapWidthInput) mapWidthInput.value = mapWidth;
        
        const mapHeightInput = document.getElementById('mapHeight') || document.querySelector('#mapCreatorContainer #mapHeight');
        if (mapHeightInput) mapHeightInput.value = mapHeight;
        
        const mapNameInput = document.getElementById('mapName');
        if (mapNameInput) mapNameInput.value = selectedMap.name;
        
        // צור מחדש את רשת המפה
        createMapGrid();
        
        // מלא את התאים לפי המפה השמורה
        hasStartPosition = false; // איפוס משתנה מיקום התחלה
        
        if (!selectedMap.cells || !Array.isArray(selectedMap.cells)) {
            console.warn("אין תאים במפה או שהמערך לא תקין");
            return;
        }
        
        console.log(`טוען ${selectedMap.cells.length} תאים מהמפה`);
        
        selectedMap.cells.forEach(cell => {
            if (!cell || !cell.x || !cell.y || !cell.type) {
                console.warn("נמצא תא לא תקין:", cell);
                return;
            }
            
            const mapCell = document.querySelector(`.mapCell[data-x="${cell.x}"][data-y="${cell.y}"]`);
            if (mapCell) {
                mapCell.classList.add(cell.type);
                if (cell.type === 'start') {
                    hasStartPosition = true;
                }
            } else {
                console.warn(`לא נמצא תא במיקום (${cell.x}, ${cell.y})`);
            }
        });
        
        // שמור את המפה הנוכחית
        window.currentMap = selectedMap;
        
        console.log("המפה נטענה בהצלחה");
    } catch (error) {
        console.error("שגיאה בטעינת מפה:", error);
        alert("שגיאה בטעינת המפה: " + error.message);
    }
}

// פונקציה למחיקת מפה שמורה
function deleteMap() {
    const select = document.getElementById('savedMapsSelect');
    if (!select || select.value === '') return;
    
    // בקש אישור מהמשתמש
    const confirmDelete = confirm(translateMapCreator('confirmDeleteMap', select.value));
    if (!confirmDelete) return;
    
    // מחק את המפה מהמערך
    window.customMaps = window.customMaps.filter(map => map.name !== select.value);
    
    // שמור את המפות המעודכנות
    saveCustomMaps();
    
    // עדכן את רשימת המפות השמורות
    updateSavedMapsList();
}

// פונקציה לשחק במפה שמורה
function playMap() {
    const select = document.getElementById('savedMapsSelect');
    if (!select || select.value === '') return;
    
    // מצא את המפה הנבחרת
    const selectedMap = window.customMaps.find(map => map.name === select.value);
    if (!selectedMap) return;
    
    // שמור את המפה הנוכחית
    window.currentMap = selectedMap;
    
    // הסתר את הלובי והצג את המשחק
    document.getElementById('lobby').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    
    // עדכן את כותרת המשחק
    document.getElementById('gameTitle').textContent = `${translate('gameTitle')} - ${selectedMap.name}`;
    
    // התחל את המשחק עם המפה המותאמת אישית
    startGameWithMap(selectedMap);
}

// קמפיין: משחק רצף מפות
function startMapsCampaign() {
    try {
        const maps = Array.isArray(window.customMaps) ? window.customMaps.slice(0, 10) : [];
        if (maps.length === 0) {
            alert('No maps available for campaign. Save some maps first.');
            return;
        }
        // סדר קבוע: לפי שם
        maps.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        let campaignIndex = 0;
        window.isMapsCampaignActive = true;

        function playNext() {
            const map = maps[campaignIndex];
            if (!map) {
                // campaign finished
                window.isMapsCampaignActive = false;
                if (window.endGame && originalEndGame) {
                    // השבת פונקציית endGame המקורית
                    window.endGame = originalEndGame;
                }
                showLobby();
                return;
            }
            // עדכון כותרת
            document.getElementById('gameTitle').textContent = `${translate('gameTitle')} - Campaign ${campaignIndex + 1}/${maps.length}: ${map.name}`;
            // התחלת משחק עם מפה
            document.getElementById('lobby').style.display = 'none';
            document.getElementById('gameContainer').style.display = 'block';
            startGameWithMap(map);
        }

        // האזן לסיום שלב כדי להתקדם
        const originalEndGame = window.endGame || endGame;
        window.endGame = function(won) {
            try {
                originalEndGame(won);
            } catch (e) {
                console.warn('originalEndGame threw:', e);
            }
            if (level === 'map' && window.isMapsCampaignActive) {
                // הסתר הודעות ונסיון-שוב בין מפות בקמפיין
                try {
                    const retry = document.getElementById('retryBtn');
                    if (retry) retry.style.display = 'none';
                    const msg = document.getElementById('message');
                    if (msg) msg.textContent = '';
                } catch (_) {}
                // עבור למפה הבאה בכל מקרה, ללא תלות בניצחון/הפסד
                campaignIndex += 1;
                setTimeout(playNext, 200);
            }
        };

        playNext();
    } catch (e) {
        console.error('שגיאה בהפעלת קמפיין מפות:', e);
    }
}

// פונקציה להתחלת משחק עם מפה מותאמת אישית
function startGameWithMap(map) {
    // שמור את המפה הנוכחית
    window.currentMap = map;
    
    // הגדר את המשחק כמשחק מפה מותאמת אישית
    level = 'map';
    // זמן שלב ברירת מחדל למפה: 15 שניות
    if (!levelTime || typeof levelTime !== 'number' || levelTime < 1000) {
        levelTime = 15000;
    }
    
    // אפס את המשחק
    boxes.length = 0;
    startTime = null;
    lastBoxTime = 0;
    gameOver = false;
    messageDiv.textContent = '';
    retryBtn.style.display = 'none';
    
    // התאם את גודל השחקן לתאי המפה
    const cellWidth = canvas.width / map.width;
    const cellHeight = canvas.height / map.height;
    player.width = Math.floor(cellWidth);
    player.height = Math.floor(cellHeight);
    if (typeof verticalVelocity !== 'undefined') verticalVelocity = 0;

    // מצא את נקודת ההתחלה במפה
    const startCell = map.cells.find(cell => cell.type === 'start');
    if (startCell) {
        player.x = startCell.x * cellWidth;
        player.y = startCell.y * cellHeight;
    } else {
        // אם אין נקודת התחלה, השתמש במיקום ברירת המחדל
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - player.height;
    }
    
    // הגדר את צבע השחקן לסקין הנבחר
    player.color = selectedSkin;
    
    // ציור המפה יתבצע ישירות על הקנבס בכל פריים
    // איפוס טיימרי סכנה של מפה
    if (typeof lastMapHazardTime !== 'undefined') {
        lastMapHazardTime = 0;
    }
    // נעל גלילה בזמן משחק
    if (document && document.body && document.body.classList) {
        document.body.classList.add('no-scroll');
    }
    // התחל את לולאת המשחק
    requestAnimationFrame(gameLoop);
}

// פונקציה ליצירת אלמנטי המפה על הקנבס
function createMapElements(map) {
    // לא צריך יותר DOM חופף - הציור נעשה על הקנבס בכל פריים
}

// פונקציה לעדכון בדיקת התנגשויות עם אלמנטי המפה
function checkMapCollision() {
    if (!window.currentMap) return false;

    const cellWidth = canvas.width / window.currentMap.width;
    const cellHeight = canvas.height / window.currentMap.height;

    const playerCellX = Math.floor((player.x + player.width / 2) / cellWidth);
    const playerCellY = Math.floor((player.y + player.height / 2) / cellHeight);

    // קיר חוסם
    const wallCell = window.currentMap.cells.find(c => c.type === 'wall' && c.x === playerCellX && c.y === playerCellY);
    if (wallCell) return true;

    // אזור סכנה = פגיעה
    const dangerCell = window.currentMap.cells.find(c => c.type === 'danger' && c.x === playerCellX && c.y === playerCellY);
    if (dangerCell) return true;

    // אזור בטוח = אין פגיעה
    return false;
}

// פונקציה להוספת מאזיני אירועים למערכת יצירת המפות
function initMapCreator() {
    try {
        console.log("מאתחל את מערכת יצירת המפות");
        
        // נסה לקחת את השפה מהמשחק אם היא קיימת
        if (typeof window !== 'undefined' && window.currentLanguage) {
            currentLanguage = window.currentLanguage;
            console.log("נטענה שפה מהמשחק:", currentLanguage);
        }
        
        // בדוק אם מאזיני האירועים כבר נוספו
        if (mapEventListenersAdded) {
            console.log("מאזיני האירועים כבר נוספו, רק מעדכן את רשת המפה");
            createMapGrid();
            updateSavedMapsList();
            return;
        }
        
        // סמן שמאזיני האירועים נוספו
        mapEventListenersAdded = true;
        
        // טען את המפות השמורות
        loadCustomMaps();
        
        // הוסף מאזיני אירועים לכפתורי הכלים
        const mapTools = document.querySelectorAll('#mapCreatorContainer .mapTool, .mapTool');
        console.log("נמצאו כפתורי כלים:", mapTools.length);
        
        mapTools.forEach(tool => {
            tool.addEventListener('click', function() {
                console.log("נלחץ כלי:", tool.dataset.tool);
                
                // הסר את הבחירה מכל הכלים
                mapTools.forEach(t => t.classList.remove('selected'));
                
                // סמן את הכלי הנבחר
                tool.classList.add('selected');
                
                // עדכן את הכלי הנוכחי
                currentTool = tool.dataset.tool;
            });
        });
        
        // הוסף מאזיני אירועים לכפתורי המפה
        const saveMapBtn = document.getElementById('saveMapBtn') || document.querySelector('#mapCreatorContainer #saveMapBtn');
        if (saveMapBtn) {
            saveMapBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("נלחץ כפתור שמירת מפה");
                try {
                    saveMap();
                } catch (error) {
                    console.error("שגיאה בשמירת המפה:", error);
                    alert("שגיאה בשמירת המפה: " + error.message);
                }
            });
            console.log("נוסף מאזין לכפתור שמירת מפה");
        } else {
            console.error("כפתור שמירת מפה לא נמצא");
        }
        
        const clearMapBtn = document.getElementById('clearMapBtn') || document.querySelector('#mapCreatorContainer #clearMapBtn');
        if (clearMapBtn) {
            clearMapBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("נלחץ כפתור ניקוי מפה");
                clearMap();
            });
            console.log("נוסף מאזין לכפתור ניקוי מפה");
        } else {
            console.error("כפתור ניקוי מפה לא נמצא");
        }
        
        const loadMapBtn = document.getElementById('loadMapBtn') || document.querySelector('#savedMapsContainer #loadMapBtn');
        if (loadMapBtn) {
            loadMapBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("נלחץ כפתור טעינת מפה");
                loadMap();
            });
            console.log("נוסף מאזין לכפתור טעינת מפה");
        } else {
            console.error("כפתור טעינת מפה לא נמצא");
        }
        
        const deleteMapBtn = document.getElementById('deleteMapBtn') || document.querySelector('#savedMapsContainer #deleteMapBtn');
        if (deleteMapBtn) {
            deleteMapBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("נלחץ כפתור מחיקת מפה");
                deleteMap();
            });
            console.log("נוסף מאזין לכפתור מחיקת מפה");
        } else {
            console.error("כפתור מחיקת מפה לא נמצא");
        }
        
        const playMapBtn = document.getElementById('playMapBtn') || document.querySelector('#savedMapsContainer #playMapBtn');
        if (playMapBtn) {
            playMapBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("נלחץ כפתור משחק במפה");
                playMap();
            });
            console.log("נוסף מאזין לכפתור משחק במפה");
        } else {
            console.error("כפתור משחק במפה לא נמצא");
        }

        // הוסף מאזין לכפתור קמפיין מפות
        const playCampaignBtn = document.getElementById('playCampaignBtn') || document.querySelector('#savedMapsContainer #playCampaignBtn');
        if (playCampaignBtn) {
            playCampaignBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("נלחץ כפתור קמפיין מפות");
                startMapsCampaign();
            });
            console.log("נוסף מאזין לכפתור קמפיין מפות");
        } else {
            console.error("כפתור קמפיין מפות לא נמצא");
        }
        
        // הוסף מאזיני אירועים לשינוי גודל המפה
        const mapWidthInput = document.getElementById('mapWidth') || document.querySelector('#mapCreatorContainer #mapWidth');
        if (mapWidthInput) {
            mapWidthInput.addEventListener('change', function() {
                mapWidth = parseInt(this.value) || 10;
                mapWidth = Math.min(20, Math.max(5, mapWidth));
                this.value = mapWidth;
                createMapGrid();
                console.log("שונה רוחב המפה ל:", mapWidth);
            });
        } else {
            console.error("שדה רוחב המפה לא נמצא");
        }
        
        const mapHeightInput = document.getElementById('mapHeight') || document.querySelector('#mapCreatorContainer #mapHeight');
        if (mapHeightInput) {
            mapHeightInput.addEventListener('change', function() {
                mapHeight = parseInt(this.value) || 15;
                mapHeight = Math.min(20, Math.max(5, mapHeight));
                this.value = mapHeight;
                createMapGrid();
                console.log("שונה גובה המפה ל:", mapHeight);
            });
        } else {
            console.error("שדה גובה המפה לא נמצא");
        }
        
        // הוסף מאזין אירועים לכפתור פתיחת יוצר המפות
        setTimeout(function() {
            const openMapCreatorBtn = document.getElementById('openMapCreatorBtn');
            if (openMapCreatorBtn) {
                openMapCreatorBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log("נלחץ כפתור פתיחת יוצר המפות");
                    
                    // סגור את חלון ההגדרות
                    const settingsModal = document.getElementById('settingsModal');
                    if (settingsModal) {
                        settingsModal.style.display = 'none';
                        console.log("חלון הגדרות נסגר");
                    }
                    
                    // הצג את הלובי אם הוא לא מוצג
                    const lobby = document.getElementById('lobby');
                    if (lobby && lobby.style.display === 'none') {
                        lobby.style.display = 'block';
                        console.log("הלובי הוצג");
                    }
                    
                    // גלול למיכל יצירת המפות
                    const mapCreatorContainer = document.getElementById('mapCreatorContainer');
                    if (mapCreatorContainer) {
                        mapCreatorContainer.scrollIntoView({ behavior: 'smooth' });
                        console.log("גלילה למיכל יצירת המפות");
                        
                        // עדכן את רשת המפה
                        setTimeout(function() {
                            createMapGrid();
                            console.log("רשת המפה עודכנה");
                        }, 100);
                    } else {
                        console.error("מיכל יצירת המפות לא נמצא");
                    }
                });
                console.log("נוסף מאזין לכפתור פתיחת יוצר המפות");
            } else {
                console.error("כפתור פתיחת יוצר המפות לא נמצא");
            }
        }, 500);
        
        // הוסף מאזין אירועים לבחירת גודל רשת
        setTimeout(function() {
            const mapGridSizeSelect = document.getElementById('mapGridSizeSelect');
            if (mapGridSizeSelect) {
                mapGridSizeSelect.addEventListener('change', function() {
                    const size = this.value;
                    console.log("נבחר גודל רשת:", size);
                    
                    if (size === 'small') {
                        mapWidth = 10;
                        mapHeight = 15;
                    } else if (size === 'medium') {
                        mapWidth = 15;
                        mapHeight = 20;
                    } else if (size === 'large') {
                        mapWidth = 20;
                        mapHeight = 25;
                    }
                    
                    // עדכן את שדות הקלט
                    const mapWidthInput = document.getElementById('mapWidth');
                    if (mapWidthInput) mapWidthInput.value = mapWidth;
                    
                    const mapHeightInput = document.getElementById('mapHeight');
                    if (mapHeightInput) mapHeightInput.value = mapHeight;
                    
                    // צור מחדש את רשת המפה
                    createMapGrid();
                });
                console.log("נוסף מאזין לבחירת גודל רשת");
            } else {
                console.error("בחירת גודל רשת לא נמצאה");
            }
        }, 500);
        
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
                
                // אם זה טאב יוצר המפות, עדכן את רשת המפה
                if (tab.dataset.tab === 'mapCreatorTab') {
                    setTimeout(function() {
                        createMapGrid();
                        console.log("רשת המפה עודכנה בעקבות מעבר לטאב יוצר המפות");
                    }, 100);
                }
            });
        });
        console.log("נוספו מאזינים לטאבים בהגדרות");
        
        // צור את רשת המפה
        createMapGrid();
        
        // עדכן את התרגומים
        updateMapCreatorTranslations();
        
        // עדכן את רשימת המפות השמורות
        updateSavedMapsList();
        
        console.log("מערכת יצירת המפות אותחלה בהצלחה");
    } catch (error) {
        console.error("שגיאה באתחול מערכת יצירת המפות:", error);
    }
}

// הוספת מאזיני אירועים למערכת יצירת המפות
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded נטען - מאתחל את מערכת יצירת המפות");
    
    // מאתחל את מערכת יצירת המפות
    setTimeout(initMapCreator, 500); // תן לדף להיטען לגמרי
});

// עדכון פונקציית checkCollision המקורית לתמיכה במפות מותאמות אישית
const originalCheckCollision = window.checkCollision;
window.checkCollision = function() {
    // קודם בדוק התנגשויות עם קוביות
    const boxCollision = originalCheckCollision();
    if (boxCollision) return true;
    
    // אם יש מפה פעילה, בדוק גם התנגשויות עם אלמנטי המפה
    if (level === 'map' && window.currentMap) {
        return checkMapCollision();
    }
    
    return false;
};

// עדכון פונקציית startGameWithMap לתמיכה במפות מותאמות אישית
window.startGameWithMap = startGameWithMap;