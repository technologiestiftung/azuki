import { content } from "../../content";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";

export function ContactCard() {
	return (
		<div className="flex flex-col gap-5 rounded-[20px] bg-sky-50 p-4">
			<div className="flex flex-col items-center gap-4">
				<div className="flex flex-col gap-1.5">
					<h3 className="text-2xl font-semibold text-sky-900">
						{content["results.contactCard.title"]}
					</h3>
					<p
						className="text-lg font-normal text-sky-900"
						dangerouslySetInnerHTML={{
							__html: content["results.contactCard.description"],
						}}
					/>
				</div>
				<ul className="flex flex-col gap-[5px]">
					<li className="flex gap-[5px]">
						<img src="/icons/check.svg" alt="" className="w-5 h-5" />
						<p className="text-sm font-normal text-sky-900">
							{content["results.contactCard.item.1"]}
						</p>
					</li>
					<li className="flex gap-[5px]">
						<img src="/icons/check.svg" alt="" className="w-5 h-5" />
						<p className="text-sm font-normal text-sky-900">
							{content["results.contactCard.item.2"]}
						</p>
					</li>
					<li className="flex gap-[5px]">
						<img src="/icons/check.svg" alt="" className="w-5 h-5" />
						<p className="text-sm font-normal text-sky-900">
							{content["results.contactCard.item.3"]}
						</p>
					</li>
				</ul>
			</div>
			<PrimaryThemedButton
				className="w-full"
				disabled
				onClick={() => {
					//TODO: open contact form
				}}
			>
				{content["results.contactCard.consultationCta"]}
			</PrimaryThemedButton>
		</div>
	);
}
