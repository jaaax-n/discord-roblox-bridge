const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Internal Storage
let commandQueue = [];
let lastStatus = { status: "idle", matchedName: "" };

// 1. HEALTH CHECK (Prevents Railway from stopping the container)
app.get('/', (req, res) => {
    res.status(200).send('Bridge Active and Healthy ✅');
});

// 2. DISCORD ENDPOINT (Bot posts commands here)
app.post('/command', (req, res) => {
    console.log("📥 Command received from Discord:", req.body);
    
    // Reset status for the new command
    lastStatus = { status: "pending", matchedName: "" };
    
    // Add command to queue
    commandQueue.push({
        ...req.body,
        timestamp: Date.now()
    });

    // Prevent memory leaks by keeping queue small
    if (commandQueue.length > 15) {
        commandQueue.shift();
    }

    res.status(200).json({ success: true });
});

// 3. ROBLOX ENDPOINT (Game polls this to get the next command)
app.get('/getCommand', (req, res) => {
    // Explicitly set JSON header for Roblox HttpService
    res.setHeader('Content-Type', 'application/json');

    if (commandQueue.length > 0) {
        const command = commandQueue.shift();
        console.log("📤 Sending command to Roblox:", command.action);
        res.status(200).json(command);
    } else {
        // Tell Roblox there is nothing to do
        res.status(200).json({ action: 'none' });
    }
});

// 4. CONFIRMATION ENDPOINT (Roblox calls this when finished)
app.post('/markDone', (req, res) => {
    console.log("✅ Roblox confirmed execution:", req.body.matchedName);
    lastStatus = { 
        status: "Done", 
        matchedName: req.body.matchedName || "Success" 
    };
    res.status(200).json({ success: true });
});

// 5. STATUS ENDPOINT (Discord bot checks this to update message)
app.get('/getStatus', (req, res) => {
    res.status(200).json(lastStatus);
});

// 6. DYNAMIC PORT BINDING (Fixes the SIGTERM/Stopping issue)
const PORT = process.env.PORT || 8080; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    🚀 Server is live!
    📡 Internal Port: ${PORT}
    🔗 Endpoint: /getCommand
    `);
});
