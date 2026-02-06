"use client";

if (typeof Promise.withResolvers === "undefined") {
    // @ts-expect-error Polyfill for missing browser feature
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}
