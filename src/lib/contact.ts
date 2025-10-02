import { ContactProps } from "@/interfaces/email";
import { baseURL } from "./api";
import axios from "axios";

export const sendEmail = async (emailForm: ContactProps | undefined) => {
  try {

    const formData = new FormData();

    formData.append("email", emailForm?.email as string);
    formData.append("message", emailForm?.message as string);
    formData.append("name", emailForm?.name as string);
    formData.append("subject", emailForm?.subject as string);

    const res = await axios.post(`${baseURL}/api/contact`, formData);

    if (res.data.success) {
      alert(res.data.message);
    } else {
      alert(res.data.message);
    }

  } catch (error) {
    console.error("Client error:", error);
    alert("An error occurred.");
  }
};
