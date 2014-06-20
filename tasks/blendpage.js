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
  var Util = require('./lib/util');
  var CleanCSS = require('clean-css');

  grunt.registerMultiTask('blendpage', ' generate static page.', function() {

    // 默认选项
    var options = this.options({
      del: [],
      ign: []
    });

    // 正则匹配内容
    var reg = {
      // 匹配link:css标签以及style标签
      css: /(?:[^>\n\r]*)(<link\s*.*href=["'].*\.css["'?].*\/>|<style[^>]*>(?:[\S\s]*?)<\/style>)[\n\r]*/ig,
      // 匹配css文件路径
      cssPath: /href=(?:"|')?([^"' >]+)(?:"|')?/i,
      // 匹配css文件
      cssFile: /(?:[^"' >\/]+)\.css(?=["'?])/i,
      // 匹配script标签
      js: /(?:[^>\n\r]*)(<script[^>]*>(?:[\s\S]*?)<\/script\s*>)[\n\r]*/ig,
      // 匹配js文件路径
      jsPath: /^<script[^>]+src=(?:"|')\s*(\S+)\s*(?:"|')/i,
      // 匹配js文件名
      jsFile: /(?:[^"' >\/]+)\.js(?=["'?])/i,
      url: /^/g,
      // 匹配标签中的删除属性del='true'
      delAttribute: /\sdel=["']true["'](?=[\s>\/])/ig,
      // 匹配需删除的批注
      // /*!delete-section-start*/...../*!delete-section-end*/
      // <!--delete-section-start-->.....<!--delete-section-end-->
      delComments: /(\/\*!|<!--)delete-section-start(\*\/|-->)[\S\s]*(\/\*!|<!--)delete-section-end(\*\/|-->)/ig,
      // 匹配标签中的忽略属性ign='true'
      ignAttribute: /\sign=["']true["'](?=[\s>\/])/ig
    };

    var done = this.async();
    var isDone = false;
    // 文件内容列表
    var filesList = [];

    // 遍历源文件，获取文件内容
    this.files.forEach(function(f) {

      // 获取文件内容
      var fileContent = grunt.file.read(f.src);

      // 存储文件信息
      var fileInfo = {
        src: f.src, // 文件原路径
        dest: f.dest, // 文件输出路径
        cssList: [],
        jsList: [],
        source: fileContent, // 源内容
        content: null,
        done: false
      };
      filesList.push(fileInfo);
    });

    console.log('Files:');

    // 循环处理内容
    filesList.forEach(function(fileInfo) {
      // 文件内容
      var fileContent = fileInfo['source'];
      // list
      var cssList = [];
      var jsList = [];

      var mergeCSS = function() {
        var cssMerge = '';
        // 遍历css列表
        cssList.forEach(function(item) {
          cssMerge += item.source;
        });
        fileContent = fileContent.replace(/<\/head>/i, function(str){
          return '<style type="text/css">' +
                  (new CleanCSS().minify(cssMerge)) +
                 '</style></head>';
        });
      };
      var mergeJS = function() {};
      var mergeHTML = function() {};

      // 判断状态
      var checkStatus = function(){

        var allList = cssList.concat(jsList);
        //this file is process done!
        Util.checkAllDone(allList, function(){
          if(fileInfo.done) { return; }
          //合并css
          mergeCSS();
          //合并js
          mergeJS();
          //合并html
          mergeHTML();

          // 写入输出文件
          grunt.file.write(fileInfo.dest, fileContent);
          console.log('  ' + fileInfo.src + '  ->  ' + fileInfo.dest);

          //标记当前页为已经处理完成
          fileInfo.done=true;

          //检查是不是所有的都处理完成了
          Util.checkAllDone(filesList, function(){
            if(isDone){
              return;
            }
            isDone = true;
            done();
          });
        });
      };
      //----- 样式处理 -----
      fileContent = (function(data) {
        // 源数据
        var src = data;

        // 循环处理
        src = src.replace(reg.css, function(tag) {
          // 判断该节点是否需要进行删除
          if(reg.delAttribute.test(tag)) { return '';}

          // 判断该节点是否需要进行忽略，若需要忽略则返回原内容
          if(reg.ignAttribute.test(tag)) { return tag.replace(reg.ignAttribute, '');}

          // 要进行合并的内容
          url = tag.match(reg.cssPath);
          if(url && url[1]) {
            // 外部引用
            cssList.push({
              source: '',
              type: 'link',
              url: url[1],
              done: false,
              fromNet: Util.isUrl(url[1])
            });
          } else {
            // 内部样式
            tag = tag.replace(/<style[^>]*>|<\/style\s*>/ig,'');
            cssList.push({
              source: tag,
              url: '',
              type: 'inline',
              done: true,
              fromNet: false
            })
          }
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
          if(reg.delAttribute.test(tag)) { return '';}

          // 判断该节点是否需要进行忽略
          if(reg.ignAttribute.test(tag)) {
            return tag.replace(reg.ignAttribute, '');
          }

          url = tag.match(reg.jsPath);
          if(url && url[1]) {
            // 外部引用
            jsList.push({
              source: '',
              type: 'link',
              url: url[1],
              done: false,
              fromNet: Util.isUrl(url[1])
            });
          } else {
            // 内部样式
            tag = tag.replace(/<script[^>]*>|<\/script\s*>/ig,'');
            jsList.push({
              source: tag,
              url: '',
              type: 'inline',
              done: true,
              fromNet: false
            })
          }
          return '';

        });

        return src;
      })(fileContent);

      // 获取非内部样式
      cssList.map(function(item){
        var content,
          _url;
        if('link' == item.type){
          //if the absolute path
          if(item.fromNet){
            _url = item.url;
          }else{
            //本地读取
            _url = path.dirname(fileInfo.src)+'/'+item.url;
          }
          //如果从网络中引用的，就远程获取，然后检查结束
          Util.getContent(_url, function(res) {
            item.source = res;
            item.done = true;
            checkStatus();
          });
        }
      });

      // 获取非内部脚本
      jsList.map(function(item){
        var content,
          _url;
        if('link' == item.type){
          //if the absolute path
          if(item.fromNet){
            _url = item.url;
          }else{
            _url = path.dirname(fileInfo.src)+'/'+item.url;
          }
          Util.getContent(_url, function(res){
            item.source = res;
            item.done = true;
            checkStatus();
          });
        }
      });

      // 状态确认
      checkStatus();
    });
    //----- end of this task -----
  });

};
