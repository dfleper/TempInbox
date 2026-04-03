import { getMail } from "../api/loadMail.js";
import { deleteMail } from "../api/deleteMail.js";
import { viewMailModal } from "./viewMailModal.js";
import { showToast } from "./toast.js";

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

let rowsListenerAdded = false;

export function choiceRows() {
  const table = document.getElementById("emailsTableBody");
  const emailListBtn = document.getElementById("emailListBtn");

  if (!table || rowsListenerAdded) return;

  rowsListenerAdded = true;

  table.addEventListener("click", async (event) => {
    const row = event.target.closest("tr");
    if (!row) return;

    const id = row.dataset.id;

    try {
      const mail = await getMail(id);

      viewMailModal(mail, async () => {
        await deleteMail(id);
        row.remove();
        showToast("Email eliminado correctamente.", emailListBtn);
      });
    } catch (error) {
      console.error(error);
      showToast("No se pudo abrir o eliminar el email.", emailListBtn);
    }
  });
}