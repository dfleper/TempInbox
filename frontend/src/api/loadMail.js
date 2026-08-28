import { apiBaseUrl } from "../config.js";

export const getMail = async (id) => {
  const encodedId = encodeURIComponent(String(id));
  const response = await fetch(`${apiBaseUrl}/inboxes/messages/${encodedId}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};
