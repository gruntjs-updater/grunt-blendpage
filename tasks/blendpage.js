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
  var url = require('url');
  var util = require('util');

  grunt.registerMultiTask('blendpage', ' generate static page.', function() {
    // 默认选项
    var options = this.options({
      del: [],
      ign: []
    });
    // 正则匹配内容
    var reg = {
      css: /(?:[^>\n\r]*)(<link\s*.*href=["'].*\.css["'?].*\/>|<style[^>]*>(?:[\S\s]*?)<\/style>)[\n\r]*/ig,
      cssfile: /(?:[^"' >\/]+)\.css(?=["'?])/i,
      js: /(?:[^>\n\r]*)(<script[^>]*>(?:[\s\S]*?)<\/script\s*>)[\n\r]*/ig,
      url: /^/g,
      del: /\sdel(?=[\s>\/])/ig,
      ign: /\sign(?=[\s>\/])/ig
    };

    // 文件内容列表
    var files = [];

    // 遍历源文件
    this.files.forEach(function(f) {

      var fileInfo = {
        src: f.src,
        dest: f.dest,
        cssList: [],
        jsList: [],
        source: grunt.file.read(f.src),
        content: null,
        done: false
      };
      files.push(fileInfo);

      // 文件内容
      var fileContent = grunt.file.read(f.src);

      //----- 样式处理 -----
      fileContent = (function(data) {
        // 源数据
        var src = data;
        // 样式列表
        var list_css = [];

        // 循环处理
        src = src.replace(reg.css, function(tag) {
          // 判断该节点是否需要进行删除
          if(reg.del.test(tag)) { return '';}

          // 判断该节点是否需要进行忽略
          if(reg.ign.test(tag)) { return tag.replace(reg.ign, '');}


          return '';

        });

        // 返回处理后的内容
        return src;

      })(fileContent);

      //----- 脚本处理 -----
      fileContent = (function(data) {
        // 源数据
        var src = data;

        // 循环处理
        src = src.replace(reg.js, function(tag) {
          // 判断该节点是否需要进行删除
          if(reg.del.test(tag)) { return '';}

          // 判断该节点是否需要进行忽略
          if(reg.ign.test(tag)) { return tag.replace(reg.ign, '');}


          return '';

        });

        return src;
      })(fileContent);

      grunt.log.warn(fileContent);

      // 输出结果
      grunt.file.write(f.dest, "");
    });

    files.forEach(function(fileInfo) {

    });
    //----- end of this task -----
  });

};
