document.addEventListener('DOMContentLoaded', () => {
    checkTimeAndShowPopup();
    setInterval(checkTimeAndShowPopup, 60000); // Check every minute

    document.getElementById('dismissBtn').addEventListener('click', () => {
        logDismissalTime();
        $('#attendanceModal').modal('hide');
        if (new Date().getHours() < 12) {
            window.electronAPI.minimizeApp(); // Minimize app in the morning
        }
    });
});


function checkTimeAndShowPopup() {
    const now = new Date();
    if (isWeekday(now)) {
        // Morning popup for every weekday
        if (now.getHours() === 9 && now.getMinutes() === 30) {
            displayPopup("Hora de ponerse las pilas");
        } else {
            // Evening popup for Monday to Thursday
            if (now.getDay() !== 5 && now.getHours() === 17 && now.getMinutes() === 0) {
                displayPopup("Hora de ir tirando pa' casa");
            } 
            // Special Friday evening popup
            else if (now.getDay() === 5 && now.getHours() === 14 && now.getMinutes() === 0) {
                displayFridayEveningPopup();
            }
        }
    }
}

function updatePopupContent(greeting, quote, isEntry) {
    const popupContentDiv = document.getElementById('popupContent');
    // Clear previous content
    popupContentDiv.innerHTML = `
        <div class="popup-section greeting-section">${greeting}</div>
        <div class="popup-section quote-section">
            ${quote.Texto ? `<i>"${quote.Texto}"</i><br>` : ""}
            ${quote.Autor ? `<strong>- ${quote.Autor}</strong><br>` : ""}
            ${quote.Observacion ? `<em>${quote.Observacion}</em>` : ""}
        </div>`;

    const okButton = document.createElement('button');
    okButton.className = "ok-button";
    okButton.innerText = 'OK';
    okButton.onclick = () => {
        logDismissalTime(isEntry);
        document.getElementById('popupContainer').style.display = 'none';
        displayDismissMessage(isEntry);
    };
    // Append OK button outside of innerHTML to avoid innerHTML reset
    popupContentDiv.appendChild(okButton);
}


function displayMorningPopup() {
    const userName = localStorage.getItem('userName') || 'Usuario';
    fetchRandomQuote().then(quote => {
        const greeting = `Buenos días <b>${userName}</b><br>Hora de comenzar el trabajo`;
        updatePopupContent(greeting, quote, true);
        playPopupSound();
        showPopup();
    });
}

function displayEveningPopup() {
    const userName = localStorage.getItem('userName') || 'Usuario';
    fetchRandomQuote().then(quote => {
        const greeting = `Buenas noches <b>${userName}</b><br>Hora de ir tirando pa' casa`;
        updatePopupContent(greeting, quote, false);
        playPopupSound();
        showPopup();
    });
}

function displayFridayEveningPopup() {
    const userName = localStorage.getItem('userName') || 'Usuario';
    fetchRandomQuote().then(quote => {
        const greeting = `Feliz fin de semana <b>${userName}</b><br>Nos vemos la próxima semana`;
        updatePopupContent(greeting, quote, false);
        playPopupSound();
        showPopup();
    });
}
function playPopupSound() {
    const audio = document.getElementById('popupAudio');
    if (audio) audio.play();
}

function showPopup() {
    const popupContainerDiv = document.getElementById('popupContainer');
    if (popupContainerDiv) popupContainerDiv.style.display = 'block';
}


function displayFridayEveningPopup() {
    const userName = localStorage.getItem('userName') || 'Usuario';
    const greeting = `Feliz fin de semana <b>${userName}</b><br>Nos vemos la próxima semana.`;

    // Fetch quote, play sound, and show popup
    fetchRandomQuote().then(quote => {
        updatePopupContent(greeting, quote);
        playPopupSound();
        showPopup();
    });
}

