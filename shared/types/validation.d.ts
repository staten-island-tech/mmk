export {};

declare global {
  /** Rule for validating a string against a condition. */
  export interface InputValidationRule {
    /** The test function to check the string against. */
    readonly test: (value: any) => boolean;
    /** The message to be displayed when the test fails. */
    readonly message: string;
  }
}
