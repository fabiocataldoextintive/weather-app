# Fix Unit Tests

Asks for the unit test error log and the test suite command, and repairs the failing tests. Also, generates the missing unit tests in the project. It follows exactly the guidance defined in the `fix-unit-tests` rule (automatically applied to `**/*.spec.ts` files).

## Initial inputs
There are two possibilities that you must take into account:
1) User provides these pair of arguments:
- **errorLog**: the error log of the unit tests that failed (paste it here)
- **testCommand**: the command used to run the test suite (e.g. `npm test`)
2) User does not provide any arguments.

If the user provides the arguments mentioned before, pass these inputs exactly as provided, without modifying or summarizing them, to the `fix-unit-tests` rule. In the case of missing arguments, just use the `fix-unit-tests` rule.
You must follow the guidance in the `fix-unit-tests`.