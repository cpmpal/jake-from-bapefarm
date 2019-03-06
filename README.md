# Jake from Bapefarm
 
## About
Jake is a basic node.js implementation of the slack api to make a slack bot. He is hosted on a heroku instance that auto-builds of the main branch. His functions are expanding as documented

## Why
memes and junk

### Current Functions
1. User functions:
  All of jake's functions are called by prepending with a '$' right before so that he can filter only messages that matter
  * spell: using the dnd5eapi.co look up a DnD 5e spell listed in the SRD. Will correct for capitalization but the SRD is limited so there might be some spells missing
    ex: $spell daylight
  * sarcasm: take the message given by the user and snake case every alpha within it. Pretty much, it's a shorthand for the sponge-gar meme
  * clap: add clap emojis where there are spaces in a message
  
    ex. $clap why are you like this
    
    response: :clap: why :clap: are :clap: you :clap: like :clap: this :clap:
2. Auto functions:
  * imgur reupload:
    When an image, specifically listed as MIME/image, is uploaded to slack, Jake downloads it, re-uploads it to imgur, and deletes the original. This is to make the use of uploading files more impactful so we don't waste file space with just reposting screenshots.

