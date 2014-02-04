'use strict';

var _ = require('lodash');
var qFs = require('q-io/fs');
var editorconfigLint = _.curry(require('editorconfig-lint'));
var util = require('util');
var q = require('q');
var chalk = require('chalk');

module.exports = function (grunt) {

    grunt.registerMultiTask('editorconfig-lint', 'lints your files for adherence to an editorconfig', function () {

        var options = grunt.task.current.options();
        var files = grunt.task.current.files;
        var done = grunt.task.current.async();

        var filesPromise = _(files)
            .map('src')
            .flatten()
            .map(function (filePath) {
                return qFs.read(filePath).then(function (fileContent) {
                    return {
                        filePath: filePath,
                        fileContent: fileContent
                    };
                });
            })
            .value();

        q.all(filesPromise).then(function (files) {

            var lints = _.map(files, function (file) {
                var lintResult = editorconfigLint(options, file.fileContent);
                return {
                    filePath: file.filePath,
                    lintResult: lintResult
                };
            });

            var countBad = _(lints)
                .map('lintResult')
                .map(_.size)
                .compact()
                .size();

            var countOk = lints.length - countBad;

            grunt.log.ok(countOk + ' files lint-free.');

            if (countBad) {
                _.forEach(lints, function (lint) {
                    console.log();
                    console.log(chalk.red.underline(lint.filePath));

                    _.forEach(lint.lintResult, function(violation, validationName) {

                        console.log();

                        console.log(_.template('[L<%= lineNumber %>:C<%= col %>]: ' + validationName), violation);

                        console.log(violation.line);

                        var highlightedLine = violation.line.splice(0, violation.col) +
                            chalk.bgRed(violation.line[violation.col]) +
                            violation.line.splice(violation.col + 1);

                        console.log(highlightedLine);

                        console.log();
                    });

                    console.log();
                });

                grunt.fail.fatal(countBad + ' files contained errors');
            }
        })
            .then(done, function (err) {
                done(util.isError(err) ? err : new Error(err));
            });

    });

};