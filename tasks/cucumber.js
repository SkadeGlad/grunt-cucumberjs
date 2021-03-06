/*
 * grunt-cucumberjs
 * https://github.com/mavdi/grunt-cucumberjs
 *
 * Copyright (c) 2013 Mehdi Avdi
 * Licensed under the MIT license.
 */

'use strict';
module.exports = function(grunt) {
    grunt.registerMultiTask('cucumberjs', 'Run cucumber.js features', function() {
        var done = this.async();

        var options = this.options({
            output: 'features_report.html',
            format: 'html',
            theme: 'foundation',
            templateDir: 'features/templates',
            tags: '',
            require: '',
            debug: false,
            debugger: false,
            failFast: false,
            reportSuiteAsScenarios: false
        });

        var handler = options.debugger ? require('../lib/requireHandler') : require('../lib/processHandler');

        var applyLegacyFormatters = function() {
            if (options.format === 'html') {
                options.isHtml = true;
                commands.push('-f', 'json:' + options.output + '.json');
            } else {
                commands.push('-f', options.format);
            }
        };

        // resolve options set via cli
        for (var key in options) {
            if (grunt.option(key)) {
                if (key === 'tags') {
                    if (options.tags === '') {
                        options[key] = grunt.option(key);
                    }
                } else {
                    options[key] = grunt.option(key);
                }
            }
        }

        var commands = [];

        if (options.executeParallel && options.workers) {
            commands.push('-w', options.workers);
        }

        if (options.steps) {
            commands.push('-r', options.steps);
        }

        if (options.tags) {
            if (options.tags instanceof Array) {
                options.tags.forEach(function(element) {
                    commands.push('-t', element);
                });
            } else {
                commands.push('-t', options.tags);
            }
        }

        if (options.formats) {
            options.formats.forEach(function(format) {
                if (format === 'html') {
                    options.isHtml = true;
                    commands.push('-f', 'json:' + options.output + '.json');
                } else {
                    commands.push('-f', format);
                }
            });
        } else if (options.format) {
            applyLegacyFormatters();
        }

        if (options.failFast || grunt.option('fail-fast') || grunt.cli.options['fail-fast'] === true) {
            commands.push('--fail-fast');
        }

        if (options.dryRun || grunt.option('dry-run') || grunt.cli.options['dry-run'] === true) {
            commands.push('--dry-run');
        }

        if (grunt.cli.options['parallel']) {
            commands.push('--parallel', grunt.cli.options['parallel']);
        } else if (options.parallel) {
            commands.push('--parallel', options.parallel);
        }

        if (grunt.cli.options['compiler']) {
            commands.push('--compiler', grunt.cli.options['compiler']);
        } else if (options.compiler) {
            commands.push('--compiler', options.compiler);
        }

        if (options.require) {
            if (options.require instanceof Array) {
                options.require.forEach(function(element) {
                    commands.push('--require', element);
                });
            } else {
                commands.push('--require', options.require);
            }
        }

        if (grunt.option('require')) {
            commands.push('--require', grunt.option('require'));
        }

        if (grunt.option('features')) {
            commands.push(grunt.option('features'));
        } else {
            this.files.forEach(function(f) {
                f.src.forEach(function(filepath) {
                    if (!grunt.file.exists(filepath)) {
                        grunt.log.warn('Source file "' + filepath + '" not found.');
                        return;
                    }
                    commands.push(filepath);
                });
            });
        }

        handler(grunt, options, commands, function handlerCallback(err) {
            if (err) {
                grunt.log.error('failed tests, please see the output');
                return done(false);
            } else {
                return done();
            }
        });

    });
};
