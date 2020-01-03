import { IActionDescribers } from "../base-widget";

export interface AreaInfo {
    name: string;
    id: number;
    children?: AreaInfo[];
    selected?: boolean;
}

export interface AddressChooserOptions {
    provinces: AreaInfo[];
    cities: AreaInfo[];
    districts: AreaInfo[];
    provinceId: number;
    cityId: number;
    districtId: number;
    onChange: (arr: string[]) => void;
}

export interface AddressSelectionState {
    isVisible: boolean;
}

export interface AddressChooserActionDescribers extends IActionDescribers {
    updateProvinces: () => void;
    updateCities: (newState: AreaInfo[]) => void;
    updateDistricts: (newState: AreaInfo[]) => void;
    selectProvince: (provinceId: number) => void;
    selectCity: (cityId: number) => void;
    selectDistrict: (districtId: number) => void;
}