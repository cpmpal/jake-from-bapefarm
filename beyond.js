require('dotenv').config();
var request = require('request-promise-native');
var http = require('http');
var access_token;
var login;


request({
  url: "https://id.twitch.tv/oauth2/authorize",
  qs: {
    client_id: process.env.TWITCH_CLIENT_ID,
    redirect_uri: "http://localhost",
    scope: "user_read",
    response_type: 'code',
    force_verify: 'false'
  }
}, function(err, response, body) {
  if (err) console.error(err);
  else {
    console.log(body);
    login = body;
  }
});

http.createServer(function(req, res) {
  if (req.path !== "/") {
    res.write(login);
  } else {
    console.log(req)
    res.setHeader('Location', req)
  }
  res.end();
}).listen(3000)


/*

request({url:"https://id.twitch.tv/oauth2/token",
         method: 'POST',
         qs: {
           client_id : process.env.TWITCH_CLIENT_ID,
           client_secret: process.env.TWITCH_CLIENT_SECRET,
           grant_type: 'authorization_code,
           scope: 'user_read'
         }
}, function(err, response, body){
  if(err) {console.error(err); return;}
  //console.log(response);
  //console.log(JSON.parse(body));
  access_token = JSON.parse(body).access_token;
  console.log(access_token)
})
*/
