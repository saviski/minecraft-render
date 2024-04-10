// @ts-ignore
import streamZip from 'node-stream-zip'

export class Jar {
  protected zip: InstanceType<typeof streamZip.async>;

  protected constructor(public file: string) {
    this.zip = new streamZip.async({ file });
  }

  static open(file: string) {
    return new Jar(file);
  }

  async close() {
    await this.zip.close();
  }

  async entries(path: string): Promise<streamZip.ZipEntry[]> {
    return Object.entries(await this.zip.entries())
      .filter(([key]) => key.startsWith(path))
      .map(([_, value]) => value);
  }

  read(path: string | streamZip.ZipEntry) {
    return this.zip.entryData(typeof path === "string" ? path : path.name);
  }

  async readJson(path: string | streamZip.ZipEntry) {
    return JSON.parse((await this.read(path)).toString());
  }
}