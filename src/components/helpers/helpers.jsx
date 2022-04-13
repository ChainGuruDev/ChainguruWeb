import React from "react";

import Web3 from "web3";

function formatMoney(amount, decimalCount, decimal = ".", thousands = ",") {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 5 : decimalCount;
    const negativeSign = amount < 0 ? "-" : "";
    let num = parseFloat((amount = Math.abs(Number(amount) || 0)));
    if (decimalCount) {
      if (num > 0) {
        if (num <= 0.09) {
          decimalCount = 5;
          const myNum = num.toString().split(".");
          decimalCount = 0;
          for (var k = 0; k < myNum[1].length; k++) {
            if (myNum[1][k] === "0") {
              decimalCount += 1;
            } else {
              decimalCount += 2;
              k = myNum[1].length;
            }
          }
        } else if (num > 1000) {
          decimalCount = 0;
        } else {
          decimalCount = 2;
        }
      } else {
        if (num > -0.01) {
          decimalCount = 2;
        } else {
          decimalCount = 5;
        }
      }
    }
    let i = parseInt(
      (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
    ).toString();
    let j = i.length > 3 ? i.length % 3 : 0;

    return (
      negativeSign +
      (j ? i.substr(0, j) + thousands : "") +
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
      (decimalCount
        ? decimal +
          Math.abs(amount - i)
            .toFixed(decimalCount)
            .slice(2)
        : "")
    );
  } catch (e) {
    console.log(e);
  }
}

function formatMoneyMCAP(
  amount,
  decimalCount = 2,
  decimal = ".",
  thousands = ","
) {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt(
      (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
    ).toString();
    let j = i.length > 3 ? i.length % 3 : 0;

    return (
      negativeSign +
      (j ? i.substr(0, j) + thousands : "") +
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
      (decimalCount
        ? decimal +
          Math.abs(amount - i)
            .toFixed(decimalCount)
            .slice(2)
        : "")
    );
  } catch (e) {
    console.log(e);
  }
}

function timeDifference(date, date2) {
  var date1 = new Date(date);
  if (!date2) {
    date2 = new Date();
  }
  var diffInMs = parseInt(date2 - date1);
  return timeConversion(diffInMs);
}

function timeConversion(millisec) {
  var seconds = (millisec / 1000).toFixed(1);

  var minutes = (millisec / (1000 * 60)).toFixed(1);

  var hours = (millisec / (1000 * 60 * 60)).toFixed(1);

  var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

  if (seconds < 60) {
    return seconds + " Sec";
  } else if (minutes < 60) {
    return minutes + " Min";
  } else if (hours < 24) {
    if (hours <= 1) {
      return hours + " Hr";
    } else {
      return hours + " Hrs";
    }
  } else {
    if (days <= 1) {
      return days + " Day";
    } else {
      return days + " Days";
    }
  }
}

function formatBigNumbers(value, decimals) {
  let formatted = value / Math.pow(10, decimals);
  return formatted;
}

function getHash(toHash) {
  try {
    const web3 = new Web3();
    let hash = web3.utils.soliditySha3(toHash);
    return hash;
  } catch (err) {
    console.log(err.message);
  }
}

function differenceInPercentage(value1, value2) {
  const percent = ((value2 - value1) / value1) * 100;
  return percent.toFixed(2);
}

function percentage(partialValue, totalValue) {
  return (100 * partialValue) / totalValue;
}

function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    var result =
      a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;

    return result * sortOrder;
  };
}

function getVsSymbol(vsCoin) {
  if (vsCoin) {
    switch (vsCoin) {
      case "usd":
        return "$";
        break;
      case "eur":
        return "€";
        break;
      case "btc":
        return "₿";
        break;
      case "eth":
        return "⧫";
        break;
      default:
        return "$";
        break;
    }
  }
}

const LEVEL_MOD = 0.05;

function convertXpToLevel(xp) {
  let level = Math.floor(LEVEL_MOD * Math.sqrt(xp));
  if (!isNaN(level)) {
    return Math.floor(LEVEL_MOD * Math.sqrt(xp));
  } else {
    return 0;
  }
}

function convertLevelToXp(level) {
  return Math.pow(level / LEVEL_MOD, 2);
}

function getLevel(xp) {
  return convertXpToLevel(xp);
}

function getLevelProgress(xp) {
  const currentLevelXP = convertLevelToXp(getLevel(xp));
  const nextLevelXP = convertLevelToXp(getLevel(xp) + 1);

  const neededXP = nextLevelXP - currentLevelXP;
  const earnedXP = xp - currentLevelXP;

  // return Math.ceil((earnedXP * 100) / neededXP);
  return Math.ceil((earnedXP * 100) / neededXP);
}

function getCurrentAndNextLevelXP(xp) {
  const currentLevelXP = convertLevelToXp(getLevel(xp));
  const nextLevelXP = convertLevelToXp(getLevel(xp) + 1);

  const neededXP = nextLevelXP - xp;
  const earnedXP = xp - currentLevelXP;

  return {
    currentXP: xp,
    currentLevelXP: currentLevelXP,
    nextLevelXP: nextLevelXP,
    earnedXP: earnedXP,
    neededXP: neededXP,
    progress: Math.ceil((earnedXP * 100) / neededXP),
  };
}

function getLongShortSeasonData() {
  const dateNow = new Date();

  const currentSeason =
    dateNow >= new Date(Date.parse("06-Apr-2022 23:59:59".replace(/-/g, " ")))
      ? 2
      : 1;

  const seasonStart = new Date(Date.parse("07-Mar-2022".replace(/-/g, " ")));
  seasonStart.setMonth(seasonStart.getMonth() + currentSeason - 1);
  // seasonStart.setDate(7);
  // seasonStart.setHours(11);
  // seasonStart.setMinutes(0);
  const seasonEnd = new Date(seasonStart);
  seasonEnd.setMonth(seasonStart.getMonth() + 1);
  seasonEnd.setDate(6);
  seasonEnd.setHours(23);
  seasonEnd.setMinutes(59);
  seasonEnd.setSeconds(59);

  const timeRemaining = timeConversion(seasonEnd - dateNow);

  const lsSeasonData = {
    currentSeason,
    seasonStart,
    seasonEnd,
    timeRemaining,
  };
  return lsSeasonData;
}

export {
  formatMoney,
  formatMoneyMCAP,
  timeConversion,
  timeDifference,
  getHash,
  formatBigNumbers,
  differenceInPercentage,
  percentage,
  dynamicSort,
  getVsSymbol,
  getLevel,
  getLevelProgress,
  getCurrentAndNextLevelXP,
  getLongShortSeasonData,
};
