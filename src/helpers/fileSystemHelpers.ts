import { promises as fs } from "node:fs";
import path from "node:path";

export function resolveSafePath(rootDir: string, relativePath: string) {
    const fullPath = path.resolve(rootDir, relativePath);
    const normalizedRoot = path.resolve(rootDir);

    if (!fullPath.startsWith(normalizedRoot)) {
        throw new Error(`Path escapes memory root: ${relativePath}`);
    }

    return fullPath;
}

async function ensureParent(filePath: string) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function emptyAFile(rootDir: string, relativePath: string) {
    const filePath = resolveSafePath(rootDir, relativePath);
    await ensureParent(filePath);

    await fs.writeFile(filePath, "", { encoding: "utf8", flag: "w" });

    return `File reset (emptied): ${relativePath}`;
}

export async function createAFile(
    rootDir: string,
    relativePath: string,
    content = ""
) {
    const filePath = resolveSafePath(rootDir, relativePath);
    await ensureParent(filePath);

    await fs.writeFile(filePath, content, {
        encoding: "utf8",
        flag: "wx",
    });

    return `Created file: ${relativePath}`;
}

export async function readAFile(rootDir: string, relativePath: string) {
    try {
        const filePath = resolveSafePath(rootDir, relativePath);
        return fs.readFile(filePath, "utf8");
    } catch (error) {
        console.log("failed to read that file");
    }
}

export async function updateAFile(
    rootDir: string,
    relativePath: string,
    content: string
) {
    const filePath = resolveSafePath(rootDir, relativePath);

    await ensureParent(filePath);
    await fs.writeFile(filePath, content, "utf8");

    return `Updated file: ${relativePath}`;
}

export async function appendAFile(
    rootDir: string,
    relativePath: string,
    content: string
) {
    const filePath = resolveSafePath(rootDir, relativePath);

    await ensureParent(filePath);
    await fs.appendFile(filePath, content, "utf8");

    return `Appended file: ${relativePath}`;
}

export function todayDateString(now = new Date()) {
    return now.toISOString().slice(0, 10);
}

export function nowTimeString(now = new Date()) {
    return now.toTimeString().slice(0, 8);
}

export async function fileExists(filePath: string) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}