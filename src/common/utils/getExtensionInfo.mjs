import { resolve } from "path";
import { promises as fs } from "node:fs";

export default async function (src) {
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

async function getManifestJSON(src) {
  try {
    return JSON.parse(await fs.readFile(resolve(src, "manifest.json")));
  } catch (error) {
    throw new Error("You need to provide a valid 'manifest.json'");
  }
}

async function getPackageJSON(src) {
  try {
    try {
      return JSON.parse(await fs.readFile(resolve(src, "../package.json")));
    } catch (error) {
      return JSON.parse(await fs.readFile(resolve(src, "package.json")));
    }
  } catch (e) {
    return {};
  }
}
