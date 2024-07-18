import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';
import { create, UploadOptions } from '@actions/artifact';
import { findFilesToUpload } from './search';
import { getInputs } from './input-helper';
import { NoFileOptions } from './constants';

export function getVsTestPath(): string {
  let vstestLocationMethod = core.getInput('vstestLocationMethod')
  if (vstestLocationMethod && vstestLocationMethod.toUpperCase() === "LOCATION") {
    const customLocation = core.getInput('vstestLocation')
    if (!customLocation) {
      throw `Custom location cannot be empty!`
    }
    //  Quote in case the location includes a space
    return `"${path.join(customLocation)}"`
  }

  let vsTestVersion = core.getInput('vsTestVersion')
  if (vsTestVersion && vsTestVersion === "14.0") {
    return path.join(__dirname, 'win-x64/VsTest/v140/vstest.console.exe')
  }

  if (vsTestVersion && vsTestVersion === "15.0") {
    return path.join(__dirname, 'win-x64/VsTest/v150/Common7/IDE/Extensions/TestPlatform/vstest.console.exe')
  }

  if (vsTestVersion && vsTestVersion === "16.0") {
    return path.join(__dirname, 'win-x64/VsTest/v160/Common7/IDE/Extensions/TestPlatform/vstest.console.exe')
  }

  return path.join(__dirname, 'win-x64/VsTest/v170/Common7/IDE/Extensions/TestPlatform/vstest.console.exe')
}
