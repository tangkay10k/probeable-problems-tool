import {Dropdown} from "react-bootstrap";
import {CODE_SNIPPETS, LANGUAGE_VERSIONS} from "./constants.js";
import {useEffect} from "react";
import {getRuntimes} from "../../routes/code-route.js";

const languages = Object.entries(LANGUAGE_VERSIONS)

export default function LanguageSelector({onSelect, language}) {

    useEffect(() => {
        async function fetchRuntimes() {
            try {
                const array = await getRuntimes()
                for (const key in array) {
                    if (Object.prototype.hasOwnProperty.call(LANGUAGE_VERSIONS, array[key].language)) {
                        LANGUAGE_VERSIONS[key] = array[key].version
                    }
                }
            } catch (error) {
                console.error(error)
            }
        }

        fetchRuntimes()
    }, [])

    return (
        <Dropdown className="mb-1" data-bs-theme="dark">
            <Dropdown.Toggle variant="secondary" id="dropdown-basic" size={"sm"}>
                Language: {language}
            </Dropdown.Toggle>
            <Dropdown.Menu>
                {languages.map(([lang,], index) => (
                    <Dropdown.Item
                        key={index} onClick={() => onSelect(lang)}>
                        {lang}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    )
}