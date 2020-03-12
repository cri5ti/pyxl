import React, {useEffect, useMemo, useRef, useState} from "react";
import ResizeObserver from 'resize-observer-polyfill';


type Props = {
    children: (width, height) => any
};

export const AutoSize = ({children}: Props) => {
    const ref = useRef<HTMLDivElement>();

    const [size, setSize] = useState<undefined | [number, number]>(undefined);

    const ro = useMemo(() => new ResizeObserver(
        (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
            const bounds = entries[0].contentRect;
            setSize([bounds.width, bounds.height]);
            console.log(entries, observer);
        }
    ), []);
    useEffect(function() {
        if (!ref.current) return;
        const bounds = ref.current.getBoundingClientRect();
        ro.observe(ref.current);
        setSize([bounds.width, bounds.height]);
    }, []);

    console.log('setSize', size);

    return (
        <div ref={ref}>
            {size && children(size[0], size[1])}
        </div>
    );

};