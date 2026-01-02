// Minimal XMLHttpRequest timeout fix - only for Google Places API, not map tiles
// NOTE: This file is imported for side effects.
if (global.XMLHttpRequest) {
  const originalSend = global.XMLHttpRequest.prototype.send;

  global.XMLHttpRequest.prototype.send = function (body) {
    // Only fix timeout for Google Places API calls, leave map tiles alone
    if (
      this.responseURL &&
      this.responseURL.includes("googleapis.com/maps/api/place")
    ) {
      if (this.timeout === undefined || this.timeout === null || this.timeout === 0) {
        this.timeout = 15000;
      }
    }

    return originalSend.call(this, body);
  };
}


