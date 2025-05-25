import "@babel/polyfill";

import { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import Snap from "snapsvg";
import SvgText from 'svg-text';
import { useDebounce } from "@uidotdev/usehooks";

import "./snap.svg.free_transform"


function getData() {
  const data = window.localStorage.getItem('zineSVG')
  if (data) {
    return JSON.parse(data)
  }
  return null;
}

function saveData(data) {
  window.localStorage.setItem('zineSVG', JSON.stringify(data))
}

Snap.plugin(function (Snap, Element, Paper, global, Fragment) {
  Paper.prototype.svgTextWidth = function(subject, key, width, setter) {
    console.log({key, subject, width})
    console.log(subject.transform())


    const paper = this;
    const group = paper.g({id: 'tw-handles', transform: subject.transform()});
    const control = group.rect(width, -10, 10, 10)
    control.drag(function(dx, dy, x, y, event) { console.log({dx, dy, x, y, event})})
  }
})

const App = () => {
  const svg = useRef();
  const [data, setData] = useState({});
  const debouncedData = useDebounce(data, 100);

  const callback = event => {
    const {subject, width} = event;
    const newTransform = DOMMatrix.fromMatrix(subject.matrix).toString();
    if (newTransform != data.first.attrs.transform || width != data.first.attrs.width) {
      const newData = {...data};
      newData.first.attrs.transform = newTransform;
      newData.first.attrs.width = width;
      setData(newData);
    }
  }

  useEffect(_ => {
    setData(getData() || {
      first: {
        type: 'text',
        attrs: {
          text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          transform: new DOMMatrix().toString(),
          width: 200,
        }
      }
    })
  }, []);

  useEffect(_ => saveData(debouncedData), [debouncedData])

  useEffect(_ => {
    if (!svg.current) return;

    const s = Snap(svg.current)
    s.clear();

    // const rect = s.rect(50, 50, 100, 50)
    // .attr({
    //   cursor: 'move',
    //   fill: '#1e609d',
    //   transform: 't200,200'
    // });
    // const t = s.text(10, 64, "")
    // .attr({
    //   cursor: 'move',
    //   fontFamily: 'Noticia Text',
    //   fontSize: 64
    // })

    Object.entries(data).map(([key, item]) => {
      const { type, attrs } = item;

      if (type == 'text') {
        const { text, transform, width } = attrs;

        const g = s.g({transform: transform.toString()});
        const t = new SvgText({
          text,
          element: g.node,
          svg: svg.current,
          maxWidth: width,
          textOverflow: 'ellipsis',
          x: 0,
          y: 0,
        });
        const ft = s.freeTransform(g, {
          snap: { rotate: 1 },
          size: 8,
          draw: 'bbox',
          scale: false,
          width
        }, callback);

        // const tw = s.svgTextWidth(g, key, width, setWidth)
      }
    })

  }, [debouncedData])

  return <div style={{ width: "100%", height: "100%"}}>
    <svg width="100%" height="100%" ref={svg}></svg>
  </div>
};

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
