const Jimp = require('jimp');

const jimp = async path => {
  await Jimp.read(path)
    .then(file => {
      return file.cover(250, 250).quality(60).greyscale().write(path);
    })
    .catch(err => {
      console.error(err);
    });
};

module.exports = jimp;
