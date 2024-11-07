// Import necessary Firebase modules

const firebaseConfig = {
    apiKey: "AIzaSyD32cqEuZx-ZAEnk6BCpxxneTzJvwK48dE",
    authDomain: "asistncia-b2394.firebaseapp.com",
    projectId: "asistncia-b2394",
    storageBucket: "asistncia-b2394.appspot.com",
    messagingSenderId: "523215954194",
    appId: "1:523215954194:web:039c5425f0984526a8d3cb",
    measurementId: "G-T7MDR9CEVT"
  };
  firebase.initializeApp(firebaseConfig);

  const db = firebase.firestore();
  const storage = firebase.storage();

  function validateEmail(email) {
      const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      return re.test(String(email).toLowerCase());
  }
  
  const auth = firebase.auth();

// Function to handle form submission

async function handleFormSubmit(event) {
    event.preventDefault();

    // Get form values
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const posicion = document.getElementById('posicion').value;
    const fechaNacimiento = document.getElementById('fechaNacimiento').value;
     // Convert fechaNacimiento to YYYYMMDD format
     const birthDate = new Date(fechaNacimiento);
     const birthDateString = birthDate.toISOString().split('T')[0].replace(/-/g, '');
 
     // Create EmployeeID
     const employeeID = '121068' + birthDateString;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const contactoEmergencia = document.getElementById('nombrecontactoEmergencia').value;
    const numeroContactoEmergencia = document.getElementById('numerocontactoEmergencia').value;
    const foto = document.getElementById('foto').files[0];

    // Basic Validation
    if (!nombre.trim() || !validateEmail(email) || password.length < 6 || password !== confirmPassword || !foto) {
        // Add appropriate validation messages here
        return;
    }

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);

        // Uploading the file to Firebase Storage
        const storageRef = storage.ref(`FotosEmpleados/${foto.name}`);
        await storageRef.put(foto);
        const photoURL = await storageRef.getDownloadURL();

        // Adding document to Firestore
        await db.collection("EMPLEADOS").add({
            uid: userCredential.user.uid,
            employeeID,
            nombre,
            email,
            posicion,
            fechaNacimiento,
            telefono,
            direccion,
            contactoEmergencia,
            numeroContactoEmergencia,
            photoURL
        });

        localStorage.setItem('userId', userCredential.user.uid);
        localStorage.setItem('userName', nombre);
        localStorage.setItem('userPhotoURL', photoURL);
        localStorage.setItem('userRegistered', 'true');

        alert("Usuario registrado con éxito. Tu número de empleado es: " + employeeID);

        // Reset the form
        document.getElementById('registrationForm').reset();

        // Redirect to index.html
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Error in registration process: ", error);
        alert("Error al registrar usuario: " + error.message);
    }
}
   
// Event listener for file input change
function handleFileInputChange() {
    const fileInput = document.getElementById('foto');
    fileInput.addEventListener('change', event => {
        if (event.target.files.length > 0) {
            const src = URL.createObjectURL(event.target.files[0]);
            document.getElementById('photoPlaceholder').src = src;
            // It might be a good idea to revoke the object URL after it's used
            // URL.revokeObjectURL(src);
        }
    });
}
// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registrationForm').addEventListener('submit', handleFormSubmit);
    handleFileInputChange();

    document.getElementById('photoPlaceholder').addEventListener('click', () => {
        document.getElementById('foto').click();
    });
});

