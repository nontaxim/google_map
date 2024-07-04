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
import { useState, useEffect, useRef } from 'react';
import { getCurrentPosition } from './utils';

const App = () => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [selectedPlaces, setSelectedPlaces] = useState<
		google.maps.places.PlaceResult[]
	>([]);

	const isLoad = useApiIsLoaded();
	const map = useMap('map-1');
	const placesLib = useMapsLibrary('places');
	// const [placesAuto, setPlacesAuto] =
	// 	useState<google.maps.places.Autocomplete | null>(null);
	const option: MapProps = {
		defaultCenter: { lat: 13.736717, lng: 100.523186 },
		defaultZoom: 16,
		gestureHandling: 'greedy',
		reuseMaps: true,
		disableDefaultUI: true,
		className: 'w-full h-full',
	};

	const [mark, setMark] = useState<
		google.maps.LatLngLiteral[] | google.maps.LatLngAltitudeLiteral[]
	>([{ lat: 13.736717, lng: 100.523186 }]);

	useEffect(() => {
		if (!map) return;
		// map.moveCamera({ center: { lat: 10, lng: 10 }, zoom: 12 });
		console.log(map.getCenter()?.lat(), map.getCenter()?.lng());

		// do something with the map instance
	}, [map]);

	useEffect(() => {
		if (!placesLib || !map) return;

		const input = new placesLib.Autocomplete(
			inputRef.current as HTMLInputElement,
			{
				types: ['geocode'],
				componentRestrictions: { country: ['th'] },
				bounds: map.getBounds(),
				fields: ['place_id', 'geometry', 'name'],
			}
		);

		input.addListener('place_changed', () => {
			const place = input.getPlace();
			console.log(place);
			if (!place.geometry) {
				console.log('no geometry');
				return;
			}
			const pos = place.geometry.location;

			if (pos) {
				setSelectedPlaces([...selectedPlaces, place]);
				setMark([...mark, { lat: pos.lat(), lng: pos.lng() }]);
				map.setCenter(pos);
			}
		});

		// const styleAutocomplete = () => {
		// 	const pacContainer = document.querySelector('.pac-container');
		// 	if (pacContainer) {
		// 		pacContainer.classList.add(
		// 			'bg-pink-200',
		// 			'mt-[5px]',
		// 			'rounded-md',
		// 			'z-50'
		// 		);
		// 	}
		// 	const pacIcon = document.querySelectorAll('.pac-icon');
		// 	pacIcon.forEach((icon) => {
		// 		icon.classList.add(
		// 			`bg-[url(/vite.svg)]] bg-cover bg-no-repeat w-[20px] h-[20px]`
		// 		);
		// 	});

		// 	const pacItems = document.querySelectorAll('.pac-item');
		// 	pacItems.forEach((item) => {
		// 		item.classList.add('p-2', 'hover:bg-gray-100');
		// 	});
		// };
		// input.addListener('input', styleAutocomplete);

		// input.addListener('input', styleAutocomplete);
		// inputRef.current?.addEventListener('input', styleAutocomplete);
		return () => {
			// Clean up the event listener
			google.maps.event.clearInstanceListeners(input);
			// inputRef.current?.removeEventListener('input', styleAutocomplete);
		};

		// setPlacesAuto(input);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [placesLib, map]);

	const handleClick = () => {
		getCurrentPosition().then(
			(position) => {
				map?.setCenter({
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

	if (!isLoad) {
		return <div className='text-red-400'>loading</div>;
	}

	const handleClickMap = (e: MapMouseEvent) => {
		console.log(e);
		if (!e.detail.latLng) return;
		setMark([...mark, e.detail.latLng]);
	};

	return (
		// <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAP_KEY}>
		<div className='flex flex-col w-screen h-screen text-black p-6 gap-y-4'>
			<div className='text-red-400'>hi</div>

			<button className='border-2 border-slate-600' onClick={handleClick}>
				Click me
			</button>
			<div className='w-full h-full'>
				<Map
					id='map-1'
					mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
					onClick={handleClickMap}
					{...option}>
					<MapControl position={ControlPosition.BLOCK_START_INLINE_CENTER}>
						<input type='text' className=' w-[500px] mt-2 p-2' ref={inputRef} />
					</MapControl>
					{mark.map((m, i) => {
						return (
							<div key={i}>
								<AdvancedMarker
									style={{ transform: 'translate(50%, 100%)' }}
									position={m}>
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
			</div>
		</div>
	);
};

export default App;
