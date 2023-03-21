import { NgxToastType } from "./toast-type.enum";

export interface NgxToast {
  messages: string[];
  type: NgxToastType;
  id?: number | string;
  title?: string;
  icon?: string; // Path to SVG item
  delay?: number; // 0 Means
  color?: string;
  destroy?(item: NgxToast): void;
  click?(item: NgxToast): void;
  close?(item: NgxToast): void;
}
