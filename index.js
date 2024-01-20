#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

// Les arguments de ligne de commande sont traités ici
const args = process.argv.slice(2) // On enlève les deux premiers arguments (node et le chemin du script)
const directoryPath = args[0] ? path.resolve(args[0]) : process.cwd() // Résout le chemin fourni ou utilise le répertoire courant
const includeHidden = args.includes("--includeHidden")

const outputArgIndex = args.findIndex((arg) => arg === "--output")
const outputDir =
  outputArgIndex !== -1 && args[outputArgIndex + 1]
    ? args[outputArgIndex + 1]
    : "."
const outputFile = path.join(outputDir, "output.md")

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
