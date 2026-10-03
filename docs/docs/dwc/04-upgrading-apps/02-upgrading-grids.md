---
sidebar_position: 2
title: "Upgrading BBjGrids"
---

# Upgrading BBjGrids

Learn about the steps needed to upgrade existing code written for BBjStandardGrid to BBjGridExWidget.

## Overview

The DWC does not offer a direct 1:1 API compatible implementation of the BBjStandardGrid and its siblings, BBjDataAwareGrid and BBjDataBoundGrid.

### Why No Direct Compatibility?

These grids were written with a legacy 1-tier architecture in mind. When they were brought over to BBj with its Thin Client Architecture, their API could not be implemented with the same performance. The event callbacks and routines these grids offered through their API result in a substantial amount of round trips between the server and the client.

## BBjGridExWidget Plug-in

The **BBjGridExWidget Plug-in** has been written with best-possible performance for the Thin Client and the Web Browser in mind. It's built on a leading 3rd party implementation of a powerful data grid, built in JavaScript and TypeScript.

The BBjGridExWidget works well in the DWC, which is why this course proposes it as one potential upgrade path for your existing data grids.

### Resources

- [BBjGridExWidget on GitHub](https://github.com/BBj-Plugins/BBjGridExWidget) - Documentation, examples, and source code

## Differences Between BBjStandardGrid and BBjGridExWidget

### Data Structure

| BBjStandardGrid | BBjGridExWidget |
|-----------------|-----------------|
| Filled cell-by-cell or using BBjVector | Built as a data grid based on a collection of records |
| | Records correspond to rows, field list defines columns |

### Supported Data Types

The BBjGridExWidget and the basiscomponents library support:

- **Core BBx types**: String, Numeric, Integer values
- **Common SQL data types**: Boolean, Dates, Timestamps

This means:
- No separate code needed to convert from/to Strings
- Data flows efficiently between database and UI when using standard SQL databases (BBj ESQL, MySQL, Postgres, etc.)

### Additional Features

The BBjGridExWidget offers user convenience features:

- Drag and drop of columns
- Switching column visibility
- Many more built-in features

### Enhanced Version

The enhanced version (available for rent) provides additional features:
- Pivot tables
- Tree grid display
- Charting capabilities

Refer to the [plug-in's homepage](https://github.com/BBj-Plugins/BBjGridExWidget) and overview document to learn more.

## Migration Steps

When migrating from BBjStandardGrid to BBjGridExWidget:

1. **Review your data structure** - Convert cell-by-cell population to record-based approach
2. **Update data types** - Take advantage of native type support
3. **Adapt event handling** - Update callbacks to use BBjGridExWidget events
4. **Test thoroughly** - Ensure all grid functionality works in DWC
