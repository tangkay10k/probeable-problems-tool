import {Dropdown} from "react-bootstrap";
import {LANGUAGE_VERSIONS} from "./constants.js";

const languages = Object.entries(LANGUAGE_VERSIONS)

export default function LanguageSelector({onSelect, language}) {
    return (
        <Dropdown className="mb-1" data-bs-theme="dark">
            <Dropdown.Toggle variant="secondary" id="dropdown-basic" size={"sm"}>
                Language: {language}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {languages.map(([lang, version], index) => (
                    <Dropdown.Item
                        key={index} onClick={() => onSelect(lang)}>
                        {lang}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    )
}