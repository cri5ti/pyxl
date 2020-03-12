import * as React from "react";
import {useCallback, useMemo, useState} from "react";
import {render} from 'react-dom';
import {hex2uint, hsv} from "./colors";
import {AutoSize} from "./util";

require('./style.scss');

const S = 256;

let drawState = {
    frame: null as OffscreenCanvas,
    fg: 0xff0000,
    bg: 0x000000,

    repaint: null as () => void
};

const Canvas = ({width, height}) => {

    function ref(ref: HTMLCanvasElement) {
        if (!ref) return;
        console.log(ref);

        const W = width;
        const H = height;
        const PS = 8;

        ref.width = W;
        ref.height = H;

        function draw(ctx) {
            ctx.fillRect(0, 0, W, H);

            ctx.imageSmoothingEnabled = false;
            ctx.save();
            ctx.scale(PS, PS);
            ctx.drawImage(drawState.frame, 0, 0);
            ctx.restore();

            ctx.save();
            ctx.scale(2, 2);
            ctx.drawImage(drawState.frame, 240, 60);
            ctx.restore();
        }

        function pixel(px, py, c) {
            const oc = drawState.frame.getContext('2d');
            const od = oc.getImageData(0, 0, S, S);
            const z = py * S * 4 + px * 4;
            od.data[z] = (c >> 16) & 0xFF;
            od.data[z + 1] = (c >> 8) & 0xFF;
            od.data[z + 2] = c & 0xFF;
            od.data[z + 3] = 0xFF;
            // od.data[z + 3] = (c) & 0xFF;
            oc.putImageData(od, 0, 0);
        }

        function mousedown(ev) {
            const [x, y] = [ev.offsetX, ev.offsetY];
            const [px, py] = [Math.floor(x / PS), Math.floor(y / PS)];
            const [xx, yy] = [px * PS, py * PS];

            if (ev.buttons == 1)
                pixel(px, py, drawState.fg);
            else if (ev.buttons == 2)
                pixel(px, py, drawState.bg);
        }

        const ctx = ref.getContext('2d');
        draw(ctx);

        drawState.repaint = () => {
            const ctx = ref.getContext('2d');
            draw(ctx);
        };

        ref.addEventListener('contextmenu', (ev) => {
            ev.preventDefault();
        });

        ref.addEventListener('mousedown', (ev) => {
            ev.preventDefault();
            mousedown(ev);
        });

        ref.addEventListener('mousemove', (ev) => {
            const ctx = ref.getContext('2d');

            const [x, y] = [ev.offsetX, ev.offsetY];
            const [px, py] = [Math.floor(x / PS), Math.floor(y / PS)];
            const [xx, yy] = [px * PS, py * PS];

            if (ev.buttons > 0)
                mousedown(ev);

            draw(ctx);

            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.rect(xx, yy, PS, PS);
            ctx.stroke();
        });
    }


    return (
        <div className="canvas">
            <canvas ref={ref}/>
        </div>
    );
};


const App = () => {
    return (
        <div className="app">
            <Palette/>
            <Layers/>

            <AutoSize>
                {(width, height) => <Canvas {...{width, height}}/>}
            </AutoSize>
        </div>
    );
};

const Layers= () => {

    const [state, setState] = useState(() => {
        const layers = [];
        for(let i=0; i<4; i++) {
            const o = new OffscreenCanvas(S, S);
            const oc = o.getContext('2d');
            const od = oc.getImageData(0, 0, S, S);
            let z = 0;
            for(let y = 0; y<S; y++)
                for(let x = 0; x<S; x++) {
                    // od.data[z + 0] = y * (256/S);
                    // od.data[z + 1] = x * (256/S);
                    // od.data[z + 2] = 0;
                    od.data[z + 3] = 255;
                    z += 4;
                }
            oc.putImageData(od, 0, 0);

            layers.push({
                no: i,
                canvas: o
            });
        }

        drawState.frame = layers[0].canvas;

        return {
            layers,
            current: layers[0]
        }
    });

    const onSelect = useCallback((layer) => {
        setState({...state, current: layer});
        drawState.frame = layer.canvas;
        drawState.repaint();
    }, [state]);

    return (
        <div className="layers">
            {state.layers.map((i,k) => <Layer key={k} selected={i == state.current} layer={i} onSelect={onSelect}/>)}
        </div>
    );
};

const Layer = ({layer, selected, onSelect}) => {
    return (
        <div className={cls("layer", selected && "selected")}
             onMouseMove={(ev) => ev.buttons == 1 && onSelect(layer)}
             onClick={(ev) => onSelect(layer)}
        >
            {layer.no}
        </div>
    )
};

const Palette = () => {
    const colors = useMemo(() => {
        const HS = 8;
        const SS = 5;

        let h0 = 60;
        let hi = 360 / HS;
        let s0 = 128;
        let s1 = 255;
        let si = (s1 - s0) / SS;
        let v0 = 64;
        let v1 = 240;
        let vi = (v1 - v0) / SS;

        const colors = [];
        for (let kh = 0; kh < HS; kh++) {
            for (let ks = 0; ks < SS; ks++) {
                let h = (h0 + kh * hi) % 360;
                let s = s0 + ks * si;
                let v = v0 + ks * vi;
                colors.push(hsv(h, s, v));
            }
        }
        return colors;
    }, []);

    const [color, setColor] = useState(0);
    const selectColor = useCallback((color) => {
        setColor(color);
        drawState.fg = hex2uint(color);
        console.log(color, drawState.fg, drawState.fg.toString(16));
    }, []);

    return (
        <div className="palette">
            {colors.map((i,k) => <Color key={k} color={i} selected={color == i} onSelectColor={selectColor}/>)}
        </div>
    )

};

const Color = ({color, selected, onSelectColor}) => {
    return <div className={cls("color", selected && "selected")} style={{background: color}} onClick={ev => onSelectColor(color)}/>;
};


function cls(...cls) {
    return cls.filter(i => !!i).join(' ');
}

render(<App/>, document.body.appendChild(document.createElement('div')));
