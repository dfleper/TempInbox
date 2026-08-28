import { escapeHtml } from "./escapeHtml.js";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("es-ES");
};

export const viewMailModal = (email, onDelete) => {
  const modal = document.createElement("dialog");
  modal.id = "mailModal";
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-box max-w-3xl">
      <h2 class="text-lg font-bold mb-4">Detalle del email</h2>

      <p><strong>From:</strong> ${escapeHtml(email?.from ?? "-")}</p>
      <p><strong>To:</strong> ${escapeHtml(email?.to ?? "-")}</p>
      <p><strong>Date:</strong> ${escapeHtml(formatDate(email?.date ?? email?.createdAt))}</p>
      <p><strong>Subject:</strong> ${escapeHtml(email?.subject ?? "-")}</p>

      <h3 class="font-semibold mt-4">Texto</h3>
      <div class="bg-base-200 p-3 rounded-lg whitespace-pre-wrap">${escapeHtml(email?.text ?? "Sin contenido")}</div>

      <div class="modal-action">
        <button id="deleteBtn" class="btn btn-error">Eliminar</button>
        <form method="dialog">
          <button class="btn">Cerrar</button>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.showModal();

  const deleteBtn = modal.querySelector("#deleteBtn");
  deleteBtn.addEventListener("click", async () => {
    deleteBtn.disabled = true;
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = "Eliminando...";

    try {
      await onDelete(email);
      modal.close();
    } catch (error) {
      console.error("Error deleting email:", error);
      deleteBtn.disabled = false;
      deleteBtn.textContent = originalText;
    }
  });

  modal.addEventListener("close", () => {
    modal.remove();
  });
};
