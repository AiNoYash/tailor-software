import { forwardRef } from 'react';
import useGujaratiSuggestions from '../../hooks/useGujaratiSuggestions';
import GujaratiSuggestionBox from '../GujaratiSuggestionBox/GujaratiSuggestionBox';

/**
 * Drop-in replacement for <input> and <textarea> that adds
 * Gujarati transliteration suggestions when language is 'gu'.
 *
 * Usage:
 *   <TransliterateInput
 *       as="textarea"
 *       language={language}
 *       value={value}
 *       onChange={(e) => setValue(e.target.value)}
 *       className="form-input"
 *       rows={3}
 *   />
 *
 * @param {Object} props
 * @param {'input'|'textarea'} props.as - Element type (default: 'input')
 * @param {string} props.language - Current language code
 * @param {string} props.value - Controlled value
 * @param {function} props.onChange - Standard onChange handler (receives synthetic event)
 * @param {function} [props.onKeyDown] - Optional additional keyDown handler
 */
const TransliterateInput = forwardRef(({
    as: Element = 'input',
    language,
    value,
    onChange,
    onKeyDown: externalKeyDown,
    ...rest
}, ref) => {
    const {
        suggestions,
        selectedIndex,
        visible,
        inputRef,
        handleInput,
        handleKeyDown,
        handleSuggestionClick,
        hideSuggestions,
    } = useGujaratiSuggestions({
        value,
        onChange: (newValue) => {
            // Create a synthetic-like event for compatibility with existing handlers
            // that expect (e) => setState(e.target.value)
            const syntheticEvent = {
                target: { value: newValue },
                currentTarget: { value: newValue },
            };
            onChange(syntheticEvent);
        },
        language,
    });

    const handleChange = (e) => {
        handleInput(e.target.value);
    };

    const handleKeyDownCombined = (e) => {
        // Let the suggestion hook handle it first
        const consumed = handleKeyDown(e);
        // If not consumed, pass to external handler
        if (!consumed && externalKeyDown) {
            externalKeyDown(e);
        }
    };

    // Merge refs
    const setRefs = (el) => {
        inputRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
    };

    return (
        <div style={{ position: 'relative', display: 'contents' }}>
            <Element
                ref={setRefs}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDownCombined}
                onBlur={() => {
                    // Small delay so click on suggestion can fire first
                    setTimeout(hideSuggestions, 150);
                }}
                {...rest}
            />
            <GujaratiSuggestionBox
                suggestions={suggestions}
                selectedIndex={selectedIndex}
                visible={visible}
                anchorEl={inputRef.current}
                onSelect={handleSuggestionClick}
            />
        </div>
    );
});

TransliterateInput.displayName = 'TransliterateInput';

export default TransliterateInput;
