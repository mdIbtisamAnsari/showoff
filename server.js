const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DOWNLOAD_LIMIT = 50;
const COUNT_FILE = 'download-count.txt';
const FEEDBACK_FILE = 'feedback.txt';

app.use(express.json());

function getCount() {
    if (!fs.existsSync(COUNT_FILE)) {
        fs.writeFileSync(COUNT_FILE, '0');
        return 0;
    }
    return parseInt(fs.readFileSync(COUNT_FILE, 'utf8'));
}

function incrementCount() {
    const count = getCount() + 1;
    fs.writeFileSync(COUNT_FILE, count.toString());
    return count;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/icon', (req, res) => {
    res.sendFile(path.join(__dirname, 'icon16.png'));
});

app.get('/count', (req, res) => {
    res.json({ count: getCount() });
});

app.get('/download', (req, res) => {
    const count = getCount();
    if (count >= DOWNLOAD_LIMIT) {
        return res.json({ success: false, message: 'Download limit reached' });
    }
    incrementCount();
    res.json({ success: true });
});

app.get('/download-file', (req, res) => {
    const extensionPath = path.join(__dirname, 'extension.zip');
    if (!fs.existsSync(extensionPath)) {
        return res.status(404).send('Extension file not found. Please add extension.zip to the project folder.');
    }
    res.download(extensionPath);
});

app.post('/feedback', (req, res) => {
    const { feedback } = req.body;
    if (!feedback) {
        return res.json({ success: false });
    }
    
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${feedback}\n\n`;
    
    fs.appendFileSync(FEEDBACK_FILE, entry);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
