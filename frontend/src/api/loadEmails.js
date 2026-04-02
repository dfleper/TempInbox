import { apiBaseUrl } from "../config.js";

export const getEmailList = async () => {
  const response = await fetch(`${apiBaseUrl}/inboxes/messages`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};