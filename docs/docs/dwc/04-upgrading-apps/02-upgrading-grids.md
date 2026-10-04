---
title: "Upgrading BBjGrids"
description: Upgrade code written for BBjStandardGrid to BBjGridExWidget.
---

Learn about the steps needed to upgrade existing code written for BBjStandardGrid to BBjGridExWidget.

## Overview

The DWC does not offer a direct 1:1 API compatible implementation of the BBjStandardGrid and its siblings, BBjDataAwareGrid and BBjDataBoundGrid.

### Why No Direct Compatibility?

These grids were written with a legacy 1-tier architecture in mind. When they were brought over to BBj with its Thin Client Architecture, their API could not be implemented with the same performance. The event callbacks and routines these grids offered through their API result in a substantial amount of round trips between the server and the client.

## BBjGridExWidget Plug-in

The **BBjGridExWidget Plug-in** has been written with best-possible performance for the Thin Client and the Web Browser in mind. It's built on a leading third-party implementation of a powerful data grid, built in JavaScript and TypeScript.

The BBjGridExWidget works well in the DWC, which is why this course proposes it as one potential upgrade path for your existing data grids.

### Resources

- [BBjGridExWidget on GitHub](https://github.com/BBj-Plugins/BBjGridExWidget) - Documentation, examples, and source code
- [BBjGridExWidget intro page](https://documentation.basis.cloud/BASISHelp/WebHelp/bbutil/BBjGridExWidget/BBjGridExWidget.htm) - The BASIS Documentation page for the plug-in

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

Refer to the [plug-in's homepage](https://github.com/BBj-Plugins/BBjGridExWidget) and the [overview document](https://documentation.basis.cloud/BASISHelp/WebHelp/bbutil/BBjGridExWidget/BBjGridExWidget.htm) to learn more.

## Install the Plug-In

Use the Plug-In Manager to install the BBjGridExWidget on your system. You can find the Plug-In Manager in the start menu, or type `RUN "PM"` in a BBj console. This assumes you use the default `PREFIX`, which contains the `<bbx>/plugins` directory.

The Plug-In Manager comes with a [getting started document](https://bbj-plugins.com/en/get-started) that describes the steps to install a plug-in.

### Inspect the Demos

The BBjGridExWidget comes with demo programs that you can start from the Plug-In Manager. The demos show how to implement functionality that this course does not cover. To read the source code, open the BBjGridExWidget plug-in folder in your IDE, then load and run the demo programs.

### Review the JavaDoc

The BBjGridExWidget [API is documented in JavaDoc format](https://bbj-plugins.github.io/BBjGridExWidget/javadoc/). Besides the demos, the JavaDoc pages are the most important source of information about the grid and the methods it exposes.

## Working with ResultSet and DataRow

The central classes for data handling, not only for the BBjGridExWidget, live in the [basiscomponents](https://basishub.github.io/components/javadoc/overview-tree.html) library.

A [DataRow](https://basishub.github.io/components/javadoc/com/basiscomponents/db/DataRow.html) holds an entire record of a data table. It consists of fields that each have a name and a type. The supported data types are the ones most current SQL databases know, not just the numbers and strings of the legacy BBx language. If you know the [BBjTemplatedString](https://documentation.basis.cloud/BASISHelp/WebHelp/bbjobjects/API/bbjtemplatedstring/bbjtemplatedstring.htm), think of a DataRow as its counterpart: it implements most of the same methods. It can also convert from and to BBj strings by using the string templates you know from the BBx language.

A [ResultSet](https://basishub.github.io/components/javadoc/com/basiscomponents/db/ResultSet.html) is a collection of DataRows. Besides holding the data, it offers convenience methods that convert to and from JSON, to Excel, to CSV, or to a JRDataSource for use with JasperReports.

**Creating a new DataRow from code**

The following snippet creates a DataRow and sets two string fields and one field that contains a `java.sql.Date`. Like BBjTemplatedStrings, the DataRow can also hold field attributes.

```bbj
use com.basiscomponents.db.DataRow
record! = new DataRow()
record!.setFieldValue("LAST_NAME","Picard")
record!.setFieldValue("FIRST_NAME","Jean-Luc")
record!.setFieldValue("DOB",java.sql.Date.valueOf("2305-07-23"))
record!.setFieldAttribute("DOB","DATEMASK","%Dl, %Dz. of %Ml, %Yl")
PRINT
: record!.getFieldAsString("LAST_NAME")+", "+
: record!.getFieldAsString("FIRST_NAME")+", born "+
: DATE(record!.getFieldAsNumber("DOB"):
: record!.getFieldAttribute("DOB","DATEMASK"))
```

You instantiate the DataRow with the `new` keyword, like most Java classes. Then you use `setFieldValue` to set the field contents. Unlike the classic BBj templated strings, the DataRow can add fields dynamically and does not need to be initialized with `DIM`.

**Upgrading existing code that uses BBx templated strings**

The DataRow class has a factory method, [fromTemplate](https://basishub.github.io/components/javadoc/com/basiscomponents/db/DataRow.html#fromTemplate(java.lang.String,java.lang.String)), that creates a DataRow from a BBx string template and a plain string. The string is typically a record that comes from a data file. Changing the previous sample to start from a BBx string template shows the concept:

```bbj
use com.basiscomponents.db.DataRow
TPL$="LAST_NAME:C(25*),FIRST_NAME:C(25*),DOB:N(7)"
DIM R$:TPL$

R.LAST_NAME$="Picard"
R.FIRST_NAME$="Jean-Luc"
R.DOB=JUL(2305,7,23)

record! = DataRow.fromTemplate(TPL$,R$)
PRINT
: record!.getFieldAsString("LAST_NAME")+", "+
: record!.getFieldAsString("FIRST_NAME")+", born "+
: DATE(record!.getFieldAsNumber("DOB"):"%Dl, %Dz. of %Ml, %Yl")
```

**Combining DataRows into a ResultSet**

To load a grid with data, you combine the single records into a [ResultSet](https://basishub.github.io/components/javadoc/com/basiscomponents/db/ResultSet.html). Create the ResultSet with `new`, then use the [add](https://basishub.github.io/components/javadoc/com/basiscomponents/db/ResultSet.html#add(com.basiscomponents.db.DataRow)) method to add the records:

```bbj
use com.basiscomponents.db.DataRow
use com.basiscomponents.db.ResultSet
rs! = new ResultSet()

record! = new DataRow()
record!.setFieldValue("LAST_NAME","Picard")
record!.setFieldValue("FIRST_NAME","Jean-Luc")
rs!.add(record!)

record! = new DataRow()
record!.setFieldValue("LAST_NAME","Spock")
record!.setFieldValue("FIRST_NAME","S'Chn T'Gai")
rs!.add(record!)

record! = new DataRow()
record!.setFieldValue("LAST_NAME","Uhura")
record!.setFieldValue("FIRST_NAME","Nyota")
rs!.add(record!)
```

You can give the resulting `rs!` variable to the BBjGridExWidget to load it with data.

**Loading a ResultSet from SQL**

If your data comes from SQL, you can create a ResultSet directly with SqlQueryBC:

```bbj
use com.basiscomponents.db.ResultSet
use com.basiscomponents.bc.SqlQueryBC
sbc! = new SqlQueryBC(BBjAPI().getJDBCConnection("CDStore"))
rs! = sbc!.retrieve("SELECT  * FROM CDINVENTORY")
```

The [CDStore sample](https://github.com/BBj-Plugins/BBjGridExWidget/blob/master/demo/CD-Store.bbj) of the BBjGridExWidget uses this method to retrieve the data and post it to the grid.

## Set Up a Simple BBjGridExWidget

You can load the ResultSet from the previous section into a BBjGridExWidget with the `setData` method of its API:

```bbj
use ::BBjGridExWidget/BBjGridExWidget.bbj::BBjGridExWidget
use com.basiscomponents.db.ResultSet
use com.basiscomponents.db.DataRow

wnd! = BBjAPI().openSysGui("X0").addWindow("Hello BBj DWC", $01111083$)
wnd!.setPanelStyle("height","100%")

cw! = wnd!.addChildWindow("",$00108000$,BBjAPI().getSysGui().getAvailableContext())
cw!.setStyle("height","100%")
cw!.setStyle("width","100%")
grid! = new BBjGridExWidget(cw!)

rs! = new ResultSet()

record! = new DataRow()
record!.setFieldValue("LAST_NAME","Picard")
record!.setFieldValue("FIRST_NAME","Jean-Luc")
rs!.add(record!)

record! = new DataRow()
record!.setFieldValue("LAST_NAME","Spock")
record!.setFieldValue("FIRST_NAME","S'Chn T'Gai")
rs!.add(record!)

record! = new DataRow()
record!.setFieldValue("LAST_NAME","Uhura")
record!.setFieldValue("FIRST_NAME","Nyota")
rs!.add(record!)

grid!.setData(rs!)

process_events
```

Run this program in the DWC. The grid takes the full browser canvas to display the BBjGridExWidget.

### Styling and Configuring the Grid

With the basic loading of data working, you can look at examples for often needed functionality. You find the demos in the `demo` subfolder of the BBjGridExWidget plug-in on your disk, or you can browse them [online on GitHub](https://github.com/BBj-Plugins/BBjGridExWidget/tree/master/demo).

## Migration Steps

When migrating from BBjStandardGrid to BBjGridExWidget:

1. **Review your data structure** - Convert cell-by-cell population to record-based approach
2. **Update data types** - Take advantage of native type support
3. **Adapt event handling** - Update callbacks to use BBjGridExWidget events
4. **Test thoroughly** - Ensure all grid functionality works in DWC
