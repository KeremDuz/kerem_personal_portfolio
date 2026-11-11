/** Business contact details used by the call / WhatsApp buttons. */
export const PHONE_DISPLAY = "0505 991 37 75";
/** E.164, for tel: and wa.me links. */
export const PHONE_E164 = "+905059913775";

export const telHref = `tel:${PHONE_E164}`;

export function whatsappHref(message: string): string {
    return `https://wa.me/${PHONE_E164.slice(1)}?text=${encodeURIComponent(message)}`;
}
