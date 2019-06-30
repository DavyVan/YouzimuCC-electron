'use strict';

function seconds2str(seconds) {
    let s = parseInt(seconds);
    let ms = seconds - s;
    let m = Math.floor(s/60);
    s = s - m*60;
    let h = 0;
    if (m >= 60) {
        h = Math.floor(m/60);
    }

    // return 00:00:00,00
    return `${toPrefixedIntStr(h, 2)}:${toPrefixedIntStr(m, 2)}:${toPrefixedIntStr(s, 2)},${toPrefixedIntStr(ms*100, 2)}`;
}

function toPrefixedIntStr(x, n) {
    return (Array(n).join(0) + x).slice(-n);
}

module.exports = {
    seconds2str: seconds2str,
    toPrefixedIntStr: toPrefixedIntStr
};