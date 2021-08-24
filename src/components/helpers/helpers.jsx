import React from "react";

import Web3 from "web3";

function formatMoney(amount, decimalCount, decimal = ".", thousands = ",") {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 5 : decimalCount;
    const negativeSign = amount < 0 ? "-" : "";
    let num = parseFloat((amount = Math.abs(Number(amount) || 0)));
    if (num > 0) {
      if (num < 0.01) {
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

function getHash(toHash) {
  try {
    const web3 = new Web3();
    let hash = web3.utils.soliditySha3(toHash);
    return hash;
  } catch (err) {
    console.log(err.message);
  }
}

export { formatMoney, formatMoneyMCAP, timeConversion, getHash };
