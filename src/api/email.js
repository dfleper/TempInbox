import { token } from "../config.js";

export const getEmail = async () => {
  const response = await fetch("https://api2.freecustom.email/v1/inboxes", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const monthLimit = response.headers.get("x-ratelimit-remaining-month");
  const monthElement = document.getElementById("monthLimit");
  monthElement.textContent = `Requests restantes este mes: ${monthLimit}`;

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};