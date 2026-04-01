import { getAccount } from "./api/account.js";
import { viewAccount } from "./ui/accountModal.js";
import { showToast } from "./ui/toast.js";

const planBtn = document.querySelector("#planBtn");

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