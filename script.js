const appointmentForm = document.getElementById("appointmentForm");
const formNote = document.getElementById("formNote");
const aiToggle = document.getElementById("aiToggle");
const aiAgent = document.getElementById("aiAgent");
const aiClose = document.getElementById("aiClose");
const aiForm = document.getElementById("aiForm");
const aiInput = document.getElementById("aiInput");
const aiMessages = document.getElementById("aiMessages");
const quickChips = document.querySelectorAll(".quick-chip");
const AI_ENDPOINT =
  window.CLINIC_CONFIG?.AI_ENDPOINT ||
  "http://localhost:3000/api/clinic-assistant";

if (appointmentForm && formNote) {
  appointmentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(appointmentForm);
    const patientName = formData.get("patientName");
    const phone = formData.get("phone");
    const problem = formData.get("problem");
    const time = formData.get("time");
    const message = formData.get("message");

    const whatsappMessage = [
      "Namaste Lal Ji Clinic, mujhe appointment leni hai.",
      `Patient Name: ${patientName}`,
      `Phone: ${phone}`,
      `Problem: ${problem}`,
      `Preferred Time: ${time}`,
      `Message: ${message || "N/A"}`
    ].join("\n");

    const whatsappUrl = `https://wa.me/919818205587?text=${encodeURIComponent(whatsappMessage)}`;

    formNote.textContent = `${patientName}, aapki appointment request ready ho gayi hai. Ab WhatsApp khul raha hai jahan se aap direct message bhej sakte hain.`;
    window.open(whatsappUrl, "_blank", "noopener");
    appointmentForm.reset();
  });
}

const clinicAnswers = [
  {
    keywords: ["timing", "time", "open", "morning", "evening"],
    answer: "Clinic timing yeh hai: Morning 10 AM se 1 PM aur Evening 5 PM se 9 PM."
  },
  {
    keywords: ["address", "location", "map", "kahan", "where"],
    answer: "Clinic address: Nehru Ground, RBA College ke back side, NIT Faridabad - 121001. Aap page par Open Google Map button bhi use kar sakte hain."
  },
  {
    keywords: ["service", "services", "treatment", "bukhar", "fever", "sugar", "dressing", "injury"],
    answer: "Clinic me General OPD consultation, fever-cold-cough care, wound dressing and first aid, diabetes guidance, BP check aur family routine treatment available hai."
  },
  {
    keywords: ["appointment", "book", "booking", "form"],
    answer: "Appointment ke liye neeche form fill kar sakte hain ya seedha WhatsApp aur phone dono options available hain."
  },
  {
    keywords: ["phone", "call", "number", "contact"],
    answer: "Clinic phone number hai 9818205587. Aap call ya WhatsApp dono kar sakte hain."
  }
];

function appendMessage(text, type) {
  if (!aiMessages) {
    return;
  }

  const message = document.createElement("div");
  message.className = `ai-message ai-message-${type}`;
  message.textContent = text;
  aiMessages.appendChild(message);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

function getClinicReply(question) {
  const normalizedQuestion = question.toLowerCase();
  const matchedAnswer = clinicAnswers.find((item) =>
    item.keywords.some((keyword) => normalizedQuestion.includes(keyword))
  );

  if (matchedAnswer) {
    return matchedAnswer.answer;
  }

  return "Main clinic timing, address, services, phone number aur appointment ke baare mein help kar sakta hoon. Aap inmein se koi sawal pooch sakte hain.";
}

async function getAIReply(question) {
  try {
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      throw new Error("AI server unavailable");
    }

    const data = await response.json();

    if (data.answer && data.answer.includes("429")) {
      return `${getClinicReply(question)} Real AI service abhi temporary unavailable hai, lekin clinic information aur booking help yahin available hai.`;
    }

    return data.answer || getClinicReply(question);
  } catch (error) {
    return `${getClinicReply(question)} Real AI service abhi connect nahi ho pa rahi, lekin clinic information aur booking help yahin available hai.`;
  }
}

if (aiToggle && aiAgent) {
  aiToggle.addEventListener("click", () => {
    aiAgent.hidden = false;
    aiInput?.focus();
  });
}

if (aiClose && aiAgent) {
  aiClose.addEventListener("click", () => {
    aiAgent.hidden = true;
  });
}

if (quickChips.length > 0) {
  quickChips.forEach((chip) => {
    chip.addEventListener("click", async () => {
      const question = chip.dataset.question || "";
      appendMessage(question, "user");
      appendMessage("Soch raha hoon...", "bot");
      const pendingMessage = aiMessages?.lastElementChild;
      const answer = await getAIReply(question);
      if (pendingMessage) {
        pendingMessage.textContent = answer;
      } else {
        appendMessage(answer, "bot");
      }
    });
  });
}

if (aiForm && aiInput) {
  aiForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const question = aiInput.value.trim();
    if (!question) {
      return;
    }

    appendMessage(question, "user");
    appendMessage("Soch raha hoon...", "bot");
    const pendingMessage = aiMessages?.lastElementChild;
    const answer = await getAIReply(question);
    if (pendingMessage) {
      pendingMessage.textContent = answer;
    } else {
      appendMessage(answer, "bot");
    }
    aiForm.reset();
    aiInput.focus();
  });
}
