import { useState, useEffect } from "react";

export function SplashScreen() {
	const [isVisible, setIsVisible] = useState(true);
	useEffect(() => {
		setTimeout(() => {
			setIsVisible(false);
		}, 3000);
	}, []);

	if (!isVisible) {
		return null;
	}

	return (
		<div className="fixed top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-sky-100">
			<img src="/logo.svg" alt="Logo" className="w-40" />
		</div>
	);
}
