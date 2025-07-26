import { baseURL } from "./api";

export const getImage = async () => {
  try {
    const res = await fetch(`${baseURL}/api/image`, {
      method: "GET",
    });

    if (!res.ok) {
      return;
    }

    const data = await res.json();
    return data.images;
  } catch (error) {
    console.error(error);
  }
};