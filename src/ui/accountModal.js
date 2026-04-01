export const viewAccount = (data) => {
  const modal = document.createElement("dialog");
  modal.id = "accountModal";
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-box">
      <h2 class="text-lg font-bold mb-4">${data.plan_label}</h2>

      <p><strong>Precio:</strong> ${data.price}</p>
      <p><strong>Créditos disponibles:</strong> ${data.credits}</p>

      <h3 class="font-semibold mt-4">Límites</h3>
      <p>${data.rate_limits.requestsPerSecond} request/s</p>
      <p>${data.rate_limits.requestsPerMonth} requests/mes</p>

      <h3 class="font-semibold mt-4">Funciones</h3>
      <p>OTP: ${data.features.otpExtraction ? "Disponible" : "No disponible"}</p>
      <p>Adjuntos: ${data.features.attachments ? "Disponible" : "No disponible"}</p>
      <p>Dominios personalizados: ${data.features.customDomains ? "Disponible" : "No disponible"}</p>
      <p>WebSocket: ${data.features.websocket ? "Disponible" : "No disponible"}</p>

      <h3 class="font-semibold mt-4">Recursos creados</h3>
      <p>App inboxes: ${data.app_inbox_count}</p>
      <p>API inboxes: ${data.api_inbox_count}</p>
      <p>Custom domains: ${data.custom_domain_count}</p>

      <div class="modal-action">
        <form method="dialog">
          <button class="btn">Cerrar</button>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.showModal();

  modal.addEventListener("close", () => {
    modal.remove();
  });
};