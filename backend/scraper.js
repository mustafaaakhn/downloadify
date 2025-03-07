const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

async function scrapeWebsite(url) {
    console.log("🌍 Downloading website:", url);

    const domain = new URL(url).hostname;
    const savePath = path.join(__dirname, 'downloads', domain);

    if (!fs.existsSync(savePath)) fs.mkdirSync(savePath, { recursive: true });

    console.log("📥 Downloading static files...");
    const wgetCommand = `wget --mirror --convert-links --adjust-extension --page-requisites --no-parent --execute robots=off --timeout=1200 --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36" "${url}" -P "${savePath}"`;

    try {
        execSync(wgetCommand, { stdio: 'inherit' });
        console.log("✅ Static files downloaded!");
    } catch (error) {
        console.error("🚨 Error occurred wget failed:", error);
        throw new Error("The website failed to download. wget failed.");
    }

    const zipPath = `${savePath}.zip`;

    try {
        await createZip(savePath, zipPath);
    } catch (zipError) {
        console.error("🚨 Error creating ZIP:", zipError);
        throw new Error("Failed to create ZIP file.");
    }

    return zipPath;
}

async function createZip(sourceDir, zipPath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(sourceDir)) {
            console.error("🚨 Error: Source folder for ZIP not found:", sourceDir);
            return reject(new Error("Source folder missing"));
        }

        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`✅ ZIP created successfully: ${zipPath} (${archive.pointer()} bytes)`);
            resolve(zipPath);
        });

        archive.on('error', (err) => {
            console.error("🚨 Error creating ZIP:", err);
            reject(err);
        });

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

module.exports = { scrapeWebsite };