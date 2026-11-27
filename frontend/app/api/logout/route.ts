import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  for (const c of ["token", "role", "name"]) res.cookies.delete(c);
  return res;
}
