import React, { RefObject } from 'react';
import ReactDOM from 'react-dom';

let counter = 0;

function nextId() {
    return `widget-runner-${+new Date()}-${++counter}`;
}

export interface WidgetRunnerResult<W> {
    widget: W;
    destroy: () => void;
}

export default function widgetRunner<T, W extends React.Component>(widget: React.ComponentClass, props?: T)
: WidgetRunnerResult<W> {
    let id = nextId();
    $('body').append($(`<div id=${id}></div>`));
    let container = document.getElementById(id);
    let widgetInstance = ReactDOM.render(React.createElement(widget, props), container);
    return {
        widget: widgetInstance as W,
        destroy: () => {
            ReactDOM.unmountComponentAtNode(container);
            container.remove();
            this.widget = null;
        }
    };
}