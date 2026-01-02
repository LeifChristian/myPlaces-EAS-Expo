import { useCallback } from "react";
import { moveMap } from "../map/mapMovement";

// Returns the move(direction) handler (up/down/left/right/plus/minus).
// Extracted from App.js; behavior intentionally unchanged.
export default function mapMovement({
  lat,
  long,
  latD,
  longD,
  display,
  setTheName,
  setTheId,
  stopMyLiveLocation,
  setLong,
  setLat,
  setDisplay,
  setLocations,
  setLongD,
  setLatD,
}) {
  const move = useCallback(
    (direction) => {
      return moveMap({
        direction,
        lat,
        long,
        latD,
        longD,
        setTheName,
        setTheId,
        stopMyLiveLocation,
        setLong,
        setLat,
        setDisplay,
        setLocations,
        setLongD,
        setLatD,
        display,
      });
    },
    [
      lat,
      long,
      latD,
      longD,
      display,
      setTheName,
      setTheId,
      stopMyLiveLocation,
      setLong,
      setLat,
      setDisplay,
      setLocations,
      setLongD,
      setLatD,
    ]
  );

  return { move };
}


