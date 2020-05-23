const spells = require('./spells.js');
const { species, parties, places } = require('fantastical');

const dndRaces = {
  "Goblin":"goblin",
  "Orc":"orc",
  "Bugbear":"ogre",
  "Firbolg":"cavePerson",
  "Dwarf":"dwarf",
  "Halfling":"halfling",
  "Gnome":"gnome",
  "Elf":"elf",
  "Half-Elf":"highelf",
  "Tabaxi":"fairy",
  "Aarakocra":"highfairy",
  "Goliath":"darkelf",
  "Drow":"drow",
  "Half-Orc":"halfdemon",
  "Tiefling":"demon",
  "Dragonborn":"dragon",
  "Aasimar":"angel",
  "Human":"human"
};

function isAlpha(p) {
  return /[A-Za-z]/.test(p)
}

function rollDice(diceSide) {
  return Math.floor(Math.random() * (diceSide) + 1);
}

function convAdv(roll){
  return Number.parseInt(roll.slice(1).slice(0, -1))
}

function fillArray(value, l){
  let tmp = Array.from({length: l}, (e, i) => value);
  //console.log(tmp);
  return tmp;
}

function halflingDice(rollArr, advType, advNum) {
  let rollSort = rollArr.slice()
  let advRoll = [];
  switch(advType) {
    case "A":
    rollSort.sort((a, b) => b - a)
    break;
    case "D":
    rollSort.sort((a, b) => a - b)
    break;
    case "E":
    let avg = (rollArr.reduce((a, b) => a + b, 0))/rollArr.length;
    rollSort.sort((a, b) => Math.abs(avg - a) - Math.abs(avg - b))
    break;
    default:
    return new Error(`Could not parse advantage type of ${advType}`);
    break;
  }
  advRoll = rollSort.map((e, i) => (i < advNum)? "*"+e+"*":e)
  return advRoll;
}

class Character {

  constructor() {
    let races = Object.keys(dndRaces);
    let raceRoll = rollDice(18)-1;
    //console.log(raceRoll)
    //console.log(dndRaces[races[raceRoll]])
    this.r = races[raceRoll];
    if (dndRaces[races[raceRoll]] === "human") this.name = species[dndRaces[races[raceRoll]]]({ allowMultipleNames: true });
    else if (['goblin', 'orc', 'ogre', 'demon'].includes(dndRaces[races[raceRoll]])) this.name = species[dndRaces[races[raceRoll]]]();
    else this.name = species[dndRaces[races[raceRoll]]](rollDice(2)==1?'male':'female');

    let ps = ['militaryUnit', 'mysticOrder', 'guild'];
    //console.log(ps[rollDice(3)-1])
    this.party = parties[ps[rollDice(3)-1]]()
    this.tavern = places.tavern();
  }

  toString(){
    return "You meet " + this.name + ", the " + this.r + ", of The " + this.party + " in the corner of The " + this.tavern + "\n"
  }
}

function makeAChar(){

}

