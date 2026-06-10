import { useCallback, useEffect, useState } from "react";
import { content } from "../../content";
import { DEFAULT_LOCATION } from "../../store/useAppStore";
import { resolveLocationFromCoordinates } from "../../api/resolvePlzFromCoordinates";
import { FilterBottomSheetShell } from "./FilterBottomSheetShell";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";
import { Pill } from "../primitives/buttons/Pill";
import { getSelectedLocationDisplay } from "./plzLocality";

export const RADIUS_OPTIONS = [2, 5, 10, 20, 25, 30, 50, 100] as const;
const PLZ_REGEX = /^\d{5}$/;

export interface LocationFilterState {
	postcode: string;
	distance: number;
	locality?: string | null;
}

export const DEFAULT_LOCATION_FILTER: LocationFilterState = {
	postcode: DEFAULT_LOCATION.postcode,
	distance: DEFAULT_LOCATION.distance,
};

export interface LocationFilterBottomSheetProps {
	open: boolean;
	onClose: () => void;
	initialFilters?: Partial<LocationFilterState>;
	onApply?: (state: LocationFilterState) => void;
	onReset?: () => void;
}

export function LocationFilterBottomSheet({
	open,
	onClose,
	initialFilters,
	onApply,
	onReset,
}: LocationFilterBottomSheetProps) {
	const [draftPlz, setDraftPlz] = useState(
		initialFilters?.postcode ?? DEFAULT_LOCATION_FILTER.postcode,
	);
	const [draftDistance, setDraftDistance] = useState(
		initialFilters?.distance ?? DEFAULT_LOCATION_FILTER.distance,
	);
	const [draftLocality, setDraftLocality] = useState<string | null>(
		initialFilters?.locality ?? null,
	);
	const [regionSelected, setRegionSelected] = useState(
		Boolean(initialFilters?.locality),
	);
	const [locating, setLocating] = useState(false);
	const [locationError, setLocationError] = useState<string | null>(null);

	useEffect(() => {
		setDraftPlz(initialFilters?.postcode ?? DEFAULT_LOCATION_FILTER.postcode);
		setDraftDistance(
			initialFilters?.distance ?? DEFAULT_LOCATION_FILTER.distance,
		);
		setDraftLocality(initialFilters?.locality ?? null);
		setRegionSelected(Boolean(initialFilters?.locality));
	}, [
		initialFilters?.postcode,
		initialFilters?.distance,
		initialFilters?.locality,
	]);

	const handleReset = () => {
		setDraftPlz(DEFAULT_LOCATION_FILTER.postcode);
		setDraftDistance(DEFAULT_LOCATION_FILTER.distance);
		setDraftLocality(null);
		setRegionSelected(false);
		setLocating(false);
		setLocationError(null);
		onReset?.();
	};

	const handleUseCurrentLocation = useCallback(() => {
		if (!navigator.geolocation) {
			setLocationError(content["results.filter.location.error.unavailable"]);
			return;
		}
		if (locating) {
			return;
		}

		setLocationError(null);
		setLocating(true);
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				try {
					const location = await resolveLocationFromCoordinates(
						position.coords.latitude,
						position.coords.longitude,
					);
					if (location) {
						setDraftPlz(location.plz);
						setDraftLocality(location.locality);
						setRegionSelected(true);
					} else {
						setLocationError(
							content["results.filter.location.error.geocodeFailed"],
						);
					}
				} finally {
					setLocating(false);
				}
			},
			() => {
				setLocating(false);
				setLocationError(
					content["results.filter.location.error.permissionDenied"],
				);
			},
			{ enableHighAccuracy: true, timeout: 10_000 },
		);
	}, [locating]);

	const handleApply = () => {
		const postcode = PLZ_REGEX.test(draftPlz)
			? draftPlz
			: (initialFilters?.postcode ?? DEFAULT_LOCATION_FILTER.postcode);

		onApply?.({ postcode, distance: draftDistance, locality: draftLocality });
		onClose();
	};

	const selectedLocationDisplay = getSelectedLocationDisplay({
		postcode: draftPlz,
		regionLabel: content["results.region"],
		useSpecificLocation: regionSelected,
		locality: draftLocality,
	});

	return (
		<FilterBottomSheetShell
			open={open}
			onClose={onClose}
			title={content["results.filter.location.title"]}
			ariaLabel={content["results.filter.location.title"]}
			onReset={handleReset}
			resetDisabled={!regionSelected}
			onApply={handleApply}
		>
			<div className="flex flex-col min-w-0 gap-2 px-4 pt-4 pb-8">
				<div
					className={`flex flex-col justify-center items-center gap-2 min-h-[52px] p-3 w-full rounded-xl border-2 text-lg font-medium ${
						regionSelected
							? "border-sky-300 bg-sky-50 text-sky-700"
							: "border-gray-200 bg-transparent text-gray-700"
					}`}
				>
					{selectedLocationDisplay}
				</div>
				<PrimaryThemedButton
					ariaLabel={
						content["results.filter.location.currentLocation.ariaLabel"]
					}
					title={
						content["results.filter.location.currentLocation.button.label"]
					}
					disabled={locating}
					onClick={handleUseCurrentLocation}
				>
					<img src="/icons/location.svg" alt="" className="h-6 w-6" />
					{content["results.filter.location.currentLocation.button.label"]}
				</PrimaryThemedButton>
				{locationError && (
					<p className="px-1 text-sm text-red-500" role="alert">
						{locationError}
					</p>
				)}
				{regionSelected && (
					<>
						<div className="text-lg text-gray-400 pt-4 px-1">
							{content["results.filter.location.distance.title"]}
						</div>
						<div className="flex gap-x-2 gap-y-3 flex-wrap pt-2">
							{RADIUS_OPTIONS.map((km) => (
								<Pill
									key={km}
									label={`${km} km`}
									selected={draftDistance === km}
									onClick={() => setDraftDistance(km)}
									ariaLabel={`${km} km`}
								/>
							))}
						</div>
					</>
				)}
			</div>
		</FilterBottomSheetShell>
	);
}
