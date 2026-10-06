const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DB = path.join(__dirname, "data.json");

// Ensure data.json database file exists
if (!fs.existsSync(DB)) {
    fs.writeFileSync(DB, JSON.stringify({
        counter: 0,
        max: 10
    }, null, 2));
}

// Helper to read DB
function readData() {
    try {
        return JSON.parse(fs.readFileSync(DB, "utf8"));
    } catch (e) {
        return { counter: 0, max: 10 };
    }
}

// Helper to write DB
function writeData(data) {
    fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Route: Get current parking status
app.get("/data", (req, res) => {
    const data = readData();
    res.json(data);
});

// Route: Set specific count (from Pico/ESP8266 or dashboard)
app.get("/update", (req, res) => {
    let count = parseInt(req.query.count);

    if (isNaN(count)) {
        return res.status(400).json({
            error: "Invalid count value"
        });
    }

    let data = readData();
    data.counter = Math.max(0, Math.min(data.max, count));
    writeData(data);

    res.json({
        message: "updated",
        counter: data.counter,
        max: data.max,
        available: data.max - data.counter
    });
});

// Route: Vehicle Entry (Increment count)
app.get("/api/entry", (req, res) => {
    let data = readData();
    if (data.counter < data.max) {
        data.counter += 1;
        writeData(data);
        return res.json({
            status: "success",
            message: "Vehicle entered",
            counter: data.counter,
            available: data.max - data.counter
        });
    }
    res.status(400).json({
        status: "full",
        message: "Parking facility is at maximum capacity",
        counter: data.counter
    });
});

// Route: Vehicle Exit (Decrement count)
app.get("/api/exit", (req, res) => {
    let data = readData();
    if (data.counter > 0) {
        data.counter -= 1;
        writeData(data);
        return res.json({
            status: "success",
            message: "Vehicle exited",
            counter: data.counter,
            available: data.max - data.counter
        });
    }
    res.status(400).json({
        status: "empty",
        message: "Parking facility is already empty",
        counter: data.counter
    });
});

// Route: System Reset
app.get("/api/reset", (req, res) => {
    let data = readData();
    data.counter = 0;
    writeData(data);
    res.json({
        status: "success",
        message: "Facility counter reset to 0",
        counter: 0,
        available: data.max
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Parking Server running on port ${PORT}`);
    console.log(`Access dashboard at: http://localhost:${PORT}`);
});