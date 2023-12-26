import { createEventEmitter } from "../events/createEventEmitter";

/**
 * Event emitter
 */
export const createRouter = () => {
  const routes = [
    {
      title: "Damien Doussaud",
      name: "landing",
      path: `${import.meta.env.BASE_URL}`,
      regex: new RegExp(`^${import.meta.env.BASE_URL.replace(/\//, "/")}$`),
    },
    {
      title: "Page not found",
      name: "404",
      path: "/error",
      regex: /^\*$/,
    },
  ] as const;

  const { on, dispatch } = createEventEmitter<{
    name: (typeof routes)[number]["name"];
    callback: () => void;
  }>();

  const changePage = ({
    path,
    changePath = true,
    // oldPath = document.location.pathname || '/'
  }: { path: string; changePath?: boolean; oldPath?: string }) => {
    const route = pathToRoute(path);

    if (changePath) {
      history.pushState({}, route.title, route.path);
      dispatch(route.name);
    }

    document.title = route.title;
  };

  function pathToRoute(path: string) {
    return (
      routes.find((route) => route.regex.test(path)) ||
      (routes.find((route) => route.name === "404") as (typeof routes)[number])
    );
  }

  window.addEventListener("popstate", () => {
    changePage({
      path: document.location.pathname,
      changePath: false,
    });
  });

  return {
    on,
    changePage,
  };
};
