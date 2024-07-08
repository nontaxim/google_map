import { useEffect, useState } from 'react';

export const getCurrentPosition = async () => {
	return new Promise<GeolocationPosition>((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(resolve, reject);
	});
};

export const usePlacesService = (
	placesLib: google.maps.PlacesLibrary | null,
	map: google.maps.Map | null
) => {
	const [placesService, setPlacesService] =
		useState<google.maps.places.PlacesService | null>(null);

	useEffect(() => {
		if (!placesLib || !map) return;

		setPlacesService(new placesLib.PlacesService(map));
	}, [placesLib, map]);

	return placesService;
};

export const useAutoComplteteService = (
	placesLib: google.maps.PlacesLibrary | null
) => {
	const [autoCompleteService, setAutoCompleteService] =
		useState<google.maps.places.AutocompleteService | null>(null);

	useEffect(() => {
		if (!placesLib) return;

		setAutoCompleteService(new placesLib.AutocompleteService());
	}, [placesLib]);

	return autoCompleteService;
};

export const useAutoCompltete = (
	placesLib: google.maps.PlacesLibrary | null,
	inputRef: React.RefObject<HTMLInputElement>,
	onPlaceChange: (place: google.maps.places.PlaceResult) => void,
	field?: string[]
) => {
	const [autoComplete, setAutoComplete] =
		useState<google.maps.places.Autocomplete | null>(null);

	useEffect(() => {
		if (!placesLib || !inputRef) return;

		const autoComplete = new placesLib.Autocomplete(
			inputRef.current as HTMLInputElement,
			{
				types: ['geocode'],
				componentRestrictions: { country: ['th'] },
				fields: ['place_id', 'geometry', 'name'],
			}
		);
		setAutoComplete(autoComplete);
		return () => {
			google.maps.event.clearInstanceListeners(autoComplete);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inputRef, placesLib]);

	useEffect(() => {
		autoComplete?.addListener('place_changed', onPlaceChange);
		autoComplete?.setFields(field);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autoComplete]);

	return autoComplete;
};

export const useGeoCoder = (
	geoCodeingLib: google.maps.GeocodingLibrary | null
) => {
	const [geoCoder, setGeoCoder] = useState<google.maps.Geocoder | null>(null);
	useEffect(() => {
		if (!geoCodeingLib) return;
		setGeoCoder(new geoCodeingLib.Geocoder());
	}, [geoCodeingLib]);
	return geoCoder;
};

export const useDirectionsService = (
	routingLib: google.maps.RoutesLibrary | null
) => {
	const [directionSer, setDirectionSer] =
		useState<google.maps.DirectionsService | null>(null);
	useEffect(() => {
		if (!routingLib) return;
		setDirectionSer(new routingLib.DirectionsService());
	}, [routingLib]);
	return directionSer;
};

export const useDirectionRenderer = (
	routingLib: google.maps.RoutesLibrary | null,
	map: google.maps.Map | null
) => {
	const [directionRendenrer, setDirectionRendenrer] =
		useState<google.maps.DirectionsRenderer | null>(null);
	useEffect(() => {
		if (!routingLib || !map) return;
		setDirectionRendenrer(
			new routingLib.DirectionsRenderer({
				map: map,
				suppressMarkers: true,
			})
		);
	}, [routingLib, map]);
	return directionRendenrer;
};
