import React from "react";
import AlertWidget from "../src/widgets/alert";
import renderer from "react-test-renderer";

it("basic render correctly", () => {
  let component = renderer.create(<AlertWidget />);
  let alertWidget: AlertWidget = component.getInstance() as any;
  alertWidget.widget.current.show({
    title: "标题",
    body: '<p class="my-body">测试内容</p>',
    buttons: [
      {
        text: "取消",
        click: () => {}
      },
      {
        text: "确定",
        click: () => {}
      }
    ]
  });
  expect(component.toJSON()).toMatchInlineSnapshot(`
<div
  className="alert-widget"
>
  <div
    className="_masker"
  >
     
  </div>
  <div
    className="_dialog"
  >
    <div
      className="_header"
    >
      <p
        className="_title"
      >
         
        标题
      </p>
      <a
        className="_close"
        href="javascript:void(0)"
        onClick={[Function]}
      >
         
      </a>
    </div>
    <div
      className="_body"
      dangerouslySetInnerHTML={
        Object {
          "__html": "<p class=\\"my-body\\">测试内容</p>",
        }
      }
    />
    <div
      className="_foot"
    >
      <a
        className="btn"
        onClick={[Function]}
      >
        取消
      </a>
      <a
        className="btn"
        onClick={[Function]}
      >
        确定
      </a>
    </div>
  </div>
</div>
`);
});

it("body is a react component", () => {
  class TestComponent extends React.Component {
    render() {
      return <div className="test-component">测试内容</div>;
    }
  }
  let component = renderer.create(<AlertWidget />);
  let alertWidget: AlertWidget = component.getInstance() as any;
  alertWidget.widget.current.show({
    body: <TestComponent />
  });
  expect(component.toJSON()).toMatchInlineSnapshot(`
<div
  className="alert-widget"
>
  <div
    className="_masker"
  >
     
  </div>
  <div
    className="_dialog"
  >
    <div
      className="_header"
    >
      <p
        className="_title"
      >
         
      </p>
      <a
        className="_close"
        href="javascript:void(0)"
        onClick={[Function]}
      >
         
      </a>
    </div>
    <div
      className="_body"
    >
      <div
        className="test-component"
      >
        测试内容
      </div>
    </div>
    <div
      className="_foot"
    >
      
    </div>
  </div>
</div>
`);
});
