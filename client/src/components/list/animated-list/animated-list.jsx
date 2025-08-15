import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import "./animated-list.css";

/**
 * Animated item that flips its enter direction depending on `insertDirection`.
 */
const AnimatedItem = ({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
  insertDirection = "tail", // "tail" | "head"
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, triggerOnce: false });

  const variants = {
    tail: {
      hidden: { y: 8, scale: 0.98, opacity: 0 },
      visible: { y: 0, scale: 1, opacity: 1 },
    },
    head: {
      hidden: { y: -8, scale: 0.98, opacity: 0 },
      visible: { y: 0, scale: 1, opacity: 1 },
    },
  };

  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants[insertDirection]}
      transition={{ duration: 0.2, delay }}
      style={{ marginBottom: "1rem", cursor: "pointer" }}
      layout
    >
      {children}
    </motion.div>
  );
};

/**
 * Scrollable animated list with keyboard navigation and gradient fades.
 * `insertDirection` controls animation direction and scroll compensation when items are prepended.
 */
const AnimatedList = ({
  items = [],
  renderItem,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = "",
  itemClassName = "",
  displayScrollbar = false,
  initialSelectedIndex = -1,
  insertDirection = "tail", // "tail" | "head"
}) => {
  const listRef = useRef(null);

  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  // Refs to keep scroll stable when prepending items
  const prevLenRef = useRef(items.length);
  const prevScrollHRef = useRef(0);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1),
    );
  };

  // Keyboard navigation
  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          e.preventDefault();
          onItemSelect?.(items[selectedIndex], selectedIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

  // Auto-scroll selected item into view when navigating by keyboard
  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(
      `[data-index="${selectedIndex}"]`,
    );
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;

      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
      } else if (
        itemBottom >
        containerScrollTop + containerHeight - extraMargin
      ) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: "smooth",
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  /**
   * Keep the viewport anchored when items are PREPENDED.
   * We capture the "before" scrollHeight in the cleanup, then on the next
   * layout effect (after DOM updates) we compute the delta and nudge scrollTop.
   */
  useLayoutEffect(() => {
    const container = listRef.current;

    const newLen = items.length;
    const prevLen = prevLenRef.current;

    if (insertDirection === "head" && newLen > prevLen && container) {
      const before = prevScrollHRef.current || container.scrollHeight;
      const after = container.scrollHeight;
      const delta = after - before;

      // Nudge down so the same content stays under the cursor/eyes
      container.scrollTop += delta;
    }

    prevLenRef.current = newLen;

    // Cleanup runs before the next effect when items change.
    // Capture current scrollHeight as "before" for the next render.
    return () => {
      if (listRef.current) {
        prevScrollHRef.current = listRef.current.scrollHeight;
      }
    };
  }, [items, insertDirection]);

  return (
    <div className={`scroll-list-container ${className}`}>
      <div
        ref={listRef}
        className={`scroll-list ${!displayScrollbar ? "no-scrollbar" : ""}`}
        onScroll={handleScroll}
      >
        {items.map((item, index) => {
          const content = renderItem ? (
            renderItem(item, index)
          ) : (
            <div
              className={`item ${selectedIndex === index ? "selected" : ""} ${itemClassName}`}
            >
              <p className="item-text">{item}</p>
            </div>
          );

          return (
            <AnimatedItem
              key={index /* Prefer a stable key from your data if possible */}
              delay={0.1}
              index={index}
              insertDirection={insertDirection}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => {
                setSelectedIndex(index);
                onItemSelect?.(item, index);
              }}
            >
              {content}
            </AnimatedItem>
          );
        })}
      </div>

      {showGradients && (
        <>
          <div
            className="top-gradient"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="bottom-gradient"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  );
};

export default AnimatedList;