function displayDismissMessage(isEntry) {
    let message = "";
    if (isEntry) {
        message = "Gracias. Que tengas buena jornada";
    } else {
        // Use Date.getDay() to check if it's Friday
        const dayOfWeek = new Date().getDay();
        if (dayOfWeek === 5) { // Friday
            message = "Gracias. Feliz fin de semana!";
        } else {
            message = "Buenas Noches. Que descanses.";
        }
    }
    // Display message in a specific element or as an alert
    alert(message);
}


function logDismissalTime(isEntry) {
    const currentTime = new Date();
    const userName = localStorage.getItem('userName') || 'defaultUserName';
    const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
    const monthName = monthNames[currentTime.getMonth()];
    const year = currentTime.getFullYear();
    const dateId = currentTime.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Correcting the path to include a collection name before the month-year document
    const userLogsPath = `ASISTENCIA/${userName}/LOGS/${year}-${monthName}`;

    // Reference to the specific month document within the user's logs
    const docRef = firebase.firestore().doc(userLogsPath);

    // Determine field name and create log data
    const timeField = isEntry ? 'entryTime' : 'exitTime';
    const logData = { [dateId]: { [timeField]: currentTime.toLocaleTimeString() } };

    // Log the time
    docRef.set({ [dateId]: { ...logData[dateId] } }, { merge: true })
    .then(() => {
        console.log("Time logged successfully.");
        document.getElementById('popupContainer').style.display = 'none';
    })
    .catch(error => console.error("Error logging time: ", error));
}

// Function to fetch a random quote from Firestore
async function fetchRandomQuote() {
    try {
        const randomNum = Math.random();
        const citasCollection = firebase.firestore().collection('CITAS');
        let query = citasCollection.where('random', '>=', randomNum).orderBy('random').limit(1);

        let snapshot = await query.get();
        // If the query does not return a document, it means the generated randomNum is greater than any 'random' field value
        // In this case, query again with a random number less than the generated randomNum
        if (snapshot.empty) {
            query = citasCollection.where('random', '<', randomNum).orderBy('random', 'desc').limit(1);
            snapshot = await query.get();
        }

        // Handle the case where the collection might be empty or another error occurs
        if (snapshot.empty) {
            return { Texto: "No quote available", Autor: "", Observacion: "" };
        }

        const doc = snapshot.docs[0];
        return doc.data();
    } catch (error) {
        console.error("Error fetching quote: ", error);
        return { Texto: "No quote available", Autor: "", Observacion: "" };
    }
}

function getTimeUntil(targetHour, targetMinute) {
    const now = new Date();
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, 0, 0);

    let delay = targetTime - now;
    if (delay < 0) {
        // If the time has already passed today, schedule for next day
        delay += 24 * 60 * 60 * 1000;
    }
    return delay;
}


function isWeekday(date) {
    const dayOfWeek = date.getDay();
    return dayOfWeek > 0 && dayOfWeek < 6; // 0 = Sunday, 6 = Saturday
  }

  function testMorningPopup() {
    const now = new Date();
    console.log("Current time (morning test):", now.toLocaleTimeString());

    // Set target time to 00:13 AM today
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 58, 0);
    console.log("Target time for morning popup:", targetTime.toLocaleTimeString());

    let delay = targetTime - now;
    if (delay < 0) delay += 24 * 60 * 60 * 1000; // Adjust for next day if time has already passed

    console.log("Delay set for morning popup:", delay, "milliseconds");
    setTimeout(() => {
        console.log("Displaying morning popup at:", new Date().toLocaleTimeString());
        displayMorningPopup("Hora de Comenzar el Trabajo");
    }, delay);
}

function testEveningPopup() {
    const now = new Date();
    console.log("Current time (evening test):", now.toLocaleTimeString());

    // Set target time to 00:12 AM today
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 59, 0);
    console.log("Target time for evening popup:", targetTime.toLocaleTimeString());

    let delay = targetTime - now;
    if (delay < 0) delay += 24 * 60 * 60 * 1000; // Adjust for next day if time has already passed

    console.log("Delay set for evening popup:", delay, "milliseconds");
    setTimeout(() => {
        console.log("Displaying evening popup at:", new Date().toLocaleTimeString());
        displayEveningPopup("Hora de Salir");
    }, delay);
}



