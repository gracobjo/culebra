import type { AccommodationBookingChannel } from "@culebra/domain";

type BookingTarget = {
  bookingUrl?: string | null;
  websiteUrl?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  bookingChannel: AccommodationBookingChannel | string;
};

export function resolveBookingHref(item: BookingTarget): string | null {
  if (item.bookingUrl) return item.bookingUrl;
  if (item.bookingChannel === "WEBSITE" && item.websiteUrl) return item.websiteUrl;
  if (item.bookingChannel === "WHATSAPP" && item.whatsapp) {
    const digits = item.whatsapp.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : null;
  }
  if (item.bookingChannel === "PHONE" && item.phone) {
    return `tel:${item.phone}`;
  }
  if (item.bookingChannel === "EMAIL" && item.email) {
    return `mailto:${item.email}`;
  }
  return item.websiteUrl ?? null;
}

export function bookingCtaLabel(channel: AccommodationBookingChannel | string): string {
  switch (channel) {
    case "BOOKING":
      return "Reservar en Booking";
    case "WHATSAPP":
      return "Consultar por WhatsApp";
    case "PHONE":
      return "Llamar para reservar";
    case "EMAIL":
      return "Escribir para reservar";
    case "WEBSITE":
      return "Reservar en su web";
    default:
      return "Ir a reservar";
  }
}
