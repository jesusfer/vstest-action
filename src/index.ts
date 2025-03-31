import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as path from "path";
import { uploadArtifact } from "./uploadArtifact";
import { getTestAssemblies } from "./getTestAssemblies";
import { getArguments } from "./getArguments";
import { getVsTestPath } from "./getVsTestPath";

export async function run() {
  try {
    let testFiles = await getTestAssemblies();
    if (testFiles.length == 0) {
      throw new Error("No matched test files!");
    }

    core.debug(`Matched test files are:`);
    testFiles.forEach(function (file) {
      core.debug(`${file}`);
    });

    const vstestLocationMethod = core.getInput("vstestLocationMethod");
    const wantsCustomLocation =
      vstestLocationMethod && vstestLocationMethod.toUpperCase() === "LOCATION";

    if (!wantsCustomLocation) {
      let downloadSucceeded = true;
      try {
        core.info(`Downloading test tools...`);
        let workerZipPath = path.join(__dirname, "win-x64.zip");
        await exec.exec(
          `powershell Invoke-WebRequest -Uri "https://raw.githubusercontent.com/jesusfer/vstest-action/main/runner/win-x64.zip" -OutFile ${workerZipPath}`
        );

        core.info(`Unzipping test tools...`);
        core.debug(`workerZipPath is ${workerZipPath}`);
        await exec.exec(
          `powershell Expand-Archive -Path ${workerZipPath} -DestinationPath ${__dirname}`
        );
      } catch (error) {
        core.info(`Downloading test tools failed: ${error}`);
        downloadSucceeded = false;
      }

      if (!downloadSucceeded && !vstestLocationMethod) {
        throw `Download failed and no custom location method specified`;
      }
    }

    let vsTestPath = getVsTestPath();
    core.debug(`VsTestPath: ${vsTestPath}`);

    let args = getArguments();
    core.debug(`Arguments: ${args}`);

    core.info(`Running tests...`);
    await exec.exec(`${vsTestPath} ${testFiles.join(" ")} ${args} /Logger:TRX`);
  } catch (err) {
    if (err instanceof Error) {
      core.setFailed(err.message);
    }
  }

  // Always attempt to upload test result artifact
  try {
    await uploadArtifact();
  } catch (err) {
    if (err instanceof Error) {
      core.setFailed(err.message);
    }
  }
}

run();
