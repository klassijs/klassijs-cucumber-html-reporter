import * as chai from 'chai';
import fs from 'fs-extra';
import path from 'path';

const should = chai.should();

export default function assertHtmlReports(outputDirectory) {
  function isReportExists(report) {
    try {
      return fs.statSync(report).isFile();
    } catch (e) {
      return false;
    }
  }

  function isDirectoryExists(dir) {
    return fs.existsSync(dir);
  }

  const hierarchyHtmlFile = path.join(outputDirectory, 'cucumber_report_hierarchy.html');
  const bootstrapHtmlFile = path.join(outputDirectory, 'cucumber_report_bootstrap.html');
  const foundationHtmlFile = path.join(outputDirectory, 'cucumber_report_foundation.html');
  const simpleHtmlFile = path.join(outputDirectory, 'cucumber_report_simple.html');

  isReportExists(hierarchyHtmlFile).should.be.equal(
    true,
    'hierarchyHtmlFile file ' + hierarchyHtmlFile + ' does not exist'
  );
  isReportExists(bootstrapHtmlFile).should.be.equal(
    true,
    'bootstrapHtmlFile file' + bootstrapHtmlFile + ' does not exist'
  );
  isReportExists(foundationHtmlFile).should.be.equal(
    true,
    'foundationHtmlFile file ' + foundationHtmlFile + ' does not exist'
  );
  isReportExists(simpleHtmlFile).should.be.equal(true, 'simpleHtmlFile file ' + simpleHtmlFile + ' does not exist');
  isDirectoryExists(path.join(outputDirectory, '..', '..', 'screenshots')).should.be.equal(
    true,
    'screenshots directory does not exists, at "parentDirectory/screenshots"'
  );
}
