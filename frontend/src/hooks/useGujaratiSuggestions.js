import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for Gujarati transliteration suggestions.
 * Uses Google Input Tools API to suggest Gujarati words as the user types English.
 *
 * Only active when `language === 'gu'`.
 *
 * @param {Object} opts
 * @param {string} opts.value        - Current input value (controlled)
 * @param {function} opts.onChange    - Setter to update the value
 * @param {string} opts.language     - Current language code ('en' | 'gu' | 'hi')
 * @returns {Object}
 */
const useGujaratiSuggestions = ({ value, onChange, language }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [visible, setVisible] = useState(false);

    const debounceRef = useRef(null);
    const inputRef = useRef(null);
    const suggestionsRef = useRef([]);

    // Keep a mutable ref to current suggestions so callbacks see latest
    useEffect(() => {
        suggestionsRef.current = suggestions;
    }, [suggestions]);

    const hideSuggestions = useCallback(() => {
        setSuggestions([]);
        setSelectedIndex(0);
        setVisible(false);
    }, []);

    const fetchSuggestions = useCallback(async (word) => {
        // Only fetch for English characters
        if (!/^[a-zA-Z]+$/.test(word)) {
            hideSuggestions();
            return;
        }

        const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=gu-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data[0] === 'SUCCESS' && data[1]?.[0]?.[1]) {
                const results = data[1][0][1];
                setSuggestions(results);
                setSelectedIndex(0);
                setVisible(true);
            } else {
                hideSuggestions();
            }
        } catch (error) {
            console.error('Transliteration failed:', error);
            hideSuggestions();
        }
    }, [hideSuggestions]);

    /**
     * Replace the last English word in the text with the selected Gujarati word.
     */
    const replaceWord = useCallback((selectedGujaratiWord, currentValue) => {
        const text = currentValue ?? value;
        const newText = text.replace(/[a-zA-Z]+$/, selectedGujaratiWord + ' ');
        onChange(newText);
        hideSuggestions();
    }, [value, onChange, hideSuggestions]);

    /**
     * Handle input changes — extract the last word and fetch suggestions.
     */
    const handleInput = useCallback((newValue) => {
        onChange(newValue);

        if (language !== 'gu') {
            hideSuggestions();
            return;
        }

        const words = newValue.split(/\s+/);
        const currentWord = words[words.length - 1];

        if (!currentWord || !/^[a-zA-Z]+$/.test(currentWord)) {
            hideSuggestions();
            return;
        }

        // Debounce API call
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchSuggestions(currentWord);
        }, 150);
    }, [language, onChange, fetchSuggestions, hideSuggestions]);

    /**
     * Handle keydown events for suggestion navigation.
     * Returns `true` if the event was consumed (caller should preventDefault).
     */
    const handleKeyDown = useCallback((e) => {
        if (!visible || suggestionsRef.current.length === 0) return false;

        switch (e.key) {
            case 'Enter': {
                e.preventDefault();
                e.stopPropagation();
                const word = suggestionsRef.current[selectedIndex] || suggestionsRef.current[0];
                if (word) replaceWord(word);
                return true;
            }
            case 'ArrowDown': {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestionsRef.current.length - 1 ? prev + 1 : 0
                );
                return true;
            }
            case 'ArrowUp': {
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : suggestionsRef.current.length - 1
                );
                return true;
            }
            case 'Escape': {
                e.preventDefault();
                hideSuggestions();
                return true;
            }
            default:
                return false;
        }
    }, [visible, selectedIndex, replaceWord, hideSuggestions]);

    const handleSuggestionClick = useCallback((word) => {
        replaceWord(word);
        // Re-focus the input after clicking
        if (inputRef.current) inputRef.current.focus();
    }, [replaceWord]);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return {
        suggestions,
        selectedIndex,
        visible,
        inputRef,
        handleInput,
        handleKeyDown,
        handleSuggestionClick,
        hideSuggestions,
    };
};

export default useGujaratiSuggestions;
