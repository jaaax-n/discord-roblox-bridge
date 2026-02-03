const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

let commandQueue = [];
let lastStatus = { status: "idle", matchedName: "" }; // Store completion status

app.post('/command', (req, res) => {
    lastStatus = { status: "pending", matchedName: "" }; // Reset on new command
    commandQueue.push({ ...req.body, timestamp: Date.now() });
    if (commandQueue.length > 10) commandQueue.shift();
    res.json({ success: true });
});

app.get('/getCommand', (req, res) => {
    if (commandQueue.length > 0) {
        res.json(commandQueue.shift());
    } else {
        res.json({ action: 'none' });
    }
});

// NEW: Roblox calls this to say "I'm done"
app.post('/markDone', (req, res) => {
    lastStatus = { status: "Done", matchedName: req.body.matchedName };
    res.json({ success: true });
});

// NEW: Discord bot checks this to see if it should say "Done"
app.get('/getStatus', (req, res) => {
    res.json(lastStatus);
});

app.get('/', (req, res) => res.send('Bridge Active ✅'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
