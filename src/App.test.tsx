// import { vi, it, expect } from 'vitest';
// import userEvent from '@testing-library/user-event';
// import App from './App';
// import { render, screen } from '@testing-library/react';

// vi.mock('./utils', () => ({
// 	// ... other mocks
// 	useAutoCompltete: vi.fn().mockReturnValue({
// 		getPlace: vi.fn().mockReturnValue({
// 			geometry: { location: { lat: () => 13.7563, lng: () => 100.5017 } },
// 			formatted_address: 'Mocked Address',
// 		}),
// 	}),
// }));

// it('calls handlePlaceChange on autocomplete selection', async () => {
// 	const user = userEvent.setup();
// 	const mockHandlePlaceChange = vi.fn();
// 	render(<App handlePlaceChange={mockHandlePlaceChange} />);

// 	const input = screen.getByRole('textbox');
// 	await user.type(input, 'Mocked Search');

// 	expect(mockHandlePlaceChange).toBeCalledWith({
// 		geometry: { location: { lat: () => 13.7563, lng: () => 100.5017 } },
// 		formatted_address: 'Mocked Address',
// 	});
// });
