function rollDice(diceSide) {
  return Math.floor(Math.random() * (diceSide) + 1);
}

function rollADie(dieToRoll) {
  const die = dieToRoll.slice();
  let modifier;
  let modReg = /(\+|\-)\d*/g
  let advantage;
  let advReg = /(\d*)(A|D)/g
  let d;
  let dice;
  let number;
  let dieReg = /(\d*)d(\d*)/g

  var rollArray = [];
  modifier = modReg.exec(die);
  if (modifier === null) modifier = 0;
  else modifier = Number.parseInt(modifier[0]);
  advantage = advReg.exec(die);
  d = dieReg.exec(die);
  if (d === null) return new Error(`cannot read die of type XdY from string ${die}`);
  else {
    dice = Number.parseInt(d[2]);
    if (d[1] !== "") number = Number.parseInt(d[1]);
    else number = 1;
    for (let i = 0; i < number; i++) {
      rollArray.push(rollDice(dice)+modifier);
    }
    if (rollArray.length > 1) {
      var sum = rollArray.reduce((a, b) => a + b, 0);
    }
    // Identify high and low rolls
    if (advantage !== null) {
      let advRoll = []
      let aRoll;
      if (advantage[1] === "") aRoll = 1;
      else aRoll = Number.parseInt(advantage[1]);
      if (advantage[2] === "A") {
        //max
        for (let i = 0; i < aRoll; i++) {
          let max = Math.max(...rollArray)
          while (rollArray.indexOf(max) >= 0) advRoll.push(rollArray.splice(rollArray.indexOf(max), 1));
        }
      } else {
        //min
        for (let i = 0; i < aRoll; i++) {
          let min = Math.min(...rollArray)
          while (rollArray.indexOf(min) >= 0) advRoll.push(rollArray.splice(rollArray.indexOf(min), 1));
        }
      }
      // flag the advantage and disadvantage die
      advRoll.forEach((ele) => {
        rollArray.push('*' + ele + '*');
      })
    }
    rollArray.push(' _Sum: ' + sum + '_');
    console.log(rollArray);
    return rollArray;
  }
}



module.exports = {

  roll: function (dice) {
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
      }
      catch (e) {
        reject(e);
      }
    })
  }
}