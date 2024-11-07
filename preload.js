const path = require('path');
const firebaseFunctions = require(path.join(__dirname, 'firebaseFunctions.js'));


contextBridge.exposeInMainWorld('electronFirebase', {
    async createUser(email, password) {
        return await firebaseFunctions.createUser(email, password);
    },
    async signIn(email, password) {
        return await firebaseFunctions.signIn(email, password);
    },
    async uploadFile(filePath, file) {
        return await firebaseFunctions.uploadFile(filePath, file);
    },
    bringToFront: () => ipcRenderer.send('bringToFront'),
    // If you plan to expose getFirestore directly, ensure you implement it properly in firebaseFunctions.js
});
