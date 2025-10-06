import { randomBytes } from "crypto";

export function generateToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addHours(date: Date, hours: number) {
  return addMinutes(date, hours * 60);
}
