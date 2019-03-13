# Jake from Bapefarm
 
## About
Jake is a basic node.js implementation of the slack api to make a slack bot. He is hosted on a heroku instance that auto-builds of the main branch. His functions are expanding as documented

## Why
Half of the existence of our slack group is around Dungeons and Dragons and there are not many great apps built for DnD. Specifically we wanted one that could be used to perform look up of the source material in slack to settle disputes and provide quick reference.

Furthermore slack free tier is very restricing. We had most integrations accounted for and I had to remove one not totally necessary integration to fit jake in. Any new features needed from a bot that couldn't be put elsewhere got pushed into Jake. Slack free also has file limits that get very complicated to sort out if users leave and the most common offender of fil sharing is images. That led to building the auto re-upload to imgur function.

More functions are still being developed as of this commit.

### Current Functions
#### User functions:
  All of jake's user functions are called by prepending with a '$' right before so that he can filter only messages that matter. At some point with the express rework we will implement traditional / command calls so as to make Jake more compliant and worthy of his khakis
  * spell: 
  Using the [http://www.dnd5eapi.co](dnd5eapi.co) look up a DnD 5e spell listed in the SRD. The SRD is limited so there are some PHB spells missing, and mostly everything in the expansion books. The command will look to correct capitlization as the 5e API is matches names strictly. Most every preposition use in spells like "dispel evil and good" below will work; however, there is no globbing, so dispel good and evil will return nothing. That is shown below the first example
  ![Example of correctly finding a spell](https://user-images.githubusercontent.com/11484030/54308429-613f4400-45a4-11e9-9496-892afda5956f.PNG)
  ![Spell find failed error](https://user-images.githubusercontent.com/11484030/54310272-5d152580-45a8-11e9-8c91-7e7848bc2ebc.png)
  
  * roll:
  Rolls standard XdY dice. The full command can take multiple dice stringed together with commas, include a flat +/- modifier to add to the total roll, and include a number of Advantage or Disadvtange dice. Jake will provide a sum of all the dice roll per different sides of dice requested. The Adv/Dis essentially marks the N-most High or low dice. For instance a stat roll which is 4d6 and drop the lowest can be done quickly as D4d6 so the the final value for the stat is the sum minus the bolded lowest die.
  
  * sarcasm: 
  Takes the message given by the user and snake case every alpha within it. Pretty much, it's a shorthand for the sponge-gar meme. It's not necessarily a high function utility but it can actually be somewhat helpful for expression
  * clap: add clap emojis where there are spaces in a message
  
    ex. $clap why are you like this
    
    response: :clap: why :clap: are :clap: you :clap: like :clap: this :clap:
#### Auto functions:
  * imgur reupload:
    When an image, specifically listed as MIME/image, is uploaded to slack, Jake downloads it, re-uploads it to imgur, and deletes the original. This is to make the use of uploading files more impactful so we don't waste file space with just reposting screenshots.

