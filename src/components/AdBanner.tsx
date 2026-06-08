import { useEffect, useState } from 'react'

interface Ad {
  id: number
  imageUrl: string
  targetUrl: string
  createdAt: string
}

interface Props {
  className?: string
  heightClass?: string
}

export default function AdBanner({ className = '', heightClass = 'h-[120px]' }: Props) {
  const [ads, setAds] = useState<Ad[]>([])

  useEffect(() => {
    fetch('/api/ads')
      .then(r => r.json())
      .then(setAds)
      .catch(() => {})
  }, [])

  const ad = ads[0]
  if (!ad) return null

  return (
    <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer"
      className={`block overflow-hidden ${className}`}>
      <img src={ad.imageUrl} alt="Advertisement"
        className={`w-full object-cover hover:opacity-90 transition-opacity ${heightClass}`}
        onError={e => { (e.currentTarget.parentElement as HTMLElement)?.style.setProperty('display', 'none') }} />
    </a>
  )
}
