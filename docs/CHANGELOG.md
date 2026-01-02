# CHANGELOG

## [Unreleased] - 2025-08-30

### Package Changes
- **REMOVED**: `react-native-google-places-autocomplete@2.5.1` (was causing XMLHttpRequest timeout errors)
- **ADDED**: `react-native-google-places-autocomplete@2.5.7` (reinstalled via yarn for proper dependency management)
- **ATTEMPTED DOWNGRADE**: `react-native-maps@1.20.1` → `react-native-maps@1.18.0` (caused module resolution errors, reverted back to 1.20.1)

### Google Places Autocomplete Fixes
- **FIXED**: XMLHttpRequest timeout issues with enhanced timeout fix
- **FIXED**: onPress events not firing by adding `keepResultsAfterBlur={true}` and `keyboardShouldPersistTaps="always"`
- **IMPROVED**: Search now works for all place types (businesses, landmarks, addresses) by removing `types: "geocode"` restriction
- **ENHANCED**: Added comprehensive debugging logs for search result data structures

### Long Press Place ID Fix
- **FIXED**: Long press now gets real place_id from Google Places API instead of dummy_id
- **ADDED**: Fetch call to Google Places Find Place API to resolve actual place_id for Google Maps URLs

### UI Improvements
- **FIXED**: Modal centering by changing `width: 400` to `width: "100%"` in PlacesModal
- **ADDED**: Conditional hiding of import button when modals are open (GoogleInput, modalVisible, PlaceModalVisible, importModalVisible)
- **ADJUSTED**: Search bar positioning from `top: -490` to `top: -390`

### Known Issues
- **BROKEN**: MapView not displaying in Android emulator (works in builds)
- **CONFIRMED**: API keys are unrestricted, so not a Google Cloud Console issue
- **ISSUE**: Likely Expo Go + react-native-maps@1.20.1 + Expo SDK 53 compatibility issue
- **WORKAROUND**: Map functionality works in EAS builds, issue limited to Expo Go/emulator

### Code Structure Changes
- **ENHANCED**: Better error handling and logging throughout
- **IMPROVED**: More robust XMLHttpRequest fixes for Google Places API
- **MAINTAINED**: All core app functionality (location tracking, place management, etc.)

### Files Modified
- `App.js` - Major changes to Google Places integration and XMLHttpRequest fixes
- `components/placesModal.js` - Modal centering fix
- `package.json` - Package version updates 