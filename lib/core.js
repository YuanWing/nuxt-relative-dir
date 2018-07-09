'use strict';

const path = require('path');
const fs = require('fs');
const debug = require('debug');
const root = process.cwd();
const generateDir = 'dist';
const defaultDir = 'hybrid/static';
let resourceDir = 'static';

const mkdirDebug = debug('nuxt-rd:mkdir');
const rewriteDebug = debug('nuxt-rd:rewrite');
const resultDebug = debug('nuxt-rd:');
mkdirDebug.color = 2;
rewriteDebug.color = 2;
resultDebug.color = 4;

/**
 * 读取源文件
 * @param {string} sourceDir 源文件所在的目录
 * @param {string} targetDir 替换之后所在的目录
 */
function getFiles(sourceDir, targetDir) {
  fs.readdir(sourceDir, (err, files) => {
    if (err) throw err;
    files.map((file) => {
      const absolutePath = path.join(sourceDir, file);

      fs.stat(absolutePath, (statErr, stats) => {
        if (statErr) throw statErr;
        if (stats.isDirectory()) {
          getFiles(absolutePath, targetDir);
        } else {
          readFile(absolutePath, targetDir);
        }
      });
    });
  });
};

/**
 * 读取文件，修改后再写入
 * 如果是图片，只执行copy操作
 * @param {string} filePath 要读取的文件路径
 * @param {string} targetDir 替换之后所在的目录
 */
function readFile(filePath, targetDir) {
  if (!filePath || !targetDir) return;
  let fileName = path.basename(filePath);
  const extName = path.extname(filePath);
  const dirName = path.dirname(filePath);
  let targetFile = '';
  // .htm 或 .html文件，在命名的时候需要加上目录名
  // 因为nuxt默认的目录内的文件名都是index.html会跟首页冲突
  if (/\.(png|jpe?g|gif|svg|css|js|less|sass|scss)$/.test(extName)) {
    // 资源文件放到 static 目录内
    targetFile = path.join(targetDir, resourceDir, fileName);
  } else {
    const dirArr = dirName.split(path.sep);
    const lastDir = dirArr[dirArr.length - 1];
    // dist是默认的nuxt静态化的一级目录，所以我们的首页不需要加目录名
    if (lastDir !== 'dist') {
      fileName = `${lastDir}_${fileName}`;
    }
    targetFile = path.join(targetDir, fileName);
  }
  if (/\.(png|jpe?g|gif|svg|ico)$/.test(extName)) {
    fs.copyFile(filePath, targetFile, (err) => {
      if (err) throw err;
    });
    return;
  }
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) throw err;
    let targetFileContent = data.replace(/\/_nuxt\/(img\/)?/gim, `./${resourceDir}/`)
                                .replace('img/', '')
                                .replace(/\/(favicon.ico)/gim, './$1');
    fs.writeFile(targetFile, targetFileContent, 'utf8', (err) => {
      if (err) throw err;
      rewriteDebug(targetFile);
    });
  });
}

/**
 * 创建指定的目录, 支持多层级嵌套
 * @param {string | URL} sourceDir 创建的目录名称
 */
function mkdir(sourceDir) {
  const dirName = sourceDir.replace(/\/(.+)\//, '$1');
  const dirs = dirName.split('/');
  const dirObj = {};
  if (dirs.length > 1) resourceDir = dirs[1];
  const dirsPromise = dirs.map((dir, index) => new Promise((resolve, reject) => {
    let currentDir = path.join(root, dir);
    if (dirObj[index - 1]) {
      currentDir = path.join(dirObj[index - 1], dir);
    }
    dirObj[index] = currentDir;
    fs.mkdir(currentDir, (err) => {
      if (err) {
        if (err.code === 'EEXIST') {
          resolve(currentDir);
        } else {
          reject(err);
        }
      } else {
        mkdirDebug(currentDir);
        resolve(currentDir);
      }
    });
  }));

  return Promise.all(dirsPromise);
};

function defaults(dir = defaultDir, sourceDir = generateDir) {
  mkdir(dir)
    .then((data) => {
      const targetDir = data[0];
      const sDir = path.join(root, sourceDir);
      resultDebug('All directories have been created successfully.');
      getFiles(sDir, targetDir);
    }).catch(err => {
      console.log(err);
    });
}


module.exports = defaults;