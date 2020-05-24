const request = require('request');
var imgur = require('imgur');

module.exports = {

  getUserPicture: function(userInfo) {
      var url = userInfo.profile.image_original
      console.log(url)
      if(url === undefined) url = "";
      url = url.replace('\/', '//');
      return url
  },

  downloadFile: function(fileName, fileURL) {
    return new Promise((resolve, reject) => {
      var fName = fileName.split(' ').join('_').toLowerCase();
      var f = request.get(fileURL, {
        'auth': {
          'bearer': process.env.SLACK_USER_TOKEN
        }
      })
      imgur.setCredentials(process.env.IMGUR_USER, process.env.IMGUR_PASS, process.env.IMGUR__CLIENT_ID)
      imgur._imgurRequest('upload', f)
        .then((json) => {
          console.log(`File: ${fileName} uploaded successfully to imgur\nAt link ${json.data.link}`);
          resolve(json.data)
        })
        .catch((json) => {
          console.log(`Couldn't upload file to imgur`);
          console.log(error)
          reject(error);
        })
    })
  },

  capitalize: function(string) {
    return string[0].toUpperCase() + string.slice(1);
  }
}
