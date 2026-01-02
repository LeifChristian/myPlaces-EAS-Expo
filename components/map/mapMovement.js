// Extracted move() switch from App.js. Intentionally uses the same math and side effects.
export function moveMap({
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
}) {
  setTheName("");
  setTheId("");

  switch (direction) {
    case "up":
      stopMyLiveLocation();
      setLong((prevState) => prevState);
      setDisplay(`lat: ${(lat + latD / 7).toFixed(7)}, long: ${long.toFixed(7)}`);
      console.log(display);
      setLocations([{ lat: lat + latD / 3, long: long }]);

      setLat((prevState) => prevState + latD / 3);
      console.log(lat, long);
      break;

    case "down":
      stopMyLiveLocation();
      setLat((prevState) => prevState - latD / 3);
      setLong((prevState) => prevState);
      setDisplay(`lat: ${(lat - latD / 7).toFixed(7)}, long: ${long.toFixed(7)}`);
      setLocations([{ lat: lat - latD / 3, long: long }]);
      break;

    case "left":
      stopMyLiveLocation();
      setLong((prevState) => prevState - longD / 7);
      console.log(longD);
      setDisplay(`lat: ${lat.toFixed(7)}, long: ${(long - longD / 7).toFixed(7)}`);
      setLocations([{ lat: lat, long: long - longD / 7 }]);
      break;

    case "right":
      stopMyLiveLocation();
      console.log(longD);
      setLong((prevState) => prevState + longD / 7);
      setDisplay(`lat: ${lat.toFixed(7)}, long: ${(long + longD / 7).toFixed(7)}`);
      setLocations([{ lat: lat, long: long + longD / 7 }]);
      break;

    case "minus":
      setLongD((prevState) => prevState + prevState / 4);
      setLatD((prevState) => prevState + prevState / 4);
      console.log(longD);
      break;

    case "plus":
      setLongD((prevState) => prevState - prevState / 4);
      setLatD((prevState) => prevState - prevState / 4);
      console.log(longD);
      break;
  }
}


