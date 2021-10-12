# Ionic Secure Storage Bug Reproduction
- This repo is intended to demonstrate a bug in the ionic secure storage plugin.
- The bug is that when attempting to select data from a table, using a parameterized number to filter to an number in a json blob is not returning records.

# How to run
- Update `ionic.config.json` and `.npmrc` with the proper product key/app id info
- Run `npm ci`
- Run `npm run build`
- Run `npx cap sync`
- Run `npx cap run android`
- There are two buttons
  - One will run the sql statement successfully without a parameterized number value
  - The other will run a parameterized sql statement that will never return a result
- You will see a message that either outputs the value, or displays an error

# Explanation of the problem
- In the example, we create a table (`jsonTable`) with a single column (`jsonData`)
- We insert the following value: `{ numberProp: 5 }`
- We then attempt to select that value in one of two ways:
  - Using a number embedded within the sql string:
    - ```
      const result = await db.executeSql(
        `SELECT jsonData FROM jsonDataTable WHERE json_extract(jsonData, '$.numberProp')=${this.jsonData.numberProp}`,
        []
      );
      ```
    - This way works as you would expect and returns the data properly
  - Using a number as a sql query parameter:
    - ```
      const result = await db.executeSql(
        `SELECT jsonData FROM jsonDataTable WHERE json_extract(jsonData, '$.numberProp')=?`,
        [this.jsonData.numberProp]
      );
      ```
      - This way does not work as expected
      - It always returns 0 rows
- Fwiw, we have been using `cordova-sqlite-ext` previously, and all of our sql statements worked perfectly fine in this scenario
- This is a much simplified version of what we are doing that seems to show the bare minimum to reproduce the issue
- We *could* work around it by embedding all number values into the sql statements, but that definitely does not feel like a solution.
- Parameterized sql is a good thing that we would like to be able to utilize as much as possible
