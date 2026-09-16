// Syncs esc-firmware .hex files from GitHub releases into public/firmware/
// and regenerates firmware/index.json. Runs before build/generate.
// Non-fatal: on any error the existing index.json is kept as-is.

import { writeFile, mkdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const REPO = 'GooDroneru/esc-firmware';
const INDEX_PATH = `${fileURLToPath(new URL('../', import.meta.url))}public/firmware/index.json`;
const USER_AGENT = 'am32-configurator';

try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
        headers: { 'User-Agent': USER_AGENT }
    });
    if (!res.ok) {
        throw new Error(`GitHub API responded ${res.status}`);
    }
    const releases = await res.json();

    const entries = [];
    for (const release of releases) {
        if (release.draft || release.prerelease) {
            continue;
        }

        const files = [];
        for (const asset of release.assets ?? []) {
            if (asset.name.toLowerCase().endsWith('.hex')) {
                // hex assets are hosted locally so flashing works without CORS
                const dir = `${fileURLToPath(new URL('../', import.meta.url))}public/firmware/${release.tag_name}/`;
                await mkdir(dir, { recursive: true });
                const assetRes = await fetch(asset.browser_download_url, {
                    headers: { 'User-Agent': USER_AGENT }
                });
                if (!assetRes.ok) {
                    throw new Error(`Failed to download ${asset.name}: ${assetRes.status}`);
                }
                await writeFile(`${dir}${asset.name}`, Buffer.from(await assetRes.arrayBuffer()));
                files.push({ name: asset.name, url: `firmware/${release.tag_name}/${asset.name}` });
            } else if (asset.name.toLowerCase().endsWith('.bin')) {
                files.push({ name: asset.name, url: asset.browser_download_url });
            }
        }

        if (files.length > 0) {
            entries.push({
                name: release.tag_name,
                prerelease: false,
                files
            });
        }
    }

    if (entries.length === 0) {
        throw new Error('no stable releases with firmware assets found');
    }

    entries.sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true }));

    let currentIndex = null;
    try {
        if ((await stat(INDEX_PATH)).isFile()) {
            currentIndex = JSON.parse(await readFile(INDEX_PATH, 'utf8'));
        }
    } catch {
        // no existing file
    }

    // Skip writing when nothing changed, to avoid build-time git churn
    if (currentIndex?.releases && JSON.stringify(currentIndex.releases) === JSON.stringify(entries)) {
        console.log(`[firmware] index.json already up to date (${entries.length} releases)`);
    } else {
        await writeFile(INDEX_PATH, JSON.stringify({
            generated: new Date().toISOString(),
            releases: entries
        }, null, 2) + '\n');
        console.log(`[firmware] index.json updated: ${entries.map(r => r.name).join(', ')}`);
    }
} catch (e) {
    console.warn(`[firmware] sync skipped: ${e?.message ?? e}`);
}
