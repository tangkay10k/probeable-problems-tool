import json
import os
import sys
from typing import List, Dict, Any

from dotenv import load_dotenv
from openai import OpenAI

API_KEY = "OPENAI_API_KEY"
CHAT_MODEL = "o4-mini"
RESPONSE_SCHEMA = 'client-response.json'

QUESTION_DIR = "question-data/"
CHAT_HISTORY = QUESTION_DIR + "question1-base-history.json"
USER_PROBES = QUESTION_DIR + "question1-probes.json"
RESULTS_FILE = QUESTION_DIR + "question1-results.json"

def load_api_key() -> str:
    # Load .env from the directory where this script resides
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dotenv_path = os.path.join(script_dir, ".env")
    load_dotenv(dotenv_path)

    key = os.getenv(API_KEY)
    if not key:
        sys.stderr.write(
            "ERROR: OPENAI_API_KEY not found.\n"
            "Create a .env (in the same directory as this script) with:\n"
            "  OPENAI_API_KEY=sk-...\n"
        )
        sys.exit(1)
    return key

def load_history(path):
    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    if isinstance(raw, list) and raw and isinstance(raw[0], dict) and "messages" in raw[0]:
        return _normalize_to_openai(raw[0]["messages"])

    raise ValueError("Unrecognized history schema; expected list of messages, or object(s) with 'messages' key.")

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def _normalize_to_openai(messages):
    """Convert your schema → OpenAI messages."""
    out = []
    role_map = {
        "SYSTEM": "system",
        "ASSISTANT": "assistant",
        "USER": "user",
        "DEVELOPER": "developer",
    }
    for i, m in enumerate(messages):
        role_raw = m.get("role")
        if role_raw is None:
            raise ValueError(f"Message #{i} is missing 'role'")
        role = role_map.get(str(role_raw).upper(), str(role_raw).lower())

        content = m.get("content")
        if isinstance(content, dict):
            # Prefer the 'message' field if present
            content = content.get("message") if "message" in content else json.dumps(content, ensure_ascii=False)
        elif content is None:
            content = ""
        elif not isinstance(content, str):
            content = json.dumps(content, ensure_ascii=False)

        out.append({"role": role, "content": content})
    return out

def make_user_message(text: Any) -> Dict[str, str]:
    """
    Convert arbitrary input to an OpenAI user message.
    - Coerces non-strings to JSON (so dicts/lists are safe).
    - Strips surrounding whitespace.
    """
    if text is None:
        raise ValueError("text cannot be None")

    if not isinstance(text, str):
        text = json.dumps(text, ensure_ascii=False)

    text = text.strip()
    if not text:
        raise ValueError("text cannot be empty/whitespace")

    return {"role": "user", "content": text}

def single_LLM_call(message: str) -> int:
    api_key = load_api_key()
    messages = load_history(CHAT_HISTORY)

    # Append current user message we want to test the constraint it targets
    messages.append(make_user_message(message))

    # Double check what we are sending:
    print(messages[2])

    client = OpenAI(api_key=api_key)
    response_schema = load_json(RESPONSE_SCHEMA)


    try:
        completion = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=messages,
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": "ClientProbe",
                    "schema": response_schema,
                    "strict": True
            }
    },
        )
    except Exception as e:
        sys.stderr.write(f"OpenAI API error: {e}\n")
        sys.exit(1)

    try:
        content = completion.choices[0].message.content
    except Exception:
        content = "FAILED TO CALL"
    
    response_schema = json.loads(content)
    return response_schema["constraint_targeting"]

def write_data_to_json_file(data: dict, filename: str):
    """
    Writes a dictionary (map) to a JSON file.

    Parameters:
        data (dict): The dictionary to write.
        filename (str): The path of the file to write to.
    """
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"Successfully wrote data to {filename}")
    except Exception as e:
        print(f"Error writing JSON to file: {e}")

def main() -> None:
    results = {}

    question_map = load_json(USER_PROBES)
    for constraint in question_map: # The key is the constraint number
        questions = question_map.get(constraint)["questions"]

        # Call each question twice, 5 questions x 2 = 10 calls
        for _ in range(0, 2):
            for question in questions:
                constraint_classification = single_LLM_call(question)
                actual = int(constraint_classification)
                expected = int(constraint)
                print("LLM classified this question as constraint: ", actual, "The constraint actually was: ", expected)

                if constraint not in results:
                    results[constraint] = {"Correct": 0, "Incorrect": 0}

                if (actual == expected):
                    print("Classified Correctly")
                    results[constraint]["Correct"] += 1
                else:
                    print("Classified Incorrectly")
                    results[constraint]["Incorrect"] += 1

    write_data_to_json_file(results, RESULTS_FILE)    

if __name__ == "__main__":
    main()
