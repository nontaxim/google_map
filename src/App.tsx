import {
	ControlPosition,
	Map,
	MapControl,
	AdvancedMarker,
	MapProps,
	useMap,
	MapMouseEvent,
	Pin,
	useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { useApiIsLoaded } from '@vis.gl/react-google-maps';
import { useState, useRef, useEffect } from 'react';
import {
	getCurrentPosition,
	useAutoCompltete,
	// useAutoComplteteService,
	usePlacesService,
	useGeoCoder,
	useDirectionsService,
	useDirectionRenderer,
} from './utils';

const App = () => {
	const [selectedPlaces, setSelectedPlaces] = useState<
		google.maps.places.PlaceResult[]
	>([]);
	const [mark, setMark] = useState<
		google.maps.LatLngLiteral[] | google.maps.LatLngAltitudeLiteral[]
	>([]);
	const [path, setPath] = useState<string[]>([]);

	const isLoad = useApiIsLoaded();
	const map = useMap('map-1');
	const mapOption: MapProps = {
		defaultCenter: { lat: 13.736717, lng: 100.523186 },
		defaultZoom: 16,
		gestureHandling: 'greedy',
		reuseMaps: true,
		disableDefaultUI: true,
		className: 'w-full h-full',
	};

	// library
	const placesLib = useMapsLibrary('places');
	const geoCodeingLib = useMapsLibrary('geocoding');
	const routingLib = useMapsLibrary('routes');

	// directions service
	const directionsService = useDirectionsService(routingLib);

	const directionRenderer = useDirectionRenderer(routingLib, map);
	const panelRoute = useRef<HTMLDivElement>(null);

	// geocoder
	const geoCoder = useGeoCoder(geoCodeingLib);

	// places service
	const placesService = usePlacesService(placesLib, map);

	// autocomplete
	const inputRef = useRef<HTMLInputElement>(null);
	// const autoCompleteService = useAutoComplteteService(placesLib);

	const handlePlaceChange = () => {
		if (!autoComplete || !map) return;
		const place = autoComplete.getPlace();
		console.log('selected place:', place);

		if (!place.geometry) {
			console.log('no geometry');
			return;
		}
		const pos = place.geometry.location;
		if (pos) {
			setSelectedPlaces([...selectedPlaces, place]);
			setMark([...mark, { lat: pos.lat(), lng: pos.lng() }]);
			if (place.name) {
				setPath([...path, place.name]);
			} else if (place.formatted_address) {
				setPath([...path, place.formatted_address]);
			} else {
				setPath([...path, { lat: pos.lat(), lng: pos.lng() }.toString()]);
			}
			map.panTo(pos);
		}
	};

	const autoComplete = useAutoCompltete(placesLib, inputRef, handlePlaceChange);

	const handleClickMarker = (ev: google.maps.MapMouseEvent) => {
		if (!map) return;
		if (!ev.latLng) return;
		console.log('marker clicked:', ev.latLng.toString());
		map.panTo(ev.latLng);
	};

	const handleMoveToCurPos = () => {
		getCurrentPosition().then(
			(position) => {
				map?.panTo({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				});
				setMark([
					...mark,
					{ lat: position.coords.latitude, lng: position.coords.longitude },
				]);
			},
			(error) => {
				console.log(error);
			}
		);
	};

	useEffect(() => {
		if (navigator.geolocation) {
			const watchId = navigator.geolocation.watchPosition(
				(position) => {
					if (!map) return;
					const pos = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					};
					map.panTo(pos); // Use panTo to smoothly move the map to the current position
					map.setZoom(15);
				},
				(error) => {
					console.error('Error watching position: ', error);
				},
				{
					enableHighAccuracy: true, // Use high accuracy for better position tracking
					maximumAge: 0, // Disable caching of location data
					timeout: 5000, // Timeout for each position request
				}
			);

			// Clean up the watcher on component unmount
			return () => {
				navigator.geolocation.clearWatch(watchId);
			};
		}
	}, [map]);

	const getPlaceData = (
		latLng: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined
	) => {
		geoCoder?.geocode(
			{
				location: latLng,
				fulfillOnZeroResults: true,
				region: 'TH',
			},
			(results, status) => {
				if (status === 'OK' && results) {
					console.log('PW:', results);
					console.log('geocode:', results[0]);
					console.log('formatted_address:', results[0].formatted_address);

					const placeId = results[0].place_id;
					placesService?.getDetails(
						{
							placeId: placeId,
							// fields: ['name'],
							region: 'TH',
						},
						(place, status) => {
							if (status === 'OK' && place) {
								console.log('place:', place);
								console.log('place name:', place.name);
								setMark((prev) => {
									return [...prev, latLng].filter(
										(latLng) => latLng !== undefined
									) as google.maps.LatLngLiteral[];
								});
								if (place.name) {
									setPath([...path, place.name]);
								} else if (results[0].formatted_address) {
									setPath([...path, results[0].formatted_address]);
								} else {
									setPath([...path, `${latLng?.toString()}`]);
								}
							}
						}
					);
				} else {
					console.error('Geocode failed due to:', status);
				}
			}
		);
	};

	const handleRoute = () => {
		directionsService?.route(
			{
				origin: mark[0],
				destination: mark[1],
				travelMode: google.maps.TravelMode.DRIVING,
				region: 'TH',
				optimizeWaypoints: true,
				waypoints: mark.slice(2).map((m) => ({ location: m })),
			},
			(results, status) => {
				if (status === 'OK' && results) {
					console.log('directions:', results);
					console.log(
						'over:',
						results.routes[0].overview_path[0].lat(),
						results.routes[0].overview_path[0].lng()
					);
					console.log('sdf:', results.routes[0]);
					directionRenderer?.setDirections(results);
					directionRenderer?.setPanel(panelRoute.current);
					directionRenderer?.setOptions({
						polylineOptions: {
							strokeColor: 'black',
							icons: [
								{
									icon: {
										path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
										scale: 3,
										strokeColor: '#0d2',
										fillColor: '#0d2',
										fillOpacity: 1,
									},
									repeat: '25%',
								},
							],
						},
					});
				} else {
					if (status === 'ZERO_RESULTS') {
						console.log("can't find directions");
					} else {
						console.error('directions failed:', status);
					}
				}
			}
		);
	};

	const handleClickMap = (e: MapMouseEvent) => {
		console.log(e.detail.latLng);
		if (!e.detail.latLng) return;
		getPlaceData(e.detail.latLng);
	};

	const handleMoveMarker = (event: google.maps.MapMouseEvent, i: number) => {
		if (!event.latLng) return;
		console.log('drag end:', event.latLng?.toJSON());
		const newPosition = event.latLng.toJSON();
		const updatedMarkers = mark.map((m, index) => {
			if (index === i) {
				return newPosition;
			}
			return m;
		});
		setMark(updatedMarkers);
	};

	if (!isLoad) {
		return <div className='text-red-400'>loading</div>;
	}

	return (
		// <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_KEY}>
		<div className='max-h-screen flex flex-col w-screen h-screen text-black p-6 gap-y-4'>
			<div className='text-red-400'>hi</div>

			<button
				className='border-2 border-slate-600'
				onClick={handleMoveToCurPos}>
				Click me
			</button>
			<button className='border-2 border-slate-600' onClick={handleRoute}>
				make a Route
			</button>
			<div className='w-full h-[500px] flex gap-4'>
				<Map
					id='map-1'
					mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
					onClick={handleClickMap}
					{...mapOption}>
					<MapControl
						position={ControlPosition.BLOCK_START_INLINE_CENTER}></MapControl>
					{mark.map((m, i) => {
						return (
							<div key={i}>
								<AdvancedMarker
									position={m}
									onClick={handleClickMarker}
									onDragEnd={(e) => {
										handleMoveMarker(e, i);
									}}>
									<Pin
										background={'#FBBC04'}
										glyph={'🚗'}
										borderColor={'#000'}
									/>
								</AdvancedMarker>
							</div>
						);
					})}
				</Map>
				<div className='basis-1/2'>
					{path.map((p, i) => {
						return (
							<div key={i}>
								<p>- {p}</p>
							</div>
						);
					})}
					<br />
					<div ref={panelRoute}></div>
				</div>
			</div>
			<input type='text' className=' w-[300px] mt-2 p-2' ref={inputRef} />
		</div>
	);
};

export default App;
