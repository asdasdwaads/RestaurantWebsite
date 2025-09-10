import { baseURL } from "./api";
import { BookingProps } from "@/interfaces/email";

export const sendEmail = async (emailForm: BookingProps | undefined) => {
  try {
    const res = await fetch(`${baseURL}/api/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date: emailForm?.date,
        name: emailForm?.name,
        email: emailForm?.email,
        phone: emailForm?.phone,
        count: emailForm?.count,
        order: emailForm?.order,
        type: emailForm?.type,
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
