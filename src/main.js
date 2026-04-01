const token = import.meta.env.VITE_API_KEY;
const app = document.querySelector("#app");

const seePlan = async () => {
  try {
    const response = await fetch("https://api2.freecustom.email/v1/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);

    viewAccount(result.data);
  } catch (error) {
    console.error("Error al obtener los datos de la cuenta: ", error);
  }
};

const viewAccount = (data) => {
  app.innerHTML = `
    <div class="card">
      <h2>${data.plan_label}</h2>
      <p>Precio: ${data.price}</p>
      <p>Créditos disponibles: ${data.credits}</p>

      <h3>Límites</h3>
      <p>${data.rate_limits.requestsPerSecond} request/s</p>
      <p>${data.rate_limits.requestsPerMonth} requests/mes</p>

      <h3>Funciones</h3>
      <p>OTP: ${data.features.otpExtraction ? "Disponible" : "No disponible"}</p>
      <p>Adjuntos: ${data.features.attachments ? "Disponible" : "No disponible"}</p>
      <p>Dominios personalizados: ${data.features.customDomains ? "Disponible" : "No disponible"}</p>
      <p>WebSocket: ${data.features.websocket ? "Disponible" : "No disponible"}</p>

      <h3>Recursos creados</h3>
      <p>App inboxes: ${data.app_inbox_count}</p>
      <p>API inboxes: ${data.api_inbox_count}</p>
      <p>Custom domains: ${data.custom_domain_count}</p>
    </div>
  `;
};

const planBtn = document.querySelector("#planBtn");
planBtn.addEventListener("click", seePlan);