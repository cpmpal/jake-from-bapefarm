require('dotenv').config();
const commands = require('./commands.js');
const {
  createEventAdapter
} = require('@slack/events-api');
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const {
  WebClient
} = require('@slack/client');
const token = process.env.SLACK_TOKEN;
const port = process.env.PORT || 3000
const web = new WebClient(token);

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
  if(event.text === undefined) console.log("Error: undefined received. That wasn't supposed to happen");
  if (event.text.startsWith('$')) {
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
      }).then((status) => console.log(status.ts)).catch(console.error)
    }});


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
