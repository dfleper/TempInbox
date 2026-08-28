import { apiBaseUrl } from "../config.js";

export const deleteMail = async (id) => {
  const encodedId = encodeURIComponent(String(id));
  const response = await fetch(`${apiBaseUrl}/inboxes/messages/${encodedId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
