# Places Import Guide

## Overview
MyPlaces supports two ways to import places in bulk:

## Method 1: Bulk JSON Import
Import multiple places at once using a JSON array format.

### Format:
```json
[
  {
    "name": "Central Park",
    "lat": 40.785091,
    "long": -73.968285
  },
  {
    "name": "Times Square", 
    "lat": 40.758896,
    "long": -73.985130
  },
  {
    "name": "Brooklyn Bridge",
    "lat": 40.706086,
    "long": -73.996864
  }
]
```

### Requirements:
- Must be valid JSON array format
- Each place must have: `name` (required), `lat` (required), `long` (required)
- Coordinates should be decimal degrees (Google Maps format)
- Names cannot be empty

## Method 2: Coordinate Pairs Import
Import places using a simple coordinate + name format (one per line).

### Format:
```
40.785091,-73.968285,Central Park
40.758896,-73.985130,Times Square  
40.706086,-73.996864,Brooklyn Bridge
```

### Requirements:
- One place per line
- Format: `latitude,longitude,name`
- No spaces around commas (except in the name)
- Name is required and cannot be empty
- Coordinates should be decimal degrees

## Notes:
- All imported places will automatically get a unique ID and current timestamp
- Invalid entries will be rejected and prevent the entire import
- Duplicate names are allowed (locations can have the same name)
- Coordinates will be validated to ensure they're valid lat/long values
- Existing places will not be affected by imports 