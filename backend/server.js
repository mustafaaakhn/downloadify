const express = require("express");
const cors = require("cors");
const { scrapeWebsite } = require("./scraper");
const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send("✅ Backend çalışıyor!"));

app.post("/api/scrape", async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: "URL gerekli" });
    }

    try {
        await scrapeWebsite(url);
        const zipPath = path.join(__dirname, 'downloads', new URL(url).hostname + '.zip');
        res.download(zipPath);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Backend çalışıyor: http://localhost:${port}`);
});
