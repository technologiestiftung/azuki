import { useCallback, useState, type UIEventHandler } from "react";
import { Footer } from "../footer/Footer";
import { content } from "../../content";
import { BottomNav } from "../bottom-nav/BottomNav";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../routing/routes";
import { useOccupationDetailScroll } from "../results-page/occupation-detail/useOccupationDetailScroll";
import {
	CollapsingHeaderTopRow,
	expandedButtonBackgroundStyle,
} from "../collapsing-header/CollapsingHeaderTopRow";
import { SecondaryIconButton } from "../primitives/buttons/SecondaryIconButton";

const SCROLL_OUT_THRESHOLD_PX = 8;

export const AboutPage = () => {
	const navigate = useNavigate();
	const { collapseProgress, onScroll } = useOccupationDetailScroll();
	const [isScrolledAway, setIsScrolledAway] = useState(false);

	const handleScroll: UIEventHandler<HTMLDivElement> = useCallback(
		(event) => {
			onScroll(event);
			const scrollY = event.currentTarget.scrollTop;
			setIsScrolledAway(scrollY > SCROLL_OUT_THRESHOLD_PX);
		},
		[onScroll],
	);

	return (
		<div className="flex flex-col h-full relative overflow-x-hidden pb-16">
			<CollapsingHeaderTopRow
				title={content["about.title"]}
				progress={collapseProgress}
				collapsedFill
				leading={
					<SecondaryIconButton
						iconSrc="/icons/arrow-back-black.svg"
						ariaLabel={content["about.backButton.ariaLabel"]}
						onClick={() => navigate(ROUTE_PATHS.profile)}
						className="transition-[background-color] duration-150"
						style={expandedButtonBackgroundStyle(collapseProgress)}
					/>
				}
			/>
			<div
				className="relative flex-1 overflow-y-auto overflow-x-hidden"
				onScroll={handleScroll}
			>
				<div className="relative flex flex-col px-4 pt-14 pb-2">
					<h1
						className="text-3xl font-semibold py-2 text-sky-900"
						style={{ opacity: 1 - collapseProgress }}
						aria-hidden={collapseProgress >= 0.5}
					>
						{content["about.title"]}
					</h1>
					<div
						className={`absolute top-0 right-0 pt-2 [animation-duration:0.6s] ${
							isScrolledAway ? "animate-slideOutRight" : "animate-slideInRight"
						}`}
					>
						<img src="/illustrations/azuki-star-peeking.svg" alt="" />
					</div>
				</div>
				<p className="text-lg px-[18px] py-2">
					{content["about.description.p1"]}
				</p>
				<p
					className="text-lg px-[18px] py-2 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-sky-200"
					dangerouslySetInnerHTML={{
						__html: content["about.description.p2"],
					}}
				/>
				<div className="flex flex-col gap-8 px-[18px] pt-8 pb-16">
					<div className="flex flex-col gap-4 items-start">
						<span className="text-sm font-medium text-sky-shade-170">
							{content["about.logobanner.projectOf"]}
						</span>
						<img
							src="/logos/technologie-stiftung-logo.svg"
							alt=""
							className="h-12"
						/>
					</div>
					<div className="flex flex-col gap-4 items-start">
						<span className="text-sm font-medium text-sky-shade-170">
							{content["about.logobanner.developedBy"]}
						</span>
						<div className="flex gap-8 justify-between">
							<img
								src={content["about.logobanner.cityLabBerlin.logoLink"]}
								alt=""
								className="h-12"
							/>
							<div className="flex items-center justify-center h-12">
								<img src="/logos/joblinge-logo.svg" alt="" />
							</div>
						</div>
					</div>
					<div className="flex flex-col gap-4 items-start">
						<span className="text-sm font-medium text-sky-shade-170">
							{content["about.logobanner.sponsoredBy"]}
						</span>
						<img src="/logos/bmas-logo.svg" alt="" className="h-[38px]" />
					</div>
				</div>
				<Footer />
			</div>
			<BottomNav />
		</div>
	);
};
