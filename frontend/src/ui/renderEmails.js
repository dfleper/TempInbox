import { getMail } from "../api/loadMail";
import { viewMailModal } from "./viewMailModal";

const tbody = document.getElementById("emailsTableBody");

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString("es-ES");
}

export function renderEmails(emails) {
  tbody.innerHTML = "";

  emails.forEach((email, index) => {
    const row = document.createElement("tr");
    row.dataset.id = email.id;

    row.innerHTML = `
        <th>${index + 1}</th>
        <td>${email.from}</td>
        <td>${email.subject}</td>
        <td>${formatDate(email.date)}</td>
      `;

    tbody.appendChild(row);
  });
}

export function choiceRows() {
  const table = document.getElementById("emailsTableBody");
  if (!table) return;

  table.addEventListener("click", async (event) => {
    const row = event.target.closest("tr");
    if (!row) return;

    const id = row.dataset.id;

    try {
      const mail = await getMail(id);
      viewMailModal(mail);
      // console.log(mail);
    } catch (error) {
      console.error(error);
    }
  });
}