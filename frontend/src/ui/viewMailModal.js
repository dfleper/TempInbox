export const viewMailModal = (email, onDelete) => {
  const modal = document.createElement("dialog");
  modal.id = "mailModal";
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-box max-w-3xl">
      <h2 class="text-lg font-bold mb-4">Detalle del email</h2>

      <p><strong>From:</strong> ${email.from ?? "-"}</p>
      <p><strong>To:</strong> ${email.to ?? "-"}</p>
      <p><strong>Date:</strong> ${email.date ? new Date(email.date).toLocaleString("es-ES") : "-"}</p>
      <p><strong>Subject:</strong> ${email.subject ?? "-"}</p>

      <h3 class="font-semibold mt-4">Texto</h3>
      <div class="bg-base-200 p-3 rounded-lg whitespace-pre-wrap">
        ${email.text ?? "Sin contenido"}
      </div>

      <div class="modal-action">
        <button id="deleteBtn" class="btn btn-error">Delete</button>
        <form method="dialog">
          <button class="btn">Cerrar</button>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.showModal();

  modal.querySelector("#deleteBtn").addEventListener("click", () => {
    onDelete(email);
    modal.close();
  });

  modal.addEventListener("close", () => {
    modal.remove();
  });
};