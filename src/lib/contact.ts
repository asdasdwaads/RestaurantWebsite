import { EmailProps } from "@/interfaces/email";
import { baseURL } from "./api";

export const sendEmail = async (emailForm: EmailProps | undefined) => {
  try {
    const res = await fetch(`${baseURL}/api/contact`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        name: emailForm?.name,
        email: emailForm?.email,
        subject: emailForm?.subject, 
        message: emailForm?.message 
      }),
    });

    if (res.ok) {
      alert("Email sent successfully!");
    } else {
      alert("Failed to send email.");
    }

  } catch (error) {
    console.error("Client error:", error);
    alert("An error occurred.");
  }
};
