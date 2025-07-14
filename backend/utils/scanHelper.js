const fs = require("fs").promises;
const path = require("path");

const outputDir = path.join(__dirname, "../outputs");

// Helper: Read & parse JSON array, ignore empty arrays
async function safeReadJson(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {}
  return null;
}

// Helper: Collect all results for Scan
async function collectResults(scanId) {
  const files = await fs.readdir(outputDir);
  const prefix = `${scanId}`;
  const userResults = [];
  let orgResults = [];

  for (const file of files) {
    if (!file.startsWith(prefix)) continue;

    const filePath = path.join(outputDir, file);
    const data = await safeReadJson(filePath);
    if (!data) continue;

    if (file === `${scanId}.json`) {
      orgResults = data;
    } else if (file.startsWith(`${scanId}_`)) {
      userResults.push(...data);
    }
  }

  return { userResults, orgResults };
}

// Helper: Delete all files related to a scan
async function deleteScanFiles(scanId) {
  const files = await fs.readdir(outputDir);
  const matchingFiles = files.filter((f) => f.startsWith(`${scanId}`));
  for (const file of matchingFiles) {
    const filePath = path.join(outputDir, file);
    await fs.unlink(filePath).catch(() => {});
  }
}

module.exports = { collectResults, deleteScanFiles };
