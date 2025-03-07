const express = require("express");
const cors = require("cors");
const scraper = require("./scraper");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("✅ Backend Çalışıyor!");
});

app.post("/api/scrape", async (req, res) => {
    const { url } = req.body;
    console.log("✅ API isteği alındı! URL:", url);

    if (!url) {
        return res.status(400).json({ error: "URL gerekli" });
    }

    try {
        const zipPath = await scraper.scrapeWebsite(url);
        res.download(zipPath);
    } catch (error) {
        console.error("🚨 Hata oluştu:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Sunucu çalışıyor: http://localhost:${port}`);
});