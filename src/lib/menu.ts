import { baseURL } from "./api";

export const getMenu = async () => {
  try {
    const res = await fetch(`${baseURL}/api/menu`, {
      method: "GET",
    });

    if (!res.ok) {
      return;
    }

    const data = await res.json();
    return data.menu;
  } catch (error) {
    console.error(error);
  }
};