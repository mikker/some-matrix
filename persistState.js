const debounce = require('lodash.debounce')

function persistState(key) {
  const regex = RegExp(key + ".+");
  const debouncedWrite = debounce(write, 100)

  return (state, emitter) => {
    state[key] = read(key);

    emitter.on("*", action => {
      if (action.match(regex)) {
        debouncedWrite(key, state[key]);
      }
    });
  };

  function read(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      return null;
    }
  }

  function write(key, obj) {
    localStorage.setItem(key, JSON.stringify(obj));
  }
}

module.exports = persistState;
