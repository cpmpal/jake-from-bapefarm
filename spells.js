var request = require('request-promise-native');
var cheerio = require('cheerio')
const utils = require('./utils.js');
var capitalize = utils.capitalize;

const schoolLookup = {
  'Necromancy': "https://media-waterdeep.cursecdn.com/attachments/2/720/necromancy.png",
  'Evocation': "https://media-waterdeep.cursecdn.com/attachments/2/703/evocation.png",
  'Abjuration': "https://media-waterdeep.cursecdn.com/attachments/2/707/abjuration.png",
  'Conjuration': "https://media-waterdeep.cursecdn.com/attachments/2/708/conjuration.png",
  'Transmutation': "https://media-waterdeep.cursecdn.com/attachments/2/722/transmutation.png",
  'Enchantment': "https://media-waterdeep.cursecdn.com/attachments/2/702/enchantment.png",
  'Divination': "https://media-waterdeep.cursecdn.com/attachments/2/709/divination.png",
  'Illusion': "https://media-waterdeep.cursecdn.com/attachments/2/704/illusion.png"
}

const schoolColor = {
  'Necromancy': "#000000",
  'Evocation': "#B80808",
  'Abjuration': "#157ADA",
  'Conjuration': "#DED411",
  'Transmutation': "#CA9012",
  'Enchantment': "#E540CC",
  'Divination': "#38DFDF",
  'Illusion': "#B662E7"
}

const MAIN_CLASS = [
  'Artificer',
  'Bard',
  'Barbarian',
  'Blood Hunter',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard'
]

class Spell {
  constructor(index, name, desc, page, range, components, material, ritual, duration, concentration, casting_time, level, school, classes, subclasses, url) {
    this.index = index;
    this.name = name;
    this.desc = desc;
    this.page = page;
    this.range = range;
    this.components = components.replace('*','');
    this.material = material.substring(material.indexOf('(')+1,material.indexOf(')'));
    this.ritual = ritual;
    this.duration = duration;
    this.level = level;
    this.casting_time = casting_time;
    this.concentration = concentration;
    this.school = school;
    this.url = this.dndSpellLink();
    this.classes = classes.filter(c => MAIN_CLASS.includes(c));
    this.subclasses = classes.filter(c => !MAIN_CLASS.includes(c));
    //this.subclasses = subclasses.map(subclass => subclass['name']);
  }

  isRitual() {
    return this.ritual === 'yes'
  }
  isConcentration() {
    return this.ritual === 'yes'
  }
  hasSomatic() {
    return this.components.includes("S")
  }
  hasVerbal() {
    return this.components.includes("V")
  }
  hasMaterial() {
    return this.components.includes("M")
  }

  toString() {
    return (`Name: ${this.name} \n\n Level: ${this.level} \n Description: \n ${this.desc}`);
  }

  dndSpellLink(){
    let name = this.name;
    name = name.toLowerCase().replace("'","").replace('\\'," ").replace('/'," ").split(' ').join('-');
    return "https://www.dndbeyond.com/spells/"+name
  }

  levelAndSchool(){
    let val = "";
    let digit = ("" + this.level);
    digit = digit[0];
    switch (digit) {
      case '0':
        val += 'Cantrip '
        break;
      case '1':
        val += digit + "st "
        break;
      case '2':
        val += digit + "nd "
        break;
      case '3':
        val += digit + "rd "
        break;
      default:
        val += digit + "th "
        break;
    }
    val += "Level " + this.school;
    return val
  }

  getClasses(){
    let val = ""
    val += "Classes: "
    val += this.classes.join(', ');
    val += "\nSubClasses: "
    val += this.subclasses.join(', ');
    return val;
  }
}



