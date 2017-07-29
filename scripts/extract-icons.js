'use strict';
/**
 *
 * TO RUN:
 * You need node 7.6+
 * If you're on 7.x run with the flag node --harmony-async-await
 * If you're on 8.x no flag
 *
 */

const fs = require('fs');
const path = require('path');

async function extractFromSrc() {
  console.log('Extracting icons and creating JSON\n\n');

  const dirs = {
    'px-com': 'communication',
    'px-doc': 'document',
    'px-fea': 'feature',
    'px-nav': 'navigation',
    'px-obj': 'object',
    'px-utl': 'utility',
    'px-vis': 'vis'
  };

  const basepath = '../bower_components/px-icon-set/';
  const pre = 'px-icon-set-';
  const html = '.html';
  const outpath = path.join(__dirname, '..', 'data', 'icons.json');

  const fileNames = [];

  Object.entries(dirs).forEach(([key, dir]) => {
    const dirpath = pre + dir + html;
    fileNames.push(dirpath);
  });

  const keywordpath = path.join(__dirname, 'keywords.json');
  const keywords = JSON.parse(await read(keywordpath));
  const keywordKeys = Object.keys(keywords);

  let data = [];

  for (let file of fileNames) {
    const srcpath = path.join(__dirname, basepath, file);
    const src = await read(srcpath);

    const names = getIconNames(src);
    const prefix = getIconPrefix(src)[1];
    const size = getIconSize(src)[1];

    addAllToJSONData(data, names, keywords, dirs[prefix], prefix, size, keywordKeys);
  }

  if(keywordKeys.length) {
    console.log('WARNING: The following icons cant be found but have keywords defined. Were they renamed or removed on purpose?:');
    console.log(keywordKeys.join('\n'));
    console.log('\n');
  }

  await write(outpath, JSON.stringify(data));
  console.log(`\n\ndata/icons.json created successfully`);
};

function getIconNames(src) {
  const re = /<g\s?id="([^"]+)/g;
  let names = [];
  let n;

  while(n = re.exec(src)) {
    names.push(n[1])
  }

  return names;
};

function getIconPrefix(src) {
  const re = /<iron-iconset-svg.+name="([^"]+)/g;
  return re.exec(src);
};

function getIconSize(src) {
  const re = /<iron-iconset-svg.+size="([^"]+)/g;
  return re.exec(src);
};

function addAllToJSONData(data, names, keywords, set, prefix, size, keywordKeys) {
  let missing = [];
  names.forEach(name => {
    const k = keywords[name];

    if(!k) { missing.push(name); }
    else {
      // protecting against the case that we have two icons with the same name
      // this is entirely likely since they might have different prefixes
      // we dont really care to track it, just dont want to error.
      const i = keywordKeys.indexOf(name);
      if(i > -1) { keywordKeys.splice(i,1); }
    }

    addToJSONData(data, name, k, set, prefix, size);
  });

  if(missing.length) {
    console.log(`INFO: The following from ${set} are missing keywords:`);
    console.log(missing.join('\n'));
    console.log('\n');
  }
}

function addToJSONData(data, icon, keywords, set, prefix, size) {
  data.push({
    name: icon,
    keywords: keywords,
    set: set,
    prefix: prefix,
    size: size
  });
};


function read(path) {
  return new Promise(resolve => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) throw err;
      return resolve(data);
    });
  });
};

function write(path, string) {
  return new Promise(resolve => {
    fs.writeFile(path, string, 'utf8', err => {
      if (err) throw err;
      return resolve(path);
    });
  });
};


extractFromSrc();

exports = module.exports = {
  read,
  write
};
