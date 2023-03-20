import { NgxToastType } from "./toast-type.enum";

export interface NgxToast {
  id?: number | string;
  title: string;
  messages: string[];
  type: NgxToastType;
  icon?: string; // Path to SVG item
  delay?: number; // 0 Means
  color?: string;
  destroy?(item: NgxToast): void;
  click?(item: NgxToast): void;
}
