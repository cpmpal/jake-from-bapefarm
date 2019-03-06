require('dotenv').config();
const {
  downloadFile,
  getUserPicture
} = require('./utils.js')
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
const AS_USER = ['clap'];


function getUser(userid) {
  return new Promise((resolve, reject) => {
    web.users.info({
      user: userid
    }).then((res) => {
      resolve(res.user)
    }, (rej) => {
      reject(rej)
    });
  });
}

function willSendAsUser(commandText) {
  var command = commandText.split(' ')[0];
  command = command.slice(1);
  return AS_USER.includes(command);
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
    console.error(exception);
    return new Promise((resolve, reject) => {
      if(exception instanceof TypeError) reject("That is not a command, my friend");
      else reject(exception);
    });
  }
}

function sendAsUser(textToSend, event) {
  const currentU = event.user;
  fweb.chat.delete({
    channel: event.channel,
    ts: event.ts,
    as_user : true
  }).then(
    getUser(currentU).then((user) => {
      console.log(event)
      return fweb.chat.postMessage({
        channel: event.channel,
        text: textToSend,
        as_user: false,
        icon_url: user.profile.image_original,
        username: user.profile.display_name?user.profile.display_name:user.name 
      })
    })
  )
}

//Listen on all public channels for a message event
slackEvents.on('message', (event) => {
  if (!event.hidden) {
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
        // Check to see if in defined commands that given command should be sent as user
        // This is fake on both the slack front, and from our front
        // We need to build in permissions into jake to get permsission to send on behalf of user
        // THEN we need to update this to express, so we have one combined middle wear and can break
        // out the different routes so there's one for just sending as user rather than a catch all
        // which will surely break with enough new features
        if (willSendAsUser(event.text)) sendAsUser(res, event);
        else web.chat.postMessage(message)
      }, rej => {
        web.chat.postEphemeral({
          channel: event.channel,
          user: event.user,
          text: rej
        })
      }).then((status) => console.log(status)).catch(console.error)
    }
  }
});

slackEvents.on('file_shared', (event) => {
  console.log(event);
  if (event.file_id !== undefined) {
    web.files.info({
        file: event.file_id
      })
      .then((response) => {
        console.log(`Found file uploaded: ${response.file.title} ID: ${event.file_id} of type ${response.file.mimetype}`)
        //if it's an image we uplaod to imgur
        if (response.file.mimetype.startsWith('image')) {
          downloadFile(response.file.name, response.file.url_private)
            .then((link) => {
              let chan = response.file.is_public ? response.file.channels[0] : response.file.groups[0];
              web.chat.postMessage({
                  channel: chan,
                  text: `Image uploaded from <@${response.file.user}>\n*${response.file.title}*:\n` + link
                })
                .then(() => {
                  fweb.files.delete({
                      file: event.file_id
                    })
                    .then(() => {
                      console.log("file deleted")
                    })
                    .catch((error) => console.error(error))
                })
                .catch((e) => {
                  console.error("Couldn't post link")
                  console.error(e);
                })
            })
            .catch((error) => console.log(error))
        }
      })
      .catch((error) => console.error(error))
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
    getUser(event.user).then((res) => {
      web.chat.postMessage({
        channel: event.channel,
        text: 'Hello my flesh friend ' + res.profile.display_name
      }).then((status) => {
        console.log('Message sent', status.ts);
      }).catch(console.error);
    }, () => console.error);
  }
});

slackEvents.start(port).then(() => {
  console.log(`server listening on ${port}`);
});
