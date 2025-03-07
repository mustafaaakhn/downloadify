const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const scrapeWebsite = async (url) => {
    const { exec } = require('child_process');

    const savePath = path.join(__dirname, 'downloads', new URL(url).hostname);

    if (!fs.existsSync(savePath)) fs.mkdirSync(savePath, { recursive: true });

    const wgetCommand = `wget --mirror --convert-links --adjust-extension --page-requisites --no-parent --execute robots=off --timeout=1200 --user-agent="Mozilla/5.0 (compatible)" ${url}`;

    try {
        await new Promise((resolve, reject) => {
            exec(wgetCommand, { cwd: savePath }, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    } catch (error) {
        throw new Error(`wget error: ${error.message}`);
    }

    const zipPath = `${savePath}.zip`;
    await zipFolder(savePath, zipPath);

    return zipPath;
};

const zipFolder = (source, outPath) => {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', resolve);
        archive.on('error', reject);

        archive.pipe(output);
        archive.directory(source, false);
        archive.finalize();
    });
};

module.exports = { scrapeWebsite };  
