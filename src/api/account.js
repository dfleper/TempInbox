import { token } from "../config.js";

export const getAccount = async () => {
  const response = await fetch("https://api2.freecustom.email/v1/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};