function rollADie(dieToRoll) {
  var rollArray = [];
  //console.log(dieToRoll)
  //console.log(typeof(dieToRoll))
  const die = dieToRoll.slice();
  let diceReg = /((\+|\-?)((\d*)([ADE]))?(\d*)(d)(\d*))|((\+|\-)([0-9]+)d{0})/g
  let advantage;
  let ad;
  let d;
  let dice;
  let number;

  if(dieToRoll !== "" && (dieToRoll.includes("d") || dieToRoll.includes('D'))) {

    /*
    1 - Full Dice string
    2 - Preceding plus on dice
    3 - advantage/disadvantage string
    4 - adv/dis Number
    5 - adv/dis type
    6 - Number of die
    7 - d for dice
    8 - Dice sides
    9 - Modifier string
    10 - Modifier sign
    11 - Modifier number
    */

    d = Array.from(die.matchAll(diceReg))

    for (const dieMatch of d){
      //console.log(rollArray);
      //Was there a successful match?
      if (dieMatch === null || dieMatch === undefined) return new Error(`cannot read die of type XdY from string ${die}`);
      else {
        //Check if first of compound roll
        if(dieMatch[2] !== "" && rollArray.length < 1) return new Error(`Cannot roll dice. Unexepected modifier ${dieMatch[2]} before any roll performed`);
        else {
          //We have a good first roll time to cycle through each

          //Perform modifier calc
          if(dieMatch[11] !== undefined){
            let mod = Number.parseInt(dieMatch[9])
            rollArray.forEach((roll, ind) => {
              if(!Number.isInteger(roll)) rollArray[ind] = "*"+(convAdv(roll)+mod)+"*"
              else rollArray[ind] = roll+mod
            })
          }

          //Perform a dice roll
          if(dieMatch[1] !== undefined) {
            dice = dieMatch[6]!==""?Number.parseInt(dieMatch[6]):1
            if (dice > 1000) return new Error(`Cannot roll ${number} number of die for safety. Please try a number of die less than 1000`);
            let initRoll = Array.from({length: dice}, (e, i) => rollDice(Number.parseInt(dieMatch[8])));
            if(dieMatch[3] !== undefined){
              advantage = true;
              ad = dieMatch[4]!==""?Number.parseInt(dieMatch[4]):1
              initRoll = halflingDice(initRoll, dieMatch[5], ad)
            }
            console.log(initRoll);
            if(dieMatch[2] !== ""){
              let innerSum = initRoll.reduce((a, b) => a + b, 0)
              switch (dieMatch[2]) {
                case "+":
                rollArray.forEach((roll, ind) => {
                  if(!Number.isInteger(roll)) rollArray[ind] = "*"+(convAdv(roll)+innerSum)+"*"
                  else rollArray[ind] = roll+innerSum
                })
                break;
                case "-":
                rollArray.forEach((roll, ind) => {
                  if(!Number.isInteger(roll)) rollArray[ind] = "*"+(convAdv(roll)-innerSum)+"*"
                  else rollArray[ind] = roll-innerSum
                })
                break;
                default:
                rollArray.forEach((roll, ind) => {
                  if(!Number.isInteger(roll)) rollArray[ind] = "*"+(convAdv(roll)+innerSum)+"*"
                  else rollArray[ind] = roll+innerSum
                })
                break;
              }
            } else {
              rollArray.push(...initRoll)
            }

            // Keeping it for revert
            // Calculates compound dice rolls two dimensionally. All subsequent dice rolls get added to the previous rolls indivdually, rather than being reduced
            // This tends to not be what people want for table tops
            // if(dieMatch[2] !== ""){
            //   switch (dieMatch[2]) {
            //     case "+":
            //       rollArray = rollArray.flatMap( (r) =>
            //         (!Number.isInteger(r))? fillArray(convAdv(r), dice).map((e, i) => "*"+(e+(Number.isInteger(initRoll[i])?initRoll[i]:convAdv(initRoll[i]))+"*")) :
            //         fillArray(r, dice).map((e, i) => Number.isInteger(initRoll[i])?e+initRoll[i]:(e+convAdv(initRoll[i])))
            //       )
            //       break;
            //     case "-":
            //       rollArray = rollArray.flatMap( (r) =>
            //         (!Number.isInteger(r))? fillArray(convAdv(r), dice).map((e, i) => "*"+(e-(Number.isInteger(initRoll[i])?initRoll[i]:convAdv(initRoll[i]))+"*")) :
            //         fillArray(r, dice).map((e, i) => Number.isInteger(initRoll[i])?e-initRoll[i]:(e-convAdv(initRoll[i])))
            //       )
            //     break;
            //     default:
            //       rollArray = rollArray.flatMap( (r) =>
            //         (!Number.isInteger(r))? fillArray(convAdv(r), dice).map((e, i) => "*"+(e+(Number.isInteger(initRoll[i])?initRoll[i]:convAdv(initRoll[i]))+"*")) :
            //         fillArray(r, dice).map((e, i) => Number.isInteger(initRoll[i])?e+initRoll[i]:(e+convAdv(initRoll[i])))
            //       )
            //     break;
            //   }
            // } else {
            //   rollArray.push(...initRoll)
            // }
          }
        }
      }
    }
    //Sort array
    if(advantage) {
      rollArray.sort(function(a, b) {
        if (Number.isInteger(a) && Number.isInteger(b)) return b - a
        else if (!Number.isInteger(a) && !Number.isInteger(b)) return convAdv(b) - convAdv(a)
        else if (!Number.isInteger(a) && Number.isInteger(b)) return -1
        else if (Number.isInteger(a) && !Number.isInteger(b)) return 1
        else return 0
      })
    }
  } else {
    advantage = false;
    rollArray.push(rollDice(20))
  }

  let sum;
  if(advantage) sum = rollArray.filter((e) => !Number.isInteger(e)).reduce((a, b) => a + convAdv(b), 0)
  else sum = rollArray.reduce((a, b) => a + b, 0)

  rollArray.push(' _Sum: ' + sum + '_');
  console.log(rollArray);
  return rollArray;
}


