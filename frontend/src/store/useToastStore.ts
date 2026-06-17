import { create } from "zustand";

export type ToastDescriptionKey =
	| "toast.inSchool.description"
	| "toast.schoolDegree.description";

interface ToastState {
	isOpen: boolean;
	shakeKey: number;
	descriptionKey: ToastDescriptionKey | null;
}

interface ToastActions {
	showOrShake: (descriptionKey: ToastDescriptionKey) => void;
	close: () => void;
}

const initialState: ToastState = {
	isOpen: false,
	shakeKey: 0,
	descriptionKey: null,
};

export const useToastStore = create<ToastState & ToastActions>()((set) => ({
	...initialState,

	showOrShake: (descriptionKey) =>
		set((state) => {
			if (state.isOpen && state.descriptionKey === descriptionKey) {
				return { shakeKey: state.shakeKey + 1 };
			}
			return { isOpen: true, descriptionKey, shakeKey: 0 };
		}),

	close: () => set(initialState),
}));
