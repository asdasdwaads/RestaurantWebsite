import axios from "axios";
import { baseURL } from "./api";
import { BookingProps } from "@/interfaces/email";

export const sendEmail = async (emailForm: BookingProps | undefined) => {
  try {

    const formData = new FormData();

    formData.append("date", emailForm?.date as string);
    formData.append("name", emailForm?.name as string);
    formData.append("email", emailForm?.email as string);
    formData.append("phone", emailForm?.phone as string);
    formData.append("count", emailForm?.count?.toString() as string);
    formData.append("order", emailForm?.order as string);
    formData.append("type", emailForm?.type as string);

    const res = await axios.post(`${baseURL}/api/booking`, formData);

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
