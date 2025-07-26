import { NextResponse } from "next/server";
import images from "@/database/image.test.json";

export const GET = async () => {
  return NextResponse.json({ images }, { status: 200 });
}