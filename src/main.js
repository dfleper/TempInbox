const token = import.meta.env.VITE_API_KEY;
const app = document.querySelector("#app");

const verPlan = async () => {
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

    mostrarCuenta(result.data);
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
  }
};

const mostrarCuenta = (data) => {
  app.innerHTML = `
    <div class="card">
      <h2>${data.plan_label}</h2>
      <p>Plan interno: ${data.plan}</p>
      <p>Precio: ${data.price}</p>
      <p>Créditos: ${data.credits}</p>

      <h3>Límites</h3>
      <p>Por segundo: ${data.rate_limits.requestsPerSecond}</p>
      <p>Por mes: ${data.rate_limits.requestsPerMonth}</p>

      <h3>Funciones</h3>
      <p>OTP: ${data.features.otpExtraction ? "Sí" : "No"}</p>
      <p>Adjuntos: ${data.features.attachments ? "Sí" : "No"}</p>
      <p>WebSocket: ${data.features.websocket ? "Sí" : "No"}</p>

      <h3>Conteos</h3>
      <p>App inboxes: ${data.app_inbox_count}</p>
      <p>API inboxes: ${data.api_inbox_count}</p>
      <p>Custom domains: ${data.custom_domain_count}</p>
    </div>
  `;
};

const planBtn = document.querySelector("#planBtn");
planBtn.addEventListener("click", verPlan);