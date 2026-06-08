interface Props {
    lga: Record<string, string>
}

export default function LgaImages({ lga }: Props) {
    // Use picsum.photos with the LGA label as seed
    // Generate an array of 6 elements
    const images = Array.from({ length: 6 }).map((_, i) =>
        `https://picsum.photos/seed/${lga.lga.replace(/\s+/g, '')}-${i}/200`
    )

    return (
        <div className="absolute top-3 left-3 z-[1000] bg-black/70 backdrop-blur-sm rounded-lg p-3 w-[320px]">
            <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xs font-semibold text-white uppercase tracking-widest">{lga.lga}</h3>
                <span className="text-[10px] text-white/50">{lga.state}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {images.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        alt={`${lga.lga} view ${i + 1}`}
                        className="w-full h-16 object-cover rounded shadow-md border border-white/10 opacity-80 hover:opacity-100 transition-opacity"
                        onError={e => (e.currentTarget.style.display = 'none')}
                    />
                ))}
            </div>
        </div>
    )
}
