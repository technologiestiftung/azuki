import { useState } from "react";
import type { VacancyAddress } from "@azuki/shared";
import { content } from "../../../content";
import {
	buildVacancyMapsUrl,
	formatVacancyLocation,
} from "../utils/formatVacancyLocation";

interface VacancyAddressListProps {
	addresses: VacancyAddress[];
}

function AddressLink({ address }: { address: VacancyAddress }) {
	const label = formatVacancyLocation(address);
	const mapsUrl = buildVacancyMapsUrl(address);

	if (!mapsUrl) {
		return <span className="text-sky-900">{label}</span>;
	}

	return (
		<a
			href={mapsUrl}
			target="_blank"
			rel="noopener noreferrer"
			className="text-sky-900 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
			aria-label={content["vacancies.location.openMaps"].replace(
				"{location}",
				label,
			)}
		>
			{label}
		</a>
	);
}

export function VacancyAddressList({ addresses }: VacancyAddressListProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [first, ...rest] = addresses;

	if (!first) {
		return (
			<span className="text-sky-900 text-xl font-semibold">
				{content["results.detail.salary.unknown"]}
			</span>
		);
	}

	const showMoreLabel =
		rest.length === 1
			? content["vacancies.detail.location.showMore.one"]
			: content["vacancies.detail.location.showMore"].replace(
					"{count}",
					String(rest.length),
				);

	return (
		<div className="flex flex-col gap-3">
			<span className="text-sky-900 text-xl leading-[140%] font-semibold">
				<AddressLink address={first} />
			</span>

			{isOpen && (
				<div className="flex flex-col gap-1.5">
					{rest.map((address, index) => (
						<p key={index} className="text-base">
							<AddressLink address={address} />
						</p>
					))}
				</div>
			)}

			{rest.length > 0 && (
				<button
					type="button"
					className="self-center flex mt-1 items-center gap-2 text-base font-medium text-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
					onClick={() => setIsOpen((open) => !open)}
					aria-expanded={isOpen}
				>
					{isOpen
						? content["vacancies.detail.location.showLess"]
						: showMoreLabel}
					<img
						src={
							isOpen
								? "/icons/chevron-up-sky.svg"
								: "/icons/chevron-down-sky.svg"
						}
						alt=""
						className="size-5 shrink-0"
					/>
				</button>
			)}
		</div>
	);
}
