const htmlEntities = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => htmlEntities[character]);
