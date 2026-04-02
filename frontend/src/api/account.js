import { apiBaseUrl } from "../config.js";

export const getAccount = async () => {
  const response = await fetch(`${apiBaseUrl}/me`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};