# Jake from Bapefarm
 
## About
Jake is a basic node.js implementation of the slack api to make a slack bot. He is hosted on a heroku instance that auto-builds of the main branch. His functions are expanding as documented

## Why
Half of the existence of our slack group is around Dungeons and Dragons and there are not many great apps built for DnD. Specifically we wanted one that could be used to perform look up of the source material in slack to settle disputes and provide quick reference.

Furthermore slack free tier is very restricing. We had most integrations accounted for and I had to remove one not totally necessary integration to fit jake in. Any new features needed from a bot that couldn't be put elsewhere got pushed into Jake. Slack free also has file limits that get very complicated to sort out if users leave and the most common offender of fil sharing is images. That led to building the auto re-upload to imgur function.

More functions are still being developed as of this commit.

## Current Functions
### User functions:
  All of jake's user functions are called by prepending with a '$' right before so that he can filter only messages that matter. At some point with the express rework we will implement traditional / command calls so as to make Jake more compliant and worthy of his khakis
  <ul>
 <li><b>spell</b>:</li>
 <p>    Using the <a href="http://www.dnd5eapi.co">dnd5eapi.co</a> look up a DnD 5e spell listed in the SRD. The SRD is limited so there are some PHB spells missing, and mostly everything in the expansion books. The command will look to correct capitlization as the 5e API is matches names strictly. Most every preposition use in spells like "dispel evil and good" below will work; however, there is no globbing, so dispel good and evil will return nothing. That is shown below the first example:</p>
  
  <p align="center">
  <img src="https://user-images.githubusercontent.com/11484030/54308429-613f4400-45a4-11e9-9496-892afda5956f.PNG">
  </p>
  
  <p align="center">
  <img src="https://user-images.githubusercontent.com/11484030/54310272-5d152580-45a8-11e9-8c91-7e7848bc2ebc.png">
  </p>
  
  <li><b>roll</b>:</li>
  <p>    Rolls standard XdY dice. The full command can take multiple dice stringed together with commas, include a flat +/- modifier to add to the total roll, and include a number of Advantage or Disadvtange dice. Jake will provide a sum of all the dice roll per different sides of dice requested:</p>
  
  <p align="center"><img src="https://user-images.githubusercontent.com/11484030/54382251-ffdfa980-4665-11e9-8b47-2f8d3d9e0818.PNG"></p>
  
  <p>    As you can see if a user does not specify an amount of dice to be rolled it will default to rolling a singular dice. Furthermore, Jake will sum up the total for all dice specified of a single roll. This comes in handing when adding modifier in Dnd. Below is an example:</p>
  <p align="center"><img src="https://user-images.githubusercontent.com/11484030/54382248-ffdfa980-4665-11e9-8705-11732f19b32a.PNG"></p>
  
  <p>    Here we can see Jake both rolling multiple rolls and adding, or subtracting, a modifier from the total sum. Jake will not modify the rolls directly as it helps keep the rolling logic faster and makes it easier for users to implement rolls. A modifier can be any integer prepended with either a plus or minus sign. Note that the regex used requires no spaces between the modifier and the dice roll.
  Lastly we have advantage and disadvantage. The Adv/Dis essentially marks the N-most High or low dice. For instance a stat roll which is 4d6 and drop the lowest can be done quickly as D4d6 so the the final value for the stat is the sum minus the bolded lowest die. For traditional advantage and disadvantage, where one picks the higher or lower of two d20, the roll would be either A2d20 or D2d20. Similar to the number of dice the user doesn't need to enter a number for a single advantage or disadvantage:</p>
  <p align="center"><img src="https://user-images.githubusercontent.com/11484030/54382250-ffdfa980-4665-11e9-8996-9831ab83bf58.PNG"></p>
  
  As mentioned, a number of advantage or disadvantage can be specified. The use case for this is slim but it is nice to not the max or min graphically without having to look. It could potentially have some advantages in DnD but mostly for edge cases:
  <p align="center"><img src="https://user-images.githubusercontent.com/11484030/54382249-ffdfa980-4665-11e9-824c-a163d442d6b9.PNG"></p>
  
  <li><b>sarcasm</b>:</li>
  <p>    Takes the message given by the user and snake case every alpha within it. Pretty much, it's a shorthand for the sponge-gar meme. It's not necessarily a high function utility but it can actually be somewhat helpful for expression. Once the user types out the command Jake creates the alternate capital string, and posts an message appearing as the other user with the APP badge, and deletes the original post. At some pending update we will get users tokens to send messages on their behalf directly but this is a very functional workaround for now:</p>
  <p align="center"><img src="https://user-images.githubusercontent.com/11484030/54308428-613f4400-45a4-11e9-8044-ed51b8c8003d.PNG"></p>
  
  
  <li><b>clap</b>:</li>
  <p>    This adds clap emojis in the spaces of a text string. This does the same as the sarcasm command for sending the message. Once the text is created it posts the message in the guise of the user, and deletes the original message. Both of these commands are built this way so as to not clutter slack with too many extra posts</p>
  
  <p align="center"><img src="https://user-images.githubusercontent.com/11484030/54308434-613f4400-45a4-11e9-84b0-acfbf607a000.PNG"></p>
  
  <li><b>Mentions (@Jake)</b>:</li>  
    <p>    This one is less of a function but is useful to check status. If a user mentions Jake in post he responds back with a hi saying their display or username:</p>
    <p align="center"><img src="https://user-images.githubusercontent.com/11484030/54308433-613f4400-45a4-11e9-880a-3700b1020667.PNG"></p>
</ul>    

---

### Auto functions:

<ul>  
  <li><b>Imgur Re-Upload</b>:</li>
  Normally when we want to share files to slack, images especially we upload the files directly to slack:
 <p align="center"><img src="https://user-images.githubusercontent.com/11484030/54308431-613f4400-45a4-11e9-8c74-2fbe4019ee24.PNG"></p>
  However on the free tier of slack with tens of users this can get very large very quick. Additionally if users leave and they haven't cleared their files it's quite difficult to clean up. Jake has an automatic function that listens for when users upload files. If they are matched a MIME/image type file, Jake downloads it, uploads it to imgur, posts a link to the imgur image and deletes the original:
 <p align="center"><img src="https://user-images.githubusercontent.com/11484030/54308432-613f4400-45a4-11e9-8bfc-4e2530aeb297.PNG"></p>
 Jake will only delete the image if both the imgur upload and the link post execute succesfully. If something goes wrong it fails silently to the logs and not to the user. Jake currently can only listen in channels he's in. In a pending update we will get user permissions and more that will enable him to travel more across channels and access more files. Most importantly of all, he also posts a delete link to the imgur photo only visible to the poster. In case the image is uploaded in error or something to that effect it can be taken down from imgur going forward and mitigates any damage that could be caused. Ideally we would also use the sharePublicURL call but we need user tokens for that despite it not being specified. Admins also don't have permission to share other user's files in groups and IMs.
</ul>
