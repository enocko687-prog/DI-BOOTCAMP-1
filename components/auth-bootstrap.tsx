"use client";

import { useEffect } from "react";
import { setAnonymous, setAuthError, setMember, type Member } from "../app/state/auth-slice";
import { useAppDispatch, useAppSelector } from "../app/state/hooks";

export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);

  useEffect(() => {
    if (status !== "checking") return;
    const controller = new AbortController();
    fetch("/api/members/session", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Could not check your account session.");
        }
        return (await response.json()) as {
          authenticated: boolean;
          member: Member | null;
        };
      })
      .then((result) => {
        if (result.authenticated && result.member) {
          dispatch(setMember(result.member));
        } else {
          dispatch(setAnonymous());
        }
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        dispatch(setAuthError());
      });

    return () => controller.abort();
  }, [dispatch, status]);

  return null;
}
