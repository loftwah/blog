# **Manage JSON Script**

`manage-json.sh` is a Bash script for managing JSON files used in quiz applications. It provides utilities for merging, splitting, validating, and sorting JSON data, as well as working with related images.

## **Features**

- **Merge JSON Files**: Combine multiple JSON files into one, sorted by `id`.
- **Split JSON Files**: Split a JSON file into smaller files by a specified key (e.g., `tags`, `difficulty`, `category`), with automatic sorting.
- **Fix Sorting**: Sort a specific JSON file by `id`.
- **Validate JSON**: Ensures the JSON structure is valid.
- **Generate Question Templates**: Quickly create a boilerplate for new quiz questions.
- **List Available Images**: View all images in the quiz image directory.

---

## **Usage**

Run the script from the root directory of your project (e.g., `blog`).

```bash
./manage-json.sh [command] [options]
```

### **Commands**

| Command              | Description                                                       | Example                                            |
| -------------------- | ----------------------------------------------------------------- | -------------------------------------------------- |
| `help`               | Show this help message.                                           | `./manage-json.sh help`                            |
| `join`               | Merge all JSON files in `src/data` into one, sorted by `id`.      | `./manage-json.sh join`                            |
| `split [key]`        | Split JSON by a specified key (`tags`, `difficulty`, `category`). | `./manage-json.sh split tags`                      |
| `fix-sorting [file]` | Sort a specific JSON file by `id`.                                | `./manage-json.sh fix-sorting src/data/quiz1.json` |
| `generate-template`  | Create a JSON template for quiz questions in `src/data`.          | `./manage-json.sh generate-template`               |
| `list-images`        | List available images in `public/images/quiz`.                    | `./manage-json.sh list-images`                     |

---

## **Directory Structure**

The script assumes the following directory structure:

```plaintext
blog/
├── manage-json.sh        # The script itself
├── src/
│   └── data/             # JSON files directory (e.g., quiz1.json, quiz2.json)
├── public/
│   └── images/quiz/      # Image directory for quiz questions
```

---

## **Examples**

### Merge JSON Files

Combine all JSON files in `src/data` into a single file, `merged_questions.json`, sorted by `id`.

```bash
./manage-json.sh join
```

### Split JSON Files by Tags

Split `merged_questions.json` into separate files based on the `tags` field.

```bash
./manage-json.sh split tags
```

### Fix Sorting for a Single File

Sort the contents of a specific JSON file by `id`.

```bash
./manage-json.sh fix-sorting src/data/quiz1.json
```

### Generate a Question Template

Generate a JSON template (`question_template.json`) to create new questions.

```bash
./manage-json.sh generate-template
```

### List Available Images

Display all images in `public/images/quiz`.

```bash
./manage-json.sh list-images
```

---

## **Error Handling**

- If JSON files are invalid, the script will notify you with an error and stop processing.
- Ensure you run the script from the project root directory to avoid path-related issues.

---

## **Requirements**

- **jq**: For JSON processing. Install with:
  ```bash
  sudo apt install jq
  ```

---

## **Contributing**

Feel free to suggest improvements or report issues. Contributions are welcome to make this tool even more versatile.

---

## **License**

This script is free to use and modify. Attribution is appreciated.

---
