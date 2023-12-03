

export function createEventEmitter<GlobalEventDef extends { name: string | object, callback: (data: any) => void }> () {
  
  let list: GlobalEventDef[] = []
  
  const on = <EvendDef extends GlobalEventDef>(
    name: EvendDef['name'],
    callback: EvendDef['callback']
  ) => {
    list.push({
      name,
      callback
    } as GlobalEventDef)
  }

  const off = <EvendDef extends GlobalEventDef>(
    name?: EvendDef['name'],
    callback?: EvendDef['callback']
  ) => {
    list = list.filter(item =>
      (name ? item.name !== name : false) ||
      (callback ? item.callback !== callback : false)
    )
  }
  
  function dispatch<EvendDef extends GlobalEventDef> (
    name: EvendDef['name'],
    data?: Parameters<EvendDef['callback']>[0]
  ) {
    // console.log(data)
    list
      .filter(item => item.name === name)
      .forEach(item => item.callback.call(null, data as Parameters<EvendDef['callback']>[0] ))
  }

  return {
    on,
    off,
    dispatch
  }
}