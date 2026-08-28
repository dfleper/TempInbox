import { escapeHtml } from "./escapeHtml.js";

const getBooleanFeature = (features, snakeCaseKey, camelCaseKey) =>
  Boolean(features?.[snakeCaseKey] ?? features?.[camelCaseKey]);

export const viewAccount = (data) => {
  const modal = document.createElement("dialog");
  modal.id = "accountModal";
  modal.className = "modal";

  const plan = data?.plan_label ?? data?.plan ?? "-";
  const credits = data?.credits ?? "-";
  const rateLimits = data?.rate_limits ?? data?.rateLimits ?? {};
  const features = data?.features ?? {};

  const requestsPerSecond =
    rateLimits.requests_per_second ?? rateLimits.requestsPerSecond ?? "-";
  const requestsPerMonth =
    rateLimits.requests_per_month ?? rateLimits.requestsPerMonth ?? "-";

  const otpExtraction = getBooleanFeature(features, "otp_extraction", "otpExtraction");
  const attachments = Boolean(features.attachments);
  const customDomains = getBooleanFeature(features, "custom_domains", "customDomains");
  const websocket = Boolean(features.websocket);

  modal.innerHTML = `
    <div class="modal-box">
      <h2 class="text-lg font-bold mb-4">Plan: ${escapeHtml(plan)}</h2>

      <p><strong>Créditos disponibles:</strong> ${escapeHtml(credits)}</p>

      <h3 class="font-semibold mt-4">Límites</h3>
      <p>${escapeHtml(requestsPerSecond)} request/s</p>
      <p>${escapeHtml(requestsPerMonth)} requests/mes</p>

      <h3 class="font-semibold mt-4">Funciones</h3>
      <p>OTP: ${otpExtraction ? "Disponible" : "No disponible"}</p>
      <p>Adjuntos: ${attachments ? "Disponible" : "No disponible"}</p>
      <p>Dominios personalizados: ${customDomains ? "Disponible" : "No disponible"}</p>
      <p>WebSocket: ${websocket ? "Disponible" : "No disponible"}</p>

      <h3 class="font-semibold mt-4">Recursos creados</h3>
      <p>App inboxes: ${escapeHtml(data?.app_inbox_count ?? data?.appInboxCount ?? "-")}</p>
      <p>API inboxes: ${escapeHtml(data?.api_inbox_count ?? data?.apiInboxCount ?? "-")}</p>
      <p>Custom domains: ${escapeHtml(data?.custom_domain_count ?? data?.customDomainCount ?? "-")}</p>

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
