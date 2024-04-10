import * as fs from "fs/promises";
import { Spec, skipTest } from "nole";
import * as path from "path";

export class DownloadTest {
  private targetVersionUrl: string = "";
  private jarUrl: string = "";
  public jarPath: string = "";

  @Spec()
  async getManifest() {
    await this.checkExistingJar();
    const response = await fetch(
      `https://launchermeta.mojang.com/mc/game/version_manifest.json`
    );
    const manifest: VersionManifest = await response.json();
    this.targetVersionUrl = manifest.versions.find(
      (version) =>
        version.type == "release" || version.id == manifest.latest.release
    )!.url;
  }

  @Spec()
  async getVersionJarUrl() {
    await this.checkExistingJar();
    const response = await fetch(this.targetVersionUrl);
    const version: Version = await response.json();
    this.jarUrl = version.downloads.client.url;
  }

  @Spec(120000)
  async downloadJar() {
    await this.checkExistingJar();
    const response = await fetch(this.jarUrl);
    this.jarPath = this.getPath();
    await fs.writeFile(this.jarPath, Buffer.from(await response.arrayBuffer()));
  }

  async checkExistingJar() {
    if (this.jarPath) skipTest("Jar already exists");
    const checkPath = this.getPath();
    const stat = await fs.stat(checkPath).catch(() => undefined);
    if (stat) {
      this.jarPath = checkPath;
      skipTest("Jar already exists");
    }
  }

  getPath() {
    return path.resolve(__dirname, "../../test-data/test.jar");
  }
}

interface VersionManifest {
  latest: { release: string; snapshot: string };
  versions: {
    id: string;
    type: "release" | "snapshot";
    url: string;
    time: string;
    releaseTime: string;
  }[];
}

interface Version {
  arguments: any;
  assetIndex: any;
  assets: string;
  downloads: {
    client: DownloadInfo;
    client_mappings: DownloadInfo;
    server: DownloadInfo;
  };
  id: string;
  javaVersion: any;
  libraries: { downloads: any; name: string }[];
  logging: any;
  mainClass: string;
  minimumLauncherVersion: number;
  releaseTime: string;
  time: string;
  type: "release" | "snapshot";
}

interface DownloadInfo {
  sha1: string;
  size: number;
  url: string;
}
