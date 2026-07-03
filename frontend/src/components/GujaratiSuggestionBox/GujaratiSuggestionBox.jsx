import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './GujaratiSuggestionBox.css';

/**
 * Floating suggestion dropdown rendered via portal.
 * Positioned near the input element's caret.
 *
 * @param {Object} props
 * @param {string[]} props.suggestions - Array of Gujarati word suggestions
 * @param {number} props.selectedIndex - Currently highlighted index
 * @param {boolean} props.visible - Whether the dropdown is visible
 * @param {HTMLElement|null} props.anchorEl - The input/textarea element to anchor to
 * @param {function} props.onSelect - Called with the selected word
 */
const GujaratiSuggestionBox = ({ suggestions, selectedIndex, visible, anchorEl, onSelect }) => {
    const boxRef = useRef(null);

    // Scroll the active item into view
    useEffect(() => {
        if (!boxRef.current) return;
        const activeItem = boxRef.current.querySelector('.gu-suggestion-item--active');
        if (activeItem) {
            activeItem.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    if (!visible || !suggestions.length || !anchorEl) return null;

    // Position relative to the anchor element
    const rect = anchorEl.getBoundingClientRect();
    const style = {
        top: rect.bottom + 4,
        left: rect.left,
    };

    // If dropdown would go off-screen right, shift left
    if (style.left + 280 > window.innerWidth) {
        style.left = window.innerWidth - 290;
    }
    // If dropdown would go off-screen bottom, show above
    if (style.top + 200 > window.innerHeight) {
        style.top = rect.top - 8;
        style.transform = 'translateY(-100%)';
    }

    return createPortal(
        <div className="gu-suggestion-overlay" style={style}>
            <div className="gu-suggestion-box" ref={boxRef}>
                <ul className="gu-suggestion-list" role="listbox">
                    {suggestions.map((word, index) => (
                        <li
                            key={`${word}-${index}`}
                            role="option"
                            aria-selected={index === selectedIndex}
                            className={`gu-suggestion-item ${index === selectedIndex ? 'gu-suggestion-item--active' : ''}`}
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent input blur
                                onSelect(word);
                            }}
                        >
                            <span className="gu-suggestion-item__index">{index + 1}</span>
                            <span className="gu-suggestion-item__text">{word}</span>
                            {index === selectedIndex && (
                                <span className="gu-suggestion-item__hint">Enter</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>,
        document.body
    );
};

export default GujaratiSuggestionBox;
