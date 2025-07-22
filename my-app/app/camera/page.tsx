"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Map from "@/components/Map";
import { Coordinate } from "@/type";

export default function CameraPage() {
  const [popupCoordinates, setPopupCoordinates] = useState<Coordinate[]>([]);
  const [mainCoordinates, setMainCoordinates] = useState<Coordinate[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [mapCenter, setMapCenter] = useState({ lat: 21.0285, lng: 105.8542 });
  const [mapZoom, setMapZoom] = useState(13);
  const [backgroundOffset, setBackgroundOffset] = useState({ x: 0, y: 0 });

  const handlePopupCoordinateAdd = (coord: Coordinate) => {
    if (popupCoordinates.length < 4) {
      setPopupCoordinates((prev) => [...prev, coord]);
    }
  };

  const handleSave = () => {
    setMainCoordinates([...popupCoordinates]);
    setIsPopupOpen(false);
  };

  const handleReset = () => {
    setPopupCoordinates([]);
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Dialog
            open={isPopupOpen}
            onOpenChange={(open) => {
              setIsPopupOpen(open);
              handleReset();
            }}
          >
            <DialogTrigger className="flex items-center" asChild>
              <Button className="px-6 sm:px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
                Mapping
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full h-[80vh]">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex-1 min-h-[400px]">
                  <Map
                    coordinates={popupCoordinates}
                    onCoordinateAdd={handlePopupCoordinateAdd}
                    isPopup={true}
                    center={mapCenter}
                    zoom={mapZoom}
                    backgroundOffset={backgroundOffset}
                    onCenterChange={setMapCenter}
                    onZoomChange={setMapZoom}
                    onOffsetChange={setBackgroundOffset}
                    draggable={true}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => {
                      setIsPopupOpen(false);
                      handleReset();
                    }}
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent"
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={popupCoordinates.length !== 4}
                    className="flex items-center gap-2 "
                  >
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-xl p-4 bg-white shadow-sm">
          <div className="h-96 sm:h-[500px] lg:h-[600px] mb-6">
            <Map
              coordinates={mainCoordinates}
              isPopup={false}
              center={mapCenter}
              zoom={mapZoom}
              backgroundOffset={backgroundOffset}
              onCenterChange={setMapCenter}
              onZoomChange={setMapZoom}
              onOffsetChange={setBackgroundOffset}
              draggable={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
