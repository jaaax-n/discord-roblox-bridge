const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

let commandQueue = [];

// Discord bot posts commands here
app.post('/command', (req, res) => {
    commandQueue.push({
        ...req.body,
        timestamp: Date.now()
    });
    
    // Keep only last 10 commands
    if (commandQueue.length > 10) {
        commandQueue.shift();
    }
    
    console.log('Command received:', req.body);
    res.json({ success: true });
});

// Roblox game polls this endpoint
app.get('/getCommand', (req, res) => {
    if (commandQueue.length > 0) {
        const command = commandQueue.shift();
        res.json(command);
    } else {
        res.json({ action: 'none' });
    }
});

// Health check
app.get('/', (req, res) => {
    res.send('Discord-Roblox Bridge Active ✅');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});