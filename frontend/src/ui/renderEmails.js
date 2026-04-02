const tbody = document.getElementById("emailsTableBody");

function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString("es-ES");
}

export function renderEmails(emails) {
  tbody.innerHTML = "";

  emails.forEach((email, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
        <th>${index + 1}</th>
        <td>${email.from}</td>
        <td>${email.subject}</td>
        <td>${formatDate(email.date)}</td>
      `;

    tbody.appendChild(row);
  });
}