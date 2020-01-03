import { connect, ConnectedComponentClass } from "react-redux";

export default function ConnectedComponent(wrappedComponent: 
    React.ComponentType): ConnectedComponentClass<any, any> {
    return connect(state => state, null, null, {
        forwardRef: true
    })(wrappedComponent);
}