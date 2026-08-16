import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const publicRoot = path.resolve("frontend/public");
const strict = process.argv.includes("--strict");
const maxFileBytes = 25 * 1024 * 1024;
const maxTotalBytes = 500 * 1024 * 1024;

async function collectFiles(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...await collectFiles(absolute));
        if (entry.isFile()) files.push(absolute);
    }

    return files;
}

const files = await collectFiles(publicRoot);
const sized = await Promise.all(files.map(async (file) => ({
    file: path.relative(publicRoot, file),
    bytes: (await stat(file)).size,
})));
const totalBytes = sized.reduce((sum, file) => sum + file.bytes, 0);
const oversized = sized
    .filter((file) => file.bytes > maxFileBytes)
    .sort((left, right) => right.bytes - left.bytes);
const mib = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MiB`;

console.log(`Public media: ${files.length} files, ${mib(totalBytes)}`);
for (const file of oversized) {
    console.warn(`Oversized: ${mib(file.bytes).padStart(10)}  ${file.file}`);
}

const overBudget = totalBytes > maxTotalBytes || oversized.length > 0;
if (overBudget) {
    console.warn("Media exceeds the migration budget; move originals to Cloudinary/object storage.");
    if (strict) process.exitCode = 1;
}
