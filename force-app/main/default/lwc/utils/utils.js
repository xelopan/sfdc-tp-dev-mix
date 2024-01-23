function delay(fn, ms) {
    let timer = 0
    return function(...args) {
        clearTimeout(timer)
        timer = setTimeout(fn.bind(this, ...args), ms || 0)
    }
}

const callDelayed = (callback, ms) => {
    let timer = 0
    clearTimeout(timer)
    timer = setTimeout(fn.bind(this, ...args), ms || 0)
};

export { delay, callDelayed };