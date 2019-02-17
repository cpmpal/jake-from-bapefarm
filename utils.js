const request = require('request');
const fs = require('fs');
var imgur = require('imgur');

function imgurUpload(fileName){
  imgur.uploadFile(fName)
    .then((json) => {
      console.log(`File: ${fileName} uploaded successfully to imgur\nAt link ${json.data.link}`);
      fs.unlink(file)
      console.log(`Deleted file ${fName}`);
      return(json.data.link)
    })
    .catch((error) => {
      console.log(`Couldn't upload file to imgur`);
      console.log(error)
      fs.unlink(file);
      return(error);
    })
}

module.exports = {

  downloadFile: function(fileName, fileURL) {

    var fName = fileName.split(' ').join('_').toLowerCase();
    var file = fs.createWriteStream(fName);
    var f = request.get(fileURL, {
        'auth': {
          'bearer': process.env.SLACK_USER_TOKEN
        }
      })
      .on('error', (error) => {
        reject(error);
      })
      .pipe(file);
      f.on('finish', () => {
        return imgurUpload()
      })
  },

  capitalize: function(string) {
    return string[0].toUpperCase() + string.slice(1);
  }
}
