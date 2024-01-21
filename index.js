#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const minimatch = require("minimatch")

const args = process.argv.slice(2)
const directoryPath = args[0] ? path.resolve(args[0]) : process.cwd()
const includeHidden = args.includes("--includeHidden")
const useGitIgnore = args.includes("--git")

const outputArgIndex = args.findIndex((arg) => arg === "--output")
const outputDir =
  outputArgIndex !== -1 && args[outputArgIndex + 1]
    ? args[outputArgIndex + 1]
    : "."
const outputFile = path.join(outputDir, "output.md")

function isLikelyTextFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8")
    // Check for a substantial number of non-text characters
    const nonTextChars = data.match(/[\x00-\x08\x0E-\x1F\x80-\xFF]/g) || []
    return nonTextChars.length < data.length * 0.1 // less than 10% non-text chars
  } catch (error) {
    return false
  }
}

function getGitignorePatterns(dir) {
  try {
    const gitignorePath = path.join(dir, ".gitignore")
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, "utf8")
      const patterns = gitignoreContent
        .split(/\r?\n/)
        .filter((line) => line && !line.startsWith("#"))
      return patterns.map((pattern) => path.join(dir, pattern))
    }
  } catch (error) {
    console.warn(`Unable to read .gitignore in ${dir}: ${error}`)
  }
  return []
}

function shouldIgnore(filePath, gitignorePatterns) {
  return gitignorePatterns.some((pattern) =>
    minimatch.minimatch(filePath, pattern, { dot: true, matchBase: true })
  )
}

function isHidden(filePath) {
  return path.basename(filePath).startsWith(".")
}

function listFiles(dir, filelist = [], gitignorePatterns = []) {
  if (useGitIgnore) {
    gitignorePatterns = [...gitignorePatterns, ...getGitignorePatterns(dir)]
  }

  const files = fs.readdirSync(dir)
  files.forEach(function (file) {
    const filePath = path.join(dir, file)
    if (
      (!includeHidden && isHidden(file)) ||
      (useGitIgnore && shouldIgnore(filePath, gitignorePatterns))
    ) {
      return
    }

    if (fs.statSync(filePath).isDirectory()) {
      filelist = listFiles(filePath, filelist, gitignorePatterns)
    } else {
      filelist.push(filePath)
    }
  })

  return filelist
}

function createMarkdownFile(files) {
  let markdownContent = ""
  files.forEach(function (filePath) {
    if (!isLikelyTextFile(filePath)) {
      console.warn(`Skipping likely binary or non-text file: ${filePath}`)
      return
    }
    try {
      const content = fs.readFileSync(filePath, "utf8")
      const extension = path.extname(filePath).slice(1)
      markdownContent += `path: ${filePath}\n\`\`\`${extension}\n${content}\n\`\`\`\n\n`
    } catch (error) {
      console.warn(`Error reading file ${filePath}: ${error}`)
    }
  })
  fs.writeFileSync(outputFile, markdownContent)
}

const files = listFiles(directoryPath)
createMarkdownFile(files)

console.log(`Fichier Markdown créé à ${outputFile}`)
