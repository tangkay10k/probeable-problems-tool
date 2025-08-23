import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

/**
 * Keeps a scroll container stuck to bottom when the user was already near it.
 * Also returns an imperative `scrollToBottom()` you can call after optimistic updates.
 *
 * Usage:
 *   const scrollToBottom = useStickToBottom(scrollerRef, endRef, [deps...], { threshold: 96, forceOnMount: true });
 *   // then call: requestAnimationFrame(() => requestAnimationFrame(scrollToBottom));
 */
export default function useStickToBottom(
  scrollerRef,
  endRef,
  deps = [],
  { threshold = 64, forceOnMount = true } = {},
) {
  const nearBottomRef = useRef(true);
  const mountedRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    const end = endRef?.current;
    if (!end) return;
    end.scrollIntoView({ block: "end" });
  }, [endRef]);

  // Track whether user is near bottom
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const gap = el.scrollHeight - (el.scrollTop + el.clientHeight);
      nearBottomRef.current = gap <= threshold;
    };

    onScroll(); // init
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollerRef, threshold]);

  // After relevant updates, if near bottom (or on first mount), snap to bottom
  useLayoutEffect(() => {
    const shouldStick =
      nearBottomRef.current || (forceOnMount && !mountedRef.current);
    if (shouldStick) {
      // two rAFs ensures layout & paint have settled (animations, images, markdown)
      requestAnimationFrame(() => requestAnimationFrame(scrollToBottom));
    }
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scrollToBottom;
}
