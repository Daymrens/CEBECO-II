"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const SOGOD_CENTER: [number, number] = [10.7436, 124.0123]

// Approximate lat/lng for Sogod, Cebu barangays.
// Labels clearly note these are approximate — not survey-grade.
const SOGOD_BARANGAY_COORDS: Record<string, [number, number]> = {
  Poblacion: [10.7436, 124.0123],
  Lubo: [10.7285, 124.0055],
  Tabunok: [10.759, 124.018],
  Bagakay: [10.737, 124.035],
  Dakit: [10.749, 124.037],
  Mohon: [10.722, 124.015],
  Pansoy: [10.715, 124.008],
  Bagatayam: [10.765, 123.998],
  Bawo: [10.753, 123.99],
  Cabalawan: [10.738, 123.995],
  Calumboyan: [10.744, 123.985],
  Liki: [10.75, 123.978],
}

interface OutageMapProps {
  barangays: string[]
  municipality?: string
}

function makeIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:${color};
      border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,.4);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  })
}

export function OutageMap({ barangays }: OutageMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: SOGOD_CENTER,
      zoom: 13,
      scrollWheelZoom: false,
      attributionControl: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    const icon = makeIcon("#ef4444")
    const placedCoords: [number, number][] = []

    for (const name of barangays) {
      const coords = SOGOD_BARANGAY_COORDS[name]
      if (coords) {
        L.marker(coords, { icon })
          .addTo(map)
          .bindPopup(`<strong>${name}</strong><br/><span class="text-xs opacity-60">approximate location</span>`)
        placedCoords.push(coords)
      }
    }

    if (placedCoords.length > 1) {
      map.fitBounds(L.latLngBounds(placedCoords).pad(0.15))
    } else if (placedCoords.length === 1) {
      map.setView(placedCoords[0], 14)
    }

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [barangays])

  const known = barangays.filter((b) => b in SOGOD_BARANGAY_COORDS)
  const unknown = barangays.filter((b) => !(b in SOGOD_BARANGAY_COORDS))

  return (
    <div className="mt-8">
      <div
        ref={mapRef}
        className="h-72 w-full rounded-xl border border-gray-200"
        style={{ zIndex: 0 }}
      />
      <p className="mt-2 text-xs text-gray-400">
        Approximate area only — not to exact scale.
        {unknown.length > 0 && (
          <>
            {" "}
            Coordinates unavailable for: {unknown.join(", ")}.
          </>
        )}
        {known.length === 0 && (
          <>{" "}No map data available for the listed barangays.</>
        )}
      </p>
    </div>
  )
}
