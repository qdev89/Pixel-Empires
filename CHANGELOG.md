# Changelog

All notable changes to the Pixel Empires project will be documented in this file.

## [0.5.0] - 2025-04-20

### Added
- Animation system for visual enhancements
- Building construction animations
- Resource production animations
- Resource gain animations
- Pulse effects for active buildings
- Animation manager for coordinating all visual effects

### Changed
- Enhanced building display with visual indicators for production
- Improved resource counters with animated updates
- Updated UI with smoother transitions and effects
- Enhanced game loop to support animations

### Fixed
- Layout issues with the game map
- Resource display alignment
- Building grid spacing and responsiveness

## [0.4.0] - 2025-04-19

### Added
- Enhanced combat system with unit selection interface
- Combat modal for selecting units to send to battle
- Real-time battle prediction based on selected units
- Combat visualization with traveling, fighting, and returning phases
- Active combat tracking with progress indicators
- NPC camp respawning with increasing difficulty
- Detailed combat reports with technology effects

### Changed
- Improved combat manager to handle multiple simultaneous battles
- Enhanced map interaction for selecting targets
- Updated UI with combat status indicators
- Improved combat calculations with more detailed advantages

### Fixed
- Combat report display issues
- Unit selection validation
- Battle outcome calculations

## [0.3.0] - 2025-04-18

### Added
- Research system with technology tree
- Library building for researching technologies
- Three technology categories: Military, Economic, and Defensive
- Military technologies:
  - Improved Weapons: +20% unit attack
  - Improved Armor: +20% unit defense
  - Advanced Tactics: +10% unit type advantages
- Economic technologies:
  - Efficient Farming: +25% food production
  - Improved Mining: +25% ore production
  - Resource Management: +30% storage capacity
- Defensive technologies:
  - Reinforced Walls: +30% wall defense
  - Defensive Tactics: -20% casualties in combat
- Research UI with tabs for different technology categories
- Research progress indicator
- Technology effects system that applies bonuses to gameplay

### Changed
- Updated combat calculations to include technology bonuses
- Modified resource production to account for technology bonuses
- Enhanced storage capacity calculation with technology effects
- Improved UI with research section
- Updated game state to track researched technologies

### Fixed
- Storage capacity calculation when upgrading warehouses

## [0.2.0] - 2025-04-17

### Added
- New unit: Archer with unique stats (Attack: 7, Defense: 1, HP: 8)
- New unit: Cavalry with unique stats (Attack: 6, Defense: 2, HP: 12)
- Unit type advantages system (rock-paper-scissors)
  - Spearmen strong against Cavalry
  - Archers strong against Spearmen
  - Cavalry strong against Archers
- Unit type disadvantages
  - Spearmen weak against Archers
  - Archers weak against Cavalry
  - Cavalry weak against Spearmen
- NPC-specific unit advantages
  - Spearmen get bonus against Goblins
  - Archers get bonus against Bandits
- Enhanced combat reports with detailed battle information
- Combat advantage indicators in battle reports
- Styling for combat details and advantages

### Changed
- Updated combat calculation to include unit type advantages
- Improved combat casualty calculation based on unit advantages
- Enhanced UI to support multiple unit types
- Updated training controls for all unit types
- Modified attack button logic to consider all unit types

### Fixed
- Combat report display for multiple unit types
- Unit upkeep calculations for different unit types

## [0.1.0] - 2025-04-16

### Added
- Initial game implementation
- Basic resource system (Food, Ore)
- Building system with 6 building types:
  - Town Hall
  - Farm
  - Mine
  - Warehouse
  - Barracks
  - Wall
- Initial unit: Spearman
- Simple combat system against NPC camps
- Resource generation based on buildings
- Building upgrade system
- Basic pixel art assets
- Game loop with resource tick
- UI for resources, buildings, units, and combat

### Changed
- N/A (initial release)

### Fixed
- N/A (initial release)
