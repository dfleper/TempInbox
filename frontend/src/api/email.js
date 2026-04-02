import { apiBaseUrl } from "../config.js";
import { disableButton } from "../ui/disabledButton.js";
import { enabledButton } from "../ui/enabledButton.js";

export const getEmail = async () => {
  const response = await fetch(`${apiBaseUrl}/inboxes`, {
    method: "GET",
  });

  const monthLimit = response.headers.get("x-ratelimit-remaining-month");
  const monthElement = document.getElementById("monthLimit");
  monthElement.textContent = `Requests restantes este mes: ${monthLimit}`;

  const emailBtn = document.querySelector("#emailBtn");
  const emailListBtn = document.querySelector("#emailListBtn");

  disableButton(emailBtn);
  enabledButton(emailListBtn);

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
};