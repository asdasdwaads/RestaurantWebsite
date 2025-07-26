import { NextResponse } from "next/server";
import menu from "@/database/menu.test.json";

export const GET = async () => {
  return NextResponse.json({ menu }, { status: 200 });
}