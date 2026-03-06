import _ from 'lodash';
import path from 'path';

export default {
  getBaseDir: function (suite) {
    let baseDir = [];
    suite.features.forEach(function (feature) {
      baseDir = feature.uri.split(path.sep);
    });
    return baseDir.join(path.sep);
  },

  getFeatureHierarchy: function (featureUri, baseDir) {
    let noBaseDir = featureUri.slice(baseDir.length + 1);
    let noBadChars = noBaseDir.split('=').join('_');
    let featureDirs = noBadChars.split(path.sep);
    featureDirs.length = featureDirs.length - 1;
    return featureDirs;
  },

  findOrCreateSubSuite: function (suite, hierarchy) {
    function newSubSuite(name, parent) {
      return {
        name: { plain: name, sanitized: name },
        passed: 0,
        failed: 0,
        ambiguous: 0,
        skipped: 0,
        parent: parent,
        features: [],
        suites: [],
      };
    }

    if (hierarchy.length < 1) {
      return null;
    }
    let subSuiteName = hierarchy[0];
    if (!suite.suites) {
      suite.suites = [];
    }
    let subSuite = suite.suites.find(function (s) {
      return s.name.plain === subSuiteName;
    });
    if (!subSuite) {
      subSuite = newSubSuite(subSuiteName, suite);
      suite.suites.push(subSuite);
    }
    if (hierarchy.length === 1) {
      return subSuite;
    } else {
      return this.findOrCreateSubSuite(subSuite, hierarchy.slice(1));
    }
  },

  recursivelyIncrementStat: function (subSuite, attrName) {
    subSuite[attrName] = subSuite[attrName] + 1;
    if (subSuite.parent) {
      this.recursivelyIncrementStat(subSuite.parent, attrName);
    }
  },
};
