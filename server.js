const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

let commandQueue = [];
let lastStatus = { status: "idle", matchedName: "" };

// Discord posts here
app.post('/command', (req, res) => {
    console.log("New Command:", req.body);
    lastStatus = { status: "pending", matchedName: "" };
    commandQueue.push({ ...req.body, timestamp: Date.now() });
    if (commandQueue.length > 15) commandQueue.shift();
    res.status(200).json({ success: true });
});

// Roblox polls here
app.get('/getCommand', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (commandQueue.length > 0) {
        const cmd = commandQueue.shift();
        res.json(cmd);
    } else {
        res.json({ action: 'none' });
    }
});

app.post('/markDone', (req, res) => {
    lastStatus = { status: "Done", matchedName: req.body.matchedName || "Success" };
    res.status(200).json({ success: true });
});

app.get('/getStatus', (req, res) => {
    res.json(lastStatus);
});

app.get('/', (req, res) => res.send('Bridge Active ✅'));

// Use the PORT provided by Railway, or default to 8080
const PORT = process.env.PORT || 8080; 

// Explicitly listen on 0.0.0.0 so it's accessible externally
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is live on port ${PORT}`);
});
