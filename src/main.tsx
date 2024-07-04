import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';

const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
	},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<APIProvider region='TH' apiKey={import.meta.env.VITE_GOOGLE_MAP_KEY}>
			<RouterProvider router={router} />
		</APIProvider>
	</React.StrictMode>
);
