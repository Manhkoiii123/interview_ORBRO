import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useRef, useState } from "react";
interface Coordinate {
  lat: number;
  lng: number;
  id: string;
}
interface MapProps {
  coordinates: Coordinate[];
  onCoordinateAdd?: (coord: Coordinate) => void;
  isPopup?: boolean;
  center: { lat: number; lng: number };
  zoom: number;
  backgroundOffset: { x: number; y: number };
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  onZoomChange?: (zoom: number) => void;
  onOffsetChange?: (offset: { x: number; y: number }) => void;
  draggable?: boolean;
}
export default function Map({
  coordinates,
  onCoordinateAdd,
  isPopup = false,
  center,
  zoom,
  backgroundOffset,
  onCenterChange,
  onZoomChange,
  onOffsetChange,
  draggable = true,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPopup || !onCoordinateAdd || coordinates.length >= 4 || isDragging)
      return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const lat = center.lat + (rect.height / 2 - y) * 0.001 * (1 / zoom);
    const lng = center.lng + (x - rect.width / 2) * 0.001 * (1 / zoom);

    const newCoord: Coordinate = {
      lat: Number.parseFloat(lat.toFixed(6)),
      lng: Number.parseFloat(lng.toFixed(6)),
      id: `D${coordinates.length + 1}`,
    };

    onCoordinateAdd(newCoord);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggable || !isDragging) return;
    e.preventDefault();

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    onOffsetChange?.({
      x: backgroundOffset.x + deltaX,
      y: backgroundOffset.y + deltaY,
    });

    onCenterChange?.({
      lat: center.lat - deltaY * 0.0001 * (1 / zoom),
      lng: center.lng - deltaX * 0.0001 * (1 / zoom),
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!draggable) return;
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (!draggable) return;
    setIsDragging(false);
  };

  const zoomIn = () => {
    onZoomChange?.(Math.min(zoom + 1, 18));
  };

  const zoomOut = () => {
    onZoomChange?.(Math.max(zoom - 1, 1));
  };

  const coordToPixel = (coord: Coordinate, containerRect: DOMRect) => {
    const x =
      containerRect.width / 2 +
      (coord.lng - center.lng) * 1000 * zoom +
      backgroundOffset.x * 0.1;
    const y =
      containerRect.height / 2 -
      (coord.lat - center.lat) * 1000 * zoom +
      backgroundOffset.y * 0.1;
    return { x, y };
  };

  return (
    <div className="relative w-full h-full  overflow-hidden rounded-lg ">
      <div
        ref={mapRef}
        className={`w-full h-full relative select-none  ${
          draggable && isDragging ? "cursor-grabbing" : "cursor-grab"
        } ${isPopup && !isDragging ? "cursor-crosshair" : "cursor-auto"}`}
        onClick={handleMapClick}
        onMouseDown={draggable ? handleMouseDown : undefined}
        onMouseMove={draggable ? handleMouseMove : undefined}
        onMouseUp={draggable ? handleMouseUp : undefined}
        onMouseLeave={draggable ? handleMouseLeave : undefined}
        style={{
          backgroundImage: 'url("/map.png")',
          backgroundSize: `${(100 * zoom) / 13}%`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: `${50 + backgroundOffset.x * 0.1}% ${
            50 + backgroundOffset.y * 0.1
          }%`,
          backgroundColor: "#ede8e8",
          transition: isDragging ? "none" : "background-position 0.1s ease-out",
        }}
      >
        <div className="absolute inset-0 bg-white bg-opacity-10 pointer-events-none"></div>

        {mapRef.current && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {coordinates.length > 1 &&
              coordinates.map((coord, index) => {
                if (index === coordinates.length - 1) return null;
                const rect = mapRef.current!.getBoundingClientRect();
                const start = coordToPixel(coord, rect);
                const end = coordToPixel(coordinates[index + 1], rect);

                return (
                  <line
                    key={`line-${index}`}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#83acf8"
                    strokeWidth="3"
                  />
                );
              })}

            {coordinates.length === 4 &&
              (() => {
                const rect = mapRef.current!.getBoundingClientRect();
                const start = coordToPixel(coordinates[3], rect);
                const end = coordToPixel(coordinates[0], rect);

                return (
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#83acf8"
                    strokeWidth="3"
                  />
                );
              })()}

            {coordinates.length === 4 &&
              (() => {
                const rect = mapRef.current!.getBoundingClientRect();
                const points = coordinates
                  .map((coord) => {
                    const pixel = coordToPixel(coord, rect);
                    return `${pixel.x},${pixel.y}`;
                  })
                  .join(" ");

                return (
                  <polygon
                    points={points}
                    fill="#2A70F0"
                    fillOpacity="0.4"
                    stroke="#83acf8"
                    strokeWidth="3"
                  />
                );
              })()}
          </svg>
        )}

        {coordinates.map((coord) => {
          if (!mapRef.current) return null;
          const rect = mapRef.current.getBoundingClientRect();
          const pixel = coordToPixel(coord, rect);

          return (
            <div
              key={coord.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: pixel.x, top: pixel.y }}
            >
              <div className="bg-blue-200 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-lg border-2 border-white">
                {coord.id}
              </div>
            </div>
          );
        })}
      </div>

      {isPopup && (
        <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-10">
          <Button
            size="sm"
            onClick={zoomIn}
            className="w-8 h-8 p-0 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={zoomOut}
            className="w-8 h-8 p-0 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
          >
            <Minus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
