import { BaseWidget } from "../widgets/base-widget";

export default function unref<T extends React.RefObject<BaseWidget>, W extends React.Component>(): (refObj: T) => W {
    return (refObj: T): W => {
        return refObj.current.widget.current as W;
    };
}