const request = require('request');
const fs = require('fs');
var imgur = require('imgur');

module.exports = {

  downloadFile: function(fileName, fileURL) {
    return new Promise((resolve, reject) => {
      let fName = fileName.split(' ').join('_');
      var file = fs.createWriteStream(fName);
      request.get(fileURL, {
          'auth': {
            'bearer': process.env.SLACK_USER_TOKEN
          }
        })
        .on('error', (error) => {
          reject(error);
        })
        .pipe(file)
      imgur.uploadFile(fName)
        .then((json) => {
          console.log(`File: ${fileName} uploaded successfully to imgur\nAt link ${json.data.link}`);
          fs.unlink(file)
          console.log(`Deleted file ${fName}`);
          resolve(json.data.link)
        })
        .catch((error) => {
          console.log(`Couldn't upload file to imgur`);
          fs.unlink(file);
          reject(error);
        })
    })
  },

  capitalize: function(string) {
    return string[0].toUpperCase() + string.slice(1);
  }
}
