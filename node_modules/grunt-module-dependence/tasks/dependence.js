/*
 * grunt-module-dependence
 * https://github.com/HanCong03/formula
 *
 * Copyright (c) 2014 hancong03
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var PathModule = require("path"),
        UglifyJS = require("uglify-js");

    // 依赖池名称
    var depsPoolName = null,
    // 名称装饰后的映射表
        moduleMapping = {},
        idMapping = {},
        moudeIndex = 0;

    grunt.registerMultiTask('dependence', 'The best Grunt plugin ever.', function () {

        // 已处理后的module源码
        var transformedSource = null;
        var filenameList = [];

        var options = this.options({
                base: './',
                entrance: null,
                separator: '\n'
            }),
            moduleBase = PathModule.resolve(options.base) + PathModule.sep;

        initDepsPool();
        resetModuleIndex();

        this.files.forEach(function (fileConfig) {

            transformedSource = [];

            fileConfig.src.filter(function (filepath) {

                var source = null,
                    currentModuleName = null;

                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    source = '//' + filepath + '\n' + grunt.file.read(filepath);
                    currentModuleName = getModuleName(filepath, source);

                    if (currentModuleName.type === "id") {
                        idMapping[currentModuleName.value] = moudeIndex;
                    } else {
                        moduleMapping[currentModuleName.value] = moudeIndex;
                    }

                    transformedSource.push(transform(moudeIndex, source));

                    filenameList[moudeIndex] = currentModuleName.path;

                    moudeIndex++;
                    return true;
                }

            });

            for (var i = 0, len = transformedSource.length; i < len; i++) {
                transformedSource[i] = removeRequire(filenameList[i], transformedSource[i], moduleBase);
            }

            // 合并源码
            transformedSource = transformedSource.join( options.separator );

            transformedSource = wrap(transformedSource, options);

            transformedSource = format(transformedSource);

            grunt.file.write(fileConfig.dest, transformedSource);

            grunt.log.writeln('Concated ' + (moudeIndex).toString().cyan + ' Modules, File "' + fileConfig.dest + '" created.');

        });


    });

    /**
     * 根据给定的base目录和module路径以及源码获取格式化后的modulePath
     */
    function getModuleName(filepath, source) {

        filepath = PathModule.resolve(filepath);

        if (/\bdefine\s*\(\s*("|')([\s\S]+?)\1\s*,\s*/g.test(source)) {
            return {
                type: "id",
                value: RegExp.$2,
                path: filepath
            };
        }

        return {
            type: "path",
            value: PathModule.resolve(filepath),
            path: filepath
        };

    }

    /**
     * 初始化依赖池名称
     */
    function initDepsPool() {
        depsPoolName = '_p';
    }

    function resetModuleIndex() {
        moudeIndex = 0;
    }

    /**
     * 对module执行转换，更改其定义方式，使其可以脱离define方法
     * @param source
     */
    function transform(index, source) {

        var prefix = depsPoolName + "[" + index + "]",
            pattern = /(?:\/\*(?:[\s\S](?!\*\/))*?[\s\S]?\*\/\s*$)|(?:\/\/[^\n]*\s*$)/,
            lastIndex = -1,
            tailSource = null,
            tmpSource = null,
            match = null;

        source = source.replace(/\bdefine\s*\(\s*(?:("|')([\s\S]+?)\1\s*,\s*)?/g, prefix + "={\nvalue: ");

        tmpSource = source;
        while (pattern.test(tmpSource)) {
            tmpSource = tmpSource.replace(pattern, '');
        }

        lastIndex = tmpSource.lastIndexOf(')');

        tailSource = source.substring(lastIndex);

        source = source.substring(0, lastIndex);

        return source + tailSource.replace(/\)\s*;?/, '};');

    }

    /**
     * 删除require依赖
     */
    function removeRequire(filepath, source, moduleBase) {

        try {
            return source.replace(/\brequire\s*\(\s*("|')([\s\S]*?)\1\s*\)/g, function (match, sign, moduleName) {

                var originalName = moduleName;

                if (/^[.]{1,2}\//.test(moduleName)) {
                    moduleName = PathModule.resolve(PathModule.dirname(filepath) + PathModule.sep + moduleName);
                } else if (idMapping.hasOwnProperty(moduleName)) {
                    return depsPoolName + '.r(' + idMapping[moduleName] + ')';
                } else {
                    moduleName = PathModule.resolve(moduleBase + moduleName);
                }

                if (PathModule.extname(moduleName) === "") {
                    moduleName += ".js";
                }

                if (moduleMapping.hasOwnProperty(moduleName)) {
                    return depsPoolName + ".r(" + moduleMapping[moduleName] + ")";
                }

                throw new ModuleNotfoundError(originalName);

            });
        } catch (e) {
            if (e.name === "ModuleNotfoundError") {
                grunt.fatal('Module [' + e.message + '] not found, in file: ' + filepath);
            }
            throw e;
        }

    }

    /**
     * 格式化源码
     * @param source
     */
    function format(source) {

        var ast = UglifyJS.parse(source);

        return ast.print_to_string({
            beautify: true,
            comments: 'all'
        });

    }

    /**
     * 包裹最终的源码
     * @param source
     */
    function wrap(source, options) {

        return getWrapTpl().replace(/^function\s*\(\s*\)\s*\{|\}\s*$/gi, '')
            .replace(/\$name/g, depsPoolName)
            .replace('$source;', source) + '\n' + getUseTpl(options.entrance);


    }

    /*-------------- 获取包裹函数模板*/
    function getWrapTpl() {
        return function () {
            var $name = {
                r: function (index) {

                    if ($name[index].inited) {
                        return $name[index].value;
                    }

                    if (typeof $name[index].value === 'function') {

                        var module = {
                                exports: {}
                            },
                            returnValue = $name[index].value(null, module.exports, module);

                        $name[index].inited = true;
                        $name[index].value = returnValue;

                        if (returnValue !== undefined) {
                            return returnValue;
                        } else {
                            for (var key in module.exports) {
                                if (module.exports.hasOwnProperty(key)) {
                                    $name[index].inited = true;
                                    $name[index].value = module.exports;
                                    return module.exports;
                                }
                            }
                        }

                    } else {
                        $name[index].inited = true;
                        return $name[index].value;
                    }
                }
            };

            $source;

        }.toString();
    }

    /**
     * Use函数入口
     * @param entrance
     */
    function getUseTpl(entrance) {

        var entranceMap = null,
            tmp = {},
            entranceName = entrance;

        if (entrance) {

            if (moduleMapping.hasOwnProperty(entrance)) {
                entrance = moduleMapping[entrance];
            } else if (idMapping.hasOwnProperty(entrance)) {
                entrance = idMapping[entrance];
            } else {
                entrance = null;
            }

        }

        if (!isNumber(entrance)) {
            entranceMap = 'var moduleMapping = ' + JSON.stringify(moduleMapping) + ';';
        } else {
            tmp[entranceName] = entrance;
            entranceMap = 'var moduleMapping = ' + JSON.stringify(tmp) + ';';
        }

        return entranceMap + '\nfunction use (name) {' + depsPoolName + '.r([moduleMapping[name]]);}';

    }

    function isNumber(val) {
        return typeof val === "number";
    }

    /*----------- 自定义错误类*/
    function ModuleNotfoundError(message) {
        this.message = message;
        this.name = 'ModuleNotfoundError';
    }

    ModuleNotfoundError.prototype = new Error();

};
