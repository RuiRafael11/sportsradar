// mobile/src/utils/images.js
import React, { useState } from "react";
import { Image } from "react-native";

// imagens locais
const IMAGES = {
  padel: require("../../assets/padel.jpg"),
  tenis: require("../../assets/padel.jpg"),
  futebol: require("../../assets/fut.png"),
  futsal: require("../../assets/fut.png"),
  basquete: require("../../assets/fut.png"),
  pavilhao: require("../../assets/multiusos.png"),
  polidesportivo: require("../../assets/multiusos.png"),
  multiusos: require("../../assets/multiusos.png"),
  atletismo: require("../../assets/atletismo.png"),
  default: require("../../assets/multiusos.png"),
};

// faz matching simples por texto
function pickLocalByText(text = "") {
  const t = text.toLowerCase();

  if (t.includes("padel")) return IMAGES.padel;
  if (t.includes("ténis") || t.includes("tenis") || t.includes("tennis")) return IMAGES.tenis;

  if (t.includes("futsal")) return IMAGES.futsal;
  if (t.includes("futebol") || t.includes("soccer")) return IMAGES.futebol;

  if (t.includes("basquet")) return IMAGES.basquete;

  if (t.includes("pavilh")) return IMAGES.pavilhao;
  if (t.includes("poli")) return IMAGES.polidesportivo;
  if (t.includes("multiuso") || t.includes("multiusos")) return IMAGES.multiusos;

  if (t.includes("atletismo") || t.includes("pista")) return IMAGES.atletismo;

  return IMAGES.default;
}

/**
 * getVenueImage(venue)
 * - Se o backend/Google trouxer URL (venue.imageUrl), devolve { uri: ... }
 * - Caso contrário, devolve uma imagem local (require(...))
 */
export function getVenueImage(venue) {
  if (venue?.imageUrl) return { uri: venue.imageUrl }; // Google Places photo, por ex.
  const fromType = pickLocalByText(venue?.type);
  if (fromType) return fromType;
  return pickLocalByText(venue?.name);
}

/**
 * <ImageFallback source | uri />
 * Aceita:
 *  - source: require(...) OU { uri: "..." }
 *  - uri: string
 * Troca para imagem local default se falhar.
 */
export function ImageFallback({ source, uri, style, ...rest }) {
  const initial =
    source ? source : uri ? { uri } : IMAGES.default;

  const [src, setSrc] = useState(initial);

  return (
    <Image
      {...rest}
      source={src}
      style={style}
      onError={() => setSrc(IMAGES.default)}
    />
  );
}
