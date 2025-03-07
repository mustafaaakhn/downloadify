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
    const wgetCommand = `wget --mirror --convert-links --adjust-extension --page-requisites --no-parent --execute robots=off --timeout=1200 --user-agent="Mozilla/5.0 (compatible)" "${url}"`;

    try {
        execSync(wgetCommand, { stdio: 'inherit', cwd: savePath });
        console.log("✅ Static files downloaded successfully!");
    } catch (error) {
        console.error("🚨 wget error:", error);
        throw new Error("wget failed to download the website.");
    }

    const zipPath = path.join(__dirname, 'downloads', `${domain}.zip`);
    await createZip(savePath, zipPath);

    return zipPath;
}

async function createZip(sourceDir, zipPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`✅ ZIP created successfully: ${zipPath} (${archive.pointer()} bytes)`);
            resolve(zipPath);
        });

        archive.on('error', reject);

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

module.exports = { scrapeWebsite };
