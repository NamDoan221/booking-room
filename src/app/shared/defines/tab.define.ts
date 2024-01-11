import { ITab } from "../interfaces/tab.interface";

export const TabsDefault = (): ITab[] => {
  return [
    {
      key: 'onl',
      title: 'Đang hoạt động'
    },
    {
      key: 'of',
      title: 'Không hoạt động'
    }
  ];
}