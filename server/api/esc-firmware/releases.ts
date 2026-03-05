interface GitHubAsset {
    name: string;
    browser_download_url: string;
}

interface GitHubRelease {
    tag_name: string;
    prerelease: boolean;
    assets: GitHubAsset[];
}

const GITHUB_OWNER = 'GooDroneru';
const GITHUB_REPO = 'esc-firmware';
const CACHE_TTL_SECONDS = 5 * 60; // 5 minutes

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const includePrereleases = query.prereleases !== undefined;

    const cacheKey = `esc-firmware-releases:${includePrereleases}`;
    const cache = useStorage('releases');

    const cached = await cache.getItem<BlobFolder[]>(cacheKey);
    if (cached) {
        return { data: cached };
    }

    let releases: GitHubRelease[] = [];

    try {
        const response = await $fetch<GitHubRelease[]>(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`,
            {
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2022-11-28',
                    'User-Agent': 'am32-configurator'
                }
            }
        );
        releases = response;
    } catch (e) {
        console.error('[esc-firmware/releases] GitHub API fetch failed:', e);
        return { data: [] };
    }

    const releasesFolder: BlobFolder = {
        name: 'releases',
        files: [],
        children: []
    };

    for (const release of releases) {
        if (!includePrereleases && release.prerelease) {
            continue;
        }

        const hexAssets = release.assets.filter(a => a.name.endsWith('.hex'));

        if (hexAssets.length === 0) {
            continue;
        }

        // Map certain firmware asset filenames to MCU names so the UI can
        // automatically pick the correct .hex for a detected MCU.
        const ASSET_TO_MCU: Record<string, string> = {
            'esc-firmware-niiet.hex': 'K1946VK035',
            'esc-firmware-wch.hex': 'CH32V203'
        };

        const files: { name: string; url: string }[] = [];

        for (const a of hexAssets) {
            files.push({ name: a.name, url: a.browser_download_url });

            const lower = a.name.toLowerCase();
            const mapped = ASSET_TO_MCU[lower];
            if (mapped) {
                // Add a synthetic filename that includes the MCU name separated
                // by an underscore so client-side matching (by MCU name) works.
                const synthetic = a.name.replace(/\.hex$/i, `_${mapped}.hex`);
                // Avoid duplicates
                if (!files.some(f => f.name === synthetic)) {
                    files.push({ name: synthetic, url: a.browser_download_url });
                }
            }
        }

        releasesFolder.children.push({
            name: release.tag_name,
            files,
            children: []
        });
    }

    // Sort newest first
    releasesFolder.children.sort((a, b) => b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' }));

    const result: BlobFolder[] = [releasesFolder];

    await cache.setItem(cacheKey, result, { ttl: CACHE_TTL_SECONDS });

    return { data: result };
});
