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
    throw new Error("You need to provide a valid 'manifest.json'");
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
      "You need to provide a version string either in the manifest.json or in your package.json"
    );
  }

  return {
    version: manifestJSON.version || packageJSON.version,
    name: packageJSON.name || "extension",
    description: packageJSON.description,
  };
}
