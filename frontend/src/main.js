import { getAccount } from "./api/account.js";
import { getEmail } from "./api/email.js";
import { getEmailList } from "./api/loadEmails.js";
import { viewAccount } from "./ui/accountModal.js";
import { showToast } from "./ui/toast.js";
import { viewEmail } from "./ui/viewEmail.js";
import { choiceRows, renderEmails } from "./ui/renderEmails.js";
import { disableButton } from "./ui/disabledButton.js";

const planBtn = document.querySelector("#planBtn");
const emailBtn = document.querySelector("#emailBtn");
const emailListBtn = document.querySelector("#emailListBtn");
disableButton(emailListBtn);

const seePlan = async () => {
  try {
    const data = await getAccount();
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
    const inboxes = await getEmail();

    if (!Array.isArray(inboxes) || inboxes.length === 0) {
      showToast("No hay un correo disponible.", emailBtn);
      return;
    }

    const inbox = inboxes[0];

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

const seeEmailList = async () => {
  try {
    const emails = await getEmailList();

    if (!Array.isArray(emails) || emails.length === 0) {
      renderEmails([]);
      showToast("No hay correos en la bandeja.", emailListBtn);
      return;
    }

    renderEmails(emails);
    choiceRows();
  } catch (error) {
    console.error("Error getting email list:", error);
    showToast("No se pudo cargar la bandeja de entrada.", emailListBtn);
  }
};

emailListBtn.addEventListener("click", seeEmailList);
