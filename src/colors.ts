export function hsv2rgb(h: number, s: number, v: number)
{
    let r, g, b;

    if (s == 0) {
        r = g = b = v;
    } else {
        let t1 = v;
        let t2 = (255 - s) * v / 255;
        let t3 = (t1 - t2) * (h % 60) / 60;
        if (h == 360) h = 0;
        if (h < 60) { r = t1; b = t2; g = t2 + t3 }
        else if (h < 120) { g = t1; b = t2; r = t1 - t3 }
        else if (h < 180) { g = t1; r = t2; b = t2 + t3 }
        else if (h < 240) { b = t1; r = t2; g = t1 - t3 }
        else if (h < 300) { b = t1; g = t2; r = t2 + t3 }
        else if (h < 360) { r = t1; g = t2; b = t1 - t3 }
        else { r = 0; g = 0; b = 0 }
    }
    return [r, g, b];
}

const HEX = '0123456789abcdef';

function i2hex(n:number) {
    return HEX[n >> 4] + HEX[n & 0xf];
}

function hex2i(a:number) {
    if (a <= 57 /*'9'*/) return a - 48 /*0*/;
    if (a <= 70 /*'F'*/) return a - 55 /*A*/;
    if (a <= 102 /*'f'*/) return a - 87 /*a*/;
    return 0;
}

function rgb2hex(r,g,b) {
    return '#' + i2hex(r) + i2hex(g) + i2hex(b);
}

export function hex2uint(s:string) {
    return (hex2i(s.charCodeAt(1)) << 20)
        +  (hex2i(s.charCodeAt(2)) << 16)
        +  (hex2i(s.charCodeAt(3)) << 12)
        +  (hex2i(s.charCodeAt(4)) << 8)
        +  (hex2i(s.charCodeAt(5)) << 4)
        +  (hex2i(s.charCodeAt(6)))
}


export function hsv(h,s,v) {
    const [r,g,b] = hsv2rgb(h,s,v);
    return rgb2hex(r,g,b);
}
