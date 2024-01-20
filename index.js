const fs = require("fs")
const path = require("path")

const args = process.argv
const directoryPath = args.find((arg) => !arg.startsWith("--")) // Find the first non-flag argument as the folder path
const includeHidden = args.includes("--includeHidden") // Check if '--includeHidden' is present in the arguments
const outputFile = "output.md" // Name of the output file

if (!directoryPath) {
  console.error("Please provide a folder path as an argument.")
  process.exit(1)
}

function isHidden(filePath) {
  return path.basename(filePath).startsWith(".")
}

function listFiles(dir, filelist = []) {
  const files = fs.readdirSync(dir)
  files.forEach(function (file) {
    if (!includeHidden && isHidden(file)) {
      return
    }

    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      filelist = listFiles(filePath, filelist)
    } else {
      filelist.push(filePath)
    }
  })
  return filelist
}

function createMarkdownFile(files) {
  let markdownContent = ""
  files.forEach(function (filePath) {
    const content = fs.readFileSync(filePath, "utf8")
    const extension = path.extname(filePath).slice(1) // Extract file extension without the dot
    markdownContent += `path: ${filePath}\n\`\`\`${extension}\n${content}\n\`\`\`\n\n`
  })
  fs.writeFileSync(outputFile, markdownContent)
}

const files = listFiles(directoryPath)
createMarkdownFile(files)

console.log(`Markdown file created at ${outputFile}`)
