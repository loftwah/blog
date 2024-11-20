#!/bin/bash

# Set variables
JSON_DIR="./src/data" # Directory containing JSON files
IMAGE_DIR="./public/images/quiz" # Directory containing quiz images
OUTPUT_FILE="$JSON_DIR/merged_questions.json" # Default merged JSON output file

# Functions
show_help() {
    echo "Usage: $0 [command] [options]"
    echo
    echo "Ensure you are running this script from the root directory of your project (e.g., 'blog')."
    echo "Commands:"
    echo "  help                     Show this help message."
    echo "  join                     Combine all JSON files in '$JSON_DIR' into one, sorting by 'id'."
    echo "  split [key]              Split JSON by 'key' (tags, difficulty, category), sorting each split."
    echo "  fix-sorting [file]       Sort a single JSON file by 'id'."
    echo "  generate-template        Generate a JSON template for questions in '$JSON_DIR'."
    echo "  list-images              List available images in '$IMAGE_DIR'."
    echo
    echo "Examples:"
    echo "  $0 join"
    echo "  $0 split tags"
    echo "  $0 fix-sorting src/data/quiz1.json"
    echo "  $0 generate-template"
    echo "  $0 list-images"
}

validate_json() {
    FILE=$1
    if ! jq empty "$FILE" 2>/dev/null; then
        echo "Error: Invalid JSON detected in $FILE. Please fix it before proceeding."
        exit 1
    fi
}

join_files() {
    echo "Joining all JSON files in $JSON_DIR..."
    MERGED=$(mktemp) # Temporary file for sorting
    jq -s 'flatten | sort_by(.id)' "$JSON_DIR"/*.json > "$MERGED"
    validate_json "$MERGED" # Validate the merged JSON
    mv "$MERGED" "$OUTPUT_FILE"
    echo "All JSON files merged and sorted into $OUTPUT_FILE."
}

split_files() {
    if [ -z "$1" ]; then
        echo "Error: No key specified for splitting. Use 'tags', 'difficulty', or 'category'."
        exit 1
    fi

    KEY=$1
    echo "Splitting JSON files in $JSON_DIR by key: $KEY..."

    jq -c ".[] | group_by(.$KEY)[] | {key: .[0].$KEY, questions: (sort_by(.id))}" "$OUTPUT_FILE" | while read -r line; do
        GROUP_KEY=$(echo "$line" | jq -r '.key')
        GROUP_FILE="$JSON_DIR/${GROUP_KEY}_${KEY}.json"
        echo "$line" | jq -c '.questions' > "$GROUP_FILE"
        echo "Generated $GROUP_FILE, sorted by 'id'."
    done
}

fix_sorting() {
    FILE=$1
    if [ -z "$FILE" ]; then
        echo "Error: Please provide the file to sort."
        exit 1
    fi

    if [ ! -f "$FILE" ]; then
        echo "Error: File $FILE does not exist."
        exit 1
    fi

    echo "Fixing sorting for $FILE..."
    SORTED=$(mktemp)
    jq 'sort_by(.id)' "$FILE" > "$SORTED"
    validate_json "$SORTED" # Ensure sorting did not corrupt the JSON
    mv "$SORTED" "$FILE"
    echo "File $FILE has been sorted by 'id'."
}

generate_template() {
    echo "Generating JSON template..."
    cat <<EOF >"$JSON_DIR/question_template.json"
{
    "id": "unique_question_id",
    "question": "Write your question here",
    "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
    ],
    "answer": 0,
    "image": "/images/quiz/placeholder.jpg",
    "explanation": {
        "text": "Explanation of the answer.",
        "url": "https://example.com",
        "urlText": "Learn more here",
        "codeExample": {
            "code": "Example code here",
            "language": "language"
        }
    },
    "tags": ["tag1", "tag2"],
    "difficulty": "easy",
    "category": "category"
}
EOF
    echo "Template saved as $JSON_DIR/question_template.json."
}

list_images() {
    echo "Available images in $IMAGE_DIR:"
    ls "$IMAGE_DIR" | grep -E "\.(jpg|png|jpeg)$"
}

# Main script
case "$1" in
    help)
        show_help
        ;;
    join)
        join_files
        ;;
    split)
        split_files "$2"
        ;;
    fix-sorting)
        fix_sorting "$2"
        ;;
    generate-template)
        generate_template
        ;;
    list-images)
        list_images
        ;;
    *)
        show_help
        ;;
esac
