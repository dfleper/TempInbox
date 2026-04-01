import { token } from "../config.js";
import { disableButton } from "../ui/disabledButton.js";

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
  const emailBtn = document.querySelector("#emailBtn");
  disableButton(emailBtn);

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};