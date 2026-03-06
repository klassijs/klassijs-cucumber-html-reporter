import path from 'path';
import fs from 'fs-extra';
import find from 'find';
import reporter from '../index.js';
import assertHtmlReports from './assert/assertHtmlReports.js';

let theme = {
  hierarchy: 'hierarchy',
  bootstrap: 'bootstrap',
  foundation: 'foundation',
  simple: 'simple',
};

let outputDirectory = 'test/report';
let jsonFile = 'test/report/cucumber_report.json';
let jsonDir = 'test/report/multi';

function removeReports() {
  let files = find.fileSync(/\.html/, outputDirectory);
  files.map(function (file) {
    fs.unlinkSync(file);
  });
}

function getOptions(theme) {
  return {
    name: '@cucumber-html-reporter/*&!@#$%)(~<>`',
    theme: theme,
    output: path.join(outputDirectory, 'cucumber_report_' + theme + '.html'),
    reportSuiteAsScenarios: true,
    launchReport: false,
    storeScreenshots: true,
    screenshotsDirectory: 'screenshots/',
    metadata: {
      'App Version': '0.3.2',
      'Test Environment': 'STAGING',
      Browser: 'Chrome  54.0.2840.98',
      Platform: 'Windows 10',
      Parallel: 'Scenarios',
      Executed: 'Remote',
    },
  };
}

function getJsonFileOptions(theme) {
  let options = getOptions(theme);
  options.jsonFile = jsonFile;
  return options;
}

function getJsonDirOptions(theme) {
  let options = getOptions(theme);
  options.jsonDir = jsonDir;
  return options;
}

function assertJsonFile() {
  reporter.generate(getJsonFileOptions(theme.hierarchy));
  reporter.generate(getJsonFileOptions(theme.bootstrap));
  reporter.generate(getJsonFileOptions(theme.foundation));
  reporter.generate(getJsonFileOptions(theme.simple));
  assertHtmlReports(outputDirectory);
}

function assertJsonDir() {
  reporter.generate(getJsonDirOptions(theme.hierarchy));
  reporter.generate(getJsonDirOptions(theme.bootstrap));
  reporter.generate(getJsonDirOptions(theme.foundation));
  reporter.generate(getJsonDirOptions(theme.simple));
  assertHtmlReports(outputDirectory);
}

assertJsonDir();

removeReports();

assertJsonFile();
