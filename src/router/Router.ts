export default () => {

  const fctList: { routeName: string, callback: () => void }[] = []
  const routes = [
    {
      title: 'Damien Doussaud',
      name: 'landing',
      path: '/',
      regex: /^\/$/
    },
    {
      title: 'Page not found',
      name: '404',
      path: '/error',
      regex: /^\*$/
    }
  ] as const

  const on = (
    routeName: typeof routes[number]['name'],
    callback: typeof fctList[number]['callback']
  ) => {
    fctList.push({
      routeName,
      callback
    })
  }

  const changePage = ({
    path,
    changePath = true,
    // oldPath = document.location.pathname || '/'
  }: { path: string, changePath?: boolean, oldPath?: string }) => {

    const route = _pathToRoute(path)
    
    if (changePath) {
      history.pushState({}, route.title, route.path)
      _dispatch(route)
    }
  }

  function _pathToRoute (path: string) {
    return routes.find((route) => route.regex.test(path)) ||
      routes.find((route) => route.name === '404') as typeof routes[number]
  }

  function _dispatch (route: typeof routes[number]) {
    fctList
      .filter(item => item.routeName === route.name)
      .forEach(item => item.callback())
  }

  window.addEventListener('popstate', () => {
    changePage({
      path: document.location.pathname,
      changePath: false
    })
  })

  return {
    on,
    changePage
  }
}