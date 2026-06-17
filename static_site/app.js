const API_ENDPOINT = window.CLOUDTRILHAS_CONFIG.apiEndpoint;

function setMessage(element, message, type = "") {
  element.textContent = message;
  element.className = type ? `form-message ${type}` : "form-message";
}

async function submitLead(payload) {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Erro ao registrar.");
  }

  return data;
}

document.querySelectorAll(".inline-download-form").forEach((form) => {
  const formMessage = form.querySelector(".form-message");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      consent: form.elements.consent.checked,
      material: form.dataset.material,
    };

    setMessage(formMessage, "Enviando dados...");

    try {
      const data = await submitLead(payload);

      setMessage(
        formMessage,
        "Cadastro realizado. Abrindo material...",
        "success"
      );

      window.open(data.download_url, "_blank");

      form.reset();
    } catch (error) {
      console.error(error);
      setMessage(formMessage, error.message || "Erro ao conectar API.", "error");
    }
  });
});