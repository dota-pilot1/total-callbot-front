export type TokenProvider = () => string | null;

let provider: TokenProvider = () => {
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
};

export const setTokenProvider = (fn: TokenProvider) => {
  provider = fn;
};

export const getAccessToken = (): string | null => {
  return provider();
};

