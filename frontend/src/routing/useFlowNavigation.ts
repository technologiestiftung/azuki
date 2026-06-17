import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToastStore } from "../store/useToastStore";
import { getNextPath, getPreviousPath } from "./routes";

export function useFlowNavigation() {
	const { pathname, hash } = useLocation();
	const navigate = useNavigate();

	const goNext = useCallback(() => {
		useToastStore.getState().close();
		navigate(getNextPath(pathname, hash));
	}, [navigate, pathname, hash]);

	const goPrevious = useCallback(() => {
		useToastStore.getState().close();
		navigate(getPreviousPath(pathname, hash));
	}, [navigate, pathname, hash]);

	return { pathname, hash, navigate, goNext, goPrevious };
}
