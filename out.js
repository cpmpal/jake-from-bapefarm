require('dotenv').config();
const token = process.env.SLACK_TOKEN;
const userToken = process.env.SLACK_USER_TOKEN;
const web = new WebClient(token);
const fweb = new WebClient(userToken);
const { WebClient } = require('@slack/client');
const AS_USER = ['clap', 'sarcasm'];

// Place holder to keep a definition of which commands are sent as a fake user
function willSendAsUser(commandText) {
  var command = commandText.split(' ')[0];
  command = command.slice(1);
  return AS_USER.includes(command);
}

// Function to construct fake user message
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

// Basic get user info function needed for a few things
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
