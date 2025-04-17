# Contributing to Pixel Empires

Thank you for your interest in contributing to Pixel Empires! This document provides guidelines and instructions for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/pixel-empires.git`
3. Create a new branch for your feature: `git checkout -b feature/your-feature-name`

## Development Setup

Pixel Empires is a vanilla JavaScript project with no external dependencies. To get started:

1. Open the project in your favorite code editor
2. Open `index.html` in a web browser to run the game
3. Make your changes to the codebase
4. Refresh the browser to see your changes

## Project Structure

```
pixel-empires/
├── index.html              # Main HTML file
├── styles/
│   └── main.css            # Main CSS styles
├── scripts/
│   ├── config.js           # Game configuration and constants
│   ├── gameState.js        # Core game state management
│   ├── buildings.js        # Building management
│   ├── units.js            # Unit management
│   ├── combat.js           # Combat system
│   ├── ui.js               # UI management
│   └── main.js             # Main game script
└── assets/
    ├── icons/              # Resource and unit icons
    ├── buildings/          # Building sprites
    ├── units/              # Unit sprites
    └── tiles/              # Map tile sprites
```

## Coding Guidelines

- Use consistent indentation (2 or 4 spaces)
- Follow JavaScript best practices
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable and function names

## Pixel Art Guidelines

- Maintain consistent pixel size (16x16 or 32x32)
- Follow the established color palette
- Ensure visual consistency with existing assets
- Use the `image-rendering: pixelated` CSS property for proper display

## Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the CHANGELOG.md with details of changes
3. The PR should work in all modern browsers (Chrome, Firefox, Safari, Edge)
4. Ensure your code follows the project's coding guidelines
5. Submit your PR with a clear description of the changes and their purpose

## Feature Requests

If you have ideas for new features, please open an issue with the tag "enhancement" and describe:

- The feature you'd like to see
- Why it would be valuable
- Any implementation ideas you have

## Bug Reports

When reporting bugs, please include:

- A clear description of the bug
- Steps to reproduce the issue
- Expected behavior
- Screenshots if applicable
- Browser and OS information

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a positive community

Thank you for contributing to Pixel Empires!
