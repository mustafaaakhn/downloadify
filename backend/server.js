const express = require("express");
const cors = require("cors");
const path = require("path");
const { scrapeWebsite } = require("./scraper");
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("✅ Backend Çalışıyor!");
});

app.post("/api/scrape", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL is required." });
    }

    try {
        const zipPath = await scrapeWebsite(url);
        
        // ZIP dosyası mevcut mu kontrolü
        if (!fs.existsSync(zipPath)) {
            throw new Error("ZIP file not found.");
        }

        // Uygun header'lar ile ZIP dosyasını gönder
        res.setHeader('Content-Type', 'application/zip');
        res.download(zipPath, path.basename(zipPath), (err) => {
            if (err) {
                console.error("Error sending file:", err);
                res.status(500).json({ error: "Error sending the file." });
            }
        });

    } catch (error) {
        console.error("🚨 Hata oluştu:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Backend çalışıyor: http://localhost:${port}`);
});
