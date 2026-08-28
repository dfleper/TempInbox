export const viewAccount = (data) => {
  const modal = document.createElement("dialog");
  modal.id = "accountModal";
  modal.className = "modal";

  const plan = data?.plan ?? "-";
  const credits = data?.credits ?? "-";
  const rateLimits = data?.rate_limits ?? {};
  const features = data?.features ?? {};

  modal.innerHTML = `
    <div class="modal-box">
      <h2 class="text-lg font-bold mb-4">Plan: ${plan}</h2>

      <p><strong>Créditos disponibles:</strong> ${credits}</p>

      <h3 class="font-semibold mt-4">Límites</h3>
      <p>${rateLimits.requests_per_second ?? "-"} request/s</p>
      <p>${rateLimits.requests_per_month ?? "-"} requests/mes</p>

      <h3 class="font-semibold mt-4">Funciones</h3>
      <p>OTP: ${features.otp_extraction ? "Disponible" : "No disponible"}</p>
      <p>Adjuntos: ${features.attachments ? "Disponible" : "No disponible"}</p>
      <p>Dominios personalizados: ${features.custom_domains ? "Disponible" : "No disponible"}</p>
      <p>WebSocket: ${features.websocket ? "Disponible" : "No disponible"}</p>

      <h3 class="font-semibold mt-4">Recursos creados</h3>
      <p>App inboxes: ${data?.app_inbox_count ?? "-"}</p>
      <p>API inboxes: ${data?.api_inbox_count ?? "-"}</p>
      <p>Custom domains: ${data?.custom_domain_count ?? "-"}</p>

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
