const admin = require('firebase-admin');
const fs = require('fs');
const readline = require('readline');

// Initialize Firebase Admin
const serviceAccount = require('/Users/elebi/Documents/AsisTNci@/asistncia-b2394-firebase-adminsdk-qwxpw-2039fc00b7.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Function to parse a single quote line
function parseQuote(line) {
  // Split the line into parts using regular expressions to match the patterns
  const textPart = line.match(/^[^\(]+/)?.[0].trim(); // Matches text before the first '('
  const authorPart = line.match(/\(([^)]+)\)/)?.[1].trim(); // Matches text inside '()'
  const observationPart = line.match(/\[([^\]]+)\]/)?.[1].trim(); // Matches text inside '[]'

  return {
      Texto: textPart || "Unknown Text",
      Autor: authorPart || "Unknown Author",
      Observacion: observationPart || "No Observation"
  };
}

  
  // Function to read and upload quotes
  function uploadQuotes(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n'); // Adjust based on your file's newline character
  
    lines.forEach(async (line, index) => {
      if (line.trim()) {
        try {
          const quote = parseQuote(line);
          console.log(`Uploading quote [${index + 1}]: `, quote); // Log the quote being uploaded
          await db.collection('CITAS').add(quote);
          console.log(`Successfully uploaded quote [${index + 1}]`); // Log successful upload
        } catch (error) {
          console.error(`Error uploading quote on line ${index + 1}: `, error);
        }
      }
    });
  
    console.log('Upload complete');
  }

// Provide the path to your quotes file
const filePath = '/Users/elebi/Documents/AsisTNci@/Citas.txt';
uploadQuotes(filePath);
