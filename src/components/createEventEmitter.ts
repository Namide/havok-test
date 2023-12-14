export type GlobalEvent = {
  name: string | object | undefined;
  callback: (data: unknown) => void;
};

export type On = <EvendDef extends GlobalEvent>(
  name: EvendDef["name"],
  callback: EvendDef["callback"],
) => void;

export type Off = On;

export function createEventEmitter<GlobalEventDef extends GlobalEvent>() {
  let list: GlobalEventDef[] = [];

  const on = <EvendDef extends GlobalEventDef>(
    name: EvendDef["name"],
    callback: EvendDef["callback"],
  ) => {
    list.push({
      name,
      callback,
    } as GlobalEventDef);
  };

  const off = <EvendDef extends GlobalEventDef>(
    name?: EvendDef["name"],
    callback?: EvendDef["callback"],
  ) => {
    list = list.filter(
      (item) =>
        (name ? item.name !== name : false) ||
        (callback ? item.callback !== callback : false),
    );
  };

  function dispatch<EvendDef extends GlobalEventDef>(
    name: EvendDef["name"],
    data?: Parameters<EvendDef["callback"]>[0],
  ) {
    // console.log(data)

    for (const item of list.filter((item) => item.name === name)) {
      item.callback.call(null, data as Parameters<EvendDef["callback"]>[0]);
    }
  }

  return {
    on,
    off,
    dispatch,
  };
}
