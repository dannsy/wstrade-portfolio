export function roundTo(numToRound, numDecimalPlaces = 2) {
  return Number(numToRound.toFixed(numDecimalPlaces));
}

export function accountsMap(accounts) {
  return accounts.map(({ id, account_type, buying_power }) => {
    return { accountId: id, accountType: account_type, availableToTrade: buying_power.amount };
  });
}

export function sumAvailableToTrade(accounts) {
  let sum = 0;
  for (const account of accounts) {
    sum += account.availableToTrade;
  }
  return sum;
}