function buildMessage(givenSpell) {
  var attachment = {
    "attachments": [{
      "fallback": givenSpell.desc[0],
      "color": schoolColor[givenSpell.school],
      "author_name": "Book of Books",
      "thumb_url": schoolLookup[givenSpell.school],
      "title": givenSpell.name,
      "title_link": givenSpell.dndSpellLink(),
      "text": givenSpell.desc.join('\n'),
      "fields": [{
          "title": "Level & School",
          "value": givenSpell.level +" Lvl "+givenSpell.school,
          "short": true
        },
        {
          "title": "Range",
          "value": givenSpell.range,
          "short": true
        },
        {
          "title": "Duration",
          "value": givenSpell.duration,
          "short": true
        },
        {
          "title": "Casting Time",
          "value": givenSpell.casting_time,
          "short": true
        },
        {
          "title": "Components",
          "value": givenSpell.components,
          "short": true
        },
        {
          "title": "Ritual",
          "value": givenSpell.ritual,
          "short": true
        },
        {
          "title": "Material",
          "value": givenSpell.material !== "" ? givenSpell.material : "None",
          "short": false
        },
        {
          "title": "Classes",
          "value": givenSpell.getClasses(),
          "short": false
        }
      ],
      "footer": givenSpell.page,
      "footer_icon": schoolLookup[givenSpell.school]
    }]
  }
  return attachment;
}





module.exports = {
  makeSpellOpts: function(spellName) {
    var sname = spellName.toLowerCase().replace("'","").replace('\\'," ").replace('/'," ").split(' ').join('-')
    /*
    let dontCapitalize = ['of', 'with', 'and', 'from', 'without', 'the']
    spellName = spellName.split(' ');
    spellName.forEach((name, i, namepart) => {
      if (!dontCapitalize.includes(name)) namepart[i] = capitalize(name);
      //console.log(name)
    });
    spellName = spellName.join('+');
    */
    let spellOptions = {
      //uri: 'http://dnd5eapi.co/api/spells/?name=' + spellName,
      uri: 'https://www.dndbeyond.com/spells/'+ sname,
      transform: (body) => cheerio.load(body)
    };
    return spellOptions;
  },

  requestSpell: function(spellName) {
    return new Promise((resolve, reject) => {
      request(this.makeSpellOpts(spellName))
        .then(($) => {
          // Check if non-SRD
          //console.log($('head > title').text())
          if($('head > title').text().includes('Marketplace')) reject("Sorry, I haven't paid for that book yet"); 
          // is SRD
          else resolve(this.getSpellDetails($));
        }, (failed) => reject("A little too much guano and ruby dust in the spellbook. Try incanting again"))
        .catch((err) => {
          // Failed
          console.error(err)
          reject(err)
        })
    })
  },

  getSpellDetails: function($) {
    //console.log($)
    let s = new Spell(
      0, //INDEX
      $('.page-title').text().trim(), //NAME
      $('.more-info-content').text().trim().split(/\n/).map(phrase => phrase.trim()).filter(phrase => phrase !== "" && !phrase.startsWith('*')), //DESC
      $('.source.spell-source').text().trim().replace(/\W{3,}/g, ' '), //PAGE
      ($('.ddb-statblock-item-range-area > .ddb-statblock-item-value').contents().toArray()[0].nodeValue.trim())+" "+$('.aoe-size').contents().toArray().map(n => 
        n.nodeType !== 1? n.nodeValue : n.attribs.class.slice(n.attribs.class.lastIndexOf('-')+1)).join(""), //RANGE
      $('.component-asterisks').text(), //COMPONENTS
      $('.components-blurb').text(), //MATERIAL
      $('.ddb-statblock-item-casting-time > .ddb-statblock-item-value')[0].childNodes.length > 1? 'yes':'no', //RITUAL
      $('.ddb-statblock-item-duration > .ddb-statblock-item-value').text().trim(), // DURATION
      $('.ddb-statblock-item-duration > .ddb-statblock-item-value')[0].childNodes.length > 1? 'yes':'no', //CONCENTRATION
      $('.ddb-statblock-item-casting-time > .ddb-statblock-item-value').text().trim(), //CASTING TIME
      $('.ddb-statblock-item-level > .ddb-statblock-item-value').text().trim(), //LEVEL
      $('.ddb-statblock-item-school > .ddb-statblock-item-value').text().trim(), //SCHOOL
      $('.tags.available-for').children().toArray().map(x => x.children[0].data), //CLASSES
      "", //SUBCLASSES
      "" //URL
    )
    return s
  },

  makeSpell: function(spell) {
    return new Promise((resolve, reject) => {
      var mess;
      this.requestSpell(spell)
        .then((spell) => {
          mess = buildMessage(spell)
          resolve(mess)
        }),
        (fail) => reject(fail)
        }).catch((error) => reject(error));
  }
}

module.exports.makeSpell('transmute rock').then((spell) => console.log(spell))
