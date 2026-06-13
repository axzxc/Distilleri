# Distilleri - Browser Extension for Opinion Highlighting and Fallacy Detection

## Project Overview

Distilleri is a browser extension that helps users identify and highlight opinions vs facts, and detect logical fallacies in web content.

## Key Features

- **Opinion Highlighting**: Automatically identifies and highlights opinionated content
- **Fallacy Detection**: Detects common logical fallacies in text
- **Real-time Analysis**: Works as users browse the web

## Installation

1. Clone this repository
2. Open browser extensions page
3. Load unpacked extension from the project directory
4. Enable the extension in your browser

## Usage

1. Navigate to any webpage
2. Click the Distilleri extension icon
3. Review highlighted opinions and detected fallacies
4. Export analysis reports as needed

## Architecture

- **Content Parser**: Extracts and analyzes text from web pages
- **Opinion Detector**: ML-based opinion/fact classification
- **Fallacy Engine**: Rule-based fallacy detection system
- **UI Layer**: Browser extension interface

## Development

See `INSTALL.md` for development setup and configuration options.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
