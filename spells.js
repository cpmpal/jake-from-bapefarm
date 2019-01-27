const request = require('request-promise-native');
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



class Spell {
  constructor(index, name, desc, page, range, components, material, ritual, duration, concentration, casting_time, level, school, classes, subclasses, url) {
    this.index = index;
    this.name = name;
    this.desc = desc;
    this.page = page;
    this.range = range;
    this.components = components;
    this.material = material;
    this.ritual = ritual;
    this.duration = duration;
    this.level = level;
    this.casting_time = casting_time;
    this.concentration = concentration;
    this.school = school.name;
    this.url = url;
    this.classes = classes.map(c => c['name']);
    this.subclasses = subclasses.map(subclass => subclass['name']);
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
    name = name.toLowerCase().split(' ');
    name = name.join('-');
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
      "fallback": givenSpell.desc,
      "color": "<spell school>",
      "author_name": "Book of Books",
      "thumb_url": schoolLookup[givenSpell.school],
      "title": givenSpell.name,
      "title_link": givenSpell.dndSpellLink(),
      "text": givenSpell.desc,
      "fields": [{
          "title": "Level & School",
          "value": givenSpell.levelAndSchool(),
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
          "value": givenSpell.components.join(' '),
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
    spellName = spellName.split(' ');
    spellName.forEach((name, i, namepart) => {
      namepart[i] = capitalize(name);
      //console.log(name)
    });
    spellName = spellName.join('+');
    let spellOptions = {
      uri: 'http://dnd5eapi.co/api/spells/?name=' + spellName,
      json: true
    };
    return spellOptions;
  },

  requestSpell: function(spellName) {
    return new Promise((resolve, reject) => {
      request(this.makeSpellOpts(spellName))
        .then((parsedBody) => {
          // Succeeded
          console.log(parsedBody)
          resolve(parsedBody['results'][0]['url']);
        })
        .catch((err) => {
          // Failed
          console.error(err)
          reject(err)
        })
    })
  },

  getSpellDetails: function(url) {
    return new Promise((resolve, reject) => {
      request({
          uri: url,
          json: true
        })
        .then((spellBlob) => {
          let s = new Spell(
            spellBlob['index'],
            spellBlob['name'],
            spellBlob['desc'],
            spellBlob['page'],
            spellBlob['range'],
            spellBlob['components'],
            spellBlob['material'],
            spellBlob['ritual'],
            spellBlob['duration'],
            spellBlob['concentration'],
            spellBlob['casting_time'],
            spellBlob['level'],
            spellBlob['school'],
            spellBlob['classes'],
            spellBlob['subclasses'],
            spellBlob['url']
          );
          resolve(s);
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        })
    })
  },

  makeSpell: function(spell) {
    return new Promise((resolve, reject) => {
      var mess;
      this.requestSpell(spell)
        .then((uri) => this.getSpellDetails(uri)
          .then((spellObject) => {
            //console.log(spellObject.toString())
            mess = buildMessage(spellObject);
            //console.log(mess);
            resolve(mess);
          })
        ).catch((error) => reject(error));
    })
  }
}
