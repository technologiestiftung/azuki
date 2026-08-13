import { useState, type FormEvent } from "react";
import { BottomSheet } from "../primitives/bottom-sheet/BottomSheet";
import { PrimaryThemedButton } from "../primitives/buttons/PrimaryThemedButton";
import { content } from "../../content";
import { GhostIconButton } from "../primitives/buttons/GhostIconButton";

type Under16 = "yes" | "no";
type ContactType = "call" | "whatsapp" | "mail";

const radioClassName =
	"size-[22px] border-2 border-sky-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-300 bg-white checked:bg-white checked:border-[6px] checked:border-sky-300 appearance-none";
const labelClassName =
	"text-base font-normal leading-[140%] text-gray-700 cursor-pointer";

export interface ContactCardBottomSheetProps {
	open: boolean;
	onClose: () => void;
}
export function ContactCardBottomSheet({
	open,
	onClose,
}: ContactCardBottomSheetProps) {
	const [under16, setUnder16] = useState<Under16 | null>(null);
	const [contactType, setContactType] = useState<ContactType | null>(null);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		console.log("submit");
	};

	return (
		<BottomSheet
			open={open}
			onClose={onClose}
			ariaLabel={"Contact Card Bottom Sheet"}
			overlayDismissLabel={content["results.filter.dismissOverlay"]}
		>
			<div className="relative flex items-center justify-between py-2 px-1.5">
				<GhostIconButton
					className="relative z-10"
					onClick={onClose}
					ariaLabel={content["navigation.back"]}
					iconSrc="/icons/arrow-back-black.svg"
				/>
			</div>
			<div className="flex flex-col gap-2 px-4 pb-5">
				<h2 className="text-2xl font-semibold leading-[130%] text-sky-900">
					Kostenlose Beratung anfragen
				</h2>
				<p className="text-base font-normal text-sky-900 leading-[140%]">
					Wir beraten dich persönlich zu deinen <strong>Stärken</strong>,{" "}
					<strong>passenden Berufen</strong> und <strong>Bewerbungen</strong>.
					Schick uns deine Anfrage und wir melden uns bei dir.
				</p>
				<form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="firstname"
							className="text-lg font-medium leading-[140%] text-gray-700"
						>
							Vorname
						</label>
						<input
							type="text"
							id="firstname"
							placeholder="Angelina"
							className="w-full placeholder:text-gray-400 placeholder:text-base h-12 px-3 py-2 rounded-lg border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<label
							htmlFor="postalcode"
							className="text-lg font-medium leading-[140%] text-gray-700"
						>
							Postleitzahl
						</label>
						<input
							type="number"
							id="postalcode"
							placeholder="12345"
							className="w-full placeholder:text-gray-400 placeholder:text-base h-12 px-3 py-2 rounded-lg border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
						/>
					</div>
					<div className="flex flex-col gap-1.5">
						<fieldset className="flex flex-col gap-1.5">
							<legend className="text-lg font-medium leading-[140%] text-gray-700">
								Bist du unter 16 Jahre alt?
							</legend>
							<div className="flex justify-start items-center gap-2 min-h-8 mt-1">
								<input
									type="radio"
									id="under16-yes"
									name="under16"
									value="yes"
									checked={under16 === "yes"}
									onChange={() => setUnder16("yes")}
									className={radioClassName}
								/>
								<label htmlFor="under16-yes" className={labelClassName}>
									Ja
								</label>
							</div>
							<div className="flex justify-start items-center gap-2 min-h-8 mb-1">
								<input
									type="radio"
									id="under16-no"
									name="under16"
									value="no"
									checked={under16 === "no"}
									onChange={() => setUnder16("no")}
									className={radioClassName}
								/>
								<label htmlFor="under16-no" className={labelClassName}>
									Nein
								</label>
							</div>
						</fieldset>
						{under16 === "yes" && (
							<>
								<label
									htmlFor="birthdate"
									className="text-lg font-medium leading-[140%] text-gray-700"
								>
									Geburtsdatum
								</label>
								<input
									type="date"
									id="birthdate"
									className="w-full placeholder:text-gray-400 placeholder:text-base h-12 px-3 py-2 rounded-lg border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
								/>
							</>
						)}
					</div>
					<div className="flex flex-col gap-1.5">
						<fieldset className="flex flex-col gap-1.5">
							<legend className="text-lg font-medium leading-[140%] text-gray-700">
								Wie sollen wir dich erreichen?
							</legend>
							<div className="flex justify-start items-center gap-2 min-h-8 mt-1">
								<input
									type="radio"
									id="contact-call"
									name="contactType"
									value="call"
									checked={contactType === "call"}
									onChange={() => setContactType("call")}
									className={radioClassName}
								/>
								<label htmlFor="contact-call" className={labelClassName}>
									Anruf
								</label>
							</div>
							<div className="flex justify-start items-center gap-2 min-h-8">
								<input
									type="radio"
									id="contact-whatsapp"
									name="contactType"
									value="whatsapp"
									checked={contactType === "whatsapp"}
									onChange={() => setContactType("whatsapp")}
									className={radioClassName}
								/>
								<label htmlFor="contact-whatsapp" className={labelClassName}>
									WhatsApp
								</label>
							</div>
							<div className="flex justify-start items-center gap-2 min-h-8 mb-1">
								<input
									type="radio"
									id="contact-mail"
									name="contactType"
									value="mail"
									checked={contactType === "mail"}
									onChange={() => setContactType("mail")}
									className={radioClassName}
								/>
								<label htmlFor="contact-mail" className={labelClassName}>
									E-mail
								</label>
							</div>
						</fieldset>
						{(contactType === "call" || contactType === "whatsapp") && (
							<>
								<label
									htmlFor="phonenumber"
									className="text-lg font-medium leading-[140%] text-gray-700"
								>
									Handynummer
								</label>
								<input
									type="tel"
									id="phonenumber"
									placeholder="+49 1234567890"
									className="w-full placeholder:text-gray-400 placeholder:text-base h-12 px-3 py-2 rounded-lg border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
								/>
							</>
						)}
						{contactType === "mail" && (
							<>
								<label
									htmlFor="email"
									className="text-lg font-medium leading-[140%] text-gray-700"
								>
									E-Mail
								</label>
								<input
									type="email"
									id="email"
									placeholder="angelina@beispielmail.com"
									className="w-full placeholder:text-gray-400 placeholder:text-base h-12 px-3 py-2 rounded-lg border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
								/>
							</>
						)}
						<span className="text-sm font-normal text-gray-500 leading-[140%]">
							Weitere Informationen zu unseren Datenschutzverfahren und dazu,
							wie wir deine Privatsphäre schützen und respektieren, findest du
							in unserer{" "}
							<a
								href="https://www.lehrstellenportal.de/datenschutz"
								target="_blank"
								rel="noopener noreferrer"
								className="underline"
							>
								Datenschutzrichtlinie
							</a>
							.
						</span>
					</div>
					<PrimaryThemedButton
						type="submit"
						ariaLabel={content["results.filter.apply"]}
						title={content["results.filter.apply"]}
						className="min-w-0 mt-1"
					>
						Kostenlose Beratung anfragen
					</PrimaryThemedButton>
					<span className="text-sm font-normal flex items-center gap-1.5 text-gray-500 leading-[140%] justify-center">
						<img src="/icons/lock-gray.svg" alt="Lock" className="size-4" />
						Deine Daten werden nicht an Dritte weitergegeben
					</span>
				</form>
			</div>
		</BottomSheet>
	);
}
