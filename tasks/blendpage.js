/*
 * grunt-blendpage
 * https://github.com/iZhen/grunt-blendpage
 *
 * Copyright (c) 2014 Zhen
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var path = require('path');
  var URL = require('url');

  grunt.registerMultiTask('blendpage', ' generate static page.', function() {
    // 默认选项
    var options = this.options({
      ignorejs: [],
      ignorecss: []
    });
    // 正则匹配内容
    var reg = {
      css:/[^\>\n\r]\s*(<link\s*.*href=["'].*\.css["'].*\/>|<style>(?:[\S\s]*?)<\/style>)[\n\r]*/ig,
      js: /[^\>\n\r]\s*<script/ig,
      del: /\sdel=["']true["']/ig,
      ignore: /\signore=["']true["']/ig
    };

    // 遍历文件
    this.files.forEach(function(f) {
      // 文件内容
      var source = grunt.file.read(f.src);

      // 样式处理
      var source = (function(data) {
        // 源数据
        var src = data;
        // 样式列表
        var list_css = [];

        // 循环处理
        src = src.replace(reg.css, function(cssStr) {
          // 判断该节点是否需要进行删除
          if(reg.del.test(cssStr)) {
            return '';
          }

          // 判断该节点是否需要进行忽略
          if(reg.ignore.test(cssStr)) {
            return cssStr.replace(reg.ignore, '');
          }

          return '';

        });

        return src;

      })(source);

      grunt.log.warn(source);

      // 输出结果
      grunt.file.write(f.dest, "");

    });


  });

};
