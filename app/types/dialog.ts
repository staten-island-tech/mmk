/** A dialog button. */
export interface DialogButton {
  /** The dialog button label. **/
  readonly label: string;
  /**
   * The dialog button priority.
   * - `1` = Primary
   * - `2` = Secondary
   */
  readonly priority: 1 | 2;
  /** The dialog button callback. */
  readonly callback: (...args: any[]) => any;
}
