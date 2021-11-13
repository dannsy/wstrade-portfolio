const wstradeBaseUrl = 'https://trade-service.wealthsimple.com/';

export const login = (email, password, otp) => {
  return {
    method: 'post',
    url: `${wstradeBaseUrl}auth/login`,
    data: {
      email,
      password,
      otp,
    },
  };
};

export const refresh = (refreshToken) => {
  return {
    method: 'post',
    url: `${wstradeBaseUrl}auth/refresh`,
    data: {
      refresh_token: refreshToken,
    },
  };
};

export const getAccounts = (accessToken) => {
  return {
    method: 'get',
    url: `${wstradeBaseUrl}account/list`,
    headers: { authorization: accessToken },
  };
};

// TODO: try using axios params parameter
export const accountHistory = (time, accountId) => {
  return {
    method: 'get',
    url: `${wstradeBaseUrl}account/history/${time}?account_id=${accountId}`,
  };
};

export const getOrders = () => {
  return {
    method: 'get',
    url: `${wstradeBaseUrl}orders`,
  };
};

export const placeOrder = () => {
  return {
    method: 'post',
    url: `${wstradeBaseUrl}orders`,
  };
};

export const deleteOrder = (orderId) => {
  return {
    method: 'delete',
    url: `${wstradeBaseUrl}orders/${orderId}`,
  };
};

// TODO: support multiple securities
export const getSecurities = (security) => {
  return {
    method: 'get',
    url: `${wstradeBaseUrl}securities?query=${security}`,
  };
};

export const getSecurityById = (securityId) => {
  return {
    method: 'get',
    url: `${wstradeBaseUrl}securities/${securityId}`,
  };
};

export const getPositions = () => {
  return {
    method: 'get',
    url: `${wstradeBaseUrl}account/positions`,
  };
};

export const getActivities = () => {
  return {
    method: 'get',
    url: `${wstradeBaseUrl}account/activities`,
  };
};

// Unused
export const getMe = (accessToken) => {
  return {
    method: 'get',
    url: `${wstradeBaseUrl}me`,
    headers: { authorization: accessToken },
  };
};

// Unused
export const getPerson = (accessToken) => {
  return {
    method: 'get',
    url: `${wstradeBaseUrl}person`,
    headers: { authorization: accessToken },
  };
};

export const getBankAccounts = () => {
  return {
    method: 'get',
    url: `${wstradeBaseUrl}bank-accounts`,
  };
};

export const getDeposits = () => {
  return {
    method: 'get',
    url: `${wstradeBaseUrl}deposits`,
  };
};

export const getForex = () => {
  return {
    method: 'get',
    url: `${wstradeBaseUrl}forex`,
  };
};
