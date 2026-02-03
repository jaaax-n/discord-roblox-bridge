const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

let commandQueue = [];
let lastStatus = { status: "idle", matchedName: "" };

app.post('/command', (req, res) => {
    lastStatus = { status: "pending", matchedName: "" };
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

app.post('/markDone', (req, res) => {
    lastStatus = { status: "Done", matchedName: req.body.matchedName || "Success" };
    res.json({ success: true });
});

app.get('/getStatus', (req, res) => res.json(lastStatus));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
