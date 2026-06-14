export {};

declare global {
  /** A dialog button. */
  interface DialogButton {
    /** The dialog button label. */
    readonly label: string;
    /**
     * The dialog button priority.
     * - `1`: primary
     * - `2`: secondary
     */
    readonly priority: 1 | 2;
    /** The dialog button callback. */
    readonly callback: (...args: any[]) => any;
  }
}