module.exports = {

  clap: function(claps) {
    return new Promise((resolve, reject) => {
      if(claps.length == 0) reject("Give :clap: me :clap: something :clap: to :clap: clap :clap: back");
      else {
        var clap = claps.join(' :clap: ');
        clap = ":clap: "+clap+" :clap:";
        resolve(clap);
      }
    })
  },

  sarcasm: function(likeTheText) {
    return new Promise((resolve, reject) => {
      var tExT = likeTheText.join(' ');
      var result = "";
      if(!isAlpha(tExT)) reject ("I cAn'T sArCaStIfY tHaT, nErD");
      else {
        var flip = (tExT[0] === tExT[0].toUpperCase());
        for (var i in tExT) {
          if(isAlpha(tExT[i])) {
            if(flip) result += tExT[i].toLowerCase();
            else result += tExT[i].toUpperCase();
            flip = !flip
          }
          else {
            result += tExT[i];
          }
        }
        resolve(result);
      }
    })
  },

  roll: function(dice) {
    return new Promise((resolve, reject) => {
      let rolls = [];
      try {
        const dieMath = dice.join(' ').split(',');
        dieMath.forEach((r) => {
          rolls.push(rollADie(r));
        });
        console.log(rolls);
        let finalString = "";
        rolls.forEach((arr) => {

          finalString = finalString.concat('[' + arr + '], ');
        });
        finalString = finalString.slice(0, -2);
        console.log(finalString);
        resolve(finalString);
      } catch (e) {
        reject(e);
      }
    })
  },

  char: function() {
    return new Promise((resolve, reject) => {
      let newChar = new Character();
      let output = newChar.toString()+"=====================================================\n"
      for (let k = 1; k <= 6; k++){
        switch(k){
          case 1:
          //console.log(rollADie('3A4d6').slice(-1))
          output+=" STR:"+rollADie('3A4d6').slice(-1)[0].replace(/_Sum: (\d+)_/g, '$1')
          break;
          case 2:
          output+=" DEX:"+rollADie('3A4d6').slice(-1)[0].replace(/_Sum: (\d+)_/g, '$1')
          break;
          case 3:
          output+=" CON:"+rollADie('3A4d6').slice(-1)[0].replace(/_Sum: (\d+)_/g, '$1')
          break;
          case 4:
          output+=" INT:"+rollADie('3A4d6').slice(-1)[0].replace(/_Sum: (\d+)_/g, '$1')
          break;
          case 5:
          output+=" WIS:"+rollADie('3A4d6').slice(-1)[0].replace(/_Sum: (\d+)_/g, '$1')
          break;
          case 6:
          output+=" CHA:"+rollADie('3A4d6').slice(-1)[0].replace(/_Sum: (\d+)_/g, '$1')
          break;
        }
      }
      resolve(output);
    })
  },

  roulette: function() {
    return new Promise((resolve, reject) => {
      let finalDecision = rollDice(6);
      if (finalDecision === 6) resolve(":gun_flipped: ------ :skull_and_crossbones::boom: ");
      else resolve("You live...for now");
    })
  },

  spell: function(spellName) {
    console.log(spellName)

    return new Promise((resolve, reject) => {
      spells.makeSpell(spellName.join(' ')).then((s) => {
        console.log(s);
        resolve(s)
      }).catch((e) => reject(e));
    })
  }

  // testing purposes
  ,
  rollADie: rollADie

}

require('make-runnable');
