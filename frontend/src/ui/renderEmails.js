import { getMail } from "../api/loadMail.js";
import { deleteMail } from "../api/deleteMail.js";
import { viewMailModal } from "./viewMailModal.js";
import { showToast } from "./toast.js";

const tbody = document.getElementById("emailsTableBody");

function formatDate(isoDate) {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("es-ES");
}

export function renderEmails(emails) {
  tbody.replaceChildren();

  emails.forEach((email, index) => {
    const row = document.createElement("tr");
    row.dataset.id = email.id ?? "";

    const indexCell = document.createElement("th");
    indexCell.textContent = String(index + 1);

    const fromCell = document.createElement("td");
    fromCell.textContent = email.from ?? "-";

    const subjectCell = document.createElement("td");
    subjectCell.textContent = email.subject ?? "-";

    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(email.date ?? email.createdAt);

    row.append(indexCell, fromCell, subjectCell, dateCell);
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
    if (!row || !row.dataset.id) return;

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
      showToast("No se pudo abrir el email.", emailListBtn);
    }
  });
}
