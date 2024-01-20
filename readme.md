# Repository to Markdown

## Description

This Node.js script recursively scans a specified directory (and its subdirectories) for files, reads their content, and generates a Markdown file that lists the path and content of each file. It supports an option to include or exclude hidden files and folders.

## Requirements

- Node.js
- No external dependencies are required.

## Installation

No installation is required beyond having Node.js on your system. Simply download or clone the script to your local machine.

## Usage

To use the script, run it from the command line with the following syntax:

```
npm install -g repo-to-markdown
repo-to-markdown <directory_path> [--output .] [--includeHidden]
```

## Output

The script will generate an `output.md` file in the same directory where the script is located. This file will contain the paths and contents of the scanned files, formatted in Markdown.

## Notes

- The script assumes that files are text-based and can be read as UTF-8 text.
- Be aware of potential performance issues when running the script on directories with a large number of files.
