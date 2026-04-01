import { getAccount } from "./api/account.js";
import { getEmail } from "./api/email.js";
import { viewAccount } from "./ui/accountModal.js";
import { showToast } from "./ui/toast.js";
import { viewEmail } from "./ui/viewEmail.js";

const planBtn = document.querySelector("#planBtn");
const emailBtn = document.querySelector("#emailBtn");

const seePlan = async () => {
  try {
    const data = await getAccount();
    console.log(data);
    viewAccount(data);
  } catch (error) {
    console.error("Error fetching account data:", error);
    showToast(
      "No se pudieron cargar los datos de la cuenta. ¡Espere y vuelva a intentarlo!.",
      planBtn
    );
  }
};

planBtn.addEventListener("click", seePlan);

const seeEmail = async () => {
  try {
    const data = await getEmail();
    console.log(data);

    if (!data || data.length === 0) {
      showToast("No hay un correo disponible.", emailBtn);
      return;
    }

    const inbox = data[0]?.inbox;

    if (!inbox) {
      showToast("No se encontró un correo válido.", emailBtn);
      return;
    }

    viewEmail(inbox);
  } catch (error) {
    console.error("Error getting the email:", error);
    showToast("No se pudo obtener el correo.", emailBtn);
  }
};

emailBtn.addEventListener("click", seeEmail);