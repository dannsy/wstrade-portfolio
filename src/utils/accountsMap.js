export default function (accounts) {
  return accounts.map(({ id, account_type }) => {
    return { accountId: id, accountType: account_type };
  });
}
