const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { scrapeWebsite } = require("./scraper");

const app = express();
const port = process.env.PORT || 3000;

// 🔥 HTTPS Zorunlu Hale Getir
app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
        return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
});

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

        if (!fs.existsSync(zipPath)) {
            throw new Error("ZIP file does not exist.");
        }

        res.set({
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${path.basename(zipPath)}"`,
        });

        res.sendFile(zipPath);
    } catch (error) {
        console.error("🚨 Backend error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Backend running at: http://localhost:${port}`);
});
