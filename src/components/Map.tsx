import { useEffect, useRef } from 'react'
import { apiUrl } from '../lib/api'
import L from 'leaflet'

const NG_CENTER: [number, number] = [9.082, 8.6753]
const NG_BOUNDS = L.latLngBounds([3.9, 2.3], [14.2, 15.1])

interface Props {
  onStateClick: (stateName: string) => void
  onLgaClick: (props: Record<string, string>) => void
  activeState: string | null
}

function getCenter(layer: L.Layer): L.LatLng {
  if ('getBounds' in layer && typeof (layer as any).getBounds === 'function') {
    return (layer as any).getBounds().getCenter()
  }
  if ('getLatLng' in layer && typeof (layer as any).getLatLng === 'function') {
    return (layer as any).getLatLng()
  }
  return L.latLng(NG_CENTER)
}

function makeLabel(text: string | null | undefined) {
  return L.divIcon({
    className: '',
    html: `<span style="color:#fff;font-size:11px;font-weight:600;text-shadow:0 0 4px #000,0 0 4px #000,0 0 4px #000;white-space:nowrap;background:transparent;border:none;">${text || ''}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

function styleFor(level: number, isLga = false) {
  const empty = level === 0
  return {
    fillColor: empty ? (isLga ? 'rgba(255,255,255,0.06)' : 'transparent') : '#d7301f',
    fillOpacity: empty ? (isLga ? 1 : 0) : 0.7,
    color: '#ffffff',
    weight: empty ? (isLga ? 2.5 : 1.5) : 1.2,
    opacity: empty ? 0.9 : 0.85,
  }
}

export default function Map({ onStateClick, onLgaClick, activeState }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const statesLayerRef = useRef<L.GeoJSON | null>(null)
  const lgaLayerRef = useRef<L.GeoJSON | null>(null)
  const labelLayerRef = useRef<L.LayerGroup | null>(null)

  function highlight(e: L.LeafletMouseEvent) {
    e.target.setStyle({ weight: 2.5, color: '#ffffff', fillOpacity: 0.9 })
    e.target.bringToFront()
  }

  async function loadStates(map: L.Map) {
    const res = await fetch(apiUrl('/api/states'))
    const geo = await res.json()
    if (!geo.features) return

    statesLayerRef.current = L.geoJSON(geo, {
      style: f => styleFor(f!.properties.level),
      onEachFeature: (feature, layer) => {
        const p = feature.properties
        layer.bindTooltip(`<b>${p.state || ''}</b><br>${p.label || ''}`, { sticky: true })
        layer.on({
          mouseover: highlight,
          mouseout: e => statesLayerRef.current?.resetStyle(e.target),
          click: () => {
            openState(p.state)
            onStateClick(p.state)
          },
        })
        const c = getCenter(layer)
        L.marker(c, { interactive: false, icon: makeLabel(p.state) }).addTo(labelLayerRef.current!)
      },
    }).addTo(map)
    map.fitBounds(statesLayerRef.current.getBounds(), { padding: [24, 24] })
  }

  async function openState(stateName: string) {
    const map = mapRef.current
    if (!map || !stateName) return
    const res = await fetch(apiUrl('/api/lgas/' + encodeURIComponent(stateName)))
    const geo = await res.json()

    if (statesLayerRef.current) map.removeLayer(statesLayerRef.current)
    if (lgaLayerRef.current) map.removeLayer(lgaLayerRef.current)
    labelLayerRef.current?.clearLayers()

    lgaLayerRef.current = L.geoJSON(geo, {
      style: f => styleFor(f!.properties.level, true),
      onEachFeature: (feature, layer) => {
        const p = feature.properties
        layer.bindTooltip(`<b>${p.lga || ''}</b><br>${p.label || ''}`, { sticky: true })
        layer.on({
          mouseover: highlight,
          mouseout: e => lgaLayerRef.current?.resetStyle(e.target),
          click: () => onLgaClick(p),
        })
        const c = getCenter(layer)
        L.marker(c, { interactive: false, icon: makeLabel(p.lga) }).addTo(labelLayerRef.current!)
      },
    }).addTo(map)

    const w = map.getSize().x
    map.flyToBounds(lgaLayerRef.current.getBounds(), {
      paddingTopLeft: [w * 0.5, 40],
      paddingBottomRight: [20, 40],
      animate: true,
      duration: 0.8,
    })
  }

  function showStates() {
    const map = mapRef.current
    if (!map) return
    if (lgaLayerRef.current) { map.removeLayer(lgaLayerRef.current); lgaLayerRef.current = null }
    labelLayerRef.current?.clearLayers()
    if (statesLayerRef.current) {
      if (!map.hasLayer(statesLayerRef.current)) {
        statesLayerRef.current.addTo(map)
        statesLayerRef.current.eachLayer(l => statesLayerRef.current!.resetStyle(l))
      }
      statesLayerRef.current.eachLayer(l => {
        statesLayerRef.current!.resetStyle(l)
        const c = getCenter(l)
        const el = l as any
        const name = el.feature?.properties?.state || el.options?.state || ''
        L.marker(c, { interactive: false, icon: makeLabel(name) }).addTo(labelLayerRef.current!)
      })
    }
    requestAnimationFrame(() => {
      map.invalidateSize()
      if (statesLayerRef.current) {
        map.fitBounds(statesLayerRef.current.getBounds(), { padding: [24, 24], animate: false })
      }
    })
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: NG_CENTER,
      zoom: 6,
      minZoom: 5,
      maxZoom: 12,
      maxBounds: NG_BOUNDS.pad(0.05),
      maxBoundsViscosity: 1.0,
      zoomControl: false,
    })
    map.attributionControl.setPrefix(false)
    mapRef.current = map
    labelLayerRef.current = L.layerGroup().addTo(map)
    loadStates(map)
    return () => { map.remove(); mapRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (activeState === null && mapRef.current && statesLayerRef.current) showStates()
  }, [activeState])

  return <div ref={containerRef} className="w-full h-full" style={{ background: '#000' }} />
}
