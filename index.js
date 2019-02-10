require('dotenv').config();
var imgur = require('imgur');
const commands = require('./commands.js');
const {
  createEventAdapter
} = require('@slack/events-api');
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const {
  WebClient
} = require('@slack/client');
const token = process.env.SLACK_TOKEN;
const userToken = process.env.SLACK_USER_TOKEN;
const port = process.env.PORT || 3000
const web = new WebClient(token);
const fweb = new WebClient(userToken);

function getUsersName(userid) {
  return new Promise((resolve, reject) => {
    web.users.info({
      user: userid
    }).then((res) => {
      resolve(res.user.name)
    }, (rej) => {
      reject(rej)
    });
  });
}

function getPublicUrl(fileID, fileName) {
  return new Promise((resolve, reject) => {
    fweb.files.sharedPublicURL({
        file: fileID
      }).then((respose) => {
        let u = respose.file.permalink_public.replace('\\/', '/');
        console.log(u.slice(23));
        u = u.slice(24);
        let secret = u.slice(-10);
        u = u.slice(0, -11);
        fileName = fileName.toLowerCase();
        u = "https://files.slack.com/files-pri/" + u + '/' + fileName + '?pub_secret=' + secret;
        console.log(`Permalink generated for ${fileID}, ${u}`)
        resolve(u)
      })
      .catch((error) => {
        console.error(error);
        reject(new Error(error));
      })

  })
}


/*
 *
 * We get in the command with the command prefix.
 * We strip the arugments and the command. We then
 * route into the appropriate command by calling it directly
 * from the commands module that is exported
 *
 * If the command doesn't exist we throw an exception and
 * tell the user. We post the exact error in the log in case
 * something else went wrong because ES6 is not thorough enough
 * to now if it definitively has the right error message versus
 * just breaking the bot/app
 */
function commandRouter(command) {
  let response;
  let com = command.split(' ');
  comm = com[0].substring(1);
  console.log(`Command received ${comm}. Filtering to appropriate promise`);
  try {
    console.log(commands[comm]);
    console.log(com);
    response = commands[comm](com.slice(1))
    return (response);
  } catch (exception) {
    console.error(e);
    return new Error();
  }
}

//Listen on all public channels for an event
slackEvents.on('message', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
  if (event.text === undefined) {
    console.log(`event subtype: ${event.subtype} hidden: ${event.hidden}`);
  } else if (event.text.startsWith('$')) {
    commandRouter(event.text).then((res) => {
      console.log(res)
      let message;
      if (typeof(res) === "string") {
        message = {
          channel: event.channel,
          text: res
        }
      } else {
        message = res;
        message.channel = event.channel;
        console.log(message);
      }
      web.chat.postMessage(message)
    }, rej => {
      web.chat.postEphemeral({
        channel: event.channel,
        user: event.user,
        text: rej
      })
    }).then((status) => console.log(status.ts)).catch(console.error)
  }
});

slackEvents.on('file_created', (event) => {
  console.log(event);
  if (event.file_id !== undefined) {
    web.files.info({
      file: event.file_id
    }).then((response) => {
      console.log(`Found file uploaded: ${response.file.title} ID: ${event.file_id} of type ${response.file.mimetype}`)
      //if it's an image we uplaod to imgur
      if (response.file.mimetype.startsWith('image')) {
        console.log(response);
        getPublicUrl(event.file_id, response.file.name).then((url) => {
          console.log(`Reuploading from ${url} to imgur`)
          imgur.uploadUrl(url).then((r) => {
            //console.log(r)
            let chan  = response.file.is_public?response.file.channels[0]:response.file.groups[0];
            web.chat.postMessage({
              channel: chan,
              text: r.data.link
            }).then(() => {
              fweb.files.delete({
                file: event.file_id
              }).then(() => {
                console.log("file deleted")
              }).catch((error) => console.error(error))
            }).catch((e) => {
              console.error("Couldn't post link")
              console.error(e);

            })
          }).catch((error) => console.log(error))
        }).catch((error) => console.error(error))
      }
    }).catch((error) => {
      console.error(error)
    })
  }
})


// Place holder testing to say hello and memes
slackEvents.on('app_mention', (event) => {
  if (event.text.includes('wearing')) {
    web.chat.postMessage({
      channel: event.channel,
      text: ':b:hakis'
    }).then((status) => console.log(status.ts)).catch(console.error);
  } else {
    getUsersName(event.user).then((res) => {
      web.chat.postMessage({
        channel: event.channel,
        text: 'Hello my flesh friend ' + res
      }).then((status) => {
        console.log('Message sent', status.ts);
      }).catch(console.error);
    }, () => console.error);
  }
});

slackEvents.start(port).then(() => {
  console.log(`server listening on ${port}`);
});
