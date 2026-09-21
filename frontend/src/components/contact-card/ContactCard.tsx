import { content } from "../../content";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";
import { ContactCardBottomSheet } from "./ContactCardBottomSheet";
import { useState } from "react";

interface ContactCardProps {
	title?: string;
	description?: string;
	items?: [string, string, string];
}

export function ContactCard({
	title = content["results.contactCard.title"],
	description = content["results.contactCard.description"],
	items = [
		content["results.contactCard.item.1"],
		content["results.contactCard.item.2"],
		content["results.contactCard.item.3"],
	],
}: ContactCardProps = {}) {
	const [open, setOpen] = useState(false);

	const onClose = () => {
		setOpen(false);
	};

	return (
		<div className="flex flex-col gap-5 rounded-[20px] bg-sky-50 p-4">
			<div className="flex flex-col items-center gap-4">
				<div className="flex flex-col gap-1.5">
					<h3 className="text-2xl font-semibold text-sky-900">{title}</h3>
					<p
						className="text-lg font-normal text-sky-900 leading-[140%] [&_strong]:font-semibold"
						dangerouslySetInnerHTML={{ __html: description }}
					/>
				</div>
				<ul className="flex flex-col gap-[5px]">
					{items.map((item) => (
						<li key={item} className="flex gap-[5px]">
							<img src="/icons/check.svg" alt="" className="w-5 h-5" />
							<p className="text-sm font-normal text-sky-900 leading-[140%]">
								{item}
							</p>
						</li>
					))}
				</ul>
			</div>
			<PrimaryThemedButton
				className="w-full"
				onClick={() => {
					setOpen(true);
				}}
			>
				{content["results.contactCard.consultationCta"]}
			</PrimaryThemedButton>
			<ContactCardBottomSheet open={open} onClose={onClose} />
		</div>
	);
}
