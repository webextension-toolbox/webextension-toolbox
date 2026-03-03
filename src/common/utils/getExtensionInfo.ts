import { resolve } from "path";
import { promises as fs } from "fs";
import type { PackageJson } from "type-fest";

/**
 * Finds the manifest.json file in the parent directory
 *
 * @param src string
 * @returns Promise<browser._manifest.WebExtensionManifest>
 */
async function getManifestJSON(
  src: string
): Promise<browser._manifest.WebExtensionManifest> {
  try {
    return JSON.parse(
      (await fs.readFile(resolve(src, "manifest.json"))).toString()
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('ENOENT')) {
      throw new Error(
        `manifest.json not found in directory: ${resolve(src)}\n` +
        `Please ensure your manifest.json file exists at: ${resolve(src, 'manifest.json')}\n` +
        `Tip: The source directory should contain your extension's manifest.json file.`
      );
    }
    if (errorMessage.includes('JSON')) {
      throw new Error(
        `Failed to parse manifest.json: Invalid JSON syntax\n` +
        `Please check your manifest.json file for syntax errors.\n` +
        `Location: ${resolve(src, 'manifest.json')}`
      );
    }
    throw new Error(
      `Failed to read manifest.json: ${errorMessage}\n` +
      `Please ensure the file exists and is readable.\n` +
      `Expected location: ${resolve(src, 'manifest.json')}`
    );
  }
}

/**
 * Find the package.json file in the parent directory
 * @param src string
 * @returns Promise<NodePackage>
 */
async function getPackageJSON(src: string): Promise<PackageJson> {
  try {
    try {
      return JSON.parse(
        (await fs.readFile(resolve(src, "../package.json"))).toString()
      );
    } catch (error) {
      return JSON.parse(
        (await fs.readFile(resolve(src, "package.json"))).toString()
      );
    }
  } catch (e) {
    return {};
  }
}

export default async function getExtensionInfo(src: string) {
  const manifestJSON = await getManifestJSON(src);
  const packageJSON = await getPackageJSON(src);

  if (!manifestJSON.version && !packageJSON.version) {
    throw new Error(
      "No version found in manifest.json or package.json\n" +
      "Please add a 'version' field to either:\n" +
      "  - manifest.json (e.g., \"version\": \"1.0.0\")\n" +
      "  - package.json (e.g., \"version\": \"1.0.0\")\n" +
      "The version is required for building and publishing your extension."
    );
  }

  return {
    version: manifestJSON.version || packageJSON.version,
    name: packageJSON.name || "extension",
    description: packageJSON.description,
  };
}
