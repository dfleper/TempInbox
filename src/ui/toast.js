export function showToast(message, button) {
  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = "Espere...";

  const toast = document.createElement("div");
  toast.className = "toast toast-center toast-middle z-50";

  const alert = document.createElement("div");
  alert.className = "alert alert-error";

  const span = document.createElement("span");
  span.textContent = message;

  alert.appendChild(span);
  toast.appendChild(alert);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
    button.disabled = false;
    button.textContent = originalText;
  }, 3000);
}